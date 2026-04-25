-- 16: Make check-in writes atomic and bind performer to auth.uid().
--
-- Two changes:
--   (a) check_in_events.performed_by must equal auth.uid() — staff can no
--       longer attribute a check-in to anyone but themselves.
--   (b) Update of registrations + insert into check_in_events happens inside
--       a single plpgsql function, so partial failures roll back together.

-- (a) Server-side performer binding.
alter table public.check_in_events
  alter column performed_by set default auth.uid();

drop policy if exists "staff_admin_can_insert_check_in_events" on public.check_in_events;

create policy "staff_admin_can_insert_check_in_events" on public.check_in_events
  for insert to authenticated
  with check (
    public.has_app_role(array['staff', 'admin'])
    and performed_by = auth.uid()
  );

-- (b) Atomic RPCs. SECURITY INVOKER so existing RLS on registrations and
-- check_in_events continues to apply; plpgsql gives us transactional rollback.

create or replace function public.check_in_user(p_user_id uuid)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_updated int;
begin
  if not public.has_app_role(array['staff', 'admin']) then
    raise exception 'Only staff or admins can check in players';
  end if;

  update public.registrations
    set checked_in    = true,
        checked_in_at = now(),
        checked_in_by = auth.uid()
    where user_id = p_user_id;

  get diagnostics v_updated = row_count;
  if v_updated = 0 then
    raise exception 'This player hasn''t completed event registration. Ask them to register before checking in.';
  end if;

  insert into public.check_in_events (user_id, event_type, performed_by)
    values (p_user_id, 'check_in', auth.uid());
end;
$$;

create or replace function public.check_out_user(p_user_id uuid)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_updated int;
begin
  if not public.has_app_role(array['staff', 'admin']) then
    raise exception 'Only staff or admins can check out players';
  end if;

  update public.registrations
    set checked_in    = false,
        checked_in_at = null,
        checked_in_by = null
    where user_id = p_user_id;

  get diagnostics v_updated = row_count;
  if v_updated = 0 then
    raise exception 'Check-out failed — player may not be registered.';
  end if;

  insert into public.check_in_events (user_id, event_type, performed_by)
    values (p_user_id, 'check_out', auth.uid());
end;
$$;

create or replace function public.reset_all_check_ins()
returns int
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_reset_count int;
begin
  if not public.has_app_role(array['staff', 'admin']) then
    raise exception 'Only staff or admins can reset check-ins';
  end if;

  with reset as (
    update public.registrations
      set checked_in    = false,
          checked_in_at = null,
          checked_in_by = null
      where checked_in = true
      returning user_id
  ),
  logged as (
    insert into public.check_in_events (user_id, event_type, performed_by)
    select user_id, 'check_out', auth.uid() from reset
    returning 1
  )
  select count(*) into v_reset_count from logged;

  return coalesce(v_reset_count, 0);
end;
$$;

grant execute on function public.check_in_user(uuid) to authenticated;
grant execute on function public.check_out_user(uuid) to authenticated;
grant execute on function public.reset_all_check_ins() to authenticated;
