-- ============================================================================
-- Adds event category (used by filters / collections) + storage buckets for
-- event covers and organizer logos. Idempotent.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- events.category — slug matching lib/mock-events `categories`
-- ----------------------------------------------------------------------------
alter table events
  add column if not exists category text;

create index if not exists events_category_idx on events(category) where category is not null;

-- ----------------------------------------------------------------------------
-- Storage buckets
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('event-covers',    'event-covers',    true, 5242880,  array['image/jpeg','image/png','image/webp','image/avif']),
  ('organizer-logos', 'organizer-logos', true, 1048576,  array['image/jpeg','image/png','image/webp','image/svg+xml'])
on conflict (id) do nothing;

-- public read for both buckets
drop policy if exists "public read event covers" on storage.objects;
create policy "public read event covers"
  on storage.objects for select
  using (bucket_id = 'event-covers');

drop policy if exists "public read organizer logos" on storage.objects;
create policy "public read organizer logos"
  on storage.objects for select
  using (bucket_id = 'organizer-logos');

-- organizers may upload / replace / delete files inside their own folder.
-- Convention: object path starts with `<organizer_id>/...`
drop policy if exists "organizers manage own event covers" on storage.objects;
create policy "organizers manage own event covers"
  on storage.objects for all
  to authenticated
  using (
    bucket_id = 'event-covers'
    and (storage.foldername(name))[1] in (
      select id::text from organizers where user_id = auth.uid()
    )
  )
  with check (
    bucket_id = 'event-covers'
    and (storage.foldername(name))[1] in (
      select id::text from organizers where user_id = auth.uid()
    )
  );

drop policy if exists "organizers manage own logos" on storage.objects;
create policy "organizers manage own logos"
  on storage.objects for all
  to authenticated
  using (
    bucket_id = 'organizer-logos'
    and (storage.foldername(name))[1] in (
      select id::text from organizers where user_id = auth.uid()
    )
  )
  with check (
    bucket_id = 'organizer-logos'
    and (storage.foldername(name))[1] in (
      select id::text from organizers where user_id = auth.uid()
    )
  );
