import os
import re
import json

def run_audit():
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    catalog_path = os.path.join(project_root, "governance", "PRODUCT_CATALOG.md")
    products_dir = os.path.join(project_root, "products")
    
    print("=" * 60)
    print("DIGITAL PRODUCT STUDIO — PRODUCT FILESYSTEM AUDIT")
    print("=" * 60)
    
    if not os.path.exists(catalog_path):
        print(f"Error: PRODUCT_CATALOG.md not found at {catalog_path}")
        return
        
    # Read catalog entries
    skus_found = []
    with open(catalog_path, "r", encoding="utf-8") as f:
        content = f.read()
        # Find rows like: | `DPS-A694CB6C` | Zenith ...
        matches = re.findall(r"\|\s*`([^`]+)`\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|", content)
        for match in matches:
            sku = match[0].strip()
            name = match[1].strip()
            category = match[2].strip()
            status = match[3].strip()
            price = match[4].strip()
            classification = match[5].strip()
            skus_found.append({
                "sku": sku,
                "name": name,
                "category": category,
                "status": status,
                "price": price,
                "classification": classification
            })

    print(f"Loaded {len(skus_found)} items from PRODUCT_CATALOG.md\n")
    
    audit_summary = {
        "live": 0,
        "production": 0,
        "planned": 0,
        "seed": 0
    }
    
    print(f"{'SKU':<15} | {'Product Name':<45} | {'FS Status':<30}")
    print("-" * 96)
    
    for item in skus_found:
        sku = item["sku"]
        name = item["name"]
        declared_class = item["classification"]
        
        # Check products directory
        sku_dir = os.path.join(products_dir, sku)
        has_assets_dir = os.path.exists(sku_dir)
        
        fs_status = "Not Created"
        if has_assets_dir:
            required_files = ["product.json", "listing.md", "seo.json", "faq.md", "changelog.md"]
            files_found = [f for f in required_files if os.path.exists(os.path.join(sku_dir, f))]
            
            # Check for any Excel workbook (.xlsx)
            all_files = os.listdir(sku_dir)
            workbooks = [f for f in all_files if f.endswith(".xlsx")]
            
            if workbooks:
                fs_status = f"Live Asset Exists ({workbooks[0]})"
                audit_summary["live"] += 1
            elif len(files_found) == len(required_files):
                fs_status = "Metadata Prepared (In Production)"
                audit_summary["production"] += 1
            else:
                fs_status = f"Incomplete Assets ({len(files_found)}/{len(required_files)})"
                audit_summary["production"] += 1
        else:
            if "Demo/Seed" in declared_class:
                fs_status = "Demo/Seed (Database record only)"
                audit_summary["seed"] += 1
            else:
                fs_status = "Planned (Roadmap idea)"
                audit_summary["planned"] += 1
                
        print(f"{sku:<15} | {name[:45]:<45} | {fs_status:<30}")
        
    print("\n" + "=" * 60)
    print("AUDIT SUMMARY RESULTS")
    print("=" * 60)
    print(f"Live customer-ready products: {audit_summary['live']}")
    print(f"Product currently in production: {audit_summary['production']}")
    print(f"Planned products: {audit_summary['planned']}")
    print(f"Demo/seed records: {audit_summary['seed']}")
    print("=" * 60)

if __name__ == "__main__":
    run_audit()
