"""
Database Provider for Data Source Layer
Queries internal SQLite WAL database for real catalog metrics.
"""

from typing import Dict, Any, Optional
from src.core.provenance import DataSource, format_metric_with_source
from src.core.database import ProductDatabase
from src.datasources.base_provider import BaseDataSourceProvider

class DatabaseProvider(BaseDataSourceProvider):
    def __init__(self, db: Optional[ProductDatabase] = None):
        super().__init__("Internal Database Provider", DataSource.INTERNAL_DB)
        self.db = db or ProductDatabase()

    def is_available(self) -> bool:
        return True

    def fetch_metric(self, metric_key: str, **kwargs) -> Dict[str, Any]:
        stats = self.db.get_catalog_stats()

        if metric_key == "total_products":
            return format_metric_with_source(stats["total_products"], self.source_type)

        if metric_key == "status_breakdown":
            return format_metric_with_source(stats["status_breakdown"], self.source_type)

        if metric_key == "products_waiting_review":
            count = stats["status_breakdown"].get("draft", 0) + stats["status_breakdown"].get("pending_approval", 0)
            return format_metric_with_source(count, self.source_type, unit=" Products")

        all_products = self.db.list_products(limit=500)
        return format_metric_with_source(len(all_products), self.source_type)
