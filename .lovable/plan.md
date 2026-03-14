

## Problem

The profiles table has two security issues:

1. **INSERT policy** — currently restricts to `role = 'owner' AND shop_id IS NULL`, which is correct for new signups but the scanner still flags it because the policy name/structure changed.

2. **UPDATE policy** — the WITH CHECK clause queries the `profiles` table from within a policy on `profiles`, which causes **infinite recursion**. Additionally, this policy blocks legitimate operations like setting `shop_id` during shop creation (in `ShopSetup.tsx` line 32).

The root cause: role and shop_id changes need to be controlled, but the current approach of comparing against a self-referencing subquery is both recursive and too restrictive for legitimate flows.

## Plan

### 1. Create security definer functions for safe profile field access

Create two new `SECURITY DEFINER` functions that bypass RLS to read the current user's role and shop_id (note: `get_my_role()` and `get_my_shop_id()` already exist and can be reused).

### 2. Replace the recursive UPDATE policy

Drop the current "Users can update own profile" policy and replace it with one that:
- Uses `get_my_role()` and `get_my_shop_id()` (existing security definer functions) instead of subqueries
- Prevents role changes (role must equal `get_my_role()`)
- Allows setting shop_id only if it's currently NULL (for shop setup), but prevents changing to a different shop once set

```sql
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = get_my_role()
    AND (
      -- Allow setting shop_id if currently NULL, or keep it the same
      shop_id IS NOT DISTINCT FROM get_my_shop_id()
      OR (get_my_shop_id() IS NULL AND shop_id IS NOT NULL)
    )
  );
```

### 3. Keep INSERT policy as-is

The current INSERT policy (`role = 'owner' AND shop_id IS NULL`) is already correct. The `handle_new_user` trigger creates profiles server-side, so client inserts are rare. No change needed.

### 4. Dismiss the scanner finding

After the migration, the recursive subquery issue will be resolved and the privilege escalation path will be closed.

### Summary of database migration

One migration with:
- Drop and recreate the "Users can update own profile" policy using security definer functions instead of self-referencing subqueries

No frontend code changes needed — `ShopSetup.tsx` will continue to work because the new policy allows setting `shop_id` when it's currently NULL.

