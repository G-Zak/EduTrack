-- =========================================================
-- Student Tracker — Group Sign-up Support
-- Migration: 003_group_signup.sql
-- =========================================================

-- Allow anonymous/public read of groups during sign-up
-- (so the sign-up form can list available groups before the user is authenticated)
create policy "groups: public read for signup" on public.groups
  for select using (true);

-- Allow the trigger / signup function to insert into group_students
-- even before the user session is fully established
create policy "group_students: self insert on signup" on public.group_students
  for insert with check (student_id = auth.uid());
