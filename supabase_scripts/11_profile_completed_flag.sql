-- 11: Add profile_completed flag and stop auto-populating fname/lname from
-- Discord metadata. Discord handles (e.g. "kevinhu91846") are not real names,
-- so we prompt every user to fill in their actual name via the
-- CompleteProfileModal. `profile_completed` flips to true only when the user
-- submits that form.

alter table public.users
  add column if not exists profile_completed boolean not null default false;

-- Backfill: mark existing users as complete only if they already have a real
-- fname AND lname. Everyone else (null/blank either field, or never filled it
-- in) will be prompted by the modal on next visit.
update public.users
set profile_completed = true
where coalesce(nullif(trim(fname), ''), null) is not null
  and coalesce(nullif(trim(lname), ''), null) is not null;

-- Rewrite the new-user trigger to leave fname/lname null. The modal will
-- collect them on first sign-in.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, username, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;
