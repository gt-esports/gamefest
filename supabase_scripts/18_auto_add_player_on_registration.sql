-- 18: Auto-add a players row when a registration is created.
-- Runs as SECURITY DEFINER so it isn't gated by players RLS, and binds the
-- player insert to the registration insert in a single transaction. Replaces
-- the previous client-side upsert in src/hooks/useRegistration.ts.

create or replace function public.handle_new_registration_player()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.players (user_id)
  values (NEW.user_id)
  on conflict (user_id) do nothing;
  return NEW;
end;
$$;

drop trigger if exists on_new_registration_player on public.registrations;
create trigger on_new_registration_player
  after insert on public.registrations
  for each row execute procedure public.handle_new_registration_player();
