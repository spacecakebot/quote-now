import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function phoneToEmail(phone: string): string {
  return `${phone.replace(/\+/g, "")}@phone.goldshop.local`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, otp } = await req.json();
    if (!phone || !otp) {
      return new Response(JSON.stringify({ error: "Phone and OTP are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find valid OTP
    const { data: otpRecord, error: fetchError } = await supabase
      .from("phone_otps")
      .select("*")
      .eq("phone", phone)
      .eq("otp_code", otp)
      .eq("verified", false)
      .gte("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !otpRecord) {
      return new Response(JSON.stringify({ error: "Invalid or expired OTP" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mark OTP as verified
    await supabase.from("phone_otps").update({ verified: true }).eq("id", otpRecord.id);

    const generatedEmail = phoneToEmail(phone);
    const tempPassword = crypto.randomUUID();
    const fullName = otpRecord.full_name || "User";

    // Check if user with this email exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find((u) => u.email === generatedEmail);

    if (existingUser) {
      // Update password and sign in
      await supabase.auth.admin.updateUser(existingUser.id, { password: tempPassword });

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: generatedEmail,
        password: tempPassword,
      });

      if (signInError) throw new Error(`Sign in failed: ${signInError.message}`);

      return new Response(JSON.stringify({ success: true, session: signInData.session }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      // Create new user with email-based auth
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: generatedEmail,
        email_confirm: true,
        password: tempPassword,
        phone,
        phone_confirm: true,
        user_metadata: { full_name: fullName },
      });

      if (createError) throw new Error(`Failed to create user: ${createError.message}`);

      // Update profile with phone number
      await supabase.from("profiles").update({ phone }).eq("id", newUser.user.id);

      // Sign in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: generatedEmail,
        password: tempPassword,
      });

      if (signInError) throw new Error(`Sign in failed: ${signInError.message}`);

      return new Response(JSON.stringify({ success: true, session: signInData.session }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (error: unknown) {
    console.error("Error in verify-otp:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
