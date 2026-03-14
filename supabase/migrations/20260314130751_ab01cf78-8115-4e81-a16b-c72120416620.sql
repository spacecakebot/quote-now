-- 1. Replace the vulnerable UPDATE policy (remove self-assignment clause)
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

-- 2. Create trigger function to auto-link profile on shop creation
CREATE OR REPLACE FUNCTION public.link_shop_creator()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Validate creator exists, is owner, and has no shop yet
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = NEW.created_by
      AND role = 'owner'
      AND shop_id IS NULL
  ) THEN
    RAISE EXCEPTION 'Only owners without a shop can create a new shop';
  END IF;

  -- Assign the new shop to the creator's profile
  UPDATE public.profiles
  SET shop_id = NEW.id
  WHERE id = NEW.created_by;

  RETURN NEW;
END;
$$;

-- 3. Add trigger on shops table
CREATE TRIGGER on_shop_created
  AFTER INSERT ON public.shops
  FOR EACH ROW
  EXECUTE FUNCTION public.link_shop_creator();