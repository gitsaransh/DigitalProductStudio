"""
Abstract Base Publisher Interface for Digital Products House
Defines uniform contract for all marketplace publishing adapters.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any

class BaseMarketplacePublisher(ABC):
    @abstractmethod
    def publish(self, product_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Publishes an approved product to the marketplace.
        Returns dict containing: status (active/error), external_id, listing_url, error_message.
        """
        pass

    @abstractmethod
    def update(self, product_data: Dict[str, Any]) -> bool:
        """Updates listing metadata or pricing on the marketplace."""
        pass

    @abstractmethod
    def sync_analytics(self, product_id: str, external_id: str) -> Dict[str, Any]:
        """Fetches views, downloads, sales revenue, and refund metrics from channel."""
        pass
