-- Migrate staff assignments from flat FK columns on user_roles to a
-- dedicated junction table, enabling multiple assignments per staff member.

-- 1. Create the new junction table
CREATE TABLE IF NOT EXISTS public.staff_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE,
  CONSTRAINT exactly_one_assignment CHECK (
    (game_id IS NOT NULL)::int + (challenge_id IS NOT NULL)::int = 1
  )
);

-- 2. Enable RLS
ALTER TABLE public.staff_assignments ENABLE ROW LEVEL SECURITY;

-- 3. RLS policies
CREATE POLICY "staff_assignments_select"
  ON public.staff_assignments
  FOR SELECT
  TO authenticated
  USING (public.has_app_role(ARRAY['staff', 'admin']));

CREATE POLICY "staff_assignments_insert"
  ON public.staff_assignments
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_app_role(ARRAY['admin']));

CREATE POLICY "staff_assignments_delete"
  ON public.staff_assignments
  FOR DELETE
  TO authenticated
  USING (public.has_app_role(ARRAY['admin']));

-- 4. Copy existing single game assignments
INSERT INTO public.staff_assignments (user_id, game_id)
SELECT user_id, game_assignment_id
FROM public.user_roles
WHERE game_assignment_id IS NOT NULL;

-- 5. Copy existing single challenge assignments
INSERT INTO public.staff_assignments (user_id, challenge_id)
SELECT user_id, challenge_assignment_id
FROM public.user_roles
WHERE challenge_assignment_id IS NOT NULL;

-- 6. Drop the now-redundant FK columns and legacy assignment text column
ALTER TABLE public.user_roles
  DROP COLUMN IF EXISTS game_assignment_id,
  DROP COLUMN IF EXISTS challenge_assignment_id,
  DROP COLUMN IF EXISTS assignment;
