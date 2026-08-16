# DECISION_LOG.md — Executive Decision Register

This log contains all strategic executive decisions approved for the direction of **Digital Product Studio**. 

---

## 1. Decision Log Register

| Date | Decision | Owner | Status | Impact |
| :--- | :--- | :--- | :--- | :---: |
| 16 Aug 2026 | Rebrand to Digital Product Studio | CEO | Approved | High |
| 16 Aug 2026 | Use digitalproductstudio.in as canonical domain | CEO | Approved | High |
| 16 Aug 2026 | Freeze architecture after v1.0 | CEO | Approved | High |

---

## 2. Decision Log Details

### D-2026-001: Rebrand to Digital Product Studio
*   **Date**: 16 Aug 2026
*   **Owner**: CEO
*   **Status**: Approved
*   **Impact**: High
*   **Context**: The repository and project were previously named `DigitalProductHouse`. We have renamed the project to `DigitalProductStudio` to reflect a more professional, premium agency/studio identity.
*   **Actions**: Renamed remote Git repo endpoint, updated code references, and created `/governance` layout.

### D-2026-002: Use digitalproductstudio.in as Canonical Domain
*   **Date**: 16 Aug 2026
*   **Owner**: CEO
*   **Status**: Approved
*   **Impact**: High
*   **Context**: Select the `.in` domain extension as the official and canonical launch domain name for SEO indexing, email signatures, sitemaps, and Open Graph validation.
*   **Actions**: Created `sitemap.xml`, `robots.txt`, and injected Open Graph & JSON-LD headers into React index pages.

### D-2026-003: Freeze Architecture after v1.0
*   **Date**: 16 Aug 2026
*   **Owner**: CEO
*   **Status**: Approved
*   **Impact**: High
*   **Context**: Lock the structural backend (SQLite WAL DB, watcher pipeline) to finalize testing and storefront deployment prior to integrating live marketplace credentials or complex changes.
*   **Actions**: Consolidated developer modules and focused on deployment parameters.
