// POST /functions/v1/verify-payment
// Ported from src/api/routes/payments.py::verify_payment.
// Runs with the service role because RLS has no update policy on `orders` for clients.

import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PLACEHOLDER_PREFIX = "rzp_test_placeholder";

function isMockMode(keySecret: string | null): boolean {
  if (!keySecret) return true;
  return keySecret.startsWith(PLACEHOLDER_PREFIX);
}

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
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
  const userClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: { user }, error: userErr } = await userClient.auth.getUser();
  if (userErr || !user) {
    return jsonResponse({ detail: "Not authenticated" }, 401);
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

  const adminClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: order, error: findErr } = await adminClient
    .from("orders")
    .select("*")
    .eq("razorpay_order_id", razorpay_order_id)
    .single();

  if (findErr || !order) {
    return jsonResponse({ detail: "Order not found" }, 404);
  }
  if (order.user_id !== user.id) {
    return jsonResponse({ detail: "Order does not belong to the authenticated user" }, 403);
  }

  const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET") ?? null;
  const isMock = razorpay_order_id.startsWith("order_mock_") || isMockMode(keySecret);

  if (isMock) {
    await adminClient
      .from("orders")
      .update({
        razorpay_payment_id,
        razorpay_signature: "MOCK_VERIFIED",
        status: "paid",
      })
      .eq("razorpay_order_id", razorpay_order_id);
    return jsonResponse({ status: "success", message: "Mock payment verified successfully" });
  }

  const generatedSig = await hmacSha256Hex(keySecret!, `${razorpay_order_id}|${razorpay_payment_id}`);

  if (!timingSafeEqual(generatedSig, razorpay_signature)) {
    await adminClient
      .from("orders")
      .update({ razorpay_payment_id, razorpay_signature: "INVALID", status: "failed" })
      .eq("razorpay_order_id", razorpay_order_id);
    return jsonResponse({ detail: "Payment signature verification failed" }, 400);
  }

  await adminClient
    .from("orders")
    .update({ razorpay_payment_id, razorpay_signature, status: "paid" })
    .eq("razorpay_order_id", razorpay_order_id);

  return jsonResponse({ status: "success", message: "Payment verified successfully" });
});
