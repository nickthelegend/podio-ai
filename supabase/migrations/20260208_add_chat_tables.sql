-- Create table for chat sessions
create table chat_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text default 'New Chat',
  platform text check (platform in ('twitter', 'linkedin', 'script')) default 'twitter',
  style text default 'Natural',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on chat_sessions
alter table chat_sessions enable row level security;

-- Policies for chat_sessions
create policy "Users can view their own chat sessions"
on chat_sessions for select
using (auth.uid() = user_id);

create policy "Users can insert their own chat sessions"
on chat_sessions for insert
with check (auth.uid() = user_id);

create policy "Users can update their own chat sessions"
on chat_sessions for update
using (auth.uid() = user_id);

create policy "Users can delete their own chat sessions"
on chat_sessions for delete
using (auth.uid() = user_id);

-- Create table for chat messages
create table chat_messages (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references chat_sessions on delete cascade not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on chat_messages
alter table chat_messages enable row level security;

-- Policies for chat_messages
create policy "Users can view messages from their own sessions"
on chat_messages for select
using (
  exists (
    select 1 from chat_sessions
    where chat_sessions.id = chat_messages.session_id
    and chat_sessions.user_id = auth.uid()
  )
);

create policy "Users can insert messages to their own sessions"
on chat_messages for insert
with check (
  exists (
    select 1 from chat_sessions
    where chat_sessions.id = chat_messages.session_id
    and chat_sessions.user_id = auth.uid()
  )
);
