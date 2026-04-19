-- 10: Fix handle_new_user() after display_name column was dropped in 08.
-- The prior trigger still referenced display_name, causing
-- "Database error saving new user" on every new signup.

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

  insert into public.users (id, username, avatar_url, fname, lname)
  values (
    new.id,
    full_name,
    new.raw_user_meta_data->>'avatar_url',
    first_part,
    last_part
  );
  return new;
end;
$$ language plpgsql security definer;
