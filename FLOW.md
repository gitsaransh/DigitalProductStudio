# FLOW.md — Actual Execution Flow

**Rule**: This file documents ACTUAL current execution flow based on code inspection.  
**Incomplete or uncertain sections are explicitly marked.**  
**Last audited**: 2026-08-11

---

## 1. Front-End Entry & Routing

```
Browser opens http://localhost:5174/
    → index.html (website/)
    → website/src/main.jsx
        createRoot(document.getElementById('root')).render(<App />)
    → website/src/App.jsx
        Loads global styles: ./index.css
        Loads scoped styles: ./admin/admin.css, ./coo/coo.css
                            (both loaded globally at startup, scoped by CSS class)
        <BrowserRouter>
            <ScrollToTop />   ← uses window.location, NOT useLocation hook
                              ← bug: won't react to React Router navigation
            <Routes>
                ├── <StorefrontLayout>  (path: /)
                │       <Navbar />
                │       <main><Outlet /></main>
                │       <Footer />
                │       Routes: / → Home.jsx
                │               /products → Products.jsx
                │               /categories → Categories.jsx
                │               /bundles → Bundles.jsx
                │               /membership → Membership.jsx
                │               /free → FreeResources.jsx
                │               /about → About.jsx
                │               /blog → Blog.jsx
                │               /faq → FAQ.jsx
                │               /support → Support.jsx
                │               /contact → Contact.jsx
                │               /privacy → Legal.jsx (Privacy)
                │               /terms → Legal.jsx (Terms)
                │               /refund → Legal.jsx (RefundPolicy)
                │               /licensing → Legal.jsx (Licensing)
                │               /affiliate → Future.jsx (Affiliate)
                │               /account → Future.jsx (Account)
                │
                ├── <AdminLayout>  (path: /admin)
                │       <div className="admin-layout">
                │           [sidebar-backdrop if open]
                │           <Sidebar />
                │           <main className="admin-main"><Outlet /></main>
                │       </div>
                │       Sidebar toggle: CustomEvent 'toggle-sidebar' on window
                │       Routes: /admin → Dashboard.jsx
                │               /admin/products → Products.jsx
                │               /admin/orders → Orders.jsx
                │               /admin/analytics → Analytics.jsx
                │               /admin/customers → Customers.jsx
                │               /admin/marketing → Marketing.jsx
                │               /admin/blog → Blog.jsx
                │               /admin/seo → SEO.jsx
                │               /admin/emails → Emails.jsx
                │               /admin/downloads → Downloads.jsx
                │               /admin/settings → Settings.jsx
                │
                ├── <CooLayout>  (path: /coo)
                │       <div className="coo-layout">
                │           <Outlet />
                │       </div>
                │       Routes: /coo → coo/Dashboard.jsx
                │
                └── * → Inline 404 page
```

**Data sources for front-end views**:
- Storefront pages read from `website/src/data/index.js` (hardcoded JS array, ~455 lines)
- Admin pages read from `website/src/admin/data/mockData.js` (hardcoded JS)
- COO Dashboard reads from `REAL_DATABASE_PRODUCTS` array hardcoded inside `coo/Dashboard.jsx`
- **No component fetches from any API or back-end service**

---

## 2. Product Ingestion Pipeline (Back-End Python)

Triggered by running `python -m src.ingestion.watcher` or calling `IngestionWatcher().scan_and_process()` directly.

```
IngestionWatcher.__init__()
    ProductDatabase()         → connects to catalog/studio_catalog.db
                                 _init_db(): creates tables + indexes if not exist
    DuplicateDetector(db)
    ThumbnailGenerator()
    GitTracker()              → ensures .git dir exists (runs git init if not)

IngestionWatcher.scan_and_process()
    for each subdirectory in catalog/raw_ingest/:
        IngestionWatcher.process_product_folder(folder_path)

process_product_folder(folder_path):
    1. DuplicateDetector.check_duplicate(folder_path)
           calculate_directory_hash(folder_path)
               os.walk() sorted files (skipping info.json)
               SHA-256 of (relative_path + file_bytes) for each file
           ProductDatabase.find_by_hash(hash)
               SELECT raw_data FROM products WHERE file_hash = ?
       → if duplicate: print warning, return None

    2. Read info.json if present (optional — uses folder name as fallback)

    3. Build product_record dict:
           id: uuid4()
           sku: DPH-{uuid[:8].upper()}
           title: raw_info.get("title") or folder_name
           status: "pending_approval"   ← always starts here
           file_hash: computed above
           marketplaces: {etsy, gumroad, lemonsqueezy, custom_web} all "draft"
           changelog: [GitTracker.create_changelog_entry()]

    4. ListingGenerator.enrich_product_listing(product_record)
           generate_etsy_title(base_name, category, keywords)
               joins parts with " | ", truncates to 140 chars
           generate_etsy_tags(category, base_name, keywords)
               builds list from candidate pool, cleans to alphanumeric + space
               each tag ≤ 20 chars, exactly 13 tags returned
           Writes: product_record["title"], ["tags"], ["description"], ["faqs"]

    5. os.makedirs(catalog/active/{product_id}/)
       shutil.copy2() / copytree() all files from raw folder to active folder

    6. ThumbnailGenerator.generate_all_cards(product_record, previews_dir)
           for each of 5 slide types (cover, feature, usage, palette, mockup):
               if PIL available: _create_pil_slide() → saves real PNG
               else: _create_placeholder_slide() → writes b"PNG_PLACEHOLDER_DATA"
                                                   ← NOT a valid PNG

    7. PDFGenerator.generate_customer_instructions(product_record, pdf_path)
           [⚠ NOT INSPECTED — see src/media/pdf_generator.py]

    8. Write metadata.json to active/{product_id}/

    9. ProductDatabase.upsert_product(product_record)
           upsert_batch([product_record])
               INSERT OR UPDATE INTO products (15 columns)
               DELETE + INSERT INTO products_fts
               INSERT INTO products_fts(products_fts) VALUES('optimize')
               conn.commit()

    10. GitTracker.commit_product_change(product_id, title, version, description)
            git add catalog/
            git commit -m "chore(product): ..."
            → silently skips on error (returns error string, does not raise)

    11. shutil.rmtree(raw_folder_path)   ← deletes raw input after success
```

---

## 3. Approval & Publishing Pipeline (Back-End Python)

Triggered by calling `ApprovalManager().approve_and_publish(product_id)`.  
Currently, **there is no mechanism to trigger this from the front-end**.

```
ApprovalManager.__init__()
    ProductDatabase()
    publishers = {
        "etsy": EtsyPublisher(),          → reads ETSY_API_KEY from env
        "gumroad": GumroadPublisher(),    → reads GUMROAD_ACCESS_TOKEN from env
        "lemonsqueezy": LemonSqueezyPublisher(),
        "custom_web": WebPublisher()      → no credentials needed
    }

ApprovalManager.approve_and_publish(product_id, target_marketplaces=None)
    1. ProductDatabase.get_product(product_id)
           SELECT raw_data FROM products WHERE id = ?
           → deserializes JSON blob

    2. product["status"] = "approved"  (intermediate)

    3. For each marketplace in [etsy, gumroad, lemonsqueezy, custom_web]:
           publisher.publish(product_data)
           
           EtsyPublisher.publish():
               if no ETSY_API_KEY → return {status: "not_connected"}
               else → return fake {status: "active", external_id: "ETSY-{id[:8]}"}
               ← No actual Etsy API HTTP call is made

           GumroadPublisher.publish():
               same stub pattern
           
           WebPublisher.publish():
               always returns {status: "active", listing_url: "https://digitalproductshouse.com/..."}
               ← hardcoded domain, no HTTP call

    4. product["status"] = "published"

    5. ProductDatabase.upsert_product(product)
           saves updated status and marketplace results

ApprovalManager.reject_product(product_id, reason):
    product["status"] = "rejected"
    product["rejection_reason"] = reason
    ProductDatabase.upsert_product(product)
```

---

## 4. Lifecycle State Machine (Back-End Python)

```
ProductLifecycleManager.transition_state(product_id, new_state, actor, notes)
    1. Validates new_state in VALID_STATES
       ["idea","research","generating","review","approved","published","scaling","updating","retired"]

    2. ProductDatabase.get_product(product_id)

    3. current_state = product.get("lifecycle_state")
                        or product.get("status")  ← fallback for older records
       allowed_next = TRANSITION_MAP[current_state]

    4. If new_state not in allowed_next:
           ⚠ print warning but DOES NOT raise — transition proceeds anyway

    5. Appends entry to product["lifecycle_history"]

    6. product["lifecycle_state"] = new_state
       product["status"] = simplified mapping:
           "published"/"scaling" → "published"
           "approved" → "approved"
           anything else → "draft"   ← loses granularity

    7. ProductDatabase.upsert_product(product)
```

**⚠ Risk**: The simplified `status` mapping on step 6 collapses `"idea"`, `"research"`, `"generating"`, `"review"`, `"updating"`, `"retired"` all to `"draft"`. A product in `"review"` state and a product in `"idea"` state are both `status: "draft"` in the indexed column.

---

## 5. Etsy OAuth Flow (Partially Implemented)

```
EtsyOAuthHandler.generate_authorization_url(scopes)
    → generates code_verifier (secrets.token_urlsafe(32))
    → computes code_challenge (SHA-256 of verifier, base64url encoded)
    → generates state (secrets.token_urlsafe(16))
    → builds https://www.etsy.com/oauth/connect?{params}
    → returns (auth_url, state, code_verifier)

[User browses to auth_url in browser]
[Etsy redirects to http://localhost:5174/oauth/callback?code=...&state=...]

⚠ MISSING: No React route handles /oauth/callback
⚠ MISSING: No mechanism to pass the code back to Python for token exchange

EtsyOAuthHandler.exchange_code_for_tokens(code, code_verifier)
    → POST https://openapi.etsy.com/v3/public/oauth/token
    → on failure: returns mock token dict silently
```

---

## 6. Intelligence Scoring (Back-End Python)

```
IntelligenceScoringEngine.calculate_product_scores(product_data)
    seo_score:
        +40 if 50 ≤ len(title) ≤ 140
        +40 if len(tags) == 13
        +20 if len(description) > 200
        min/max clamped to [10, 100]
    
    quality_score:
        base: 50
        +30 if len(previews) >= 5
        +20 if files.customer_instructions_pdf exists
        min/max clamped to [20, 100]
    
    competition_score: 45 (hardcoded — no external data)
    profit_score: ((price - cost) / price * 100), clamped [10, 100]
    difficulty_score: 30 (hardcoded)
    confidence_score: (quality * 0.5) + (seo * 0.5)
    est_sales: confidence_score * 1.8

⚠ These scores are heuristics only. competition_score and difficulty_score
  are hardcoded constants with no external market data input.
```

---

## 7. Configuration Loading Order

```
ConfigManager.__init__("config/settings.yaml")
    _load_settings():
        1. Reads env vars first (os.getenv())
        2. Reads config/settings.yaml if exists
        3. YAML values only override if env var is empty (db_path only currently)
        → Returns merged dict with masked secrets

EtsyPublisher.__init__():
    self.api_key = api_key or os.getenv("ETSY_API_KEY") or os.getenv("VITE_ETSY_API_KEY") or ""
    ← Falls back to Vite env var as secondary source
    ← ConfigManager is NOT used here — direct env access only
```

**⚠ Gap**: `ConfigManager` exists but is not imported or used by any publisher adapter. Each adapter does its own `os.getenv()` directly. `ConfigManager` appears to be used only by `scripts/preflight_check.py` implicitly (it's not even imported there — it just reads env vars directly too).

---

## 8. Flows That Do NOT Exist Yet

| What you might expect | What actually exists |
|---|---|
| Front-end fetches products from API | No API server. Front-end reads hardcoded JS files. |
| "Approve" button in COO/Admin UI calls back-end | No mechanism. ApprovalManager can only be called from Python CLI. |
| Etsy OAuth callback handled in browser | No `/oauth/callback` React route exists. |
| Intelligence scores shown in UI come from scoring engine | UI scores are hardcoded in `REAL_DATABASE_PRODUCTS` array in `Dashboard.jsx`. |
| Product count in COO dashboard reflects DB | "4 Products" is hardcoded text, not a live query. |
| Auto-approve when score > 0.95 threshold | Config key exists in YAML; no code reads it. |
| Market research data in COO dashboard | Placeholder "Not Connected" UI; no data source. |
