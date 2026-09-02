-- Etsy marketplace integration: OAuth token storage + per-product Etsy metadata.
--
-- Etsy differs from Gumroad in two structural ways this schema has to account for:
--   1. Auth is short-lived OAuth (1hr access token, 90-day refresh token) instead of
--      one static long-lived access token, so tokens need to be stored and refreshed.
--   2. Publishing requires a taxonomy category and at least one listing image, neither
--      of which Gumroad required. Rather than guess at a taxonomy_id or fabricate an
--      image, both are per-product columns that publish-to-etsy validates are set
--      before attempting a publish — same pattern as price_usd/file_placeholder for
--      Gumroad, so we never hardcode a value that turns out to be wrong for a product.

alter table products
  add column etsy_taxonomy_id integer,
  add column image_placeholder text;

-- Etsy OAuth tokens (one row per marketplace; only 'etsy' today). Service-role
-- only — no RLS policy is defined, so anon/authenticated roles get zero access;
-- only Edge Functions (which use the service_role key and bypass RLS) can read
-- or write this table.
create table marketplace_credentials (
  marketplace text primary key,
  access_token text not null,
  refresh_token text not null,
  expires_at timestamptz not null,
  shop_id text,
  updated_at timestamptz not null default now()
);
alter table marketplace_credentials enable row level security;

-- Short-lived PKCE state for the OAuth authorization-code exchange. A row is
-- created by etsy-oauth-start (admin-authenticated) and consumed + deleted by
-- etsy-oauth-callback (which has no auth header — Etsy redirects the bare
-- browser there), correlating the redirect back to the admin who started it.
create table oauth_pending_state (
  state text primary key,
  code_verifier text not null,
  created_at timestamptz not null default now()
);
alter table oauth_pending_state enable row level security;

-- Private bucket for marketplace listing images (Etsy requires at least one
-- image before a listing can go active). Same access pattern as
-- product-files: service-role only, no public/anon access.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', false)
on conflict (id) do nothing;
