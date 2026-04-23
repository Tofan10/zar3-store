-- =============================================
-- ZAR3 Hardware - Supabase Database Schema
-- Run this in Supabase > SQL Editor
-- =============================================

-- Categories table
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text default '',
  icon text default '🖥️',
  created_at timestamptz default now()
);

-- Products table
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text default '',
  price numeric not null default 0,
  stock integer not null default 0,
  category_id uuid references categories(id) on delete set null,
  images text[] default '{}',
  specs jsonb default '{}',
  featured boolean default false,
  active boolean default true,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table categories enable row level security;
alter table products enable row level security;

-- Public can read categories
create policy "Public read categories" on categories
  for select using (true);

-- Public can read active products only
create policy "Public read active products" on products
  for select using (active = true);

-- Service role (admin) has full access
create policy "Admin full access categories" on categories
  for all using (true) with check (true);

create policy "Admin full access products" on products
  for all using (true) with check (true);

-- Create Supabase Storage bucket for product images
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Allow public to read images
create policy "Public read images" on storage.objects
  for select using (bucket_id = 'product-images');

-- Allow service role to upload images
create policy "Admin upload images" on storage.objects
  for insert with check (bucket_id = 'product-images');

create policy "Admin delete images" on storage.objects
  for delete using (bucket_id = 'product-images');

-- =============================================
-- Seed default categories for ZAR3
-- =============================================
insert into categories (name, slug, description, icon) values
  ('PC Builds', 'pc-builds', 'Custom gaming and workstation builds', '🖥️'),
  ('Monitors', 'monitors', 'Gaming and professional monitors', '🖵'),
  ('Accessories', 'accessories', 'Keyboards, mice, headsets and more', '⌨️'),
  ('Parts', 'parts', 'GPUs, CPUs, RAM and spare parts', '⚙️')
on conflict (slug) do nothing;
