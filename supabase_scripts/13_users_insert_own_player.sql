-- 13: Allow authenticated users to insert their own player row.
-- Registration auto-creates a players row for the signing-up user
-- (see src/hooks/useRegistration.ts). Previously only Staff/Admin could
-- insert into public.players, which caused every non-staff registration to
-- fail with an RLS violation after the registrations row was written.

drop policy if exists "Users can insert own player" on public.players;
create policy "Users can insert own player"
  on public.players for insert
  with check (auth.uid() = user_id);
