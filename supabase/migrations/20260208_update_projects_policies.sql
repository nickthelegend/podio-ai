-- Enable updates for users on their own projects
create policy "Users can update their own projects"
on projects for update
using (auth.uid() = user_id);

-- Enable deletes for users on their own projects
create policy "Users can delete their own projects"
on projects for delete
using (auth.uid() = user_id);

-- Add an updated_at column to track modifications
alter table projects add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now()) not null;
