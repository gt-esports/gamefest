-- Add first/last name columns to public.users
alter table public.users
  add column if not exists fname text,
  add column if not exists lname text;

-- Update new-user trigger to best-effort populate fname/lname from Discord metadata.
-- Users will still be prompted to confirm/edit these on next login.
create or replace function public.handle_new_user()
returns trigger as $$
declare
  full_name text := new.raw_user_meta_data->>'full_name';
  first_part text;
  last_part text;
begin
  if full_name is not null and position(' ' in full_name) > 0 then
    first_part := split_part(full_name, ' ', 1);
    last_part  := substr(full_name, position(' ' in full_name) + 1);
  else
    first_part := full_name;
    last_part  := null;
  end if;

  insert into public.users (id, username, display_name, avatar_url, fname, lname)
  values (
    new.id,
    full_name,
    full_name,
    new.raw_user_meta_data->>'avatar_url',
    first_part,
    last_part
  );
  return new;
end;
$$ language plpgsql security definer;
