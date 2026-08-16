"""
Central Configuration & Secrets Management for Digital Products House
Loads settings from environment variables and config/settings.yaml with validation.
"""

import os
import yaml
from typing import Dict, Any, Optional

class ConfigManager:
    def __init__(self, config_path: str = "config/settings.yaml"):
        self.config_path = os.path.abspath(config_path)
        self.settings = self._load_settings()

    def _load_settings(self) -> Dict[str, Any]:
        settings = {
            "studio_name": os.getenv("STUDIO_NAME", "Digital Products House"),
            "environment": os.getenv("ENVIRONMENT", "production"),
            "db_path": os.getenv("DB_PATH", "./catalog/studio_catalog.db"),
            "etsy": {
                "api_key": self.mask_secret(os.getenv("ETSY_API_KEY", "")),
                "shop_id": os.getenv("ETSY_SHOP_ID", "ZenithPlannersCo")
            },
            "gumroad": {
                "access_token": self.mask_secret(os.getenv("GUMROAD_ACCESS_TOKEN", ""))
            },
            "lemonsqueezy": {
                "api_key": self.mask_secret(os.getenv("LEMONSQUEEZY_API_KEY", "")),
                "store_id": os.getenv("LEMONSQUEEZY_STORE_ID", "")
            }
        }

        if os.path.exists(self.config_path):
            try:
                with open(self.config_path, "r", encoding="utf-8") as f:
                    file_settings = yaml.safe_load(f) or {}
                    # Merge YAML settings if env vars are empty
                    if "catalog" in file_settings and "db_path" in file_settings["catalog"]:
                        settings["db_path"] = os.getenv("DB_PATH", file_settings["catalog"]["db_path"])
            except Exception as e:
                print(f"[Config] Warning loading YAML file: {e}")

        return settings

    @staticmethod
    def mask_secret(secret: str) -> str:
        """Masks sensitive API credentials for secure logging."""
        if not secret or len(secret) < 8:
            return "********"
        return f"{secret[:4]}****{secret[-4:]}"

    def get(self, key: str, default: Any = None) -> Any:
        return self.settings.get(key, default)
