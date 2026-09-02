// GET /functions/v1/etsy-oauth-callback
// Public — Etsy redirects the admin's browser here after they approve (or
// deny) the app. No Authorization header is available on this request (it's
// a plain browser navigation initiated by Etsy's servers, not an authenticated
// fetch), so JWT verification must be turned OFF for this function in the
// dashboard's Function Settings, or every callback will 401 before this code
// ever runs.
//
// Security relies on `state`, not on the caller being authenticated: only a
// value minted by etsy-oauth-start (which itself requires admin auth) is
// accepted, and each state is single-use — it's deleted the moment it's read,
// so a replayed callback URL fails on the second hit.

import { createClient } from "jsr:@supabase/supabase-js@2";

const ETSY_TOKEN_URL = "https://api.etsy.com/v3/public/oauth/token";
const ETSY_API = "https://openapi.etsy.com/v3/application";

function html(body: string, status = 200): Response {
  return new Response(
    `<!doctype html><html><body style="font-family:system-ui,sans-serif;padding:40px;max-width:640px;margin:0 auto;">${body}</body></html>`,
    { status, headers: { "Content-Type": "text/html" } },
  );
}

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");
  const oauthErrorDescription = url.searchParams.get("error_description");

  if (oauthError) {
    return html(
      `<h2>Etsy connection cancelled</h2><p>${oauthError}: ${oauthErrorDescription ?? ""}</p>`,
      400,
    );
  }
  if (!code || !state) {
    return html(`<h2>Invalid callback</h2><p>Missing code or state parameter.</p>`, 400);
  }

  const adminClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: pending, error: pendingErr } = await adminClient
    .from("oauth_pending_state")
    .select("code_verifier, created_at")
    .eq("state", state)
    .maybeSingle();
  if (pendingErr || !pending) {
    return html(
      `<h2>Invalid or already-used state</h2><p>Start the connection again from the admin panel.</p>`,
      400,
    );
  }
  // Single-use: delete immediately so a replayed URL can't be exchanged twice.
  await adminClient.from("oauth_pending_state").delete().eq("state", state);

  const ageMs = Date.now() - new Date(pending.created_at).getTime();
  if (ageMs > 10 * 60 * 1000) {
    return html(`<h2>Authorization expired</h2><p>Start the connection again — it's valid for 10 minutes.</p>`, 400);
  }

  const clientId = Deno.env.get("ETSY_CLIENT_ID")!;
  const redirectUri = Deno.env.get("ETSY_REDIRECT_URI")!;

  const tokenRes = await fetch(ETSY_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: clientId,
      redirect_uri: redirectUri,
      code,
      code_verifier: pending.code_verifier,
    }),
  });
  const tokenData = await tokenRes.json();
  if (!tokenRes.ok) {
    return html(`<h2>Token exchange failed</h2><pre>${JSON.stringify(tokenData, null, 2)}</pre>`, 502);
  }

  const { access_token, refresh_token, expires_in } = tokenData;
  // Etsy access tokens are formatted "{user_id}.{opaque_token}".
  const userId = String(access_token).split(".")[0];

  let shopId: string | null = null;
  try {
    const shopRes = await fetch(`${ETSY_API}/users/${userId}/shops`, {
      headers: { "Authorization": `Bearer ${access_token}`, "x-api-key": clientId },
    });
    const shopData = await shopRes.json();
    shopId = shopData?.shop_id ? String(shopData.shop_id) : null;
  } catch (_e) {
    // Non-fatal — token is still saved below; shop_id can be backfilled later
    // (publish-to-etsy will surface a clear error if it's missing when needed).
  }

  const expiresAt = new Date(Date.now() + Number(expires_in) * 1000).toISOString();

  const { error: upsertErr } = await adminClient
    .from("marketplace_credentials")
    .upsert(
      { marketplace: "etsy", access_token, refresh_token, expires_at: expiresAt, shop_id: shopId },
      { onConflict: "marketplace" },
    );
  if (upsertErr) {
    return html(`<h2>Connected, but failed to save the token</h2><pre>${upsertErr.message}</pre>`, 500);
  }

  return html(
    `<h2>Etsy connected successfully</h2><p>Shop ID: ${shopId ?? "not found — check function logs, publish-to-etsy will error clearly if this is needed and missing"}</p><p>You can close this tab.</p>`,
  );
});
