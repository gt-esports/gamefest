-- Bracket results are read from start.gg. This removes the redundant
-- manually stored match winners (and any rows in that table).
begin;
drop table if exists public.winners;
commit;
