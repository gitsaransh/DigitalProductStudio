import os
import json
import hashlib
from typing import Dict, Any, Optional

class DownloadService:
    def __init__(self, products_dir: str = "./products"):
        self.products_dir = os.path.abspath(products_dir)

    def calculate_sha256(self, filepath: str) -> str:
        sha256 = hashlib.sha256()
        with open(filepath, 'rb') as f:
            while True:
                data = f.read(65536)
                if not data:
                    break
                sha256.update(data)
        return sha256.hexdigest()

    def resolve_asset_by_sku(self, sku: str) -> Optional[Dict[str, Any]]:
        """
        Resolves a downloadable asset locally from its SKU.
        Returns a dictionary with asset metadata, or None if the SKU is unknown.
        """
        # SKUs can be upper/lowercase in filesystem directories (e.g. products/DPS-XLS-001)
        # Search the products directory case-insensitively
        sku_folder_name = None
        if os.path.exists(self.products_dir):
            for name in os.listdir(self.products_dir):
                if name.upper() == sku.upper() and os.path.isdir(os.path.join(self.products_dir, name)):
                    sku_folder_name = name
                    break
                    
        if not sku_folder_name:
            return None

        sku_dir = os.path.join(self.products_dir, sku_folder_name)
        prod_json_path = os.path.join(sku_dir, "product.json")
        
        if not os.path.exists(prod_json_path):
            return {
                "sku": sku,
                "error": "product.json missing",
                "resolved": False
            }

        try:
            with open(prod_json_path, "r", encoding="utf-8") as f:
                prod_data = json.load(f)
        except Exception as e:
            return {
                "sku": sku,
                "error": f"Failed to parse product.json: {str(e)}",
                "resolved": False
            }

        file_placeholder = prod_data.get("file_placeholder")
        if not file_placeholder:
            return {
                "sku": sku,
                "error": "file_placeholder not declared in product.json",
                "resolved": False
            }

        asset_path = os.path.join(sku_dir, file_placeholder)
        if not os.path.exists(asset_path):
            return {
                "sku": sku,
                "error": f"Broken asset reference: {file_placeholder} does not exist in {sku_folder_name} folder",
                "resolved": False,
                "declared_filename": file_placeholder
            }

        # Calculate SHA256 of the actual asset file
        try:
            actual_hash = self.calculate_sha256(asset_path)
        except Exception as e:
            actual_hash = f"Error hashing file: {str(e)}"

        # Return structured metadata for backend download resolution
        return {
            "sku": prod_data.get("sku", sku),
            "product_name": prod_data.get("name"),
            "version": prod_data.get("version", "1.0"),
            "asset_filename": file_placeholder,
            "asset_type": "Excel Workbook" if file_placeholder.endswith(".xlsx") else "CSV Database" if file_placeholder.endswith(".csv") else "Zip Archive",
            "relative_path": os.path.relpath(asset_path, os.path.dirname(os.path.dirname(sku_dir))).replace("\\", "/"),
            "sha256": actual_hash,
            "status": prod_data.get("status", "Draft"),
            "resolved": True
        }
