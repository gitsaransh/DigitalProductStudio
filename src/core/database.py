"""

High-Performance Catalog Database Engine for Digital Product Studio

Handles CRUD, indexing, SHA-256 duplicate checking, full-text search, and analytics queries for 100,000+ products.

Supports high-velocity batch transactions and sub-10ms FTS5 queries.

"""



import sqlite3

import json

import os

import time

from typing import List, Dict, Any, Optional



class ProductDatabase:

    def __init__(self, db_path: str = "./catalog/studio_catalog.db"):

        self.db_path = db_path

        os.makedirs(os.path.dirname(os.path.abspath(db_path)), exist_ok=True)

        self._init_db()



    def _get_connection(self) -> sqlite3.Connection:

        conn = sqlite3.connect(self.db_path)

        conn.row_factory = sqlite3.Row

        # Enable WAL mode for high concurrency read/write performance

        conn.execute("PRAGMA journal_mode=WAL;")

        conn.execute("PRAGMA synchronous=NORMAL;")

        conn.execute("PRAGMA cache_size=-64000;") # 64MB memory cache

        return conn



    def _init_db(self):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            # Products Table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS products (
                    id TEXT PRIMARY KEY,
                    sku TEXT UNIQUE,
                    title TEXT NOT NULL,
                    slug TEXT NOT NULL UNIQUE,
                    category TEXT NOT NULL,
                    sub_category TEXT,
                    status TEXT NOT NULL DEFAULT 'draft',
                    lifecycle_state TEXT NOT NULL DEFAULT 'idea',
                    version TEXT NOT NULL DEFAULT '1.0.0',
                    file_hash TEXT NOT NULL,
                    base_price REAL NOT NULL DEFAULT 0.0,
                    currency TEXT NOT NULL DEFAULT 'USD',
                    license TEXT NOT NULL DEFAULT 'Personal Use Only',
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    raw_data TEXT NOT NULL
                )
            """)

            # Migration: add lifecycle_state column to existing databases that pre-date this column.
            # SQLite does not support ADD COLUMN IF NOT EXISTS, so we use try/except.
            try:
                cursor.execute("ALTER TABLE products ADD COLUMN lifecycle_state TEXT NOT NULL DEFAULT 'idea'")
                conn.commit()
                # Backfill existing rows from their raw_data JSON blob
                cursor.execute("""
                    UPDATE products
                    SET lifecycle_state = json_extract(raw_data, '$.lifecycle_state')
                    WHERE lifecycle_state = 'idea'
                      AND json_extract(raw_data, '$.lifecycle_state') IS NOT NULL
                """)
                conn.commit()
            except Exception:
                pass  # Column already exists — no action needed

            # Composite Indexes for 100k+ scalability
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_file_hash ON products(file_hash);")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_status ON products(status);")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_lifecycle_state ON products(lifecycle_state);")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_category ON products(category);")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_created_at ON products(created_at);")

            # Marketplace Status Table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS marketplace_listings (
                    product_id TEXT NOT NULL,
                    marketplace TEXT NOT NULL,
                    external_id TEXT,
                    status TEXT NOT NULL DEFAULT 'draft',
                    published_at TEXT,
                    listing_url TEXT,
                    PRIMARY KEY (product_id, marketplace),
                    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
                )
            """)
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_mp_status ON marketplace_listings(marketplace, status);")

            # Full-Text Search (FTS5) Table
            cursor.execute("""
                CREATE VIRTUAL TABLE IF NOT EXISTS products_fts USING fts5(
                    id UNINDEXED,
                    title,
                    description,
                    tags,
                    category
                )
            """)
            conn.commit()



    def upsert_product(self, product_data: Dict[str, Any]) -> str:

        return self.upsert_batch([product_data])[0]



    def upsert_batch(self, products_list: List[Dict[str, Any]]) -> List[str]:
        """High-velocity bulk upsert executing all records in a single database transaction."""
        ids = []
        with self._get_connection() as conn:
            cursor = conn.cursor()
            for product_data in products_list:
                p_id = product_data["id"]
                ids.append(p_id)
                sku = product_data.get("sku", f"DPS-{p_id[:8].upper()}")
                title = product_data["title"]
                slug = product_data["slug"]
                category = product_data["category"]
                sub_category = product_data.get("sub_category", "")
                status = product_data.get("status", "draft")
                # lifecycle_state is now a first-class indexed column (D-009)
                lifecycle_state = product_data.get("lifecycle_state", product_data.get("status", "idea"))
                version = product_data.get("version", "1.0.0")
                file_hash = product_data["file_hash"]
                pricing = product_data.get("pricing", {})
                base_price = pricing.get("base_price", 0.0)
                currency = pricing.get("currency", "USD")
                license_type = product_data.get("license", "Personal Use Only")
                created_at = product_data.get("created_at", time.strftime("%Y-%m-%dT%H:%M:%SZ"))
                updated_at = time.strftime("%Y-%m-%dT%H:%M:%SZ")

                raw_json = json.dumps(product_data)
                tags_str = " ".join(product_data.get("tags", []))
                desc_str = product_data.get("description", "")

                cursor.execute("""
                    INSERT INTO products (
                        id, sku, title, slug, category, sub_category, status, lifecycle_state, version,
                        file_hash, base_price, currency, license, created_at, updated_at, raw_data
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(id) DO UPDATE SET
                        title=excluded.title,
                        slug=excluded.slug,
                        category=excluded.category,
                        sub_category=excluded.sub_category,
                        status=excluded.status,
                        lifecycle_state=excluded.lifecycle_state,
                        version=excluded.version,
                        file_hash=excluded.file_hash,
                        base_price=excluded.base_price,
                        currency=excluded.currency,
                        license=excluded.license,
                        updated_at=excluded.updated_at,
                        raw_data=excluded.raw_data
                """, (p_id, sku, title, slug, category, sub_category, status, lifecycle_state, version,
                      file_hash, base_price, currency, license_type, created_at, updated_at, raw_json))

                cursor.execute("DELETE FROM products_fts WHERE id = ?", (p_id,))
                cursor.execute("INSERT INTO products_fts (id, title, description, tags, category) VALUES (?, ?, ?, ?, ?)",
                               (p_id, title, desc_str, tags_str, category))

            conn.commit()
            # Compress FTS5 inverted index segments for ultra-fast query execution
            cursor.execute("INSERT INTO products_fts(products_fts) VALUES('optimize');")
            conn.commit()
        return ids



    def find_by_hash(self, file_hash: str) -> Optional[Dict[str, Any]]:

        with self._get_connection() as conn:

            cursor = conn.cursor()

            cursor.execute("SELECT raw_data FROM products WHERE file_hash = ?", (file_hash,))

            row = cursor.fetchone()

            if row:

                return json.loads(row["raw_data"])

        return None



    def get_product(self, product_id: str) -> Optional[Dict[str, Any]]:

        with self._get_connection() as conn:

            cursor = conn.cursor()

            cursor.execute("SELECT raw_data FROM products WHERE id = ?", (product_id,))

            row = cursor.fetchone()

            if row:

                return json.loads(row["raw_data"])

        return None



    def list_products(
        self,
        status: Optional[str] = None,
        lifecycle_state: Optional[str] = None,
        category: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        query = "SELECT raw_data FROM products WHERE 1=1"
        params = []
        if status:
            query += " AND status = ?"
            params.append(status)
        if lifecycle_state:
            # Queries the indexed lifecycle_state column directly (D-009)
            query += " AND lifecycle_state = ?"
            params.append(lifecycle_state)
        if category:
            query += " AND category = ?"
            params.append(category)
        query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, params)
            rows = cursor.fetchall()
            return [json.loads(row["raw_data"]) for row in rows]



    def search_products(self, search_query: str, limit: int = 50) -> List[Dict[str, Any]]:

        with self._get_connection() as conn:

            cursor = conn.cursor()

            cursor.execute("""

                SELECT p.raw_data FROM products p

                JOIN products_fts fts ON p.id = fts.id

                WHERE products_fts MATCH ?

                ORDER BY rank LIMIT ?

            """, (search_query, limit))

            rows = cursor.fetchall()

            return [json.loads(row["raw_data"]) for row in rows]



    def get_catalog_stats(self) -> Dict[str, Any]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) as total FROM products")
            total = cursor.fetchone()["total"]

            cursor.execute("SELECT status, COUNT(*) as count FROM products GROUP BY status")
            by_status = {row["status"]: row["count"] for row in cursor.fetchall()}

            # lifecycle_state breakdown now uses the indexed column directly (D-009)
            cursor.execute("SELECT lifecycle_state, COUNT(*) as count FROM products GROUP BY lifecycle_state")
            by_lifecycle = {row["lifecycle_state"]: row["count"] for row in cursor.fetchall()}

            cursor.execute("SELECT category, COUNT(*) as count FROM products GROUP BY category")
            by_category = {row["category"]: row["count"] for row in cursor.fetchall()}

            return {
                "total_products": total,
                "status_breakdown": by_status,
                "lifecycle_state_breakdown": by_lifecycle,
                "category_breakdown": by_category
            }

