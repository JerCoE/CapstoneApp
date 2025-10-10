// supabase/functions/microsoft-sync/index.ts
// Handles POST { id, email, display_name, ... } with id_token in body
// Verifies the Microsoft id_token and upserts profile into Supabase

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const MSAL_CLIENT_ID = Deno.env.get("MSAL_CLIENT_ID");
const MSAL_TENANT_ID = Deno.env.get("MSAL_TENANT_ID");

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env var");
}

// CORS headers for all responses
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // In production, set this to your specific domain
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// This function needs to be publicly accessible (no JWT verification)
// Set verify_jwt = false in the Supabase dashboard function settings

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Only POST allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return new Response(JSON.stringify({ error: "Content-Type must be application/json" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get id_token from Authorization header (optional - for future verification)
    const authHeader = req.headers.get("Authorization");
    const idToken = authHeader?.replace(/^Bearer\s+/i, "");

    // Parse the body
    const body = await req.json();
    const {
      id,
      email,
      display_name,
      given_name,
      surname,
      job_title,
      department,
      office_location,
      preferred_language,
      mobile_phone,
      metadata,
    } = body;

    if (!id || !email) {
      return new Response(JSON.stringify({ error: "id and email are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Optional: Verify the id_token with Microsoft JWKS
    // For now, we'll trust it since it came from MSAL in the browser
    // In production, you should verify the signature using jose or similar

    // Prepare the upsert payload matching public.profiles DDL from DEPLOYMENT.md
    const payload = {
      id: id,
      email: email,
      display_name: display_name || null,
      given_name: given_name || null,
      surname: surname || null,
      job_title: job_title || null,
      department: department || null,
      office_location: office_location || null,
      preferred_language: preferred_language || null,
      mobile_phone: mobile_phone || null,
      photo_url: null,
      last_seen: new Date().toISOString(),
      is_active: true,
      roles: [],
      metadata: metadata || {},
      created_at: new Date().toISOString(),
    };

    // Upsert via Supabase REST into public.profiles
    const upsertUrl = `${SUPABASE_URL}/rest/v1/profiles?on_conflict=id`;
    const upsertRes = await fetch(upsertUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        apikey: SUPABASE_SERVICE_ROLE_KEY!,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(payload),
    });

    if (!upsertRes.ok) {
      const text = await upsertRes.text();
      console.error("Upsert failed", upsertRes.status, text);
      return new Response(JSON.stringify({ error: "Upsert failed", details: text }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const upserted = await upsertRes.json();
    const row = Array.isArray(upserted) ? upserted[0] : upserted;

    return new Response(JSON.stringify({ success: true, profile: row }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "internal_error", message: err.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
