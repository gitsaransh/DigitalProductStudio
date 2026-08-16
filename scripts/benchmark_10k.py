"""

10,000 Product Fast Verification Benchmark for Digital Product Studio

Tests SQLite WAL Database bulk transaction insertion speed and FTS5 search latency.

"""



import os

import time

import uuid

import tempfile

import shutil

from src.core.database import ProductDatabase



def run_10k_benchmark():

    print("=== 10,000 PRODUCT FAST VERIFICATION BENCHMARK ===")

    temp_dir = tempfile.mkdtemp()

    db_path = os.path.join(temp_dir, "benchmark_10k.db")

    db = ProductDatabase(db_path)



    total_items = 10000

    batch_size = 2000



    print(f"[Benchmark] Seeding {total_items:,} product records using bulk transactions...")

    start_time = time.time()



    categories = ["Planners", "Notion OS", "Canva Kits", "Finance Sheets", "Printables", "AI Prompts"]

    current_batch = []



    for i in range(total_items):

        p_id = str(uuid.uuid4())

        cat = categories[i % len(categories)]

        product = {

            "id": p_id,

            "sku": f"DPS-FAST-{i:05d}",

            "title": f"Fast Digital Asset #{i} - High Converting Template",

            "slug": f"fast-digital-asset-{i}",

            "category": cat,

            "sub_category": "Templates",

            "status": "published" if i % 2 == 0 else "draft",

            "version": "1.0.0",

            "file_hash": f"{i:064d}",

            "pricing": {"base_price": 9.99 + (i % 20), "currency": "USD"},

            "license": "Personal Use Only",

            "description": f"Detailed listing description for asset #{i} containing keyword searchable content.",

            "tags": ["digital", "planner", "template", "boost", "studio"],

            "created_at": "2026-08-08T23:59:00Z",

            "updated_at": "2026-08-08T23:59:00Z"

        }

        current_batch.append(product)



        if len(current_batch) == batch_size:

            db.upsert_batch(current_batch)

            current_batch = []



    if current_batch:

        db.upsert_batch(current_batch)



    insert_time = time.time() - start_time

    print(f"[Success] Bulk seeding 10,000 items completed in {insert_time:.2f} seconds ({total_items / insert_time:.0f} items/sec)")



    # Test FTS5 Full Text Search Latency

    print("[Benchmark] Testing FTS5 Full-Text Search Latency...")

    search_start = time.time()

    results = db.search_products("Converting Template", limit=50)

    search_latency_ms = (time.time() - search_start) * 1000



    print(f"[Success] Search returned {len(results)} items in {search_latency_ms:.2f} ms")

    assert search_latency_ms < 10.0, f"Search latency ({search_latency_ms:.2f} ms) exceeded 10ms SLA!"

    assert len(results) > 0, "No results returned for FTS5 query!"



    shutil.rmtree(temp_dir)

    print("\n=== 10,000 PRODUCT BENCHMARK PASSED (SEARCH LATENCY: {:.2f} ms < 10ms SLA) ===".format(search_latency_ms))



if __name__ == "__main__":

    run_10k_benchmark()

