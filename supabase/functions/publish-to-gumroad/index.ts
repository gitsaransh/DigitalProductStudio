// POST /functions/v1/publish-to-gumroad
// Admin-only. Publishes a product from our catalog to Gumroad as a real,
// live listing: uploads the deliverable file, creates the product (USD
// pricing — Gumroad handles regional/PPP pricing on its own), publishes it,
// and records the result in marketplace_listings.
//
// Gumroad flow (verified against https://gumroad.com/api, 2026-09):
//   1. POST /v2/files/presign   -> upload_id, key, file_url, presigned part URL(s)
//   2. PUT file bytes to the presigned URL(s), capture the ETag header per part
//   3. POST /v2/files/complete  -> finalized file_url
//   4. POST /v2/products        -> creates as a draft, files[][url] attaches the file
//   5. PUT /v2/products/:id/enable -> publishes it live

import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GUMROAD_API = "https://api.gumroad.com/v2";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function formBody(fields: Record<string, string>): URLSearchParams {
  return new URLSearchParams(fields);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return jsonResponse({ detail: "Method not allowed" }, 405);
  }

  const gumroadToken = Deno.env.get("GUMROAD_ACCESS_TOKEN");
  if (!gumroadToken) {
    return jsonResponse({ detail: "GUMROAD_ACCESS_TOKEN is not configured" }, 500);
  }

  // Identify the caller and require admin — this is an operator action, not
  // something any authenticated customer should be able to trigger.
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
  if (!product.price_usd) {
    return jsonResponse({ detail: `Product '${sku}' has no price_usd set` }, 400);
  }
  if (!product.file_placeholder) {
    return jsonResponse({ detail: `Product '${sku}' has no file configured` }, 400);
  }

  // 1. Download the deliverable from our own Storage.
  const { data: fileBlob, error: downloadErr } = await adminClient.storage
    .from("product-files")
    .download(`${sku}/${product.file_placeholder}`);
  if (downloadErr || !fileBlob) {
    return jsonResponse({ detail: `Could not read product file: ${downloadErr?.message}` }, 500);
  }
  const fileBytes = new Uint8Array(await fileBlob.arrayBuffer());

  // 2. Presign an upload on Gumroad's side.
  const presignRes = await fetch(`${GUMROAD_API}/files/presign`, {
    method: "POST",
    body: formBody({
      access_token: gumroadToken,
      filename: product.file_placeholder,
      file_size: String(fileBytes.length),
    }),
  });
  const presign = await presignRes.json();
  if (!presign.success) {
    return jsonResponse({ detail: `Gumroad presign failed: ${presign.message}` }, 502);
  }

  // 3. Upload the (single, since our files are small) part directly to S3.
  const part = presign.parts[0];
  const uploadRes = await fetch(part.presigned_url, { method: "PUT", body: fileBytes });
  if (!uploadRes.ok) {
    return jsonResponse({ detail: `File upload to Gumroad storage failed (${uploadRes.status})` }, 502);
  }
  const etag = uploadRes.headers.get("ETag") ?? "";

  // 4. Finalize the multipart upload.
  const completeRes = await fetch(`${GUMROAD_API}/files/complete`, {
    method: "POST",
    body: formBody({
      access_token: gumroadToken,
      upload_id: presign.upload_id,
      key: presign.key,
      "parts[][part_number]": String(part.part_number),
      "parts[][etag]": etag,
    }),
  });
  const complete = await completeRes.json();
  if (!complete.success) {
    return jsonResponse({ detail: `Gumroad upload finalize failed: ${complete.message}` }, 502);
  }

  // 5. Create the product (draft) with the uploaded file attached.
  const description = product.description || product.short_description || "";
  const createBody = new URLSearchParams();
  createBody.set("access_token", gumroadToken);
  createBody.set("native_type", "digital");
  createBody.set("name", product.title);
  createBody.set("description", description);
  createBody.set("price", String(Math.round(Number(product.price_usd) * 100)));
  createBody.set("price_currency_type", "usd");
  createBody.set("custom_summary", product.short_description || "");
  createBody.set("files[][url]", complete.file_url);
  for (const tag of (product.tags ?? []).slice(0, 10)) {
    createBody.append("tags[]", tag);
  }

  const createRes = await fetch(`${GUMROAD_API}/products`, { method: "POST", body: createBody });
  const created = await createRes.json();
  if (!created.success) {
    return jsonResponse({ detail: `Gumroad product creation failed: ${created.message}` }, 502);
  }

  // 6. Publish it live.
  const enableRes = await fetch(
    `${GUMROAD_API}/products/${encodeURIComponent(created.product.id)}/enable`,
    { method: "PUT", body: formBody({ access_token: gumroadToken }) },
  );
  const enabled = await enableRes.json();
  if (!enabled.success) {
    return jsonResponse({ detail: `Gumroad publish failed: ${enabled.message}` }, 502);
  }

  // 7. Record the listing.
  const { error: listingErr } = await adminClient.from("marketplace_listings").upsert(
    {
      product_id: product.id,
      marketplace: "gumroad",
      external_id: enabled.product.id,
      status: "active",
      published_at: new Date().toISOString(),
      listing_url: enabled.product.short_url,
    },
    { onConflict: "product_id,marketplace" },
  );
  if (listingErr) {
    console.error("[publish-to-gumroad] Failed to record listing:", listingErr);
  }

  return jsonResponse({
    status: "published",
    external_id: enabled.product.id,
    listing_url: enabled.product.short_url,
  });
});
