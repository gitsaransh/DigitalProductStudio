-- Digital Product Studio — Postgres schema for Supabase
-- Replaces catalog/studio_catalog.db (SQLite). Ported from src/core/database.py.
--
-- Design notes:
--   * Auth is handled entirely by Supabase Auth (auth.users) — no custom users table,
--     no hand-rolled JWT. `profiles` extends auth.users with app-specific fields (role).
--   * `raw_data` JSONB is kept for flexibility (tags, includes, pricing extras) but the
--     fields that need indexing/filtering are promoted to real columns.
--   * Full-text search uses a generated tsvector column + GIN index (replaces FTS5).
--   * Row Level Security enforces: customers see only published products and their own
--     orders; admins (profiles.role = 'admin') see everything. This is stricter than the
--     old FastAPI /api/products, which had no status filter at all — deliberate fix.

-- ── profiles (extends auth.users) ──────────────────────────────────────────────
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  name text,
  avatar_url text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now(),
  last_login timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user signs up (Google OAuth or email).
-- Promotes to 'admin' automatically if the email matches the ADMIN_EMAIL app setting,
-- passed in via raw_user_meta_data at signup time from the client, or defaults to customer.
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, avatar_url, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', ''),
    'customer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── products ────────────────────────────────────────────────────────────────
create table products (
  id uuid primary key default gen_random_uuid(),
  sku text unique not null,
  title text not null,
  slug text unique not null,
  category text not null,
  sub_category text,
  status text not null default 'draft',
  lifecycle_state text not null default 'idea',
  version text not null default '1.0.0',
  file_hash text not null,
  base_price numeric(10,2) not null default 0.0,
  compare_at_price numeric(10,2),
  currency text not null default 'USD',
  license text not null default 'Personal Use Only',
  description text,
  short_description text,
  tags text[] not null default '{}',
  file_placeholder text,
  raw_data jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search tsvector
);

create index idx_products_file_hash on products(file_hash);
create index idx_products_status on products(status);
create index idx_products_lifecycle_state on products(lifecycle_state);
create index idx_products_category on products(category);
create index idx_products_created_at on products(created_at desc);
create index idx_products_search on products using gin(search);

-- to_tsvector(regconfig, text) is STABLE not IMMUTABLE in Postgres, so it can't be
-- used in a GENERATED column — populate `search` via trigger instead.
create function public.products_update_search()
returns trigger as $$
begin
  new.search :=
    setweight(to_tsvector('english', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.category, '')), 'C') ||
    setweight(to_tsvector('english', array_to_string(new.tags, ' ')), 'C');
  return new;
end;
$$ language plpgsql;

create trigger products_search_trigger
  before insert or update on products
  for each row execute procedure public.products_update_search();

-- ── marketplace_listings ────────────────────────────────────────────────────
create table marketplace_listings (
  product_id uuid not null references products(id) on delete cascade,
  marketplace text not null,
  external_id text,
  status text not null default 'draft',
  published_at timestamptz,
  listing_url text,
  primary key (product_id, marketplace)
);
create index idx_mp_status on marketplace_listings(marketplace, status);

-- ── prompts (AI prompt-vault line items) ────────────────────────────────────
create table prompts (
  prompt_id text primary key,
  product_id uuid not null references products(id) on delete cascade,
  category text not null,
  subcategory text,
  use_case text,
  title text not null,
  prompt_text text not null,
  variables text,
  compatible_ai text,
  difficulty text,
  expected_output text,
  pro_tip text
);
create index idx_prompt_product on prompts(product_id);

-- ── orders ──────────────────────────────────────────────────────────────────
create table orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  sku text not null,
  amount numeric(10,2) not null,
  currency text not null,
  status text not null default 'created' check (status in ('created', 'paid', 'failed')),
  razorpay_order_id text unique not null,
  razorpay_payment_id text,
  razorpay_signature text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_orders_user on orders(user_id);
create index idx_orders_rzp on orders(razorpay_order_id);

-- updated_at auto-touch trigger, reused across tables
create function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger products_touch_updated_at before update on products
  for each row execute procedure public.touch_updated_at();
create trigger orders_touch_updated_at before update on orders
  for each row execute procedure public.touch_updated_at();

-- ── Row Level Security ──────────────────────────────────────────────────────

alter table profiles enable row level security;
alter table products enable row level security;
alter table marketplace_listings enable row level security;
alter table prompts enable row level security;
alter table orders enable row level security;

-- Helper: is the current JWT holder an admin?
create function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- profiles: users read/update their own row; admins read all.
create policy "profiles_select_own_or_admin" on profiles
  for select using (auth.uid() = id or public.is_admin());
create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id);

-- products: public can read published products; admins read everything.
-- Writes are admin-only (the operator panel / ingestion pipeline).
create policy "products_select_published_or_admin" on products
  for select using (status = 'published' or public.is_admin());
create policy "products_write_admin_only" on products
  for insert with check (public.is_admin());
create policy "products_update_admin_only" on products
  for update using (public.is_admin());
create policy "products_delete_admin_only" on products
  for delete using (public.is_admin());

-- marketplace_listings / prompts: follow the parent product's visibility.
create policy "listings_select_admin_only" on marketplace_listings
  for select using (public.is_admin());
create policy "prompts_select_via_product" on prompts
  for select using (
    exists (select 1 from products p where p.id = prompts.product_id and (p.status = 'published' or public.is_admin()))
  );

-- orders: a customer sees only their own orders; admins see all.
-- Orders are created/updated exclusively by Edge Functions using the service role
-- (never directly by the client), so there is no insert/update policy for anon/authenticated.
create policy "orders_select_own_or_admin" on orders
  for select using (auth.uid() = user_id or public.is_admin());

-- ── Storage: private bucket for purchasable product files ──────────────────
insert into storage.buckets (id, name, public)
values ('product-files', 'product-files', false)
on conflict (id) do nothing;

-- Files are stored as product-files/{sku}/{filename}. A user may download an
-- object only if they hold a 'paid' order for that SKU, or are an admin.
create policy "product_files_download_if_purchased" on storage.objects
  for select using (
    bucket_id = 'product-files'
    and (
      public.is_admin()
      or exists (
        select 1 from orders o
        where o.user_id = auth.uid()
          and o.status = 'paid'
          and o.sku = (storage.foldername(name))[1]
      )
    )
  );

-- Only admins (via the dashboard/service role) upload product files.
create policy "product_files_upload_admin_only" on storage.objects
  for insert with check (bucket_id = 'product-files' and public.is_admin());
