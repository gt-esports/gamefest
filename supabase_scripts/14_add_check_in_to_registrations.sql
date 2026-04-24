-- 14: Add event check-in tracking to registrations.
-- checked_in already exists on the table (added manually).
-- This migration makes it idempotent and adds the audit columns.
-- Staff and admins can mark attendees as checked in at the event.
-- No new RLS policy needed: the existing "Staff/Admin can update registrations"
-- policy already permits staff/admin to update any column on public.registrations.

alter table public.registrations
  add column if not exists checked_in boolean not null default false,
  add column if not exists checked_in_at timestamptz,
  add column if not exists checked_in_by uuid references public.users(id) on delete set null;
