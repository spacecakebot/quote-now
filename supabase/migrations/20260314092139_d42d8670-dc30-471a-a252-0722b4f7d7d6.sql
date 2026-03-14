
-- Fix quotation_requests SELECT - restrict to owner/admin only
DROP POLICY IF EXISTS "Owner/Admin/Assigned vendor can view quotation requests" ON public.quotation_requests;
CREATE POLICY "Owner/Admin can view quotation requests" ON public.quotation_requests
  FOR SELECT TO authenticated
  USING (has_shop_access(shop_id) AND is_owner_or_admin());

-- Fix quotations INSERT - restrict to owner/admin only
DROP POLICY IF EXISTS "Owner/Admin/Vendor can create quotations" ON public.quotations;
CREATE POLICY "Owner/Admin can create quotations" ON public.quotations
  FOR INSERT TO authenticated
  WITH CHECK (has_shop_access(shop_id) AND is_owner_or_admin());
