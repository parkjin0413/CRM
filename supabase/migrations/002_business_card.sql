-- Run this once against the already-provisioned production database
-- (Supabase dashboard → SQL editor). It brings an existing database up
-- to date with the business_card_path column and storage bucket that
-- supabase/schema.sql now includes for fresh setups.

alter table customers add column if not exists business_card_path text;

insert into storage.buckets (id, name, public)
values ('business-cards', 'business-cards', false)
on conflict (id) do nothing;
