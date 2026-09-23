-- Brands are the tenants. Everything a specialist writes belongs to exactly one brand.

create type public.membership_role as enum ('lead', 'specialist');
create type public.flag_severity as enum ('critical', 'major', 'minor');

create table public.brands (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  accent_color text not null check (accent_color ~ '^#[0-9a-f]{6}$'),
  voice_summary text not null,
  procedures text not null,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null unique,
  created_at timestamptz not null default now()
);

-- Role is per brand: the same person can lead one brand and write for another.
create table public.brand_memberships (
  brand_id uuid not null references public.brands (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  role public.membership_role not null,
  created_at timestamptz not null default now(),
  primary key (brand_id, profile_id)
);

create index brand_memberships_profile_idx on public.brand_memberships (profile_id);

-- source + external_id is the seam for a future helpdesk importer; manual rows leave external_id null.
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands (id) on delete restrict,
  source text not null default 'manual',
  external_id text,
  subject text not null,
  customer_name text not null,
  customer_message text not null,
  opened_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (brand_id, source, external_id),
  unique (id, brand_id)
);

-- Replies already went out, so the app never writes them; only an importer or the seed does.
create table public.replies (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null,
  brand_id uuid not null,
  author_id uuid not null references public.profiles (id) on delete restrict,
  body text not null,
  sent_at timestamptz not null,
  response_minutes integer check (response_minutes >= 0),
  created_at timestamptz not null default now(),
  -- Composite key stops a reply from claiming a different brand than its conversation.
  foreign key (conversation_id, brand_id) references public.conversations (id, brand_id) on delete cascade
);

create index replies_brand_sent_idx on public.replies (brand_id, sent_at desc);
create index replies_author_sent_idx on public.replies (author_id, sent_at desc);

-- A null brand_id means the criterion applies to every brand. Archived, never deleted, so old reviews keep their meaning.
create table public.criteria (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references public.brands (id) on delete cascade,
  label text not null,
  description text not null,
  severity public.flag_severity not null,
  position smallint not null default 0,
  archived_at timestamptz,
  created_at timestamptz not null default now()
);

create index criteria_brand_idx on public.criteria (brand_id);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  reply_id uuid not null references public.replies (id) on delete cascade,
  reviewer_id uuid not null references public.profiles (id) on delete restrict,
  score smallint not null check (score between 1 and 5),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (reply_id, reviewer_id)
);

create index reviews_reply_idx on public.reviews (reply_id);
create index reviews_reviewer_idx on public.reviews (reviewer_id);

create table public.review_flags (
  review_id uuid not null references public.reviews (id) on delete cascade,
  criterion_id uuid not null references public.criteria (id) on delete restrict,
  primary key (review_id, criterion_id)
);

create index review_flags_criterion_idx on public.review_flags (criterion_id);

-- Separate from reviews so the specialist can record that they read it without write access to the review itself.
create table public.review_acknowledgements (
  review_id uuid primary key references public.reviews (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  acknowledged_at timestamptz not null default now()
);

create schema if not exists private;

create function private.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger reviews_touch_updated_at
before update on public.reviews
for each row execute function private.touch_updated_at();

create function private.assert_flag_applies_to_brand()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.reviews rv
    join public.replies r on r.id = rv.reply_id
    join public.criteria c on c.id = new.criterion_id
    where rv.id = new.review_id
      and c.archived_at is null
      and (c.brand_id is null or c.brand_id = r.brand_id)
  ) then
    raise exception 'Criterion % does not apply to this reply''s brand', new.criterion_id;
  end if;
  return new;
end;
$$;

create trigger review_flags_assert_brand
before insert or update on public.review_flags
for each row execute function private.assert_flag_applies_to_brand();
