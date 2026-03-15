
-- Drop and recreate the shops INSERT policy with explicit TO authenticated
DROP POLICY IF EXISTS "Authenticated users can create shops" ON public.shops;
CREATE POLICY "Authenticated users can create shops" ON public.shops
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = created_by);

-- Recreate the trigger (was missing from db)
DROP TRIGGER IF EXISTS on_shop_created ON public.shops;
CREATE TRIGGER on_shop_created
  AFTER INSERT ON public.shops
  FOR EACH ROW
  EXECUTE FUNCTION public.link_shop_creator();
