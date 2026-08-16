"""

Automated Ingestion Watcher & Processor for Digital Product Studio

Monitors catalog/raw_ingest/, detects newly added digital payloads created by Claude AI,

runs duplicate checking, enriches SEO/tags, generates thumbnail preview graphics & PDF guides,

and enqueues items into the approval queue.

"""



import os

import json

import uuid

import time

import shutil

from typing import List, Dict, Any, Optional



from src.core.database import ProductDatabase

from src.ingestion.duplicate_detector import DuplicateDetector

from src.marketing.listing_generator import ListingGenerator

from src.media.thumbnail_generator import ThumbnailGenerator

from src.media.pdf_generator import PDFGenerator

from src.versioning.git_tracker import GitTracker





class IngestionWatcher:

    def __init__(self, raw_dir: str = "./catalog/raw_ingest", active_dir: str = "./catalog/active"):

        self.raw_dir = os.path.abspath(raw_dir)

        self.active_dir = os.path.abspath(active_dir)

        self.db = ProductDatabase()

        self.detector = DuplicateDetector(self.db)

        self.thumbnail_gen = ThumbnailGenerator()

        self.git_tracker = GitTracker()



        os.makedirs(self.raw_dir, exist_ok=True)

        os.makedirs(self.active_dir, exist_ok=True)



    def scan_and_process(self) -> List[Dict[str, Any]]:

        """Scans catalog/raw_ingest/ for newly dropped product folders and ingests them."""

        processed_items = []

        if not os.path.exists(self.raw_dir):

            return processed_items



        for item_name in os.listdir(self.raw_dir):

            item_path = os.path.join(self.raw_dir, item_name)

            if os.path.isdir(item_path):

                print(f"[Watcher] Found new candidate folder: {item_name}")

                result = self.process_product_folder(item_path)

                if result:

                    processed_items.append(result)



        return processed_items



    def process_product_folder(self, folder_path: str) -> Optional[Dict[str, Any]]:

        folder_name = os.path.basename(folder_path)



        # 1. Duplicate Check

        is_dup, file_hash, existing_data = self.detector.check_duplicate(folder_path)

        if is_dup:

            print(f"[Warning] Duplicate payload detected for '{folder_name}'. SHA-256: {file_hash[:12]}... Skipping.")

            return None



        # 2. Parse or synthesize initial metadata

        info_json_path = os.path.join(folder_path, "info.json")

        raw_info = {}

        if os.path.exists(info_json_path):

            try:

                with open(info_json_path, "r", encoding="utf-8") as f:

                    raw_info = json.load(f)

            except Exception as e:

                print(f"[Warning] Failed to parse info.json: {e}")



        product_id = str(uuid.uuid4())

        base_title = raw_info.get("title", folder_name.replace("_", " ").title())

        category = raw_info.get("category", "Planners & Organizers")

        base_price = raw_info.get("price", 9.99)

        license_type = raw_info.get("license", "Personal Use Only")



        # Create structured product record

        product_record = {

            "id": product_id,

            "sku": f"DPS-{product_id[:8].upper()}",

            "title": base_title,

            "slug": base_title.lower().replace(" ", "-"),

            "category": category,

            "sub_category": raw_info.get("sub_category", "Templates"),

            "status": "pending_approval", # Human-in-the-loop approval requirement

            "version": "1.0.0",

            "file_hash": file_hash,

            "pricing": {

                "base_price": base_price,

                "currency": "USD",

                "discount_percent": 0

            },

            "license": license_type,

            "marketplaces": {

                "etsy": {"status": "draft", "listing_id": None},

                "gumroad": {"status": "draft", "product_id": None},

                "lemonsqueezy": {"status": "draft", "variant_id": None},

                "custom_web": {"status": "draft", "slug": base_title.lower().replace(" ", "-")}

            },

            "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ"),

            "updated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ"),

            "changelog": [

                GitTracker.create_changelog_entry("1.0.0", "Initial payload ingestion & SEO generation")

            ]

        }



        # 3. SEO & Copy Enrichment

        product_record = ListingGenerator.enrich_product_listing(product_record)



        # 4. Storage Directory Preparation

        target_product_dir = os.path.join(self.active_dir, product_id)

        os.makedirs(target_product_dir, exist_ok=True)



        # Move raw payload files to target active directory

        for f in os.listdir(folder_path):

            src_f = os.path.join(folder_path, f)

            dst_f = os.path.join(target_product_dir, f)

            if os.path.isfile(src_f):

                shutil.copy2(src_f, dst_f)

            elif os.path.isdir(src_f):

                shutil.copytree(src_f, dst_f, dirs_exist_ok=True)



        # 5. Media Generation (Thumbnails & PDF Guide)

        previews_dir = os.path.join(target_product_dir, "previews")

        previews = self.thumbnail_gen.generate_all_cards(product_record, previews_dir)

        product_record["previews"] = previews



        pdf_path = os.path.join(target_product_dir, "Customer_Instructions.pdf")

        PDFGenerator.generate_customer_instructions(product_record, pdf_path)

        product_record["files"] = {

            "primary_asset": os.path.join(target_product_dir, "payload.zip"),

            "customer_instructions_pdf": pdf_path

        }



        # Save metadata.json into product folder

        meta_path = os.path.join(target_product_dir, "metadata.json")

        with open(meta_path, "w", encoding="utf-8") as f:

            json.dump(product_record, f, indent=2)



        # 6. Database Upsert

        self.db.upsert_product(product_record)



        # 7. Git Track Change

        self.git_tracker.commit_product_change(product_id, base_title, "1.0.0", "Ingested raw payload")



        # Cleanup raw folder after successful ingestion

        try:

            shutil.rmtree(folder_path)

        except Exception as e:

            print(f"[Warning] Failed to cleanup raw folder: {e}")



        print(f"[Success] Successfully ingested '{base_title}' [{product_id}] into Approval Queue.")

        return product_record





if __name__ == "__main__":

    watcher = IngestionWatcher()

    watcher.scan_and_process()

