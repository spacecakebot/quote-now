
CREATE TABLE public.phone_otps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  otp_code text NOT NULL,
  full_name text,
  expires_at timestamptz NOT NULL,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.phone_otps ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts and selects (needed before auth)
CREATE POLICY "Allow anon insert phone_otps" ON public.phone_otps
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon select phone_otps" ON public.phone_otps
  FOR SELECT TO anon USING (true);

CREATE POLICY "Allow service role all phone_otps" ON public.phone_otps
  FOR ALL TO service_role USING (true) WITH CHECK (true);
