# Disaster Recovery & Backup Plan - Digital Product Studio

## 1. Database Backup & WAL Snapshots
- The primary catalog database is located at `catalog/studio_catalog.db`.
- SQLite Write-Ahead Logging (WAL) mode enables live online backups without stopping writes.
- Automated daily backup command:
  ```bash
  sqlite3 catalog/studio_catalog.db ".backup 'catalog/backups/studio_catalog_$(date +%Y%m%d).db'"
  ```

## 2. Payload Recovery & Storage Strategy
- Active digital product payload archives are stored under `catalog/active/{product_id}/`.
- Cold backups are mirrored to secondary cloud storage / Git LFS.
