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

## 4. Database Records Audit

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
