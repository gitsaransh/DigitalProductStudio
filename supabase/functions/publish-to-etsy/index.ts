// POST /functions/v1/publish-to-etsy
// Admin-only. Publishes a product from our catalog to Etsy as a real, live
// listing: creates a draft listing, uploads the cover image and the
// deliverable file (skipping either if already present), and activates it.
//
// Prerequisites (validated per-product before doing anything):
//   products.price_usd, file_placeholder, etsy_taxonomy_id, image_placeholder
// must all be set. Unlike Gumroad, Etsy requires a taxonomy category and a
// listing image — rather than guess at either, both are per-product columns
// so a wrong guess never silently ships; you get a clear 400 instead.
//
// Idempotent, in two layers:
//   1. Already published (marketplace_listings.status = 'active' for this
//      product/etsy): return immediately, no Etsy calls at all.
//   2. Not yet published: reuse the known listing_id if we have one, else
//      self-heal by title-matching this shop's draft listings (covers a
//      previous run that created the listing but crashed before recording
//      it). Then, for each of image/file, check whether the listing already
//      has one attached before uploading — Etsy's upload endpoints always
//      create a new resource, so re-running a failed activation must not
//      re-upload and duplicate them.
//
// Etsy flow (verified against developers.etsy.com/documentation, 2026-09):
//   Auth requires BOTH an OAuth bearer token AND the app's client_id sent as
//   x-api-key on every request. Access tokens last 1hr; refreshed here using
//   the stored refresh_token (90-day) when within 60s of expiry.
//   1. POST   /shops/{shop_id}/listings                -> creates a draft
//   2. GET    /shops/{shop_id}/listings/{id}/images     -> skip upload if any exist
//      POST   /shops/{shop_id}/listings/{id}/images     -> multipart image upload
//   3. GET    /shops/{shop_id}/listings/{id}/files      -> skip upload if any exist
//      POST   /shops/{shop_id}/listings/{id}/files      -> multipart file upload
//   4. PATCH  /shops/{shop_id}/listings/{id}             -> {state: 'active'}
//      (requires an image to already be set, per Etsy's own validation)

import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ETSY_TOKEN_URL = "https://api.etsy.com/v3/public/oauth/token";
const ETSY_API = "https://openapi.etsy.com/v3/application";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function etsyRequest(
  method: string,
  path: string,
  accessToken: string,
  apiKey: string,
  body?: BodyInit,
  extraHeaders?: Record<string, string>,
) {
  const res = await fetch(`${ETSY_API}${path}`, {
    method,
    headers: { "Authorization": `Bearer ${accessToken}`, "x-api-key": apiKey, ...extraHeaders },
    body,
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

async function getValidAccessToken(
  adminClient: ReturnType<typeof createClient>,
  clientId: string,
): Promise<{ accessToken: string; shopId: string } | { error: string }> {
  const { data: creds } = await adminClient
    .from("marketplace_credentials")
    .select("*")
    .eq("marketplace", "etsy")
    .maybeSingle();
  if (!creds) {
    return { error: "Etsy is not connected. Call etsy-oauth-start and complete the authorization flow first." };
  }
  if (!creds.shop_id) {
    return { error: "Etsy is connected but no shop_id was recorded. Reconnect via etsy-oauth-start." };
  }

  if (Date.now() < new Date(creds.expires_at).getTime() - 60_000) {
    return { accessToken: creds.access_token, shopId: creds.shop_id };
  }

  const refreshRes = await fetch(ETSY_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: clientId,
      refresh_token: creds.refresh_token,
    }),
  });
  const refreshData = await refreshRes.json();
  if (!refreshRes.ok) {
    return { error: `Etsy token refresh failed: ${refreshData.error_description ?? JSON.stringify(refreshData)}` };
  }

  const newExpiresAt = new Date(Date.now() + Number(refreshData.expires_in) * 1000).toISOString();
  await adminClient.from("marketplace_credentials").update({
    access_token: refreshData.access_token,
    refresh_token: refreshData.refresh_token ?? creds.refresh_token,
    expires_at: newExpiresAt,
    updated_at: new Date().toISOString(),
  }).eq("marketplace", "etsy");

  return { accessToken: refreshData.access_token, shopId: creds.shop_id };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return jsonResponse({ detail: "Method not allowed" }, 405);
  }

  const clientId = Deno.env.get("ETSY_CLIENT_ID");
  if (!clientId) {
    return jsonResponse({ detail: "ETSY_CLIENT_ID is not configured" }, 500);
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

  const { sku } = await req.json();
  if (!sku) {
    return jsonResponse({ detail: "sku is required" }, 400);
  }

  const { data: product, error: productErr } = await adminClient
    .from("products")
    .select("*")
    .eq("sku", sku)
    .single();
  if (productErr || !product) {
    return jsonResponse({ detail: `Product '${sku}' not found` }, 404);
  }

  const missing: string[] = [];
  if (!product.price_usd) missing.push("price_usd");
  if (!product.file_placeholder) missing.push("file_placeholder");
  if (!product.etsy_taxonomy_id) missing.push("etsy_taxonomy_id");
  if (!product.image_placeholder) missing.push("image_placeholder");
  if (missing.length) {
    return jsonResponse(
      { detail: `Product '${sku}' is missing required Etsy fields: ${missing.join(", ")}` },
      400,
    );
  }

  const tokenResult = await getValidAccessToken(adminClient, clientId);
  if ("error" in tokenResult) {
    return jsonResponse({ detail: tokenResult.error }, 400);
  }
  const { accessToken, shopId } = tokenResult;

  // ── Idempotency, layer 1: already fully published? ────────────────────────
  const { data: existingListing } = await adminClient
    .from("marketplace_listings")
    .select("external_id, status, listing_url")
    .eq("product_id", product.id)
    .eq("marketplace", "etsy")
    .maybeSingle();

  if (existingListing?.status === "active") {
    return jsonResponse({
      status: "already_published",
      external_id: existingListing.external_id,
      listing_url: existingListing.listing_url,
    });
  }

  let listingId: string | null = existingListing?.external_id ?? null;

  // ── Idempotency, layer 2: self-heal against Etsy directly ─────────────────
  if (!listingId) {
    const search = await etsyRequest("GET", `/shops/${shopId}/listings?state=draft&limit=100`, accessToken, clientId);
    if (search.ok) {
      const match = (search.data.results ?? []).find((l: { title: string }) => l.title === product.title);
      if (match) listingId = String((match as { listing_id: number }).listing_id);
    }
  }

  if (!listingId) {
    const createBody = {
      quantity: 999,
      title: product.title,
      description: product.description || product.short_description || "",
      price: Number(product.price_usd),
      who_made: "i_did",
      when_made: "2020_2026",
      taxonomy_id: product.etsy_taxonomy_id,
      type: "download",
      is_supply: false,
      tags: (product.tags ?? []).filter((t: string) => t.length <= 20).slice(0, 13),
    };
    const created = await etsyRequest(
      "POST",
      `/shops/${shopId}/listings`,
      accessToken,
      clientId,
      JSON.stringify(createBody),
      { "Content-Type": "application/json" },
    );
    if (!created.ok) {
      return jsonResponse({ detail: `Etsy listing creation failed: ${JSON.stringify(created.data)}` }, 502);
    }
    listingId = String((created.data as { listing_id: number }).listing_id);

    // Record the draft immediately — even if everything below fails, the next
    // call finds this row and resumes instead of creating a second listing.
    await adminClient.from("marketplace_listings").upsert(
      { product_id: product.id, marketplace: "etsy", external_id: listingId, status: "draft" },
      { onConflict: "product_id,marketplace" },
    );
  }

  // ── Image: skip if the listing already has one (upload is not idempotent) ─
  const existingImages = await etsyRequest("GET", `/shops/${shopId}/listings/${listingId}/images`, accessToken, clientId);
  const hasImage = existingImages.ok && (existingImages.data.results ?? []).length > 0;
  if (!hasImage) {
    const { data: imageBlob, error: imageErr } = await adminClient.storage
      .from("product-images")
      .download(`${sku}/${product.image_placeholder}`);
    if (imageErr || !imageBlob) {
      return jsonResponse({ detail: `Could not read product image: ${imageErr?.message}` }, 500);
    }
    const imageForm = new FormData();
    imageForm.set("image", imageBlob, product.image_placeholder);
    const imageUpload = await etsyRequest(
      "POST",
      `/shops/${shopId}/listings/${listingId}/images`,
      accessToken,
      clientId,
      imageForm,
    );
    if (!imageUpload.ok) {
      return jsonResponse({ detail: `Etsy image upload failed: ${JSON.stringify(imageUpload.data)}` }, 502);
    }
  }

  // ── File: skip if the listing already has one (upload is not idempotent) ──
  const existingFiles = await etsyRequest("GET", `/shops/${shopId}/listings/${listingId}/files`, accessToken, clientId);
  const hasFile = existingFiles.ok && (existingFiles.data.results ?? []).length > 0;
  if (!hasFile) {
    const { data: fileBlob, error: fileErr } = await adminClient.storage
      .from("product-files")
      .download(`${sku}/${product.file_placeholder}`);
    if (fileErr || !fileBlob) {
      return jsonResponse({ detail: `Could not read product file: ${fileErr?.message}` }, 500);
    }
    const fileForm = new FormData();
    fileForm.set("file", fileBlob, product.file_placeholder);
    fileForm.set("name", product.file_placeholder);
    const fileUpload = await etsyRequest(
      "POST",
      `/shops/${shopId}/listings/${listingId}/files`,
      accessToken,
      clientId,
      fileForm,
    );
    if (!fileUpload.ok) {
      return jsonResponse({ detail: `Etsy file upload failed: ${JSON.stringify(fileUpload.data)}` }, 502);
    }
  }

  // ── Activate ────────────────────────────────────────────────────────────
  const activated = await etsyRequest(
    "PATCH",
    `/shops/${shopId}/listings/${listingId}`,
    accessToken,
    clientId,
    JSON.stringify({ state: "active" }),
    { "Content-Type": "application/json" },
  );
  if (!activated.ok) {
    // Listing + image + file all persist on Etsy's side even though activation
    // failed (e.g. billing/payment setup incomplete on the shop) — next call
    // will find the listing, see the image/file already attached, and retry
    // just this step.
    return jsonResponse({ detail: `Etsy activation failed: ${JSON.stringify(activated.data)}` }, 502);
  }

  const listingUrl = (activated.data as { url?: string }).url ?? `https://www.etsy.com/listing/${listingId}`;

  const { error: listingErr } = await adminClient.from("marketplace_listings").upsert(
    {
      product_id: product.id,
      marketplace: "etsy",
      external_id: listingId,
      status: "active",
      published_at: new Date().toISOString(),
      listing_url: listingUrl,
    },
    { onConflict: "product_id,marketplace" },
  );
  if (listingErr) {
    console.error("[publish-to-etsy] Failed to record listing:", listingErr);
  }

  return jsonResponse({ status: "published", external_id: listingId, listing_url: listingUrl });
});
