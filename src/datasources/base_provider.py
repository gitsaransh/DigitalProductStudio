"""
Abstract Base Data Source Provider for Digital Products House
Defines uniform contract for all underlying metric data providers.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from src.core.provenance import DataSource, format_metric_with_source

class BaseDataSourceProvider(ABC):
    def __init__(self, provider_name: str, source_type: DataSource):
        self.provider_name = provider_name
        self.source_type = source_type

    @abstractmethod
    def fetch_metric(self, metric_key: str, **kwargs) -> Dict[str, Any]:
        """Fetches metric value with standardized data source provenance metadata."""
        pass

    @abstractmethod
    def is_available(self) -> bool:
        """Returns True if the underlying data source is connected and operational."""
        pass
