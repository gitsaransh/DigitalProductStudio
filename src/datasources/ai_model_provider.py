"""
AI Model Provider for Data Source Layer
Queries AI Agent Swarm algorithms and Intelligence Scoring models.
"""

from typing import Dict, Any
from src.core.provenance import DataSource, format_metric_with_source
from src.datasources.base_provider import BaseDataSourceProvider
from src.intelligence.scoring import IntelligenceScoringEngine
from src.intelligence.recommendations import RecommendationEngine

class AiModelProvider(BaseDataSourceProvider):
    def __init__(self):
        super().__init__("AI Agent Swarm & Scoring Engine", DataSource.ESTIMATED)

    def is_available(self) -> bool:
        return True

    def fetch_metric(self, metric_key: str, **kwargs) -> Dict[str, Any]:
        product_data = kwargs.get("product_data", {})

        if metric_key == "intelligence_scores":
            scores = IntelligenceScoringEngine.calculate_product_scores(product_data)
            return format_metric_with_source(scores, self.source_type)

        if metric_key == "recommendations":
            recs = RecommendationEngine.generate_recommendations(product_data)
            return format_metric_with_source(recs, self.source_type)

        return format_metric_with_source("Awaiting Intelligence Compute", self.source_type)
