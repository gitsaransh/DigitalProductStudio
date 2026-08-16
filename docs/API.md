# API & Adapter Specification - Digital Product Studio

## 1. Internal Engine API Interface

### Database Engine (`src/core/database.py`)
- `upsert_product(product_data: dict) -> str`: Inserts or updates product metadata.
- `get_product(product_id: str) -> dict`: Retrieves full raw JSON metadata.
- `find_by_hash(file_hash: str) -> dict`: Checks duplicate SHA-256 hash.
- `search_products(query: str, limit: int = 50) -> list`: FTS5 full-text search.
- `get_catalog_stats() -> dict`: Total count, status breakdown, category distribution.

### Ingestion Service (`src/ingestion/watcher.py`)
- `process_directory(target_dir: str) -> dict`: Processes all new asset folders in `catalog/raw_ingest/`.

### Marketplace Publisher Adapter Interface (`src/publishers/base_publisher.py`)
All marketplace integrations implement `BaseMarketplacePublisher`:
```python
class BaseMarketplacePublisher(ABC):
    @abstractmethod
    def publish(self, product_data: dict) -> Dict[str, Any]:
        """Publishes product to channel. Returns status, listing_id, listing_url."""
        pass

    @abstractmethod
    def update(self, product_data: dict) -> bool:
        """Updates listing details on channel."""
        pass

    @abstractmethod
    def sync_analytics(self, product_id: str) -> Dict[str, Any]:
        """Fetches views, downloads, sales, conversion rate."""
        pass
```
