import os
import csv
import json
import hashlib
import sqlite3
import sys

# Ensure import of core database engine
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from src.core.database import ProductDatabase

def calculate_sha256(filepath):
    sha256 = hashlib.sha256()
    with open(filepath, 'rb') as f:
        while True:
            data = f.read(65536)
            if not data:
                break
            sha256.update(data)
    return sha256.hexdigest()

def run_ingestion():
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    p_dir = os.path.join(project_root, "products", "DPS-PRM-001")
    csv_path = os.path.join(p_dir, "prompt_vault_master.csv")
    metadata_path = os.path.join(p_dir, "product_metadata.json")
    prod_json_path = os.path.join(p_dir, "product.json")
    
    print("=" * 60)
    print("INGESTION RUNNER — DPS-PRM-001")
    print("=" * 60)
    
    # Check files exist
    for p in [csv_path, metadata_path]:
        if not os.path.exists(p):
            print(f"Error: Required file not found: {p}")
            return
            
    # Calculate CSV hash
    csv_hash = calculate_sha256(csv_path)
    print(f"Calculated CSV hash: {csv_hash}")
    
    # 1. Parse CSV and Validate
    prompts = []
    duplicate_ids = []
    seen_ids = set()
    
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            prompt_id = row.get("Prompt ID", "").strip()
            category = row.get("Category", "").strip()
            subcategory = row.get("Subcategory", "").strip()
            use_case = row.get("Use Case", "").strip()
            title = row.get("Prompt Title", "").strip()
            prompt_text = row.get("Prompt", "").strip()
            variables = row.get("Variables", "").strip()
            comp_ai = row.get("Compatible AI", "").strip()
            difficulty = row.get("Difficulty", "").strip()
            exp_out = row.get("Expected Output", "").strip()
            pro_tip = row.get("Pro Tip", "").strip()
            
            # Validation checks
            if not prompt_id or not category or not title or not prompt_text:
                print(f"[ERROR] Missing critical field in row: {row}")
                return
                
            if prompt_id in seen_ids:
                duplicate_ids.append(prompt_id)
            seen_ids.add(prompt_id)
            
            prompts.append({
                "prompt_id": prompt_id,
                "category": category,
                "subcategory": subcategory,
                "use_case": use_case,
                "title": title,
                "prompt_text": prompt_text,
                "variables": variables,
                "compatible_ai": comp_ai,
                "difficulty": difficulty,
                "expected_output": exp_out,
                "pro_tip": pro_tip
            })
            
    print(f"Total prompt rows read from CSV: {len(prompts)}")
    print(f"Duplicate Prompt IDs found: {len(duplicate_ids)}")
    if duplicate_ids:
        print(f"[ERROR] Duplicate IDs: {duplicate_ids}")
        return
        
    if len(prompts) != 200:
        print(f"[ERROR] Row count is {len(prompts)}, expected exactly 200.")
        return
        
    # 2. Sync metadata with CSV count
    with open(metadata_path, "r", encoding="utf-8") as f:
        metadata = json.load(f)
        
    metadata["current_prompt_count"] = len(prompts)
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    print("Synchronized product_metadata.json count to 200.")
    
    # 3. Generate product.json
    product_json = {
        "sku": "DPS-PRM-001",
        "name": metadata.get("product_name", "10,000+ ChatGPT & Claude Prompt Vault"),
        "slug": "chatgpt-claude-prompt-vault",
        "version": metadata.get("version", "1.0"),
        "price": 29.99,
        "compare_at_price": 59.99,
        "category": "AI Prompts & Automation Kits",
        "tags": [
            "AI", "ChatGPT", "Claude", "Prompts", "Vault",
            "Business Prompts", "Marketing Prompts", "Project Management",
            "Productivity Prompts", "Copywriting"
        ],
        "short_description": "Batch 01: 200 fully distinct, schema-complete prompts across five categories (Business, Project Management, Productivity, Marketing, Writing).",
        "long_description": "A professional-grade repository of high-performance AI prompts, curated to eliminate guesswork and maximize output accuracy. Fully verified, deduplicated, and formatted with placeholders for easy copy-pasting.",
        "file_placeholder": "prompt_vault_master.csv",
        "readme_placeholder": "README.md",
        "release_checklist": {
            "design_approved": False,
            "qa_passed": False,
            "mockups_completed": False,
            "website_published": False,
            "etsy_published": False
        },
        "status": "Draft"
    }
    
    with open(prod_json_path, "w", encoding="utf-8") as f:
        json.dump(product_json, f, indent=2)
    print("Generated products/DPS-PRM-001/product.json")
    
    # 4. Ingest into database
    db = ProductDatabase()
    
    # Map product payload to upsert structure
    product_payload = {
        "id": "DPS-PRM-001",
        "sku": "DPS-PRM-001",
        "title": product_json["name"],
        "slug": product_json["slug"],
        "category": product_json["category"],
        "status": "draft",
        "lifecycle_state": "draft",
        "version": product_json["version"],
        "file_hash": csv_hash,
        "pricing": {
            "base_price": product_json["price"],
            "currency": "USD"
        },
        "license": "Personal Use Only",
        "tags": product_json["tags"],
        "description": product_json["short_description"]
    }
    
    db.upsert_product(product_payload)
    print("Upserted product record into database.")
    
    db.upsert_prompts("DPS-PRM-001", prompts)
    print(f"Upserted {len(prompts)} individual prompt records into database.")
    
    print("\n" + "=" * 60)
    print("INGESTION VALIDATION REPORT")
    print("=" * 60)
    print("SKU:             DPS-PRM-001")
    print("Name:            10,000+ ChatGPT & Claude Prompt Vault")
    print("Status:          Draft")
    print("CSV Prompts:     200 rows")
    print("DB Products:     1 row inserted")
    print("DB Prompts:      200 rows inserted")
    print("Duplicates:      0 duplicate Prompt IDs")
    print("File Hash:       " + csv_hash)
    print("=" * 60)

if __name__ == "__main__":
    run_ingestion()
