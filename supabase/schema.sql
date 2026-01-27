-- Collective Wisdom Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  ethos_confirmed_at timestamp with time zone,
  contributions_count integer default 0,
  problems_submitted integer default 0,
  created_at timestamp with time zone default now()
);

-- Problem categories
create table public.categories (
  id serial primary key,
  name text not null,
  slug text unique not null,
  description text,
  icon text -- emoji or icon name
);

-- Problems submitted by users
create table public.problems (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  category_id integer references public.categories(id),
  situation text not null,
  tried_already text,
  desired_outcome text,
  constraints text,
  status text default 'gathering' check (status in ('gathering', 'synthesising', 'complete', 'closed')),
  contribution_threshold integer default 10,
  contribution_count integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Individual contributions (never displayed directly)
create table public.contributions (
  id uuid default gen_random_uuid() primary key,
  problem_id uuid references public.problems(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  flagged_harmful boolean default false,
  created_at timestamp with time zone default now(),
  unique(problem_id, user_id) -- one contribution per user per problem
);

-- AI-generated syntheses
create table public.syntheses (
  id uuid default gen_random_uuid() primary key,
  problem_id uuid references public.problems(id) on delete cascade not null,
  summary text not null,
  common_themes jsonb, -- array of theme objects
  divergent_views jsonb, -- array of divergent view objects
  considerations jsonb, -- array of important considerations
  warnings jsonb, -- any cautions raised
  contribution_count integer not null,
  helpful_count integer default 0,
  created_at timestamp with time zone default now()
);

-- Anonymous "this helped" feedback
create table public.helpful_flags (
  id uuid default gen_random_uuid() primary key,
  synthesis_id uuid references public.syntheses(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  unique(synthesis_id, user_id)
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.problems enable row level security;
alter table public.contributions enable row level security;
alter table public.syntheses enable row level security;
alter table public.helpful_flags enable row level security;

-- RLS Policies

-- Profiles: users can read their own profile, admins can read all
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Admins can view all profiles" on public.profiles
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Admins can delete profiles" on public.profiles
  for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- Categories: anyone can read
create policy "Anyone can view categories" on public.categories
  for select using (true);

-- Problems: users can read all gathering problems, own problems always, admins can read all
create policy "Users can view gathering problems" on public.problems
  for select using (status = 'gathering' or user_id = auth.uid());

create policy "Admins can view all problems" on public.problems
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

create policy "Users can insert own problems" on public.problems
  for insert with check (auth.uid() = user_id);

create policy "Users can update own problems" on public.problems
  for update using (auth.uid() = user_id);

create policy "Admins can delete problems" on public.problems
  for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- Contributions: users can only see their own (for duplicate check), can insert
create policy "Users can view own contributions" on public.contributions
  for select using (auth.uid() = user_id);

create policy "Users can insert contributions" on public.contributions
  for insert with check (auth.uid() = user_id);

-- Syntheses: anyone can view completed syntheses, owner and contributors can view any
create policy "Anyone can view completed syntheses" on public.syntheses
  for select using (
    exists (
      select 1 from public.problems
      where problems.id = syntheses.problem_id
      and problems.status = 'complete'
    )
  );

create policy "Problem owner can view synthesis" on public.syntheses
  for select using (
    exists (
      select 1 from public.problems
      where problems.id = syntheses.problem_id
      and problems.user_id = auth.uid()
    )
  );

create policy "Contributors can view synthesis" on public.syntheses
  for select using (
    exists (
      select 1 from public.contributions
      where contributions.problem_id = syntheses.problem_id
      and contributions.user_id = auth.uid()
    )
  );

-- Helpful flags: users can view and insert their own
create policy "Users can view own helpful flags" on public.helpful_flags
  for select using (auth.uid() = user_id);

create policy "Users can insert helpful flags" on public.helpful_flags
  for insert with check (auth.uid() = user_id);

-- Functions for incrementing counts (to avoid race conditions)

create or replace function increment_contribution_count(problem_id uuid)
returns void as $$
begin
  update public.problems
  set contribution_count = contribution_count + 1
  where id = problem_id;
end;
$$ language plpgsql security definer;

create or replace function increment_contributions_count(user_id uuid)
returns void as $$
begin
  update public.profiles
  set contributions_count = contributions_count + 1
  where id = user_id;
end;
$$ language plpgsql security definer;

create or replace function increment_problems_submitted(user_id uuid)
returns void as $$
begin
  update public.profiles
  set problems_submitted = problems_submitted + 1
  where id = user_id;
end;
$$ language plpgsql security definer;

create or replace function increment_helpful_count(synthesis_id uuid)
returns void as $$
begin
  update public.syntheses
  set helpful_count = helpful_count + 1
  where id = synthesis_id;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Seed categories
insert into public.categories (name, slug, description, icon) values
  ('Life Admin', 'life-admin', 'Bureaucracy, paperwork, organising', '📋'),
  ('Finances', 'finances', 'Budgeting, debt, money decisions', '💰'),
  ('Work & Career', 'work', 'Job issues, career decisions, workplace problems', '💼'),
  ('Relationships', 'relationships', 'Family, friends, partners, neighbours', '❤️'),
  ('Parenting', 'parenting', 'Raising children, family dynamics', '👶'),
  ('Health Decisions', 'health', 'Navigating healthcare, lifestyle choices', '🏥'),
  ('Practical & DIY', 'practical', 'Home, car, technical problems', '🔧'),
  ('Big Decisions', 'decisions', 'Life crossroads, major choices', '🤔');
