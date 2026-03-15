DROP TRIGGER IF EXISTS on_shop_created ON public.shops;

CREATE TRIGGER on_shop_created
  AFTER INSERT ON public.shops
  FOR EACH ROW
  EXECUTE FUNCTION public.link_shop_creator();