
-- Recreate missing public triggers with IF NOT EXISTS pattern
DO $$
BEGIN
  -- on_shop_created
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_shop_created') THEN
    CREATE TRIGGER on_shop_created
      AFTER INSERT ON public.shops
      FOR EACH ROW
      EXECUTE FUNCTION public.link_shop_creator();
  END IF;

  -- set_updated_at on orders
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at') THEN
    CREATE TRIGGER set_updated_at
      BEFORE UPDATE ON public.orders
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  -- prevent_role_change on profiles
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'prevent_role_change') THEN
    CREATE TRIGGER prevent_role_change
      BEFORE UPDATE ON public.profiles
      FOR EACH ROW
      EXECUTE FUNCTION public.prevent_role_self_update();
  END IF;
END $$;
