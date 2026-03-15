import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/twilio";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const TWILIO_API_KEY = Deno.env.get("TWILIO_API_KEY");
    if (!TWILIO_API_KEY) throw new Error("TWILIO_API_KEY is not configured");

    const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER");
    if (!TWILIO_PHONE_NUMBER) throw new Error("TWILIO_PHONE_NUMBER is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authError || !user) throw new Error("Unauthorized");

    const body = await req.json();
    const { to_phone, message_body, shop_id, related_type, related_id, template_name, channel = "whatsapp" } = body;

    if (!to_phone || !message_body || !shop_id || !related_type || !related_id) {
      return new Response(JSON.stringify({ error: "Missing required fields: to_phone, message_body, shop_id, related_type, related_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate phone format
    const cleanPhone = to_phone.startsWith("+") ? to_phone : `+${to_phone}`;

    // Determine sending method
    let twilioFrom: string;
    let twilioTo: string;

    if (channel === "whatsapp") {
      twilioFrom = `whatsapp:${TWILIO_PHONE_NUMBER}`;
      twilioTo = `whatsapp:${cleanPhone}`;
    } else {
      twilioFrom = TWILIO_PHONE_NUMBER;
      twilioTo = cleanPhone;
    }

    // Send via Twilio gateway
    const smsResponse = await fetch(`${GATEWAY_URL}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": TWILIO_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: twilioTo,
        From: twilioFrom,
        Body: message_body,
      }),
    });

    const smsData = await smsResponse.json();
    const status = smsResponse.ok ? "sent" : "failed";
    const providerMessageId = smsData?.sid || null;

    // Log to message_logs
    await supabase.from("message_logs").insert({
      shop_id,
      to_phone: cleanPhone,
      message_body,
      channel,
      related_type,
      related_id,
      template_name: template_name || null,
      status,
      provider_message_id: providerMessageId,
    });

    if (!smsResponse.ok) {
      console.error("Twilio error:", JSON.stringify(smsData));
      return new Response(JSON.stringify({ success: false, error: `Message delivery failed [${smsResponse.status}]`, details: smsData }), {
        status: 200, // Return 200 so frontend can show the error gracefully
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, message_id: providerMessageId }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error in send-whatsapp:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
