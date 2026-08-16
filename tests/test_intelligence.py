"""
Unit Tests for Intelligence Scoring & Recommendations Engine
"""

import unittest
from src.intelligence.scoring import IntelligenceScoringEngine
from src.intelligence.recommendations import RecommendationEngine

class TestIntelligence(unittest.TestCase):
    def test_calculate_product_scores(self):
        product_data = {
            "title": "Aesthetic Notion OS Life Planner 2026 | Daily Planner | Instant Download",
            "tags": [f"tag{i}" for i in range(13)],
            "description": "Comprehensive markdown description copy exceeding 200 characters.",
            "previews": [{"file_path": f"p{i}.png"} for i in range(5)],
            "pricing": {"base_price": 14.99, "cost_per_unit": 0.5},
            "files": {"customer_instructions_pdf": "guide.pdf"}
        }

        scores = IntelligenceScoringEngine.calculate_product_scores(product_data)
        self.assertGreaterEqual(scores["quality_score"], 80)
        self.assertGreaterEqual(scores["seo_score"], 80)
        self.assertGreaterEqual(scores["profit_score"], 90)

    def test_generate_recommendations(self):
        product_data = {
            "title": "Short Title",
            "tags": ["tag1"],
            "previews": [],
            "pricing": {"base_price": 4.99},
            "intelligence_scores": {"seo_score": 40, "quality_score": 40}
        }

        recs = RecommendationEngine.generate_recommendations(product_data)
        self.assertGreaterEqual(len(recs), 2)
        rec_codes = [r["code"] for r in recs]
        self.assertIn("IMPROVE_KEYWORDS", rec_codes)
        self.assertIn("IMPROVE_THUMBNAIL", rec_codes)

if __name__ == "__main__":
    unittest.main()
