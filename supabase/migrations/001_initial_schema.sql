-- =========================================================
-- Student Tracker — Initial Database Schema
-- Migration: 001_initial_schema.sql
-- Run via: Supabase Dashboard → SQL Editor, or supabase db push
-- =========================================================

-- ─── Enable UUID extension ────────────────────────────────
create extension if not exists "pgcrypto";

-- ─── profiles ─────────────────────────────────────────────
-- Extends auth.users with student-specific metadata
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  institution text,
  year        text,
  track       text,
  created_at  timestamptz not null default now()
);

-- Trigger: auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── subjects ─────────────────────────────────────────────
create table if not exists public.subjects (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  name        text not null,
  color       text not null default '#7F77DD',
  type        text not null check (type in ('academic', 'personal')),
  coefficient integer,          -- only for academic subjects
  teacher     text,             -- only for academic subjects
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ─── tasks ────────────────────────────────────────────────
create table if not exists public.tasks (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references public.profiles(id) on delete cascade,
  type                 text not null check (type in ('simple', 'complex')),
  title                text not null,
  description          text not null default '',
  category             text not null default 'study',
  created_by           text not null default 'student' check (created_by in ('student', 'teacher', 'system')),
  due_date             date not null,
  priority             text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  status               text not null default 'pending',
  estimated_hours      numeric(5,2) not null default 1,
  actual_hours         numeric(5,2),
  subject_ids          uuid[] not null default '{}',
  tags                 text[] not null default '{}',
  started_date         timestamptz,
  completed_date       timestamptz,
  completion_quality   smallint check (completion_quality between 1 and 5),
  learning_gain        smallint check (learning_gain between 1 and 5),
  grade                numeric(4,2),
  notes                text,
  created_at           timestamptz not null default now()
);

-- ─── subtasks ─────────────────────────────────────────────
create table if not exists public.subtasks (
  id             uuid primary key default gen_random_uuid(),
  task_id        uuid not null references public.tasks(id) on delete cascade,
  title          text not null,
  description    text,
  estimated_hours numeric(5,2) not null default 1,
  due_date       date,
  status         text not null default 'pending' check (status in ('pending', 'in_progress', 'completed')),
  completed_date timestamptz,
  notes          text
);

-- ─── study_sessions ───────────────────────────────────────
create table if not exists public.study_sessions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.profiles(id) on delete cascade,
  subject_id       uuid references public.subjects(id) on delete set null,
  task_id          uuid references public.tasks(id) on delete set null,
  start_time       timestamptz not null,
  end_time         timestamptz,
  duration_minutes integer not null check (duration_minutes > 0),
  notes            text,
  quality          smallint check (quality between 1 and 5),
  created_at       timestamptz not null default now()
);

-- ─── reflections ──────────────────────────────────────────
create table if not exists public.reflections (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references public.profiles(id) on delete cascade,
  date                  date not null,
  subject_id            uuid references public.subjects(id) on delete set null,
  -- Time Investment
  hours_studied         numeric(5,2) not null default 0,
  sessions_count        integer not null default 0,
  avg_session_minutes   integer not null default 0,
  -- Productivity
  tasks_completed       integer not null default 0,
  study_consistency     smallint not null check (study_consistency between 1 and 10),
  -- Focus
  concentration_level   smallint not null check (concentration_level between 1 and 10),
  distractions_count    integer not null default 0,
  -- Satisfaction
  progress_satisfaction smallint not null check (progress_satisfaction between 1 and 10),
  confidence_level      smallint not null check (confidence_level between 1 and 10),
  motivation_level      smallint not null check (motivation_level between 1 and 10),
  -- Understanding
  self_assessed_mastery smallint not null check (self_assessed_mastery between 1 and 10),
  perceived_difficulty  smallint not null check (perceived_difficulty between 1 and 10),
  notes                 text,
  created_at            timestamptz not null default now()
);

-- ─── grades ───────────────────────────────────────────────
create table if not exists public.grades (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  title      text not null,
  value      numeric(4,2) not null check (value between 0 and 20),
  weight     numeric(4,2) not null default 1,
  date       date not null,
  teacher    text not null,
  type       text not null check (type in ('exam', 'tp', 'cc', 'project', 'quiz')),
  created_at timestamptz not null default now()
);

-- ─── absences ─────────────────────────────────────────────
create table if not exists public.absences (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references public.profiles(id) on delete cascade,
  subject_id           uuid references public.subjects(id) on delete set null,
  date                 date not null,
  duration             text not null check (duration in ('half', 'full')),
  reason               text,
  excused              boolean not null default false,
  certificate_provided boolean not null default false,
  created_at           timestamptz not null default now()
);

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================

alter table public.profiles      enable row level security;
alter table public.subjects       enable row level security;
alter table public.tasks          enable row level security;
alter table public.subtasks       enable row level security;
alter table public.study_sessions enable row level security;
alter table public.reflections    enable row level security;
alter table public.grades         enable row level security;
alter table public.absences       enable row level security;

-- profiles: users can read/update their own
create policy "profiles: own read"   on public.profiles for select using (auth.uid() = id);
create policy "profiles: own update" on public.profiles for update using (auth.uid() = id);

-- Helper: generic own-data policies for user_id columns
do $$ begin
  for tbl in select unnest(array['subjects','tasks','study_sessions','reflections','grades','absences']) as t loop
    execute format('create policy "%s: own all" on public.%s using (auth.uid() = user_id)', tbl, tbl);
    execute format('create policy "%s: own insert" on public.%s for insert with check (auth.uid() = user_id)', tbl, tbl);
  end loop;
end $$;

-- subtasks: accessible if parent task belongs to user
create policy "subtasks: own read" on public.subtasks
  for all using (
    exists (select 1 from public.tasks where tasks.id = subtasks.task_id and tasks.user_id = auth.uid())
  );

-- =========================================================
-- INDEXES
-- =========================================================

create index if not exists idx_subjects_user       on public.subjects(user_id);
create index if not exists idx_tasks_user          on public.tasks(user_id);
create index if not exists idx_tasks_status        on public.tasks(status);
create index if not exists idx_tasks_due           on public.tasks(due_date);
create index if not exists idx_subtasks_task       on public.subtasks(task_id);
create index if not exists idx_sessions_user       on public.study_sessions(user_id);
create index if not exists idx_sessions_subject    on public.study_sessions(subject_id);
create index if not exists idx_reflections_user    on public.reflections(user_id);
create index if not exists idx_reflections_date    on public.reflections(date);
create index if not exists idx_grades_user         on public.grades(user_id);
create index if not exists idx_absences_user       on public.absences(user_id);
