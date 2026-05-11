-- ============================================================================
-- Profile completion (Sympla-style): document, name, DOB, phone with OTP.
-- ============================================================================
-- Buyers must complete this before reaching /checkout. Three document types
-- supported: CPF (Brazilian individual), CNPJ (Brazilian company), and
-- PASSPORT (international tourists).
--
-- Phone is verified by a one-time code sent via SMS or WhatsApp; the code
-- itself is never stored — only a hash, an expiry, and an attempt counter.
-- ============================================================================

create type document_type as enum ('cpf', 'cnpj', 'passport');
create type otp_channel as enum ('sms', 'whatsapp');

-- ----------------------------------------------------------------------------
-- profiles: add document + identity fields
-- ----------------------------------------------------------------------------
alter table profiles
  add column if not exists full_name         text,
  add column if not exists document_type     document_type,
  add column if not exists document_number   text,
  add column if not exists document_country  text default 'BR',
  add column if not exists date_of_birth     date,
  add column if not exists phone             text,
  add column if not exists phone_verified_at timestamptz,
  add column if not exists terms_accepted_at timestamptz;

-- One document can identify at most one person on the platform.
create unique index if not exists profiles_document_unique
  on profiles(document_type, document_number)
  where document_number is not null;

-- ----------------------------------------------------------------------------
-- phone_verifications: short-lived OTP attempts.
-- ----------------------------------------------------------------------------
create table phone_verifications (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  phone        text not null,
  code_hash    text not null,       -- sha-256(code + SESSION_SECRET)
  channel      otp_channel not null,
  expires_at   timestamptz not null,
  attempts     smallint not null default 0,
  verified_at  timestamptz,
  created_at   timestamptz not null default now()
);

create index phone_verifications_user_active_idx
  on phone_verifications(user_id, expires_at)
  where verified_at is null;

-- Managed exclusively by server code via service-role. No client-facing
-- policies are intentional.
alter table phone_verifications enable row level security;

-- ----------------------------------------------------------------------------
-- Helper view: a profile is "complete" for checkout when it has document,
-- name, DOB, a verified phone, and accepted terms.
-- ----------------------------------------------------------------------------
create or replace function profile_is_complete(p_user_id uuid)
returns boolean
language sql
stable
as $$
  select
    full_name is not null
    and document_type is not null
    and document_number is not null
    and date_of_birth is not null
    and phone is not null
    and phone_verified_at is not null
    and terms_accepted_at is not null
  from profiles
  where id = p_user_id;
$$;
