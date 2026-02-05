-- Create a table for storing user projects
create table projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  type text check (type in ('podcast', 'slides')) not null,
  title text not null,
  content jsonb not null, -- Stores the script or slide data
  audio_url text, -- For podcasts
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table projects enable row level security;

-- Create policies
create policy "Users can view their own projects" 
on projects for select 
using (auth.uid() = user_id);

create policy "Users can insert their own projects" 
on projects for insert 
with check (auth.uid() = user_id);
