-- 20: Drop unused points_per_award column from games and challenges.
--
-- The column was never used in the award flow (award_points RPC takes an
-- explicit amount); it was only displayed in the admin UI.  Removing it
-- simplifies the schema and prevents confusion.

alter table public.games      drop column if exists points_per_award;
alter table public.challenges drop column if exists points_per_award;
