# PROJECT_CONTEXT.md — Digital Products House

**Last audited**: 2026-08-11  
**Audit basis**: Direct inspection of all source files. Documentation does not replace code.

---

## 1. What the Product Does

Digital Products House is a **semi-automated digital product publishing studio**. It lets a solo operator (or small team) create, enrich, QA, and publish downloadable digital products (PDF planners, Canva templates, Excel spreadsheets, AI prompt kits) to multiple e-commerce marketplaces simultaneously — Etsy, Gumroad, Lemon Squeezy, Shopify, Ko-fi, Payhip, Creative Market, Amazon Digital, WooCommerce, and a custom web storefront.

The system is designed to scale to 100,000+ products with near-zero manual effort per product, using:
- An AI agent swarm to generate SEO copy, thumbnails, and customer guides
- A human-in-the-loop approval gate before any live publishing
- SQLite WAL database as the single source of truth

---

## 2. Major Application Components

### Back-End (Python)
| Module | Location | Responsibility |
|---|---|---|
| **IngestionWatcher** | `src/ingestion/watcher.py` | Scans `catalog/raw_ingest/` and orchestrates the full product creation pipeline |
| **DuplicateDetector** | `src/ingestion/duplicate_detector.py` | SHA-256 hash check against DB to prevent duplicate listings |
| **ListingGenerator** | `src/marketing/listing_generator.py` | Generates Etsy-compliant 140-char titles, exactly 13 tags, and description copy |
| **ThumbnailGenerator** | `src/media/thumbnail_generator.py` | Creates 5 preview slides (2700×2025 PNG) with PIL or placeholder fallback |
| **PDFGenerator** | `src/media/pdf_generator.py` | Generates a `Customer_Instructions.pdf` per product |
| **ApprovalManager** | `src/approvals/approval_manager.py` | Human-in-the-loop gate; dispatches to all publisher adapters on approval |
| **ProductDatabase** | `src/core/database.py` | SQLite WAL + FTS5 engine for catalog CRUD and search |
| **ProductLifecycleManager** | `src/lifecycle/lifecycle_manager.py` | Governs 9-state machine transitions for each product |
| **GitTracker** | `src/versioning/git_tracker.py` | Commits catalog changes to git for audit trail |
| **IntelligenceScoringEngine** | `src/intelligence/scoring.py` | Scores each product on SEO, quality, profit, competition (heuristic-only today) |
| **EtsyOAuthHandler** | `src/etsy/oauth_handler.py` | Full PKCE OAuth2 flow implementation for Etsy API v3 |
| **ConfigManager** | `src/core/config.py` | Loads from `.env` + `config/settings.yaml`; masks secrets in logs |

### AI Agent Swarm (Python, thin wrappers today)
Located in `src/agents/`. Each agent subclasses `BaseAIAgent` and exposes a single `execute(payload)` method. Currently, most agents are **thin wrappers** delegating to an underlying service class:
- `ContentAgent`, `SEOAgent`, `ListingAgent`, `ThumbnailAgent`, `QAAgent`, `PublishingAgent`, `AnalyticsAgent`, `SupportAgent`

> **⚠ IMPORTANT**: The agents do not currently call any external AI API (e.g., Claude, GPT). They delegate to internal rule-based Python modules. The AI agent framing is aspirational architecture — the code is pure Python heuristics today.

### Publisher Adapters (Python, 10 total)
All inherit from `BaseMarketplacePublisher` (`src/publishers/base_publisher.py`) defining `publish()`, `update()`, `sync_analytics()`.

Currently fully implemented with live-API-or-stub logic:
- **EtsyPublisher**: Checks `ETSY_API_KEY` env var; returns `not_connected` if missing. No actual Etsy API call is made yet when key is present — returns a generated fake ID.
- **GumroadPublisher**: Checks `GUMROAD_ACCESS_TOKEN`; same stub pattern.
- **LemonSqueezyPublisher**: Same stub.
- **WebPublisher**: Always returns `active` with hardcoded `digitalproductshouse.com` URL and hardcoded analytics figures. **This URL is not live.**
- **ShopifyPublisher, WooCommercePublisher, KofiPublisher, PayhipPublisher, AmazonDigitalPublisher, CreativeMarketPublisher**: Stub implementations only (see file sizes ~800-850 bytes each).

### Front-End (React + Vite)
| View | Route | Location | State Source |
|---|---|---|---|
| **Public Storefront** | `/`, `/products`, `/about`, etc. | `website/src/pages/` | Hardcoded `website/src/data/index.js` |
| **Operator Admin Panel** | `/admin/*` | `website/src/admin/pages/` | Hardcoded `website/src/admin/data/mockData.js` |
| **COO Dashboard** | `/coo` | `website/src/coo/Dashboard.jsx` | Hardcoded `REAL_DATABASE_PRODUCTS` array in-component |

> **⚠ CRITICAL**: The front-end is **entirely data-isolated from the back-end**. There is no API server, no REST endpoint, no WebSocket, no live DB connection. The products shown in the storefront, admin panel, and COO dashboard all come from manually maintained JavaScript constants. The SQLite database (`catalog/studio_catalog.db`) is a Python-only component.

---

## 3. Technology Stack

### Back-End
- **Language**: Python 3.10+
- **Database**: SQLite with WAL mode, FTS5 virtual tables (file: `catalog/studio_catalog.db`)
- **Media Generation**: Pillow (PIL) for thumbnails; ReportLab for PDFs
- **Config**: PyYAML + `python-dotenv` (via `.env` file)
- **Versioning**: Git CLI via `subprocess`
- **No web framework**: There is no Flask, FastAPI, or Django. No HTTP server layer exists in the Python back-end.

### Front-End
- **Framework**: React 18 + Vite 5
- **Routing**: React Router DOM v6
- **Styling**: Vanilla CSS (global `index.css` for storefront; scoped `admin.css` and `coo.css` for operator views)
- **Icons**: Lucide React
- **State**: Local `useState` only — no Redux, Zustand, or Context API

### Deployment
- **Current state**: Local development only (`npm run dev` at `http://localhost:5174`)
- **No CI/CD pipeline** exists
- **No production server** is configured
- `docs/DEPLOYMENT.md` exists but contains placeholder content

---

## 4. Data Flow

### Storefront (Front-End Only)
```
website/src/data/index.js
    → Products.jsx / Home.jsx / Categories.jsx (React components)
    → Rendered in browser
    ← No back-end connection
```

### Product Ingestion (Back-End Only)
```
catalog/raw_ingest/{folder}/
    → IngestionWatcher.scan_and_process()
    → DuplicateDetector.check_duplicate()  [SHA-256 hash vs DB]
    → ListingGenerator.enrich_product_listing()  [title/tags/description]
    → ThumbnailGenerator.generate_all_cards()  [5 preview PNGs]
    → PDFGenerator.generate_customer_instructions()
    → ProductDatabase.upsert_product()  [→ studio_catalog.db]
    → GitTracker.commit_product_change()
    → Files moved to catalog/active/{product_id}/
```

### Approval & Publishing (Back-End Only)
```
ApprovalManager.approve_and_publish(product_id)
    → ProductDatabase.get_product()
    → EtsyPublisher.publish()  [stub if no API key]
    → GumroadPublisher.publish()  [stub if no token]
    → LemonSqueezyPublisher.publish()  [stub]
    → WebPublisher.publish()  [always active, hardcoded URL]
    → ProductDatabase.upsert_product()  [status → "published"]
```

### Missing Link
**There is no API bridge between the Python back-end and the React front-end.** The COO Dashboard's "4 Products" count is hardcoded. The storefront's product listings are hardcoded. No mechanism currently pushes DB state to the UI.

---

## 5. Authentication

- **Etsy**: OAuth 2.0 PKCE flow implemented in `src/etsy/oauth_handler.py`. The redirect URI `http://localhost:5174/oauth/callback` is configured but **there is no React route handling this callback URL**. The token exchange logic exists in Python but cannot be triggered from the browser.
- **Gumroad, Lemon Squeezy, Shopify**: Simple API key/token via `.env`. No OAuth.
- **Internal**: No user authentication system for the Admin or COO views. Both are openly accessible at their routes.

---

## 6. Core Business Logic

1. **Deduplication by hash**: Products are SHA-256 fingerprinted at the folder level (excluding `info.json`). This is the primary guard against marketplace account suspension from duplicate listings.
2. **Etsy compliance validation**: Titles ≤ 140 chars, exactly 13 tags ≤ 20 chars each, enforced at `ListingGenerator`.
3. **Human-in-the-loop gate**: All ingest products start at `pending_approval`. Publishing only happens via explicit `ApprovalManager.approve_and_publish()` call.
4. **9-state lifecycle machine**: `idea → research → generating → review → approved → published → scaling → updating → retired`. `TRANSITION_MAP` defines allowed transitions but violations only log a warning — not enforced hard.
5. **Intelligence scoring**: Heuristic-only. Quality score based on preview count + PDF presence. SEO score based on title length + tag count + description length. Competition score is hardcoded `45`. No external market data.

---

## 7. Major Integrations

| Integration | Status | Notes |
|---|---|---|
| **Etsy Open API v3** | Not connected | API key empty in `.env`. OAuth flow code exists but no callback handler in React. |
| **Gumroad API v2** | Not connected | Token empty in `.env`. |
| **Lemon Squeezy** | Not connected | Key empty in `.env`. |
| **Shopify, WooCommerce, Ko-fi, Payhip, Amazon Digital, Creative Market** | Stub only | Files exist (~800 bytes each) but contain placeholder implementations. |
| **DataForSEO / Semrush** | Not connected | COO dashboard displays "Not Connected" placeholder. |
| **Any external AI API** | Not integrated | No calls to Claude, GPT, or similar. Agents are rule-based Python today. |

---

## 8. Current Development State

- **Front-end**: Largely feature-complete visually. All 13 storefront pages exist. Admin panel has 11 views. COO dashboard has 6 tab views. All data is hardcoded/static.
- **Back-end**: Core pipeline is built and runnable. DB schema is production-ready. Publisher adapters are all stubbed. No live marketplace is connected.
- **Integration layer**: **Does not exist**. No API server bridges back-end and front-end.
- **Authentication**: Absent. Admin and COO routes are open.
- **Tests**: `tests/` directory exists; contents not yet audited.
- **Deployment**: Local only. No production infrastructure.

---

## 9. Important Constraints

1. The `.env` file currently contains only empty values for all API keys.
2. `WebPublisher` hardcodes `https://digitalproductshouse.com` — a domain that may not be registered or live.
3. `ETSY_SHOP_ID` is set to `ZenithPlannersCo` as a placeholder.
4. The `dashboard/` and `admin/` directories at the root are the original standalone React apps — they still exist but their dev servers have been shut down. Canonical source is now `website/src/admin/` and `website/src/coo/`.
5. `LifecycleManager` uses `lifecycle_state` as the primary field, but the DB schema stores `status`. A compatibility shim exists in `lifecycle_manager.py` line 66, but both fields co-exist in `raw_data` JSON — this is a latent inconsistency.
6. `ThumbnailGenerator` falls back to writing a literal `b"PNG_PLACEHOLDER_DATA"` string if Pillow is not installed — not a valid PNG file.
7. No `requirements.txt` or `pyproject.toml` was found during this audit. Python dependency management is undocumented.
