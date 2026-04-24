-- 15: Check-in event log.
-- Append-only audit table for event check-ins and undo actions.
-- registrations.checked_in / checked_in_at / checked_in_by remain
-- the source of truth for current state; this table records history.

create table if not exists public.check_in_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  event_type text not null check (event_type in ('check_in', 'check_out')),
  performed_by uuid references public.users(id) on delete set null,
  occurred_at timestamptz not null default now()
);

create index if not exists idx_check_in_events_user_occurred
  on public.check_in_events(user_id, occurred_at desc);
create index if not exists idx_check_in_events_performed_by
  on public.check_in_events(performed_by);

alter table public.check_in_events enable row level security;

create policy "staff_admin_can_select_check_in_events" on public.check_in_events
  for select to authenticated
  using (public.has_app_role(array['staff', 'admin']));

create policy "staff_admin_can_insert_check_in_events" on public.check_in_events
  for insert to authenticated
  with check (public.has_app_role(array['staff', 'admin']));

-- No UPDATE or DELETE policies: rows are immutable audit records.
