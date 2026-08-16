# Security & Marketplace TOS Compliance Guidelines

## 1. Credentials & API Key Isolation
- All marketplace API tokens (Etsy OAuth2 keys, Gumroad tokens, Lemon Squeezy secret keys) must strictly be stored in `.env` or `config/settings.yaml` (excluded from version control via `.gitignore`).

## 2. Marketplace Policy Enforcement
- **Anti-Duplication**: SHA-256 binary hash checking runs on every payload before ingestion. No duplicate files are published to avoid account flags.
- **Etsy Title & Tag Boundaries**: Titles are hard-capped at 140 characters, and search tags are hard-capped at 13 items with max 20 characters per tag.
- **Market Crawlers**: Scrapers follow strict rate-limiting delays and public API boundaries without bypassing auth or violating platform Terms of Use.
