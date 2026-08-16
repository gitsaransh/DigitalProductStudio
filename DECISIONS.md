# DECISIONS.md — Architecture & Design Decision Log

**Rule**: Every meaningful decision made while changing code — including the reasoning — is recorded here.  
**Format**: Existing decisions discovered during audit are tagged `[EXISTING]`. New decisions are tagged `[NEW]`. Decisions that need your confirmation are tagged `[NEEDS CONFIRMATION]`.

---

## D-001 — SQLite WAL + FTS5 as the Catalog Database

**Type**: `[EXISTING]`  
**Location**: `src/core/database.py`

**Decision**: Use SQLite in WAL (Write-Ahead Logging) mode with an FTS5 (Full-Text Search) virtual table as the sole database.

**Context**: The system needs to store and search a catalog of potentially 100,000+ digital products with sub-10ms query times.

**Chosen approach**: SQLite WAL with 64MB `cache_size` pragma, `synchronous=NORMAL`, composite indexes on `file_hash`, `status`, `category`, `created_at`, and a separate FTS5 virtual table (`products_fts`) for text search.

**Why**: SQLite WAL mode allows concurrent reads alongside writes without blocking. FTS5 provides inverted-index full-text search without an external search server. No deployment complexity — one `.db` file.

**Tradeoffs accepted**:
- Not suitable for true multi-process write concurrency (single writer at a time)
- FTS5 index must be manually optimized via `INSERT INTO products_fts(products_fts) VALUES('optimize')` — currently called after every batch upsert, which is expensive at scale
- All product data is also serialized to `raw_data TEXT` as a JSON blob — this is a denormalized "fat row" pattern. Convenient for reads but means the DB has no schema enforcement for nested fields.

---

## D-002 — SHA-256 Directory Hash for Deduplication

**Type**: `[EXISTING]`  
**Location**: `src/ingestion/duplicate_detector.py`

**Decision**: Compute a deterministic composite SHA-256 hash of the entire product folder (excluding `info.json`) to detect duplicate payloads before ingestion.

**Why**: Prevents duplicate marketplace listings that could trigger Etsy account suspensions. `info.json` is excluded from the hash because it contains metadata that may differ between submissions of the same underlying file payload.

**Tradeoffs accepted**: Hash is computed on file names (relative paths) + file content in sorted order. Renaming a file within a payload folder will produce a different hash for the same content — this is a known edge case that is not currently handled.

---

## D-003 — Human-in-the-Loop Approval Gate

**Type**: `[EXISTING]`  
**Location**: `src/approvals/approval_manager.py`, `src/ingestion/watcher.py` line 84

**Decision**: All ingested products are set to `status: "pending_approval"` and cannot be published until `ApprovalManager.approve_and_publish()` is explicitly called.

**Why**: Quality gate to prevent automated publishing of low-quality or incorrect listings to live marketplaces. `config/settings.yaml` has `approvals.require_human_review: true`.

**Tradeoffs accepted**: There is also an `auto_approve_threshold: 0.95` config key, but no code currently implements auto-approval based on intelligence scores. The key exists but is inert.

---

## D-004 — Stub-First Publisher Adapters

**Type**: `[EXISTING]`  
**Location**: `src/publishers/`

**Decision**: All publisher adapters (`EtsyPublisher`, `GumroadPublisher`, `LemonSqueezyPublisher`, etc.) are implemented with a stub-first pattern: they check for credentials, and if missing, return a `not_connected` status dict rather than raising an exception.

**Why**: Allows the full system pipeline to run and be tested without live marketplace credentials. The system can be developed, QA'd, and demoed in a pre-credential state.

**Tradeoffs accepted**:
- `EtsyPublisher` and `GumroadPublisher` have a branch for "when key is present" that returns a fake generated ID — no actual API call is made even with a real key. This is incomplete.
- `WebPublisher` always returns `active` with a hardcoded URL (`https://digitalproductstudio.in`) regardless of credentials. This will silently lie about publish status.
- 6 of 10 adapters (Shopify, WooCommerce, Ko-fi, Payhip, Amazon Digital, Creative Market) appear to be scaffold files with no meaningful implementation beyond class definition.

---

## D-005 — Etsy PKCE OAuth2 Implementation

**Type**: `[EXISTING]`  
**Location**: `src/etsy/oauth_handler.py`

**Decision**: Implement the full Etsy OAuth 2.0 PKCE (Proof Key for Code Exchange) flow in Python, including `code_verifier`/`code_challenge` generation, state parameter CSRF validation, authorization code exchange, and token refresh.

**Why**: Etsy Open API v3 requires PKCE OAuth for non-confidential clients. The PKCE flow is necessary for desktop and localhost-based tooling where a client secret cannot be kept secure.

**Tradeoffs accepted**:
- The redirect URI is `http://localhost:5174/oauth/callback`. **There is no React route handling this callback.** The OAuth flow cannot be completed end-to-end from the browser today.
- `exchange_code_for_tokens()` and `refresh_access_token()` silently fall back to returning mock tokens if the HTTP request fails. This masks real connection failures.

---

## D-006 — Monorepo with Single Unified Dev Server

**Type**: `[NEW]` (decided during active development session, 2026-08-11)  
**Location**: `website/` workspace

**Decision**: Consolidate the three originally separate React Vite apps (`website/`, `admin/`, `dashboard/`) into a single unified React application hosted on one dev server port (5174).

**Context**: Three separate Vite dev servers on three ports caused port collision issues, consumed redundant memory, and required manual coordination during local development.

**Options considered**:
1. Monorepo with Turborepo/Lerna — rejected for overhead and complexity
2. Single unified app inside `website/` — chosen for simplicity
3. New root workspace — rejected because `website/` already had the most mature codebase and correct dependencies

**Chosen approach**: Admin pages moved to `website/src/admin/`, COO dashboard to `website/src/coo/`. CSS scoped using wrapper class prefixing (`.admin-layout`, `.coo-layout`). React Router `<Outlet />` layout shells separate the three visual contexts.

**Tradeoffs accepted**: The original standalone `admin/` and `dashboard/` directories at the project root are now stale duplicates. They are not deleted. This creates confusion about which is canonical. **Canonical is `website/src/admin/` and `website/src/coo/`**.

---

## D-007 — CSS Namespace Scoping via Wrapper Class Prefix

**Type**: `[NEW]` (decided 2026-08-11)  
**Location**: `website/src/admin/admin.css`, `website/src/coo/coo.css`

**Decision**: Scope all admin and COO CSS rules under `.admin-layout` and `.coo-layout` wrapper selectors respectively, using a custom state-machine Python parser to transform the original stylesheets.

**Options considered**:
1. CSS Modules — rejected because it requires renaming every `className` reference across 25+ JSX files
2. CSS-in-JS (styled-components) — rejected as a major dependency change
3. Wrapper class prefix scoping — chosen as a zero-refactor approach

**Tradeoffs accepted**: `:root` variable declarations are mapped to the wrapper selector, which means CSS variables are scoped. If a component inside `.admin-layout` renders a portal outside that DOM tree, the variables would not apply.

---

## D-008 — Static Hardcoded Data in Front-End (No API Bridge)

**Type**: `[EXISTING]` — **needs to be resolved**

**Decision** (implicit, never formally made): The React front-end uses hardcoded JavaScript data arrays (`website/src/data/index.js`, `website/src/admin/data/mockData.js`, inline arrays in `coo/Dashboard.jsx`) instead of fetching from the Python back-end.

**Current state**: There is no API server. The SQLite database is Python-only. The front-end shows data that does not reflect the real catalog state.

**Why it was done this way**: Likely for speed of front-end development without having to stand up a backend API server first.

**Why it matters**: The COO Dashboard claiming "4 Products — Indexed in WAL SQLite Engine" is showing a hardcoded number, not a live query. Revenue figures and product states shown in the UI are fictional relative to the actual DB.

> **[NEEDS CONFIRMATION]**: Is building an API server (e.g., FastAPI) to bridge the Python back-end and React front-end the intended next major milestone? Or is the data layer expected to remain static until a different architecture decision is made?

---

## D-009 — Dual Status Field (status vs lifecycle_state)

**Type**: `[EXISTING]` — **latent bug risk**

**Decision** (implicit): Two separate fields represent a product's state:
- `status` (TEXT in the `products` table, used by `list_products()` and `find_by_hash()`)
- `lifecycle_state` (stored inside the `raw_data` JSON blob, used by `LifecycleManager`)

**How they interact**: `LifecycleManager.transition_state()` line 66 maps `lifecycle_state` back to a simplified `status` string (`"published"`, `"approved"`, or `"draft"`). Both fields are written on every DB upsert.

**Risk**: A product can be in `lifecycle_state: "scaling"` while `status: "published"` — these are semantically different but stored separately. Queries using `list_products(status="published")` will include both `published` and `scaling` products. Queries against `lifecycle_state` require reading the JSON blob, which bypasses the indexed `status` column.

> **[NEEDS CONFIRMATION]**: Should `lifecycle_state` be promoted to a first-class indexed column in the DB schema, and `status` be deprecated or aliased?

---

## D-010 — No Authentication on Admin/COO Routes

**Type**: `[EXISTING]` — **security gap**

**Decision** (implicit): The routes `/admin` and `/coo` are open to any browser visitor with no login, session, or token check.

**Current justification**: Local development only. No production deployment exists.

**Risk**: If the app is ever served publicly (e.g., deployed to Vercel, Railway, or a VPS), the admin panel and financial data are fully exposed.

> **[NEEDS CONFIRMATION]**: Is adding route-level authentication (even a simple hardcoded password gate for now) a priority before any public hosting?
