# CHANGELOG.md — Digital Product Studio Version Changelog

All notable changes to this project will be documented in this file. This project adheres to Semantic Versioning.

---

## v1.0.1 – Rebrand & Executive Governance
Date: 16 Aug 2026
Added:
- Executive `/governance` system containing `BRAND_BOOK.md`, `ROADMAP.md`, `CHANGELOG.md`, `DECISION_LOG.md`, and `MEETING_NOTES.md`.
- Canonical domain setup with sitemap, robots.txt, canonical SEO meta tags, and JSON-LD schema.
Changed:
- Rebranded repository to `DigitalProductStudio`.
- Updated Git remote endpoint to `gitsaransh/DigitalProductStudio.git`.
- Changed admin dashboard preview action links from local port to root path (`/`).
- Updated API allowed origins to include `https://digitalproductstudio.in`.
Fixed:
- Hardcoded localhost links in TopBar.
Notes:
- Completed rebrand transition and pushed first governance iteration.

---

## v1.0.0 – Foundation
Date: 11 Aug 2026
Added:
- Core SQLite WAL database with FTS5 search indexing.
- Ingestion watcher to monitor raw folders and run SHA-256 duplicate detection checks.
- Rule-based Listing, SEO, and Thumbnail generator adapters.
- Complete 9-state product lifecycle mapping logic.
Changed:
- Consolidated website, admin, and COO dashboards into a unified React Vite application (port 5174).
Fixed:
- Port collision issues by merging three standalone front-end dev servers.
Notes:
- Initial architecture release establishing local backend pipelines and dashboard views.
