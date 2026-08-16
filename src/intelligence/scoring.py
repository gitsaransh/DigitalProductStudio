"""
Product & Store Intelligence Scoring Engine for Digital Product Studio
Computes multi-dimensional scores for every digital product and overall store health:
- Quality Score (0-100)
- SEO Score (0-100)
- Competition Score (0-100)
- Estimated Monthly Sales
- Difficulty Score (0-100)
- Profit Score (0-100)
- Confidence Score (0-100)
- Store Health Score (0-100)
"""

from typing import Dict, Any

class IntelligenceScoringEngine:
    @staticmethod
    def calculate_product_scores(product_data: Dict[str, Any]) -> Dict[str, Any]:
        title = product_data.get("title", "")
        tags = product_data.get("tags", [])
        desc = product_data.get("description", "")
        previews = product_data.get("previews", [])
        pricing = product_data.get("pricing", {})
        price = pricing.get("base_price", 9.99)

        # 1. SEO Score calculation
        seo_score = 0
        if 50 <= len(title) <= 140:
            seo_score += 40
        if len(tags) == 13:
            seo_score += 40
        if len(desc) > 200:
            seo_score += 20
        seo_score = min(100, max(10, seo_score))

        # 2. Quality Score calculation
        quality_score = 50
        if len(previews) >= 5:
            quality_score += 30
        if product_data.get("files", {}).get("customer_instructions_pdf"):
            quality_score += 20
        quality_score = min(100, max(20, quality_score))

        # 3. Competition Score (Lower is better/less competitive)
        competition_score = 45 # Default moderate competition

        # 4. Profit Score
        cost = pricing.get("cost_per_unit", 0.5)
        margin = ((price - cost) / price * 100) if price > 0 else 0
        profit_score = min(100, max(10, int(margin)))

        # 5. Difficulty Score
        difficulty_score = 30 # Digital assets have low difficulty

        # 6. Confidence Score & Estimated Monthly Sales
        confidence_score = int((quality_score * 0.5) + (seo_score * 0.5))
        est_sales = int(confidence_score * 1.8)

        scores = {
            "quality_score": quality_score,
            "seo_score": seo_score,
            "competition_score": competition_score,
            "estimated_monthly_sales": est_sales,
            "difficulty_score": difficulty_score,
            "profit_score": profit_score,
            "confidence_score": confidence_score
        }

        product_data["intelligence_scores"] = scores
        return scores

    @staticmethod
    def calculate_store_health(products: list) -> Dict[str, Any]:
        if not products:
            return {"store_health_score": 100, "active_listings": 0}

        avg_seo = sum(p.get("intelligence_scores", {}).get("seo_score", 80) for p in products) / len(products)
        avg_quality = sum(p.get("intelligence_scores", {}).get("quality_score", 85) for p in products) / len(products)

        store_health = int((avg_seo * 0.5) + (avg_quality * 0.5))
        return {
            "store_health_score": store_health,
            "seo_health_score": int(avg_seo),
            "product_health_score": int(avg_quality),
            "total_products": len(products)
        }
