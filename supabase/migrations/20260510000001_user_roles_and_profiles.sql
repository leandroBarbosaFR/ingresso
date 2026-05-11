-- ============================================================================
-- User roles + profiles table.
-- ============================================================================
-- Three roles power the SaaS:
--   super_admin  — platform owner (Ingressos team). Sees everything.
--   event_maker  — organizer that creates and sells events.
--   client_user  — buyer.
--
-- Profile is created automatically on signup via a trigger on auth.users so
-- every authenticated user has a `profiles` row keyed by their auth id.
-- ============================================================================

create type user_role as enum ('super_admin', 'event_maker', 'client_user');

create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        user_role not null default 'event_maker',
  name        text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index profiles_role_idx on profiles(role);

create trigger profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- Auto-create profile on auth user creation. Runs as security definer so it
-- can write to public.profiles regardless of the caller's role.
-- ----------------------------------------------------------------------------
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into public.profiles (id, role, name)
  values (
    new.id,
    'event_maker',
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Backfill profiles for any pre-existing auth users.
insert into public.profiles (id, role, name)
select
  u.id,
  'event_maker'::user_role,
  coalesce(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1))
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

-- ----------------------------------------------------------------------------
-- Helper: check the current user's role from a stable security-definer view.
-- ----------------------------------------------------------------------------
create or replace function current_user_role()
returns user_role
language sql
stable
security definer
set search_path = public, auth
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function is_super_admin()
returns boolean
language sql
stable
as $$
  select coalesce(current_user_role() = 'super_admin', false);
$$;

-- ----------------------------------------------------------------------------
-- RLS
-- ----------------------------------------------------------------------------
alter table profiles enable row level security;

create policy "profiles self read"
  on profiles for select
  using (auth.uid() = id);

create policy "profiles super admin read all"
  on profiles for select
  using (is_super_admin());

create policy "profiles self update"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from profiles where id = auth.uid()));

-- super_admin can update anyone's role
create policy "profiles super admin write"
  on profiles for all
  using (is_super_admin())
  with check (is_super_admin());

-- ----------------------------------------------------------------------------
-- Existing-table read policies for super_admin (visibility into everything).
-- ----------------------------------------------------------------------------
create policy "events super admin read all"
  on events for select
  using (is_super_admin());

create policy "ticket_types super admin read all"
  on ticket_types for select
  using (is_super_admin());

create policy "organizers super admin read all"
  on organizers for select
  using (is_super_admin());
