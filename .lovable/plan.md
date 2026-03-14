

## Analysis

Phone OTP is failing because no SMS provider is configured in the backend's auth system. Supabase's built-in phone auth requires an SMS provider like Twilio, which isn't free at scale.

**Important reality check:** There is no truly free unlimited SMS OTP solution. Options:
- **Twilio free trial**: ~$15 credit (enough for ~2,000 SMS)
- **Twilio pay-as-go**: ~$0.0079/SMS after trial
- Supabase's built-in phone provider also uses Twilio under the hood

## Proposed Plan: Custom OTP via Twilio Connector

Since we can't configure the backend's built-in phone auth provider directly, we'll build a **custom OTP system** using the Twilio connector gateway:

### 1. Connect Twilio connector
- Use `standard_connectors--connect` with `twilio` to link Twilio credentials (you'll need a Twilio account with a phone number)

### 2. Create database table for OTP codes
```sql
CREATE TABLE public.phone_otps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  otp_code text NOT NULL,
  full_name text,
  expires_at timestamptz NOT NULL,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
-- RLS: public insert/select (needed before auth)
-- Auto-cleanup of expired OTPs
```

### 3. Create edge function `send-otp`
- Generates a random 6-digit OTP
- Stores it in `phone_otps` table with 5-minute expiry
- Sends SMS via Twilio connector gateway
- Uses `application/x-www-form-urlencoded` format

### 4. Create edge function `verify-otp`
- Validates OTP against `phone_otps` table
- If valid, creates/signs in user via Supabase Admin Auth (service role)
- Returns session token

### 5. Update AuthContext
- Replace `signInWithOtp`/`signUpWithPhone`/`verifyOtp` to call the custom edge functions instead of Supabase's built-in phone auth
- Handle session from the verify response

### 6. Update Login/Signup pages
- No UI changes needed — the existing phone tab UI will work with the updated auth context methods

### Cost
Twilio free trial gives ~$15.50 credit. Each SMS costs ~$0.0079 (US) or ~$0.04 (India). That's 300-2000 free OTPs depending on destination country.

