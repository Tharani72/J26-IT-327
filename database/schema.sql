-- 1. Each logged-in person gets a profile
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'student'
    check (role in ('student', 'teacher', 'admin')),
  created_at timestamptz not null default now()
);

-- 2. Sign-language lessons
create table public.signs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  sinhala_label text,
  category text,
  difficulty text not null default 'beginner',
  instruction_text text,
  image_path text,
  video_path text,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

-- 3. Student practice results
create table public.practice_attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  sign_id uuid not null references public.signs(id) on delete cascade,
  score numeric(5,2),
  feedback text,
  hand_landmarks jsonb,
  glove_data jsonb,
  gaze_data jsonb,
  recording_path text,
  created_at timestamptz not null default now()
);

-- 4. Student learning progress summary
create table public.learning_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  sign_id uuid not null references public.signs(id) on delete cascade,
  status text not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'completed')),
  best_score numeric(5,2),
  last_practiced_at timestamptz,
  unique (student_id, sign_id)
);

-- Turn on database security
alter table public.profiles enable row level security;
alter table public.signs enable row level security;
alter table public.practice_attempts enable row level security;
alter table public.learning_progress enable row level security;

-- Everyone who logs in can see only published lessons
create policy "Read published signs"
on public.signs
for select
to authenticated
using (is_published = true);

-- Every user can view and edit only their own profile
create policy "Read own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "Update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- Every student can see and save only their own attempts
create policy "Read own attempts"
on public.practice_attempts
for select
to authenticated
using (auth.uid() = student_id);

create policy "Create own attempts"
on public.practice_attempts
for insert
to authenticated
with check (auth.uid() = student_id);

-- Every student can see and manage only their own progress
create policy "Read own progress"
on public.learning_progress
for select
to authenticated
using (auth.uid() = student_id);

create policy "Create own progress"
on public.learning_progress
for insert
to authenticated
with check (auth.uid() = student_id);

create policy "Update own progress"
on public.learning_progress
for update
to authenticated
using (auth.uid() = student_id)
with check (auth.uid() = student_id);