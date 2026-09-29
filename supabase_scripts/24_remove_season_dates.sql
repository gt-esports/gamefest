-- Run after 23_drop_winners.sql. Season dates did not control registration,
-- visibility, or brackets, so only the active tournament slug remains editable.
begin;

drop function if exists public.update_active_season(uuid, date, date, text);

alter table public.seasons
  drop column if exists starts_on,
  drop column if exists ends_on;

create or replace function public.update_active_season(
  p_season_id uuid,
  p_tournament_slug text
)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not public.has_app_role(array['admin']) then
    raise exception 'Only admins can edit the active season';
  end if;
  if nullif(btrim(p_tournament_slug), '') is not null
     and p_tournament_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then
    raise exception 'Tournament slug must use lowercase letters, numbers, and hyphens';
  end if;

  update public.seasons
  set tournament_slug = nullif(btrim(p_tournament_slug), '')
  where id = p_season_id and is_active;

  if not found then
    raise exception 'The active season changed. Reload and try again';
  end if;
end;
$$;

revoke all on function public.update_active_season(uuid, text) from public;
grant execute on function public.update_active_season(uuid, text) to authenticated;

commit;
