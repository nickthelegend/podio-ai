-- Create table for brand kits
create table brand_kits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text default 'My Brand',
  logo_url text,
  primary_color text default '#EC4899', -- pink-500 default
  secondary_color text default '#A855F7', -- purple-500 default
  font_family text default 'Inter',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table brand_kits enable row level security;

-- Policies
create policy "Users can view their own brand kits"
on brand_kits for select
using (auth.uid() = user_id);

create policy "Users can insert their own brand kits"
on brand_kits for insert
with check (auth.uid() = user_id);

create policy "Users can update their own brand kits"
on brand_kits for update
using (auth.uid() = user_id);

create policy "Users can delete their own brand kits"
on brand_kits for delete
using (auth.uid() = user_id);
