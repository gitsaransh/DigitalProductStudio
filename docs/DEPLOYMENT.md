# Deployment & Operations Manual - Digital Product Studio

## 1. Environment Setup & Requirements
- **Python**: 3.10+
- **Node.js**: v18+
- **Dependencies**: `pip install pillow reportlab pyyaml`

## 2. Directory Initialization
Run the ingestion engine script to initialize all directories (`catalog/raw_ingest`, `catalog/active`, `catalog/archived`) and SQLite schema automatically:
```bash
python -m src.ingestion.watcher
```

## 3. Launching Web COO Executive Dashboard
```bash
cd dashboard
npm install
npm run dev
```
Dashboard will open locally at `http://localhost:5173`.

## 4. Operational Workflow
1. Creator agents save digital payloads to `catalog/raw_ingest/{category}/{product_folder}/`.
2. Run automated ingestion & preview engine:
   ```bash
   python -m src.ingestion.watcher
   ```
3. Open Web Dashboard at `http://localhost:5173` to review and click **Approve** on draft listings.
4. Engine publishes approved listings to configured marketplace channels.
