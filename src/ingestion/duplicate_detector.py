"""
SHA-256 Duplicate Detection Engine for Digital Products House
Computes binary hash of product payloads and checks against database index to prevent duplicate listings.
"""

import hashlib
import os
from typing import Tuple, Optional
from src.core.database import ProductDatabase

class DuplicateDetector:
    def __init__(self, db: Optional[ProductDatabase] = None):
        self.db = db or ProductDatabase()

    @staticmethod
    def calculate_file_hash(file_path: str) -> str:
        """Calculates SHA-256 hash of a single file payload."""
        sha256 = hashlib.sha256()
        with open(file_path, "rb") as f:
            while chunk := f.read(65536):
                sha256.update(chunk)
        return sha256.hexdigest()

    @staticmethod
    def calculate_directory_hash(dir_path: str) -> str:
        """Calculates a deterministic composite SHA-256 hash for an entire directory payload."""
        sha256 = hashlib.sha256()
        for root, dirs, files in os.walk(dir_path):
            for file in sorted(files):
                full_path = os.path.join(root, file)
                # Ignore metadata files like info.json in hash calculation
                if file == "info.json":
                    continue
                rel_path = os.path.relpath(full_path, dir_path)
                sha256.update(rel_path.encode("utf-8"))
                with open(full_path, "rb") as f:
                    while chunk := f.read(65536):
                        sha256.update(chunk)
        return sha256.hexdigest()

    def check_duplicate(self, target_path: str) -> Tuple[bool, Optional[str], Optional[dict]]:
        """
        Checks if file or folder at target_path already exists in product database.
        Returns: (is_duplicate: bool, file_hash: str, existing_product_data: Optional[dict])
        """
        if os.path.isdir(target_path):
            file_hash = self.calculate_directory_hash(target_path)
        else:
            file_hash = self.calculate_file_hash(target_path)

        existing = self.db.find_by_hash(file_hash)
        if existing:
            return True, file_hash, existing
        return False, file_hash, None
