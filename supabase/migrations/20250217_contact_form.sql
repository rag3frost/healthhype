-- Create contact_submissions table
create table contact_submissions (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  status text default 'pending' check (status in ('pending', 'in_progress', 'completed')),
  user_id uuid references auth.users(id)
);

-- Enable RLS
alter table contact_submissions enable row level security;

-- Create policy to allow users to view their own submissions
create policy "Users can view their own submissions"
  on contact_submissions for select
  using (auth.uid() = user_id);

-- Create policy to allow users to insert their own submissions
create policy "Users can create submissions"
  on contact_submissions for insert
  with check (auth.uid() = user_id);
