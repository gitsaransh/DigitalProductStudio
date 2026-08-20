import os
import json
import hashlib
import sys

# Ensure import of download service
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from src.services.download_service import DownloadService

def validate_catalog_products():
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    products_dir = os.path.join(project_root, "products")
    
    download_svc = DownloadService(products_dir)
    
    print("=" * 70)
    print("DIGITAL PRODUCT STUDIO — PRODUCT INTEGRITY & QA VALIDATOR")
    print("=" * 70)
    
    if not os.path.exists(products_dir):
        print(f"Error: Products directory not found at {products_dir}")
        return
        
    sku_folders = [f for f in os.listdir(products_dir) if os.path.isdir(os.path.join(products_dir, f))]
    
    print(f"Discovered {len(sku_folders)} candidate product folders in products/\n")
    
    global_passed = True
    reports = []
    
    for folder in sku_folders:
        folder_path = os.path.join(products_dir, folder)
        errors = []
        warnings = []
        
        # 1. Validate product.json existence
        prod_json_path = os.path.join(folder_path, "product.json")
        prod_data = {}
        if not os.path.exists(prod_json_path):
            errors.append("product.json is missing")
        else:
            try:
                with open(prod_json_path, "r", encoding="utf-8") as f:
                    prod_data = json.load(f)
            except Exception as e:
                errors.append(f"Failed to parse product.json: {str(e)}")

        # 2. Validate README.md existence
        readme_path = os.path.join(folder_path, "README.md")
        if not os.path.exists(readme_path):
            errors.append("README.md is missing")

        # 3. Validate download asset mapping and detect broken references
        if prod_data:
            file_placeholder = prod_data.get("file_placeholder")
            if not file_placeholder:
                errors.append("file_placeholder is not declared in product.json")
            else:
                asset_path = os.path.join(folder_path, file_placeholder)
                if not os.path.exists(asset_path):
                    errors.append(f"Broken asset reference: '{file_placeholder}' declared in product.json but file is missing")
                else:
                    # Validate SHA-256 calculation
                    try:
                        sha = download_svc.calculate_sha256(asset_path)
                    except Exception as e:
                        errors.append(f"Failed to calculate SHA-256 hash of asset: {str(e)}")
        
        # 4. Check SEO metadata (if applicable)
        seo_path = os.path.join(folder_path, "seo.json")
        if not os.path.exists(seo_path):
            # Only warning, not an error since some draft batch templates may not need SEO tags immediately
            warnings.append("seo.json is missing (SEO metadata not finalized)")
        else:
            try:
                with open(seo_path, "r", encoding="utf-8") as f:
                    seo_data = json.load(f)
                    if not seo_data.get("etsy_title") or not seo_data.get("etsy_tags"):
                        warnings.append("seo.json exists but is incomplete (missing title or tags)")
            except Exception as e:
                errors.append(f"Failed to parse seo.json: {str(e)}")

        # Determine PASS / FAIL status
        status = "PASS" if not errors else "FAIL"
        if status == "FAIL":
            global_passed = False
            
        reports.append({
            "sku": folder,
            "status": status,
            "errors": errors,
            "warnings": warnings,
            "title": prod_data.get("name", "Unknown Name")
        })

    # Print Report Output
    for r in reports:
        print(f"Product: {r['sku']} — {r['title']}")
        print(f"Status:  [{r['status']}]")
        
        if r["errors"]:
            print("Errors:")
            for err in r["errors"]:
                print(f"  • [ERROR] {err}")
                
        if r["warnings"]:
            print("Warnings:")
            for warn in r["warnings"]:
                print(f"  • [WARN]  {warn}")
                
        print("-" * 70)
        
    print("\n" + "=" * 70)
    print("FINAL QUALITY ASSURANCE REPORT")
    print("=" * 70)
    print(f"Total Products Audited:  {len(reports)}")
    print(f"Passed Integrity Audit:  {sum(1 for r in reports if r['status'] == 'PASS')}")
    print(f"Failed Integrity Audit:  {sum(1 for r in reports if r['status'] == 'FAIL')}")
    print(f"Pipeline Result:         {'SUCCESS (All Passed)' if global_passed else 'FAILURE (Broken Assets Detected)'}")
    print("=" * 70)
    
    if not global_passed:
        sys.exit(1)

if __name__ == "__main__":
    validate_catalog_products()
