-- Run this once against the production database (Supabase SQL editor).
-- Adds the contact history table used by the customer detail page's
-- "연락 기록" section and the list's "마지막 연락" column.

create table if not exists contact_logs (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers (id) on delete cascade,
  contacted_at date not null,
  method text not null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists contact_logs_customer_id_idx on contact_logs (customer_id);
create index if not exists contact_logs_contacted_at_idx on contact_logs (contacted_at);

alter table contact_logs enable row level security;
