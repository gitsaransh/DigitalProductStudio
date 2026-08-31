// POST /functions/v1/publish-to-gumroad
// Admin-only. Publishes a product from our catalog to Gumroad as a real,
// live listing: uploads the deliverable file, creates the product (USD
// pricing — Gumroad handles regional/PPP pricing on its own), publishes it,
// and records the result in marketplace_listings.
//
// Idempotent: safe to call repeatedly for the same SKU.
//   1. If marketplace_listings already has a gumroad row for this product,
//      skip straight to (re-)enabling that existing Gumroad product — this
//      is what lets you retry after fixing something on Gumroad's side
//      (e.g. connecting a payout method) without creating a duplicate.
//   2. Otherwise, self-heal: look up the caller's Gumroad products for one
//      whose name matches. If Gumroad already has it (e.g. a previous run
//      created it but failed before we recorded the listing), adopt that
//      one instead of creating a duplicate.
//   3. Only if neither exists do we go through the full create flow.
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

async function enableGumroadProduct(token: string, gumroadId: string) {
  const res = await fetch(
    `${GUMROAD_API}/products/${encodeURIComponent(gumroadId)}/enable`,
    { method: "PUT", body: formBody({ access_token: token }) },
  );
  return await res.json();
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

  // ── Idempotency, step 1: do we already know about a Gumroad listing? ──────
  const { data: existingListing } = await adminClient
    .from("marketplace_listings")
    .select("external_id, status")
    .eq("product_id", product.id)
    .eq("marketplace", "gumroad")
    .maybeSingle();

  let gumroadId: string | null = existingListing?.external_id ?? null;

  // ── Idempotency, step 2: self-heal against Gumroad directly ───────────────
  // Covers the case where a product was created on a previous run but we
  // never got to record it (e.g. the enable step failed).
  if (!gumroadId) {
    const listRes = await fetch(`${GUMROAD_API}/products?access_token=${encodeURIComponent(gumroadToken)}`);
    const list = await listRes.json();
    if (list.success) {
      const match = (list.products ?? []).find((p: { name: string }) => p.name === product.title);
      if (match) gumroadId = match.id;
    }
  }

  let listingUrl: string | null = null;

  if (gumroadId) {
    // Already exists on Gumroad (known or discovered) — just (re-)publish it.
    const enabled = await enableGumroadProduct(gumroadToken, gumroadId);
    if (!enabled.success) {
      // Still record that we know the product exists, even if publish failed again.
      await adminClient.from("marketplace_listings").upsert(
        { product_id: product.id, marketplace: "gumroad", external_id: gumroadId, status: "draft" },
        { onConflict: "product_id,marketplace" },
      );
      return jsonResponse({ detail: `Gumroad publish failed: ${enabled.message}` }, 502);
    }
    listingUrl = enabled.product.short_url;
  } else {
    // ── Full create flow (first time this product is being published) ──────
    const { data: fileBlob, error: downloadErr } = await adminClient.storage
      .from("product-files")
      .download(`${sku}/${product.file_placeholder}`);
    if (downloadErr || !fileBlob) {
      return jsonResponse({ detail: `Could not read product file: ${downloadErr?.message}` }, 500);
    }
    const fileBytes = new Uint8Array(await fileBlob.arrayBuffer());

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

    const part = presign.parts[0];
    const uploadRes = await fetch(part.presigned_url, { method: "PUT", body: fileBytes });
    if (!uploadRes.ok) {
      return jsonResponse({ detail: `File upload to Gumroad storage failed (${uploadRes.status})` }, 502);
    }
    const etag = uploadRes.headers.get("ETag") ?? "";

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
    gumroadId = created.product.id;

    // Record the draft immediately — even if enable fails below, the next
    // call will find this row and retry enable instead of creating another.
    await adminClient.from("marketplace_listings").upsert(
      { product_id: product.id, marketplace: "gumroad", external_id: gumroadId, status: "draft" },
      { onConflict: "product_id,marketplace" },
    );

    const enabled = await enableGumroadProduct(gumroadToken, gumroadId);
    if (!enabled.success) {
      return jsonResponse({ detail: `Gumroad publish failed: ${enabled.message}` }, 502);
    }
    listingUrl = enabled.product.short_url;
  }

  const { error: listingErr } = await adminClient.from("marketplace_listings").upsert(
    {
      product_id: product.id,
      marketplace: "gumroad",
      external_id: gumroadId,
      status: "active",
      published_at: new Date().toISOString(),
      listing_url: listingUrl,
    },
    { onConflict: "product_id,marketplace" },
  );
  if (listingErr) {
    console.error("[publish-to-gumroad] Failed to record listing:", listingErr);
  }

  return jsonResponse({ status: "published", external_id: gumroadId, listing_url: listingUrl });
});
