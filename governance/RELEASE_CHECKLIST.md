# RELEASE_CHECKLIST.md — Product Release Governance Checklist

Every digital product release under the **Digital Product Studio** banner must be verified and checked off against this checklist before publishing to global storefronts (Etsy, website, Gumroad, etc.).

---

## Pre-Release Verification Items

- [ ] **Design approved**
  - High-fidelity layout checks, theme validation, and UX review completed.
- [ ] **QA completed**
  - Structural testing, formula validations (Excel), and link audits verified with zero bugs.
- [ ] **Build passed**
  - Static compile, packaging scripts, and database schema migrations verified locally and in CI/CD.
- [ ] **SEO verified**
  - Canonical titles, tags, descriptions, sitemaps, and breadcrumb structures populated.
- [ ] **Mockups completed**
  - Multi-device preview assets, dashboard screenshots, and cover card visuals rendered.
- [ ] **Product guide included**
  - Reusable setup guides, instruction manuals, or quick-start PDF/videos packaged.
- [ ] **Pricing approved**
  - Base price and promotional discount rates aligned with the master PRODUCT_CATALOG.md.
- [ ] **Etsy listing approved**
  - Shop tags, categories, title descriptors, and product description copies finalized for Etsy.
- [ ] **Website listing approved**
  - Metadata, storefront cards, and product page parameters set on the local commercial storefront.
- [ ] **Changelog updated**
  - Version increments, bug fixes, and feature highlights logged in the product changelog.

---

## Publishing Workflow & Governance Rules
1. **Pre-release Gate**: A product cannot go from `Pending Approval` to `Published` status without completing all checklist items.
2. **Catalog Audit**: The SKU list in `/governance/PRODUCT_CATALOG.md` must be updated concurrently during the release step.
