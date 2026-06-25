-- =========================================================
-- Student Tracker — RBAC & Groups Schema
-- Migration: 002_rbac_schema.sql
-- =========================================================

-- ─── 1. Role Enum & Profile Column ─────────────────────────
create type public.user_role as enum ('student', 'teacher');

alter table public.profiles 
  add column if not exists role public.user_role not null default 'student';

-- Update the auto-profile signup trigger to insert the role
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'student')::public.user_role
  )
  on conflict (id) do update set
    role = excluded.role;
  return new;
end;
$$;

-- ─── 2. Groups Tables ──────────────────────────────────────
create table if not exists public.groups (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  created_at  timestamptz not null default now()
);

create table if not exists public.group_students (
  group_id   uuid not null references public.groups(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  primary key (group_id, student_id)
);

create table if not exists public.group_teachers (
  group_id   uuid not null references public.groups(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  primary key (group_id, teacher_id)
);

-- ─── 3. Add Group Foreign Keys to academic entities ────────
alter table public.tasks 
  add column if not exists group_id uuid references public.groups(id) on delete set null;

alter table public.grades 
  add column if not exists group_id uuid references public.groups(id) on delete set null;

alter table public.absences 
  add column if not exists group_id uuid references public.groups(id) on delete set null;

-- ─── 4. RLS & Policy Helpers ──────────────────────────────
create or replace function public.is_teacher(user_id uuid)
returns boolean language plpgsql security definer as $$
begin
  return exists (
    select 1 from public.profiles
    where id = user_id and role = 'teacher'
  );
end;
$$;

create or replace function public.is_teacher_of_student(teacher_id uuid, student_id uuid)
returns boolean language plpgsql security definer as $$
begin
  return exists (
    select 1
    from public.group_teachers gt
    join public.group_students gs on gt.group_id = gs.group_id
    where gt.teacher_id = teacher_id and gs.student_id = student_id
  );
end;
$$;

-- Enable RLS on groups and mappings
alter table public.groups enable row level security;
alter table public.group_students enable row level security;
alter table public.group_teachers enable row level security;

-- ─── 5. Policies for Groups ───────────────────────────────
create policy "groups: select members" on public.groups
  for select using (
    exists (select 1 from public.group_students where group_id = id and student_id = auth.uid()) or
    exists (select 1 from public.group_teachers where group_id = id and teacher_id = auth.uid())
  );

create policy "groups: teachers edit" on public.groups
  for all using (public.is_teacher(auth.uid()));

-- Policies for Group Students
create policy "group_students: select members" on public.group_students
  for select using (
    student_id = auth.uid() or
    exists (select 1 from public.group_teachers where group_id = group_students.group_id and teacher_id = auth.uid())
  );

create policy "group_students: teachers edit" on public.group_students
  for all using (public.is_teacher(auth.uid()));

-- Policies for Group Teachers
create policy "group_teachers: select members" on public.group_teachers
  for select using (
    teacher_id = auth.uid() or
    exists (select 1 from public.group_students where group_id = group_teachers.group_id and student_id = auth.uid())
  );

create policy "group_teachers: teachers edit" on public.group_teachers
  for all using (public.is_teacher(auth.uid()));

-- ─── 6. Update Academic Entities Policies for RBAC ─────────

-- Drop old own-data policies
drop policy if exists "subjects: own all" on public.subjects;
drop policy if exists "subjects: own insert" on public.subjects;

drop policy if exists "tasks: own all" on public.tasks;
drop policy if exists "tasks: own insert" on public.tasks;

drop policy if exists "grades: own all" on public.grades;
drop policy if exists "grades: own insert" on public.grades;

drop policy if exists "absences: own all" on public.absences;
drop policy if exists "absences: own insert" on public.absences;

-- Recreate Subjects policies
create policy "subjects: select all authenticated" on public.subjects 
  for select using (auth.role() = 'authenticated');

create policy "subjects: own insert" on public.subjects 
  for insert with check (auth.uid() = user_id);

create policy "subjects: own update/delete" on public.subjects 
  for all using (auth.uid() = user_id);

-- Recreate Tasks policies
create policy "tasks: select" on public.tasks 
  for select using (auth.uid() = user_id or public.is_teacher_of_student(auth.uid(), user_id));

create policy "tasks: insert" on public.tasks 
  for insert with check (auth.uid() = user_id or public.is_teacher_of_student(auth.uid(), user_id));

create policy "tasks: update" on public.tasks 
  for update using (auth.uid() = user_id or public.is_teacher_of_student(auth.uid(), user_id));

create policy "tasks: delete" on public.tasks 
  for delete using (auth.uid() = user_id or public.is_teacher_of_student(auth.uid(), user_id));

-- Recreate Grades policies
create policy "grades: select" on public.grades 
  for select using (auth.uid() = user_id or public.is_teacher_of_student(auth.uid(), user_id));

create policy "grades: insert" on public.grades 
  for insert with check (auth.uid() = user_id or public.is_teacher_of_student(auth.uid(), user_id));

create policy "grades: update" on public.grades 
  for update using (auth.uid() = user_id or public.is_teacher_of_student(auth.uid(), user_id));

create policy "grades: delete" on public.grades 
  for delete using (auth.uid() = user_id or public.is_teacher_of_student(auth.uid(), user_id));

-- Recreate Absences policies
create policy "absences: select" on public.absences 
  for select using (auth.uid() = user_id or public.is_teacher_of_student(auth.uid(), user_id));

create policy "absences: insert" on public.absences 
  for insert with check (auth.uid() = user_id or public.is_teacher_of_student(auth.uid(), user_id));

create policy "absences: update" on public.absences 
  for update using (auth.uid() = user_id or public.is_teacher_of_student(auth.uid(), user_id));

create policy "absences: delete" on public.absences 
  for delete using (auth.uid() = user_id or public.is_teacher_of_student(auth.uid(), user_id));
