# Operations Runbook - Digital Product Studio (Phase 2 Enterprise)

## 1. Daily Operating Rhythm
1. **Payload Ingestion**: Verify creator agents place raw payload folders into `catalog/raw_ingest/`.
2. **Execute Watcher Pipeline**:
   ```bash
   python -m src.ingestion.watcher
   ```
3. **Open Executive COO Dashboard**:
   ```bash
   cd dashboard
   npm run dev
   ```
   Navigate to `http://localhost:5174/` to review pending approvals, intelligence scores, and P&L metrics.
4. **Approve Listings**: Review product details, preview graphics, and click **Approve & Publish**.
5. **Generate Financial P&L Report**:
   ```bash
   python -c "from src.reporting.report_generator import ExecutiveReportGenerator; ExecutiveReportGenerator.generate_financial_pl_report()"
   ```
