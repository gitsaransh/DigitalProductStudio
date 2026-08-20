# ASSET_REGISTRY.md — Digital Product Studio Downloadable Asset Registry

This document serves as the **single source of truth** for all digital download assets physically packaged, signed, and validated in the repository workspace. Every product SKU must map to exactly one primary downloadable asset registered below.

---

## 1. Registered Downloadable Assets

| SKU | Product Name | Version | Asset Filename | Asset Type | Relative Path | SHA-256 | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `DPS-XLS-001` | Ultimate Finance OS | 1.0 | `Ultimate_Finance_OS_v1.0.xlsx` | Excel Workbook | `products/DPS-XLS-001/Ultimate_Finance_OS_v1.0.xlsx` | `35e2eb325c9f3886cfe87de4863d5ede7db2d328be2f01dc676de904a365f3f0` | Draft |
| `DPS-PRM-001` | 10,000+ ChatGPT & Claude Prompt Vault | 1.0 | `prompt_vault_master.csv` | CSV Database | `products/DPS-PRM-001/prompt_vault_master.csv` | `e6e7bdb30a405a6b0af52a2de85475f0f9af6553d86a90bcc28c316a980f0ed7` | Draft |

---

## 2. Ingestion & Signature Governance
1. **Asset Integrity**: The SHA-256 hash must be recalculated and verified against the binary whenever a product asset is modified.
2. **Release Checks**: Assets cannot be marked `Published` in this registry until all items in the product's release checklist (located inside its `product.json`) evaluate to `true`.
3. **Registry Audits**: The automated test suite matches this file against physical paths to detect orphaned entries or missing binaries.
