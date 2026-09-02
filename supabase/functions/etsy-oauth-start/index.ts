// POST /functions/v1/etsy-oauth-start
// Admin-only. Begins the Etsy OAuth 2.0 + PKCE authorization flow: generates a
// code_verifier/code_challenge pair and a CSRF state token, stores the verifier
// server-side (etsy-oauth-callback looks it up by state once Etsy redirects
// back), and returns the URL to send the admin's browser to.
//
// Flow (verified against https://developers.etsy.com/documentation/essentials/authentication, 2026-09):
//   1. This function: generate + store PKCE pair, return Etsy's authorize URL.
//   2. Admin's browser visits that URL, logs into Etsy, approves the app.
//   3. Etsy redirects to etsy-oauth-callback with ?code=...&state=...
//   4. etsy-oauth-callback exchanges the code for tokens and stores them.
//
// PKCE is mandatory on every Etsy authorization request (not optional).

import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function base64url(bytes: Uint8Array): string {
  let str = "";
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sha256(input: string): Promise<Uint8Array> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return new Uint8Array(digest);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return jsonResponse({ detail: "Method not allowed" }, 405);
  }

  const clientId = Deno.env.get("ETSY_CLIENT_ID");
  const redirectUri = Deno.env.get("ETSY_REDIRECT_URI");
  if (!clientId || !redirectUri) {
    return jsonResponse({ detail: "ETSY_CLIENT_ID / ETSY_REDIRECT_URI are not configured" }, 500);
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  const userClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: { user }, error: userErr } = await userClient.auth.getUser();
  if (userErr || !user) {
    return jsonResponse({ detail: "Not authenticated" }, 401);
  }

  const adminClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: profile } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") {
    return jsonResponse({ detail: "Admin access required" }, 403);
  }

  const codeVerifier = base64url(crypto.getRandomValues(new Uint8Array(64)));
  const codeChallenge = base64url(await sha256(codeVerifier));
  const state = base64url(crypto.getRandomValues(new Uint8Array(32)));

  const { error: insertErr } = await adminClient
    .from("oauth_pending_state")
    .insert({ state, code_verifier: codeVerifier });
  if (insertErr) {
    return jsonResponse({ detail: `Failed to store OAuth state: ${insertErr.message}` }, 500);
  }

  const authorizeUrl = new URL("https://www.etsy.com/oauth/connect");
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("scope", "listings_w listings_r shops_r");
  authorizeUrl.searchParams.set("state", state);
  authorizeUrl.searchParams.set("code_challenge", codeChallenge);
  authorizeUrl.searchParams.set("code_challenge_method", "S256");

  return jsonResponse({ authorize_url: authorizeUrl.toString() });
});
