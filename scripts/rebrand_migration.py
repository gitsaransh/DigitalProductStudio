import os
import re
import sqlite3
import json

REPLACEMENTS = [
    # Emails
    ("hello@digitalproductshouse.com", "hello@digitalproductstudio.in"),
    ("support@digitalproductshouse.com", "support@digitalproductstudio.in"),
    ("privacy@digitalproductshouse.com", "privacy@digitalproductstudio.in"),
    ("licensing@digitalproductshouse.com", "licensing@digitalproductstudio.in"),
    # Domain
    ("digitalproductshouse.com", "digitalproductstudio.in"),
    # Full name in various casings
    ("Digital Products House", "Digital Product Studio"),
    ("DIGITAL PRODUCTS HOUSE", "DIGITAL PRODUCT STUDIO"),
    ("digital products house", "digital product studio"),
    # Concat name
    ("DigitalProductsHouse", "DigitalProductStudio"),
    ("digitalproductshouse", "digitalproductstudio"),
    # Short forms
    ("DPH", "DPS"),
]

EXCLUDE_DIRS = {".git", "node_modules", ".venv", "venv", "dist", ".pytest_cache", "logs", "__pycache__"}
EXCLUDE_FILES = {"rebrand_migration.py", "rebrand_validation.py"}

def rebrand_file(file_path):
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
    except UnicodeDecodeError:
        return False

    original_content = content
    for old, new in REPLACEMENTS:
        content = content.replace(old, new)

    if content != original_content:
        with open(file_path, "w", encoding="utf-8", newline="") as f:
            f.write(content)
        print(f"[File Rebranded] {file_path}")
        return True
    return False

def rebrand_database(db_path):
    if not os.path.exists(db_path):
        print(f"[DB] Database not found at {db_path}")
        return

    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    try:
        cursor.execute("SELECT id, sku, title, slug, raw_data FROM products")
        rows = cursor.fetchall()
        
        updated_count = 0
        for row in rows:
            p_id = row['id']
            sku = row['sku']
            title = row['title']
            slug = row['slug']
            raw_data_str = row['raw_data']

            # Update sku
            new_sku = sku.replace("DPH-", "DPS-")
            
            # Rebrand raw_data dict
            raw_data = json.loads(raw_data_str)
            
            def rebrand_value(val):
                if isinstance(val, str):
                    for old, new in REPLACEMENTS:
                        val = val.replace(old, new)
                    return val
                elif isinstance(val, dict):
                    return {k: rebrand_value(v) for k, v in val.items()}
                elif isinstance(val, list):
                    return [rebrand_value(v) for v in val]
                return val

            new_raw_data = rebrand_value(raw_data)
            new_raw_data_str = json.dumps(new_raw_data)

            new_title = title
            for old, new in REPLACEMENTS:
                new_title = new_title.replace(old, new)
            new_slug = slug
            for old, new in REPLACEMENTS:
                new_slug = new_slug.replace(old, new)

            cursor.execute("""
                UPDATE products 
                SET sku = ?, title = ?, slug = ?, raw_data = ?
                WHERE id = ?
            """, (new_sku, new_title, new_slug, new_raw_data_str, p_id))
            
            cursor.execute("""
                UPDATE marketplace_listings
                SET external_id = replace(external_id, 'DPH-', 'DPS-'),
                    listing_url = replace(listing_url, 'digitalproductshouse.com', 'digitalproductstudio.in')
                WHERE product_id = ?
            """, (p_id,))
            
            updated_count += 1
        
        conn.commit()
        print(f"[DB] Rebranded {updated_count} product records in {db_path}")
    except Exception as e:
        print(f"[DB Error] Failed to rebrand database: {e}")
        conn.rollback()
    finally:
        conn.close()

def main():
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    modified_count = 0

    print("--- Starting File Rebranding ---")
    for root, dirs, files in os.walk(root_dir):
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        for file in files:
            if file in EXCLUDE_FILES:
                continue
            file_path = os.path.join(root, file)
            if rebrand_file(file_path):
                modified_count += 1

    print(f"Modified {modified_count} text files.")

    print("\n--- Starting Database Rebranding ---")
    db_path = os.path.join(root_dir, "catalog", "studio_catalog.db")
    rebrand_database(db_path)

    print("\nRebranding run finished.")

if __name__ == "__main__":
    main()
