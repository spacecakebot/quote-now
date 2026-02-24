
-- ============================================
-- ENUMS
-- ============================================
CREATE TYPE public.app_role AS ENUM ('owner', 'admin', 'vendor');
CREATE TYPE public.order_status AS ENUM ('draft', 'received', 'in_progress', 'ready', 'delivered', 'cancelled');
CREATE TYPE public.priority_level AS ENUM ('low', 'normal', 'high');
CREATE TYPE public.payment_status AS ENUM ('unpaid', 'partial', 'paid');
CREATE TYPE public.payment_method AS ENUM ('cash', 'upi', 'card', 'bank', 'other');
CREATE TYPE public.reminder_type AS ENUM ('payment_due', 'delivery_due', 'custom');
CREATE TYPE public.reminder_channel AS ENUM ('in_app', 'whatsapp');
CREATE TYPE public.reminder_status AS ENUM ('pending', 'sent', 'failed');
CREATE TYPE public.quotation_request_status AS ENUM ('requested', 'responded', 'cancelled');
CREATE TYPE public.quotation_status AS ENUM ('draft', 'sent', 'accepted', 'rejected');
CREATE TYPE public.message_status AS ENUM ('queued', 'sent', 'failed');

-- ============================================
-- 1) SHOPS
-- ============================================
CREATE TABLE public.shops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2) PROFILES
-- ============================================
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT,
  role public.app_role NOT NULL DEFAULT 'owner',
  shop_id UUID REFERENCES public.shops(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3) CUSTOMERS
-- ============================================
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4) VENDORS
-- ============================================
CREATE TABLE public.vendors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5) ORDERS
-- ============================================
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id),
  vendor_id UUID REFERENCES public.vendors(id),
  order_no TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status public.order_status NOT NULL DEFAULT 'draft',
  priority public.priority_level NOT NULL DEFAULT 'normal',
  due_date DATE,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  advance_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_status public.payment_status NOT NULL DEFAULT 'unpaid',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(shop_id, order_no)
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6) ORDER ATTACHMENTS
-- ============================================
CREATE TABLE public.order_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.order_attachments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 7) PAYMENTS
-- ============================================
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  method public.payment_method NOT NULL DEFAULT 'cash',
  paid_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 8) REMINDERS
-- ============================================
CREATE TABLE public.reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
  reminder_type public.reminder_type NOT NULL DEFAULT 'custom',
  message TEXT NOT NULL,
  due_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  channel public.reminder_channel NOT NULL DEFAULT 'in_app',
  status public.reminder_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 9) QUOTATION REQUESTS
-- ============================================
CREATE TABLE public.quotation_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  notes TEXT,
  status public.quotation_request_status NOT NULL DEFAULT 'requested',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.quotation_requests ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 10) QUOTATIONS
-- ============================================
CREATE TABLE public.quotations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  quotation_request_id UUID NOT NULL REFERENCES public.quotation_requests(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  details TEXT,
  status public.quotation_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded_at TIMESTAMPTZ
);
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 11) MESSAGE LOGS
-- ============================================
CREATE TABLE public.message_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  related_type TEXT NOT NULL, -- 'order', 'reminder', 'quotation'
  related_id UUID NOT NULL,
  channel TEXT NOT NULL DEFAULT 'whatsapp',
  to_phone TEXT NOT NULL,
  template_name TEXT,
  message_body TEXT NOT NULL,
  status public.message_status NOT NULL DEFAULT 'queued',
  provider_message_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.message_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Get current user's shop_id
CREATE OR REPLACE FUNCTION public.get_my_shop_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT shop_id FROM public.profiles WHERE id = auth.uid();
$$;

-- Get current user's role
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS public.app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Check if user belongs to a shop
CREATE OR REPLACE FUNCTION public.has_shop_access(target_shop_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND shop_id = target_shop_id
  );
$$;

-- Check if user is owner or admin
CREATE OR REPLACE FUNCTION public.is_owner_or_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'admin')
  );
$$;

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'User'),
    'owner'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- RLS POLICIES
-- ============================================

-- SHOPS
CREATE POLICY "Users can view their shop"
  ON public.shops FOR SELECT
  USING (public.has_shop_access(id));

CREATE POLICY "Owner can update their shop"
  ON public.shops FOR UPDATE
  USING (public.has_shop_access(id) AND public.get_my_role() = 'owner');

CREATE POLICY "Authenticated users can create shops"
  ON public.shops FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- PROFILES
CREATE POLICY "Users can view profiles in their shop"
  ON public.profiles FOR SELECT
  USING (
    id = auth.uid()
    OR (shop_id IS NOT NULL AND public.has_shop_access(shop_id))
  );

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Owner can update profiles in shop"
  ON public.profiles FOR UPDATE
  USING (public.has_shop_access(shop_id) AND public.get_my_role() = 'owner');

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- CUSTOMERS
CREATE POLICY "Shop members can view customers"
  ON public.customers FOR SELECT
  USING (public.has_shop_access(shop_id));

CREATE POLICY "Owner/Admin can manage customers"
  ON public.customers FOR INSERT
  WITH CHECK (public.has_shop_access(shop_id) AND public.is_owner_or_admin());

CREATE POLICY "Owner/Admin can update customers"
  ON public.customers FOR UPDATE
  USING (public.has_shop_access(shop_id) AND public.is_owner_or_admin());

CREATE POLICY "Owner/Admin can delete customers"
  ON public.customers FOR DELETE
  USING (public.has_shop_access(shop_id) AND public.is_owner_or_admin());

-- VENDORS
CREATE POLICY "Shop members can view vendors"
  ON public.vendors FOR SELECT
  USING (public.has_shop_access(shop_id));

CREATE POLICY "Owner/Admin can manage vendors"
  ON public.vendors FOR INSERT
  WITH CHECK (public.has_shop_access(shop_id) AND public.is_owner_or_admin());

CREATE POLICY "Owner/Admin can update vendors"
  ON public.vendors FOR UPDATE
  USING (public.has_shop_access(shop_id) AND public.is_owner_or_admin());

CREATE POLICY "Owner/Admin can delete vendors"
  ON public.vendors FOR DELETE
  USING (public.has_shop_access(shop_id) AND public.is_owner_or_admin());

-- ORDERS
CREATE POLICY "Shop members can view orders"
  ON public.orders FOR SELECT
  USING (
    public.has_shop_access(shop_id)
    AND (
      public.is_owner_or_admin()
      OR vendor_id IN (SELECT id FROM public.vendors WHERE shop_id = orders.shop_id)
    )
  );

CREATE POLICY "Owner/Admin can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (public.has_shop_access(shop_id) AND public.is_owner_or_admin());

CREATE POLICY "Owner/Admin can update orders"
  ON public.orders FOR UPDATE
  USING (public.has_shop_access(shop_id) AND public.is_owner_or_admin());

CREATE POLICY "Owner/Admin can delete orders"
  ON public.orders FOR DELETE
  USING (public.has_shop_access(shop_id) AND public.is_owner_or_admin());

-- ORDER ATTACHMENTS
CREATE POLICY "Shop members can view attachments"
  ON public.order_attachments FOR SELECT
  USING (public.has_shop_access(shop_id));

CREATE POLICY "Owner/Admin can manage attachments"
  ON public.order_attachments FOR INSERT
  WITH CHECK (public.has_shop_access(shop_id) AND public.is_owner_or_admin());

CREATE POLICY "Owner/Admin can update attachments"
  ON public.order_attachments FOR UPDATE
  USING (public.has_shop_access(shop_id) AND public.is_owner_or_admin());

CREATE POLICY "Owner/Admin can delete attachments"
  ON public.order_attachments FOR DELETE
  USING (public.has_shop_access(shop_id) AND public.is_owner_or_admin());

-- PAYMENTS
CREATE POLICY "Shop members can view payments"
  ON public.payments FOR SELECT
  USING (public.has_shop_access(shop_id));

CREATE POLICY "Owner/Admin can manage payments"
  ON public.payments FOR INSERT
  WITH CHECK (public.has_shop_access(shop_id) AND public.is_owner_or_admin());

CREATE POLICY "Owner/Admin can update payments"
  ON public.payments FOR UPDATE
  USING (public.has_shop_access(shop_id) AND public.is_owner_or_admin());

CREATE POLICY "Owner/Admin can delete payments"
  ON public.payments FOR DELETE
  USING (public.has_shop_access(shop_id) AND public.is_owner_or_admin());

-- REMINDERS
CREATE POLICY "Shop members can view reminders"
  ON public.reminders FOR SELECT
  USING (public.has_shop_access(shop_id));

CREATE POLICY "Owner/Admin can manage reminders"
  ON public.reminders FOR INSERT
  WITH CHECK (public.has_shop_access(shop_id) AND public.is_owner_or_admin());

CREATE POLICY "Owner/Admin can update reminders"
  ON public.reminders FOR UPDATE
  USING (public.has_shop_access(shop_id) AND public.is_owner_or_admin());

CREATE POLICY "Owner/Admin can delete reminders"
  ON public.reminders FOR DELETE
  USING (public.has_shop_access(shop_id) AND public.is_owner_or_admin());

-- QUOTATION REQUESTS
CREATE POLICY "Owner/Admin/Assigned vendor can view quotation requests"
  ON public.quotation_requests FOR SELECT
  USING (
    public.has_shop_access(shop_id)
    AND (
      public.is_owner_or_admin()
      OR vendor_id IN (SELECT id FROM public.vendors WHERE shop_id = quotation_requests.shop_id)
    )
  );

CREATE POLICY "Owner/Admin can manage quotation requests"
  ON public.quotation_requests FOR INSERT
  WITH CHECK (public.has_shop_access(shop_id) AND public.is_owner_or_admin());

CREATE POLICY "Owner/Admin can update quotation requests"
  ON public.quotation_requests FOR UPDATE
  USING (public.has_shop_access(shop_id) AND public.is_owner_or_admin());

CREATE POLICY "Owner/Admin can delete quotation requests"
  ON public.quotation_requests FOR DELETE
  USING (public.has_shop_access(shop_id) AND public.is_owner_or_admin());

-- QUOTATIONS
CREATE POLICY "Shop members can view quotations"
  ON public.quotations FOR SELECT
  USING (public.has_shop_access(shop_id));

CREATE POLICY "Owner/Admin/Vendor can create quotations"
  ON public.quotations FOR INSERT
  WITH CHECK (public.has_shop_access(shop_id));

CREATE POLICY "Owner/Admin can update quotations"
  ON public.quotations FOR UPDATE
  USING (public.has_shop_access(shop_id) AND public.is_owner_or_admin());

CREATE POLICY "Owner/Admin can delete quotations"
  ON public.quotations FOR DELETE
  USING (public.has_shop_access(shop_id) AND public.is_owner_or_admin());

-- MESSAGE LOGS
CREATE POLICY "Shop members can view message logs"
  ON public.message_logs FOR SELECT
  USING (public.has_shop_access(shop_id));

CREATE POLICY "Owner/Admin can manage message logs"
  ON public.message_logs FOR INSERT
  WITH CHECK (public.has_shop_access(shop_id) AND public.is_owner_or_admin());

CREATE POLICY "Owner/Admin can update message logs"
  ON public.message_logs FOR UPDATE
  USING (public.has_shop_access(shop_id) AND public.is_owner_or_admin());

CREATE POLICY "Owner/Admin can delete message logs"
  ON public.message_logs FOR DELETE
  USING (public.has_shop_access(shop_id) AND public.is_owner_or_admin());

-- ============================================
-- STORAGE BUCKET FOR ORDER ATTACHMENTS
-- ============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('order-attachments', 'order-attachments', false);

CREATE POLICY "Shop members can view order attachments"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'order-attachments' AND public.has_shop_access((storage.foldername(name))[1]::uuid));

CREATE POLICY "Owner/Admin can upload order attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'order-attachments' AND public.has_shop_access((storage.foldername(name))[1]::uuid) AND public.is_owner_or_admin());

CREATE POLICY "Owner/Admin can delete order attachments"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'order-attachments' AND public.has_shop_access((storage.foldername(name))[1]::uuid) AND public.is_owner_or_admin());

-- ============================================
-- ORDER NUMBER GENERATION FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION public.generate_order_no(p_shop_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_num INT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_no FROM 4) AS INT)), 0) + 1
  INTO next_num
  FROM public.orders
  WHERE shop_id = p_shop_id;
  
  RETURN 'GS-' || LPAD(next_num::TEXT, 4, '0');
END;
$$;
