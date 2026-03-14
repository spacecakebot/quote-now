
Goal: eliminate the `profiles_self_shop_assignment` privilege-escalation path without breaking first-time shop setup.

1) Confirmed root cause
- Current policy `Users can update own profile` allows:
  `get_my_shop_id() IS NULL AND shop_id IS NOT NULL`
- That lets any newly registered owner (`role='owner'`, `shop_id=NULL`) join any shop by UUID and inherit full shop access.

2) Backend policy fix (migration)
- Replace `Users can update own profile` with a strict policy that disallows self-changing `shop_id`.
- New `WITH CHECK` should enforce:
  - `id = auth.uid()`
  - `role = get_my_role()` (no self role escalation)
  - `shop_id IS NOT DISTINCT FROM get_my_shop_id()` (shop_id must remain unchanged)

Planned SQL shape:
```sql
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (
  id = auth.uid()
  AND role = get_my_role()
  AND shop_id IS NOT DISTINCT FROM get_my_shop_id()
);
```

3) Preserve onboarding flow securely (trusted server-side assignment)
Because ShopSetup currently does a direct client update to `profiles.shop_id`, tightening policy would block onboarding.  
To keep onboarding working safely, add a trusted server-side mechanism:

- Create `SECURITY DEFINER` trigger function on `shops` insert:
  - Validate creator has a profile
  - Validate creator is `owner`
  - Validate creator currently has `shop_id IS NULL`
  - Set creator’s `profiles.shop_id = NEW.id`
- Add trigger: `AFTER INSERT ON public.shops`

This ensures shop membership assignment happens in trusted backend logic, not user-controlled profile update.

4) Frontend adjustment
File: `src/pages/ShopSetup.tsx`
- Remove direct client update:
  `supabase.from('profiles').update({ shop_id: shop.id }).eq('id', user!.id)`
- Keep shop insert + `refreshProfile()`.
- Trigger handles profile linking automatically.

5) Verification checklist
- Security:
  - Attempt `profiles` self-update to arbitrary `shop_id` as a new user → denied.
  - Attempt role self-change (`owner`/`admin`) → denied.
- Functional:
  - New user creates shop via ShopSetup → profile gets linked automatically.
  - App exits setup screen after refresh (shop now present).
- Governance:
  - Re-run security scan and confirm `profiles_self_shop_assignment` is gone.

Technical details
- Files to change:
  - New migration in `supabase/migrations/*` (policy replacement + trigger function + trigger)
  - `src/pages/ShopSetup.tsx` (remove insecure direct profile update)
- No changes needed in `AuthContext` or generated Supabase client/types files.
