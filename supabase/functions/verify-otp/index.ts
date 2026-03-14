import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    // Check if user exists with this phone
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find((u) => u.phone === phone);

    let session;

    if (existingUser) {
      // Sign in existing user
      const { data, error } = await supabase.auth.admin.generateLink({
        type: "magiclink",
        email: existingUser.email || `${phone.replace(/\+/g, "")}@phone.local`,
      });
      
      if (error) throw new Error(`Failed to generate link: ${error.message}`);

      // Use signInWithPassword with a temp password approach
      // Better: use admin to create a session directly
      const tempPassword = crypto.randomUUID();
      await supabase.auth.admin.updateUser(existingUser.id, { password: tempPassword });
      
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        phone,
        password: tempPassword,
      });

      if (signInError) throw new Error(`Sign in failed: ${signInError.message}`);
      session = signInData.session;
    } else {
      // Create new user
      const tempPassword = crypto.randomUUID();
      const fullName = otpRecord.full_name || "User";
      
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        phone,
        phone_confirm: true,
        password: tempPassword,
        user_metadata: { full_name: fullName },
      });

      if (createError) throw new Error(`Failed to create user: ${createError.message}`);

      // Sign in the new user
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        phone,
        password: tempPassword,
      });

      if (signInError) throw new Error(`Sign in failed: ${signInError.message}`);
      session = signInData.session;
    }

    // Clean up expired OTPs
    await supabase.from("phone_otps").delete().lt("expires_at", new Date().toISOString());

    return new Response(JSON.stringify({ success: true, session }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error in verify-otp:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
