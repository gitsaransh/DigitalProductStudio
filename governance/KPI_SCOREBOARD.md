# KPI_SCOREBOARD.md — Executive KPI Scoreboard

This document tracks the core Key Performance Indicators (KPIs) for **Digital Product Studio**. It acts as our financial and operational health monitor.

---

## 1. Core KPIs & Targets

| KPI | Target Value | Current Live Status | Last Updated | Notes / Source |
| :--- | :--- | :---: | :---: | :--- |
| **Live Products** | 20 | `5` | 16 Aug 2026 | Local SQLite Catalog active. Target represents v2.0 milestone. |
| **Etsy Conversion Rate** | 3%+ | `0.0%` | 16 Aug 2026 | Initial baseline to be established post-launch. |
| **Average Order Value** | $18+ | `$0.00` | 16 Aug 2026 | Monitored across Etsy, Gumroad, and custom web storefronts. |
| **Monthly Revenue** | $5,000 | `$0.00` | 16 Aug 2026 | Aggregated across all publishing channels. |
| **Refund Rate** | <2% | `0.0%` | 16 Aug 2026 | Target represents strict quality control goal. |
| **Shop Rating** | 4.9+ | `N/A` | 16 Aug 2026 | Monitored on Etsy, Creative Market, and Amazon. |
| **Email Subscribers** | 1,000 | `0` | 16 Aug 2026 | List managed via Resend/newsletter integrations. |
| **Organic Traffic** | Growing | `Stable` | 16 Aug 2026 | Baselined via Google Analytics / search indexers. |
| **Repeat Customers** | 20% | `0%` | 16 Aug 2026 | Customer retention and lifecycle metric. |
| **First Sale Date** | Recorded | `Pending` | 16 Aug 2026 | Milestone v1.5 gate. |

---

## 2. Metric Explanations & Measurement Strategy

### 1. Live Products
*   **Measurement**: Total count of active listings marked `published` in the SQLite database and synced successfully on live storefronts.
*   **Strategy**: Weekly ingestion batches driven by `IngestionWatcher`.

### 2. Etsy Conversion Rate
*   **Measurement**: `(Etsy Orders / Etsy Visits) * 100`.
*   **Strategy**: Fetched daily via `EtsyPublisher.sync_analytics()`.

### 3. Average Order Value (AOV)
*   **Measurement**: `Total Revenue / Total Orders`.
*   **Strategy**: Calculated from unified sales records across all active marketplaces.

### 4. Monthly Revenue
*   **Measurement**: Gross revenue in USD generated within a calendar month.
*   **Strategy**: Monitored via the operator dashboard and synced via platform webhooks.

### 5. Refund Rate
*   **Measurement**: `(Refunded Orders / Total Orders) * 100`.
*   **Strategy**: Target kept low by enforcing high-craft QA checks before publishing.

### 6. Shop Rating
*   **Measurement**: Average star rating from customer reviews.
*   **Strategy**: Automated monitoring of Etsy shop API and storefront widgets.

### 7. Email Subscribers
*   **Measurement**: Total active subscribers in the email list.
*   **Strategy**: Grown through freebies, discount popups, and product instructions page links.

### 8. Organic Traffic
*   **Measurement**: Monthly unique users arriving via unpaid search engine results.
*   **Strategy**: Measured using sitemaps, indexing, and meta optimization tags.

### 9. Repeat Customers
*   **Measurement**: `(Returning Customers / Unique Customers) * 100`.
*   **Strategy**: Encouraged via post-purchase discount coupons and value bundles.

### 10. First Sale Date
*   **Measurement**: Timestamp of the first successful organic or sandbox customer order.
*   **Strategy**: Automated logging in the database once webhook events verify payment.
