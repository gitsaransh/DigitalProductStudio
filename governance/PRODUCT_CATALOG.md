# PRODUCT_CATALOG.md — Master Product Catalog & Inventory (Version 1.0)

This document is the **single source of truth** for all core flagship digital products developed, ingested, published, or planned under the **Digital Product Studio** banner.

---

## 1. Catalog Reality Status

Every item in the catalog is audited against the actual product asset directories in the repository workspace. 

*   **Live customer-ready products**: `0`
*   **Product currently in production**: `2` ([`DPS-XLS-001`](file:///c:/Users/Saransh/OneDrive/Documents/DigitalProductStudio/products/DPS-XLS-001), [`DPS-PRM-001`](file:///c:/Users/Saransh/OneDrive/Documents/DigitalProductStudio/products/DPS-PRM-001))
*   **Planned products**: `6`
*   **Demo/seed records**: `5`

---

## 2. Version 1.0 Flagship Catalog

| SKU | Product | Category | Status | Price | Reality Classification | Asset Path / Notes |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- |
| `DPS-A694CB6C` | Zenith Ultimate Life Planner 2026 | Planners & Organizers | Published | $14.99 | Demo/Seed Record | Dummy payload in DB ingestion test |
| `DPS-49162179` | Executive Small Business Finance Tracker | Business & Finance Spreadsheets | Pending Approval | $24.99 | Demo/Seed Record | Dummy payload in DB ingestion test |
| `DPS-4FF56C54` | Aesthetic Instagram Canva Carousel Templates | Social Media & Canva Templates | Pending Approval | $19.99 | Demo/Seed Record | Dummy payload in DB ingestion test |
| `DPS-8A6E90C9` | 10,000+ ChatGPT & Claude Prompt Vault | AI Prompts & Automation Kits | Pending Approval | $29.99 | Demo/Seed Record | Dummy payload in DB ingestion test |
| `DPS-8942C021` | Ultimate Excel Monthly Budget Tracker 2026 | Business & Finance Spreadsheets | Pending Approval | $12.99 | Demo/Seed Record | Dummy payload in DB ingestion test |
| `DPS-XLS-001` | Ultimate Finance OS | Excel Templates | Draft | $19.00 | Product Metadata Exists Only | Under active preparation in [`products/DPS-XLS-001`](file:///c:/Users/Saransh/OneDrive/Documents/DigitalProductStudio/products/DPS-XLS-001) |
| `DPS-PRM-001` | 10,000+ ChatGPT & Claude Prompt Vault | AI Prompts & Automation Kits | Draft | $29.99 | Product Metadata Exists Only | Under active preparation in [`products/DPS-PRM-001`](file:///c:/Users/Saransh/OneDrive/Documents/DigitalProductStudio/products/DPS-PRM-001) |
| `DPS-XLS-002` | Personal Budget Dashboard | Excel Templates | Planned | $14.99 | Planned Product | Roadmap idea |
| `DPS-XLS-003` | Expense & Bill Tracker | Excel Templates | Planned | $12.99 | Planned Product | Roadmap idea |
| `DPS-NOT-001` | Notion Content Creator Hub | Notion Systems | Planned | $17.99 | Planned Product | Roadmap idea |
| `DPS-BIZ-001` | Project Management Kit (Professional) | Business Templates | Planned | $24.99 | Planned Product | Roadmap idea |
| `DPS-BIZ-003` | Startup Documentation Kit | Business Templates | Planned | $29.99 | Planned Product | Roadmap idea |
| `DPS-BIZ-004` | PMO Toolkit (Enterprise) | Business Templates | Planned | $29.99 | Planned Product | Roadmap idea |

---

## 3. Governance & Status Rules
1. **Creation**: Any newly proposed product idea must be approved and appended to the roadmap database before file assets are generated.
2. **SKU Allocation**: All SKUs follow the syntax `DPS-[CAT]-[NUM]` for planned products and `DPS-[HEX]` (hexadecimal short ID mapping) for database ingested products.
3. **Status Transitions**: State transitions from *Planned* to *Pending Approval* and *Published* must be updated in sync with database ingestion.
4. **Publishing Block**: The automated pipeline must block publishing of any SKU unless the `Reality Classification` is validated as "Actual product asset exists" and all release checklist items are marked `true` in its `product.json`.
