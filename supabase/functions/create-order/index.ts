// POST /functions/v1/create-order
// Ported from src/api/routes/payments.py::create_order.
// Runs with the service role (only place that may write to `orders`) because RLS
// intentionally has no insert policy for authenticated/anon on that table.

import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PRICE_MAP: Record<string, { amount: number; currency: string }> = {
  "DPS-PRM-001": { amount: 499, currency: "INR" },
  "DPS-XLS-001": { amount: 1500, currency: "INR" },
};

const PLACEHOLDER_PREFIX = "rzp_test_placeholder";

function isLiveMode(keyId: string | null): boolean {
  if (!keyId) return false;
  return !keyId.startsWith("rzp_test_");
}

function isMockMode(keyId: string | null, keySecret: string | null): boolean {
  if (!keyId || !keySecret) return true;
  return keyId.startsWith(PLACEHOLDER_PREFIX) || keySecret.startsWith(PLACEHOLDER_PREFIX);
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return jsonResponse({ detail: "Method not allowed" }, 405);
  }

  const authHeader = req.headers.get("Authorization") ?? "";

  // Client scoped to the caller's JWT — used only to identify who's asking.
  const userClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: { user }, error: userErr } = await userClient.auth.getUser();
  if (userErr || !user) {
    return jsonResponse({ detail: "Not authenticated" }, 401);
  }

  const { sku } = await req.json();
  const priceInfo = PRICE_MAP[sku];
  if (!priceInfo) {
    return jsonResponse({ detail: "Invalid SKU or product not configured for purchase" }, 400);
  }

  const { amount, currency } = priceInfo;
  const amountPaise = Math.round(amount * 100);

  const keyId = Deno.env.get("RAZORPAY_KEY_ID") ?? null;
  const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET") ?? null;

  if (isLiveMode(keyId)) {
    return jsonResponse(
      { detail: "Live Razorpay keys are not permitted. Configure TEST mode keys (rzp_test_*) only." },
      500,
    );
  }

  const receiptId = `rcpt_${crypto.randomUUID().slice(0, 10)}`;
  let isMock = isMockMode(keyId, keySecret);
  let rzpOrderId: string;

  if (isMock) {
    rzpOrderId = `order_mock_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
  } else {
    try {
      const res = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}`,
        },
        body: JSON.stringify({ amount: amountPaise, currency, receipt: receiptId }),
      });
      if (!res.ok) throw new Error(`Razorpay API returned ${res.status}`);
      const orderRes = await res.json();
      rzpOrderId = orderRes.id;
    } catch (exc) {
      console.error(`[Razorpay API Error] ${exc}. Falling back to mock order.`);
      rzpOrderId = `order_mock_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
      isMock = true;
    }
  }

  // Service-role client — the only writer allowed into `orders` (see RLS policy).
  const adminClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const { error: insertErr } = await adminClient.from("orders").insert({
    user_id: user.id,
    sku,
    amount,
    currency,
    status: "created",
    razorpay_order_id: rzpOrderId,
  });
  if (insertErr) {
    console.error("[create-order] Failed to persist order:", insertErr);
    return jsonResponse({ detail: "Failed to create order" }, 500);
  }

  // SECURITY: key_secret is never included in this response.
  return jsonResponse({
    order_id: rzpOrderId,
    amount: amountPaise,
    currency,
    key_id: isMock ? "rzp_test_mockkey" : keyId,
    mock: isMock,
  });
});
