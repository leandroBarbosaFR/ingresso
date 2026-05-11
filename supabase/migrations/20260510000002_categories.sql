-- ============================================================================
-- Categories (collections). Source of truth for category slugs used by
-- events, /eventos filtering, and /colecoes pages.
-- ============================================================================

create table categories (
  slug         text primary key,
  name         text not null,
  cover_url    text,
  position     smallint not null default 0,
  created_at   timestamptz not null default now()
);

create index categories_position_idx on categories(position);

-- public read for everyone, super_admin manage
alter table categories enable row level security;

create policy "categories public read"
  on categories for select
  using (true);

create policy "categories super admin write"
  on categories for all
  using (is_super_admin())
  with check (is_super_admin());

-- ----------------------------------------------------------------------------
-- Seed the eight default collections used by the landing page.
-- Idempotent — re-running this migration won't duplicate.
-- ----------------------------------------------------------------------------
insert into categories (slug, name, cover_url, position) values
  ('musica',      'Música',                'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=70', 0),
  ('stand-up',    'Stand-up',              'https://images.unsplash.com/photo-1527224538127-2104bb71c51b?auto=format&fit=crop&w=900&q=70', 1),
  ('teatro',      'Teatro',                'https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=900&q=70', 2),
  ('familia',     'Família e Crianças',    'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=900&q=70', 3),
  ('gastronomia', 'Gastronomia',           'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=70', 4),
  ('cursos',      'Cursos e Workshops',    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=900&q=70', 5),
  ('esportes',    'Esportes',              'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=70', 6),
  ('festas',      'Festas',                'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=70', 7)
on conflict (slug) do update set
  name = excluded.name,
  cover_url = excluded.cover_url,
  position = excluded.position;
