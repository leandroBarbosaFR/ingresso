-- ============================================================================
-- Initial schema for event ticketing platform
-- ============================================================================
--   - organizers: who is selling
--   - events / ticket_types: what is being sold
--   - holds: soft inventory locks during checkout
--   - orders / order_items / tickets: purchase + per-attendee tickets
--   - invoices: NFS-e issuance tracking (PlugNotas)
--   - refund_requests: 7-day window per CDC
--   - webhook_events: idempotency log for Mercado Pago notifications
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- enums
-- ----------------------------------------------------------------------------
create type event_status as enum ('draft', 'published', 'cancelled', 'finished');
create type order_status as enum ('pending', 'paid', 'failed', 'refunded', 'expired');
create type ticket_status as enum ('valid', 'used', 'cancelled');
create type payment_method as enum ('pix', 'credit_card', 'debit_card');
create type invoice_status as enum ('pending', 'issued', 'failed', 'cancelled');
create type refund_status as enum ('pending', 'approved', 'rejected', 'processed');
create type tax_regime as enum ('simples_nacional', 'lucro_presumido', 'mei');

-- ----------------------------------------------------------------------------
-- updated_at trigger function (re-used by every table that has updated_at)
-- ----------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- organizers
-- ----------------------------------------------------------------------------
create table organizers (
  id                          uuid primary key default gen_random_uuid(),
  user_id                     uuid not null references auth.users(id) on delete cascade,
  name                        text not null,
  legal_name                  text,
  cnpj                        text,
  municipal_registration      text,
  tax_regime                  tax_regime,
  digital_cert_uploaded_at    timestamptz,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now(),

  unique (user_id)
);

create trigger organizers_updated_at
  before update on organizers
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- events
-- ----------------------------------------------------------------------------
create table events (
  id                          uuid primary key default gen_random_uuid(),
  organizer_id                uuid not null references organizers(id) on delete cascade,
  slug                        text not null,
  title                       text not null,
  description                 text,
  cover_url                   text,
  venue_name                  text not null,
  venue_address               text not null,
  venue_city                  text not null,
  venue_state                 text not null check (length(venue_state) = 2),
  starts_at                   timestamptz not null,
  ends_at                     timestamptz,
  status                      event_status not null default 'draft',
  -- service fee charged on top of ticket price (paid by buyer)
  service_fee_percent         numeric(5,2) not null default 7.00,
  service_fee_flat_cents      integer not null default 99,
  -- max tickets a single buyer can take in one checkout (across all types)
  max_tickets_per_purchase    smallint not null default 3 check (max_tickets_per_purchase between 1 and 20),
  -- NFS-e config (per event so each can have its own iss code if needed)
  iss_service_code            text,
  iss_rate_percent            numeric(5,2),
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now(),

  unique (slug),
  check (ends_at is null or ends_at > starts_at)
);

create index events_organizer_idx on events(organizer_id);
create index events_status_starts_at_idx on events(status, starts_at);

create trigger events_updated_at
  before update on events
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- ticket_types
-- ----------------------------------------------------------------------------
create table ticket_types (
  id                  uuid primary key default gen_random_uuid(),
  event_id            uuid not null references events(id) on delete cascade,
  name                text not null,
  description         text,
  price_cents         integer not null check (price_cents >= 0),
  quantity_total      integer not null check (quantity_total > 0),
  quantity_sold       integer not null default 0 check (quantity_sold >= 0),
  sales_start_at      timestamptz,
  sales_end_at        timestamptz,
  position            smallint not null default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  check (quantity_sold <= quantity_total),
  check (sales_end_at is null or sales_start_at is null or sales_end_at > sales_start_at)
);

create index ticket_types_event_idx on ticket_types(event_id);

create trigger ticket_types_updated_at
  before update on ticket_types
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- holds (soft inventory locks during checkout)
-- ----------------------------------------------------------------------------
create table holds (
  id              uuid primary key default gen_random_uuid(),
  ticket_type_id  uuid not null references ticket_types(id) on delete cascade,
  session_id      text not null,
  quantity        smallint not null check (quantity > 0),
  expires_at      timestamptz not null,
  created_at      timestamptz not null default now()
);

create index holds_ticket_type_active_idx on holds(ticket_type_id, expires_at);
create index holds_session_idx on holds(session_id);

-- ----------------------------------------------------------------------------
-- orders
-- ----------------------------------------------------------------------------
create table orders (
  id                  uuid primary key default gen_random_uuid(),
  event_id            uuid not null references events(id) on delete restrict,
  buyer_name          text not null,
  buyer_email         text not null,
  buyer_cpf           text not null,
  buyer_phone         text,
  subtotal_cents      integer not null check (subtotal_cents >= 0),
  fees_cents          integer not null default 0 check (fees_cents >= 0),
  total_cents         integer not null check (total_cents >= 0),
  status              order_status not null default 'pending',
  mp_preference_id    text,
  mp_payment_id       text,
  payment_method      payment_method,
  paid_at             timestamptz,
  expires_at          timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index orders_event_idx on orders(event_id);
create index orders_status_idx on orders(status);
create index orders_mp_payment_idx on orders(mp_payment_id) where mp_payment_id is not null;
create index orders_buyer_email_idx on orders(buyer_email);

create trigger orders_updated_at
  before update on orders
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- order_items
-- ----------------------------------------------------------------------------
create table order_items (
  id                  uuid primary key default gen_random_uuid(),
  order_id            uuid not null references orders(id) on delete cascade,
  ticket_type_id      uuid not null references ticket_types(id) on delete restrict,
  quantity            smallint not null check (quantity > 0),
  unit_price_cents    integer not null check (unit_price_cents >= 0),
  -- attendee data captured at checkout: [{ name, cpf, email? }]
  -- length must equal quantity; expanded into tickets on payment confirm.
  attendees           jsonb not null default '[]'::jsonb
);

create index order_items_order_idx on order_items(order_id);
create index order_items_ticket_type_idx on order_items(ticket_type_id);

-- ----------------------------------------------------------------------------
-- tickets
-- ----------------------------------------------------------------------------
create table tickets (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid not null references orders(id) on delete cascade,
  ticket_type_id  uuid not null references ticket_types(id) on delete restrict,
  event_id        uuid not null references events(id) on delete restrict,
  qr_token        uuid not null default gen_random_uuid(),
  holder_name     text not null,
  holder_cpf      text,
  status          ticket_status not null default 'valid',
  used_at         timestamptz,
  checked_in_by   uuid references auth.users(id),
  created_at      timestamptz not null default now(),

  unique (qr_token)
);

create index tickets_event_idx on tickets(event_id);
create index tickets_order_idx on tickets(order_id);
create index tickets_status_idx on tickets(status);

-- ----------------------------------------------------------------------------
-- invoices (NFS-e tracking)
-- ----------------------------------------------------------------------------
create table invoices (
  id                      uuid primary key default gen_random_uuid(),
  order_id                uuid not null references orders(id) on delete cascade,
  provider                text not null default 'plugnotas',
  provider_invoice_id     text,
  status                  invoice_status not null default 'pending',
  rps_number              text,
  pdf_url                 text,
  xml_url                 text,
  issued_at               timestamptz,
  error_message           text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),

  unique (order_id)
);

create index invoices_status_idx on invoices(status);

create trigger invoices_updated_at
  before update on invoices
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- refund_requests
-- ----------------------------------------------------------------------------
create table refund_requests (
  id                          uuid primary key default gen_random_uuid(),
  order_id                    uuid not null references orders(id) on delete restrict,
  requested_by_email          text not null,
  reason                      text,
  status                      refund_status not null default 'pending',
  refunded_amount_cents       integer,
  mp_refund_id                text,
  requested_at                timestamptz not null default now(),
  processed_at                timestamptz
);

create index refund_requests_order_idx on refund_requests(order_id);
create index refund_requests_status_idx on refund_requests(status);

-- ----------------------------------------------------------------------------
-- webhook_events (idempotency log)
-- ----------------------------------------------------------------------------
create table webhook_events (
  id              uuid primary key default gen_random_uuid(),
  provider        text not null,
  event_id        text not null,
  payload         jsonb not null,
  processed_at    timestamptz,
  created_at      timestamptz not null default now(),

  unique (provider, event_id)
);

create index webhook_events_provider_processed_idx on webhook_events(provider, processed_at);

-- ============================================================================
-- helper: live available quantity (sold + active holds)
-- ============================================================================
create or replace function available_quantity(p_ticket_type_id uuid, p_exclude_session text default null)
returns integer
language sql
stable
as $$
  select greatest(
    0,
    tt.quantity_total
      - tt.quantity_sold
      - coalesce((
          select sum(h.quantity)::integer
          from holds h
          where h.ticket_type_id = tt.id
            and h.expires_at > now()
            and (p_exclude_session is null or h.session_id <> p_exclude_session)
        ), 0)
  )
  from ticket_types tt
  where tt.id = p_ticket_type_id;
$$;

-- ============================================================================
-- RLS
-- ============================================================================
alter table organizers       enable row level security;
alter table events           enable row level security;
alter table ticket_types     enable row level security;
alter table holds            enable row level security;
alter table orders           enable row level security;
alter table order_items      enable row level security;
alter table tickets          enable row level security;
alter table invoices         enable row level security;
alter table refund_requests  enable row level security;
alter table webhook_events   enable row level security;

-- organizers: only the owning user can read/write
create policy "organizers self-read"  on organizers for select using (auth.uid() = user_id);
create policy "organizers self-write" on organizers for all    using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- events: organizer manages their events; everyone can read published
create policy "events public read published"
  on events for select
  using (status = 'published');

create policy "events organizer manage"
  on events for all
  using (organizer_id in (select id from organizers where user_id = auth.uid()))
  with check (organizer_id in (select id from organizers where user_id = auth.uid()));

-- ticket_types: visible when parent event is visible, organizer manages
create policy "ticket_types public read"
  on ticket_types for select
  using (event_id in (select id from events where status = 'published'));

create policy "ticket_types organizer manage"
  on ticket_types for all
  using (event_id in (
    select e.id from events e
    join organizers o on o.id = e.organizer_id
    where o.user_id = auth.uid()
  ))
  with check (event_id in (
    select e.id from events e
    join organizers o on o.id = e.organizer_id
    where o.user_id = auth.uid()
  ));

-- holds, orders, order_items, tickets, invoices, refund_requests, webhook_events:
-- managed exclusively by service-role from server code (no client-side policies).
-- Client reads orders/tickets via server actions or signed-token endpoints.

-- ============================================================================
-- seed: nothing yet
-- ============================================================================
