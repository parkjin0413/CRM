-- Run this once against the production database (Supabase SQL editor).
-- Adds the star/pin toggle column that the customer list and detail
-- page now use.

alter table customers add column if not exists is_favorite boolean not null default false;
