create extension if not exists pgcrypto;

create table source_options (
  id uuid primary key default gen_random_uuid(),
  value text not null unique,
  sort_order int not null
);

insert into source_options (value, sort_order) values
  ('지인소개', 1),
  ('웹사이트', 2),
  ('광고', 3),
  ('전시회·박람회', 4),
  ('콜드콜', 5),
  ('기존고객 소개', 6),
  ('기타', 7);

create table customers (
  id uuid primary key default gen_random_uuid(),
  source text not null references source_options (value) on update cascade,
  name text not null,
  company text not null,
  phone text not null,
  phone_normalized text not null,
  email text,
  memo text,
  business_card_path text,
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index customers_phone_normalized_idx on customers (phone_normalized);
create index customers_created_at_idx on customers (created_at);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger customers_set_updated_at
  before update on customers
  for each row
  execute function set_updated_at();

alter table customers enable row level security;
alter table source_options enable row level security;
-- No policies are created: the anon key can read/write nothing.
-- All access goes through the server-only service role key, which bypasses RLS.

-- Private storage bucket for uploaded business card photos. Not public;
-- the app reads/writes it only through the service role key and serves
-- images via short-lived signed URLs generated server-side.
insert into storage.buckets (id, name, public)
values ('business-cards', 'business-cards', false)
on conflict (id) do nothing;
