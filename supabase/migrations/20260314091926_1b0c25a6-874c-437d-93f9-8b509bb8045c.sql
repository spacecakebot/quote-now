
-- Fix 1: Profiles INSERT policy - prevent setting role to owner/admin and arbitrary shop_id
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (
    id = auth.uid()
    AND role = 'owner'
    AND shop_id IS NULL
  );

-- Fix 2: Profiles UPDATE own profile - add WITH CHECK to prevent role/shop_id self-escalation
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
    AND (
      shop_id IS NOT DISTINCT FROM (SELECT p.shop_id FROM public.profiles p WHERE p.id = auth.uid())
    )
  );

-- Fix 3: Orders SELECT - restrict to owner/admin only (remove overly broad vendor condition)
DROP POLICY IF EXISTS "Shop members can view orders" ON public.orders;
CREATE POLICY "Owner/Admin can view orders" ON public.orders
  FOR SELECT TO authenticated
  USING (has_shop_access(shop_id) AND is_owner_or_admin());
