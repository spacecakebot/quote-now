
-- Fix: Replace recursive UPDATE policy with security definer functions
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = get_my_role()
    AND (
      shop_id IS NOT DISTINCT FROM get_my_shop_id()
      OR (get_my_shop_id() IS NULL AND shop_id IS NOT NULL)
    )
  );
