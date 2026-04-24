-- Harden the public.users UPDATE policy by adding a WITH CHECK clause.
-- Without WITH CHECK, a user could change their row's `id` to another user's UUID
-- during an UPDATE. The USING clause only gates which rows are visible for update;
-- WITH CHECK enforces the same condition on the new row values post-update.
-- Re-running is safe: we drop and recreate the policy.

drop policy if exists "Users can update own profile" on public.users;
create policy "Users can update own profile"
  on public.users for update
  using ( auth.uid() = id )
  with check ( auth.uid() = id );
