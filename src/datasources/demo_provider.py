"""
Demo Sandbox Provider for Data Source Layer
Explicitly isolated provider for offline sandbox/testing modes when enabled via DEMO_MODE env flag.
Disabled by default to enforce Zero-Fabrication real-world data rules.
"""

import os
from typing import Dict, Any
from src.core.provenance import DataSource, format_metric_with_source
from src.datasources.base_provider import BaseDataSourceProvider

class DemoSandboxProvider(BaseDataSourceProvider):
    def __init__(self):
        super().__init__("Offline Sandbox Demo Provider", DataSource.AWAITING_INTEGRATION)
        self.demo_enabled = os.getenv("DEMO_MODE", "false").lower() == "true"

    def is_available(self) -> bool:
        return self.demo_enabled

    def fetch_metric(self, metric_key: str, **kwargs) -> Dict[str, Any]:
        if not self.is_available():
            return format_metric_with_source(
                None,
                DataSource.NOT_CONNECTED,
                not_connected_message="Demo Sandbox Disabled (Zero-Fabrication Mode Active)"
            )
        return format_metric_with_source("SANDBOX_DEMO_DATA", DataSource.AWAITING_INTEGRATION)
