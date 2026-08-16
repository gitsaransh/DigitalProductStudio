"""
Automated Recommendation Engine for Digital Product Studio
Generates actionable optimization recommendations per product:
- IMPROVE_THUMBNAIL
- IMPROVE_KEYWORDS
- RAISE_PRICE / LOWER_PRICE
- CREATE_BUNDLE
- TRANSLATE_DE / TRANSLATE_FR
- RETIRE_PRODUCT
"""

from typing import Dict, Any, List
from src.intelligence.scoring import IntelligenceScoringEngine

class RecommendationEngine:
    @staticmethod
    def generate_recommendations(product_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        scores = product_data.get("intelligence_scores") or IntelligenceScoringEngine.calculate_product_scores(product_data)
        recs = []

        # SEO Recommendations
        if scores["seo_score"] < 80:
            recs.append({
                "code": "IMPROVE_KEYWORDS",
                "title": "Optimize Search Tags & Title Keywords",
                "description": "Ensure 13 search tags are filled and primary keywords are in the first 40 characters of the Etsy title.",
                "priority": "high"
            })

        # Thumbnail Recommendations
        if scores["quality_score"] < 80 or len(product_data.get("previews", [])) < 5:
            recs.append({
                "code": "IMPROVE_THUMBNAIL",
                "title": "Add Multi-Card Device Mockups",
                "description": "Generate full 5-card preview gallery (Laptop, Mobile, Color Palette, Feature highlights).",
                "priority": "high"
            })

        # Pricing Recommendations
        price = product_data.get("pricing", {}).get("base_price", 0)
        if price < 9.99:
            recs.append({
                "code": "RAISE_PRICE",
                "title": "Optimize Value-Based Pricing",
                "description": "Consider raising price to $14.99 with commercial license inclusion to boost profit margin.",
                "priority": "medium"
            })

        # Multi-Language Localization
        locales = product_data.get("localizations", {})
        if "de" not in locales:
            recs.append({
                "code": "TRANSLATE_DE",
                "title": "Localize Product to German Market",
                "description": "High demand detected for digital templates in Germany. Generate DE translated listing copy.",
                "priority": "medium"
            })

        # Bundling
        recs.append({
            "code": "CREATE_BUNDLE",
            "title": "Create Mega Productivity Bundle",
            "description": "Combine this listing with top sellers in the same category to create a $49.99 high-AOV bundle.",
            "priority": "low"
        })

        product_data["recommendations"] = recs
        return recs
