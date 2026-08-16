# ROADMAP.md — Digital Product Studio Release Roadmap & Governance Manual

This document governs the operational growth, development phases, and launch milestones of **Digital Product Studio**. It acts as our official development ledger. 

> [Spacer Alert]
> [!IMPORTANT]
> **Governance Rule**: Every future issue, task, feature request, or pull request MUST belong to exactly one milestone defined in this roadmap.

---

## 1. Roadmap Overview

| Version | Milestone | Scope | Primary Exit Criteria | Status |
| :--- | :--- | :--- | :--- | :---: |
| **v1.0** | **Foundation** | Core Ingestion & DB | Local watcher processes raw folders to SQLite | **Completed** ✅ |
| **v1.1** | **Website** | Web Store & Hosting | Frontend live on canonical domain `digitalproductstudio.in` | *In Progress* 🏃‍♂️ |
| **v1.2** | **Etsy** | Shop Verification | Seller credentials and basic stubs verified | *Scheduled* 📅 |
| **v1.3** | **API** | OAuth & Data Bridge | Unified FastAPI endpoints and React authentication active | *Scheduled* 📅 |
| **v1.4** | **First Product** | Live Ingestion & Publish | First physical listing successfully posted to market | *Scheduled* 📅 |
| **v1.5** | **First Sale** | Webhook Curation | Live checkout, payment, and file dispatch validated | *Scheduled* 📅 |
| **v2.0** | **Scale** | Multi-Market Automation | 20+ products live across 4+ publisher adapters | *Scheduled* 📅 |

---

## 2. Milestone Details & Exit Criteria

### v1.0 — Foundation
*Focus: Establish the local core pipelines, SQLite WAL database, mock UI, and ingestion engine.*

*   **Scope**:
    *   Initialize single source of truth database with SQLite WAL mode and FTS5 search.
    *   Build `IngestionWatcher` to scan raw product folders and check SHA-256 fingerprint hashes to prevent duplicate listings.
    *   Create stub-first adapters for Etsy, Gumroad, Lemon Squeezy, and Web.
    *   Implement 9-state product lifecycle model.
*   **Exit Criteria**:
    *   [x] Raw assets can be ingested, enriched with titles/tags, cataloged in `studio_catalog.db`, and tracked via Git.
    *   [x] All 10 publisher adapters load without python module errors.
    *   [x] Front-end React structure established with storefront layout, admin layouts, and operator views.
*   **Status**: `Completed` ✅

---

### v1.1 — Website
*Focus: Deploy the unified React + Vite application to production on the canonical domain.*

*   **Scope**:
    *   Setup domain configuration and DNS routing for `digitalproductstudio.in`.
    *   Configure Vercel / Netlify / VPS pipeline for high-performance React hosting.
    *   Optimize sitemap indexation and crawler search patterns.
*   **Exit Criteria**:
    *   [ ] Public storefront and admin router are accessible live on `https://digitalproductstudio.in`.
    *   [ ] `robots.txt` and `sitemap.xml` are verified active on the live domain by search indexers.
    *   [ ] No development mock items leak to search engines.
*   **Status**: `In Progress` 🏃‍♂️

---

### v1.2 — Etsy
*Focus: Validate target shop authentication and seller environment.*

*   **Scope**:
    *   Complete Etsy Developer Portal app registration for client key retrieval.
    *   Configure Etsy Shop ID (`ZenithPlannersCo`) and environment credentials in `.env`.
    *   Audit Etsy title compliance (≤ 140 chars) and tags (exactly 13 tags, ≤ 20 chars).
*   **Exit Criteria**:
    *   [ ] App credentials loaded by `ConfigManager` without validation warnings.
    *   [ ] Verified Etsy seller account configured and active.
*   **Status**: `Scheduled` 📅

---

### v1.3 — API
*Focus: Bridge the data-isolation between Python backend and React frontend.*

*   **Scope**:
    *   Start FastAPI server `src.api.main:app` as a persistent daemon.
    *   Implement client endpoints in React to replace hardcoded JS data states with live SQLite database queries.
    *   Build the React `/oauth/callback` routing page to handle authorization codes from the browser and pass them to Python `EtsyOAuthHandler`.
*   **Exit Criteria**:
    *   [ ] Operator Admin Panel displays live database product rows.
    *   [ ] End-to-end OAuth callback exchange completes inside the operator interface, saving access and refresh tokens to local configuration.
*   **Status**: `Scheduled` 📅

---

### v1.4 — First Product
*Focus: Publish the first live digital product to e-commerce marketplaces.*

*   **Scope**:
    *   Submit a validated product folder through `IngestionWatcher` (e.g. an AI Prompt Kit or PDF planner).
    *   Run intelligence scoring heuristics to confirm SEO quality.
    *   Run `ApprovalManager.approve_and_publish()` to trigger live API payloads to Etsy, Gumroad, and Lemon Squeezy.
*   **Exit Criteria**:
    *   [ ] Product listing created live on Etsy and Gumroad (non-mock IDs returned by endpoints).
    *   [ ] Customer instruction PDF generated and attached correctly to the listing.
    *   [ ] Product state successfully transitioned to `published`.
*   **Status**: `Scheduled` 📅

---

### v1.5 — First Sale
*Focus: Verify the transaction recording and checkout experience.*

*   **Scope**:
    *   Simulate or complete a live sandbox/production purchase.
    *   Verify webhook listeners for Gumroad/Etsy to capture purchase events.
    *   Verify dispatch of download email links and customer instructions.
*   **Exit Criteria**:
    *   [ ] Checkout completes, webhooks are successfully captured by the backend bridge.
    *   [ ] Product download metrics and revenue updates are recorded in SQLite and reflected on the Admin Dashboard.
*   **Status**: `Scheduled` 📅

---

### v2.0 — Scale
*Focus: Shift from semi-automated to autonomous swarm ingestion, scaling to 20+ live listings.*

*   **Scope**:
    *   Replace rule-based Python heuristics inside `ContentAgent`, `SEOAgent`, and `ListingAgent` with actual LLM calls (OpenAI/Gemini).
    *   Set up batch ingestion pipelines to scan 100+ raw items sequentially.
    *   Add automated market scoring using DataForSEO / Semrush APIs.
*   **Exit Criteria**:
    *   [ ] 20+ high-quality digital products published and active on Etsy, Gumroad, and the custom store.
    *   [ ] AI swarm successfully generates listing copy, tags, and thumbnails with zero human code involvement.
*   **Status**: `Scheduled` 📅
