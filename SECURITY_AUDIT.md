# Security Audit — Google Authentication & RBAC

This document logs the security review, role-based access control (RBAC) policy, and verification summary for Sprint 04A and Sprint 04A.1.

---

## 1. Authentication Strategy

* **Primary Provider**: Google Identity Services (GSI) SDK.
* **Implementation Details**: Integrates the native Google Sign-In button on the frontend (`Login.jsx`) using the `gsi/client` library. Authenticated payloads (ID Tokens) are sent to the backend (`POST /api/auth/google/verify`) and securely verified via Google's tokeninfo API (`https://oauth2.googleapis.com/tokeninfo`).
* **Fallback Provider**: None. Traditional email/password authentication is **explicitly disabled** to comply with modern identity governance practices.
* **Testing Harness**: A dedicated Developer Mock Login is available in local development. It bypasses external API requirements and generates standard session tokens for any mock identity, facilitating RBAC testing.

---

## 2. Role-Based Access Control (RBAC) Model

The system governs catalog access and operator commands via two distinct roles:

| Role | Access Type | Target Dashboard | Gated API Scope |
|---|---|---|---|
| **admin** | Full read/write over product pipeline and stats | `/admin/dashboard` | `/api/approvals/*`, `/api/stats` |
| **customer** | Personal account management only | `/account` | Restricted to public endpoints + `/api/auth/me` |

### Security Logic & Rules
1. **Dynamic Seeding**: The system automatically reads `ADMIN_GOOGLE_EMAIL` from `.env` on database start. If not present in the DB, it seeds the user with role `'admin'`.
2. **Role Preservation**: If a user email already exists in the `users` table, its role is strictly preserved during Google OAuth sign-in. This prevents escalation vulnerabilities.
3. **Default Assignment**: Any unknown Google user signing in for the first time is automatically registered with the `'customer'` role (unless they match the configured `ADMIN_GOOGLE_EMAIL`).
4. **Backend Enforcement**: API routes for approvals and catalog stats are guarded at the router level in FastAPI using dependency injection (`Depends(require_admin)`).

---

## 3. Verification & Audit Log

### Test Case 1: Seed Administrator Authentication
* **Input Identity**: `digitalproductstudio.admin@gmail.com`
* **Flow**:
  1. User triggers mock Google auth with email `digitalproductstudio.admin@gmail.com`.
  2. Database identifies matching seed record or assigns `'admin'` role dynamically.
  3. Session token is generated and returned to frontend callback handler.
  4. Frontend detects `role === 'admin'` and redirects.
* **Result**: **SUCCESS**. User is logged in and redirected to `/admin/dashboard`. Access to `/admin/*` views is successfully granted.

### Test Case 2: Standard Customer Authentication
* **Input Identity**: `customer@example.com`
* **Flow**:
  1. User triggers mock Google auth with email `customer@example.com`.
  2. Database creates new record with role `'customer'`.
  3. Session token is returned to frontend callback handler.
  4. Frontend detects `role === 'customer'` and redirects.
* **Result**: **SUCCESS**. User is logged in and redirected to `/account`. Any attempt to navigate to `/admin/dashboard` is intercepted by `AdminAuthGate.jsx`, rendering a secure **Access Denied** block and denying access.

### Test Case 3: Unauthenticated Access Prevention
* **Input**: Unauthenticated requests to restricted pages and backend endpoints.
* **Result**: **SUCCESS**.
  * Navigating to `/account` or `/admin` in the browser automatically redirects to `/login`.
  * Requesting `/api/stats` or `/api/approvals/pending` via HTTP requests returns `401 Unauthorized`.
  * Requesting restricted endpoints with a customer token returns `403 Forbidden`.

### Test Case 4: Public Storefront Accessibility
* **Input**: Accessing public pages (Home `/`, Products `/products`, Bundles `/bundles`, About `/about`, etc.) without a session token.
* **Result**: **SUCCESS**. All storefront pages remain completely accessible to public visitors.

---

## 4. Razorpay Key Management (Sprint 05A)

### 4.1 Key Segregation Policy

| Variable | Scope | Purpose |
|---|---|---|
| `RAZORPAY_KEY_ID` | Backend `.env` only | Order creation auth (public half of credential pair) |
| `RAZORPAY_KEY_SECRET` | Backend `.env` only | HMAC-SHA256 signature verification — **never exposed** |
| `VITE_RAZORPAY_KEY_ID` | Frontend `.env` (Vite-exposed) | Passed to Razorpay checkout widget; must equal `RAZORPAY_KEY_ID` |

**Rule**: `RAZORPAY_KEY_SECRET` is loaded exclusively via `os.getenv()` inside `payments.py`. It is never:
- Returned in any API response payload
- Logged to stdout or stderr
- Passed to the frontend via any route

### 4.2 Test-Mode Enforcement

A dedicated `_is_live_mode()` guard in [`payments.py`](file:///c:/Users/Saransh/OneDrive/Documents/DigitalProductStudio/src/api/routes/payments.py) rejects any `RAZORPAY_KEY_ID` that starts with `rzp_live_`:

```python
if _is_live_mode(key_id):
    raise HTTPException(status_code=500,
        detail="Live Razorpay keys are not permitted. Configure TEST keys (rzp_test_*) only.")
```

This is enforced at the route handler level on every order creation attempt.

### 4.3 Startup Validation

[`main.py`](file:///c:/Users/Saransh/OneDrive/Documents/DigitalProductStudio/src/api/main.py) includes an `@app.on_event("startup")` hook that runs at server boot:

| Check | Action |
|---|---|
| `RAZORPAY_KEY_ID` missing | Warning → server starts in mock mode |
| `RAZORPAY_KEY_ID` is `rzp_live_*` | **Fatal** → `RuntimeError` raised, server aborted |
| `RAZORPAY_KEY_SECRET` missing | Warning → signature verification uses mock mode |
| `VITE_RAZORPAY_KEY_ID` ≠ `RAZORPAY_KEY_ID` | Warning → frontend/backend key mismatch flagged |
| `ADMIN_GOOGLE_EMAIL` missing | Warning → no admin seed |
| All checks pass | `✓` Logged, server continues |

### 4.4 Mock Mode Policy

Mock mode is activated automatically when:
- Keys are absent from `.env`, **or**
- Keys use the placeholder prefix `rzp_test_placeholder`

In mock mode:
- `order_mock_*` IDs are generated locally without calling the Razorpay API
- Signature verification is auto-approved
- The stored signature is set to `MOCK_VERIFIED` (not the client-supplied string, preventing signature injection)

Mock mode is strictly for local development. It is **not** a security bypass for production.

---

## 5. Database Records Audit

A direct query to the SQLite virtual table reveals the seeded admin user configuration:
```json
[
  {
    "id": "dfad6ce6-d474-4ce0-bfb0-ea48bdb58510",
    "google_id": null,
    "email": "digitalproductstudio.admin@gmail.com",
    "name": "Admin User",
    "avatar_url": "",
    "role": "admin",
    "created_at": "2026-08-23T21:57:05Z",
    "last_login": "2026-08-23T21:57:05Z"
  }
]
```
