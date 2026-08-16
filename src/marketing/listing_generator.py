"""
SEO & Listing Generator Engine for Digital Products House
Produces marketplace-optimized listing metadata:
- Etsy 140-char title (Primary keywords placed at the front for maximum search ranking)
- Exactly 13 Etsy Search Tags (Max 20 chars per tag, no punctuation)
- Formatted Description Copy with Benefits, Included Files, Compatibility & FAQs
"""

import re
from typing import Dict, Any, List

class ListingGenerator:
    @staticmethod
    def generate_etsy_title(base_name: str, category: str, keywords: List[str]) -> str:
        """
        Generates an Etsy title capped strictly at 140 characters.
        Format: Primary Title | Key Feature | High Search Intent Phrase
        """
        parts = [base_name.strip()]
        for kw in keywords:
            if kw and kw.lower() not in base_name.lower():
                parts.append(kw.strip().title())

        parts.append(category.strip().title())
        parts.append("Instant Download")

        title = " | ".join(parts)
        if len(title) > 140:
            title = title[:137] + "..."
        return title

    @staticmethod
    def generate_etsy_tags(category: str, base_name: str, custom_keywords: List[str]) -> List[str]:
        """
        Generates exactly 13 Etsy search tags.
        Each tag MUST be <= 20 characters, with special characters removed.
        """
        raw_candidates = [
            category,
            base_name,
            "digital download",
            "instant download",
            "printable template",
            "aesthetic planner",
            "minimalist design",
            "custom template",
            "productivity OS",
            "commercial license",
            "creator assets",
            "digital OS",
            "pro bundle"
        ] + custom_keywords

        valid_tags = []
        seen = set()

        for cand in raw_candidates:
            # Clean string: lowercase, remove non-alphanumeric except spaces
            clean = re.sub(r'[^a-zA-Z0-9 ]', '', cand.strip().lower())
            clean = re.sub(r'\s+', ' ', clean)

            if len(clean) > 20:
                clean = clean[:20].strip()

            if clean and clean not in seen and len(clean) <= 20:
                seen.add(clean)
                valid_tags.append(clean)

            if len(valid_tags) == 13:
                break

        # Fallback padding if less than 13
        fallback_tags = ["digital download", "instant access", "printable asset", "best seller", "top tier", "studio asset"]
        for fb in fallback_tags:
            if len(valid_tags) == 13:
                break
            if fb not in seen:
                seen.add(fb)
                valid_tags.append(fb)

        return valid_tags[:13]

    @classmethod
    def enrich_product_listing(cls, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        """Takes raw product data and enriches title, tags, description, and FAQs."""
        base_name = raw_data.get("title", "Digital Asset")
        category = raw_data.get("category", "Planners & Organizers")
        keywords = raw_data.get("keywords", [])

        # Optimized Title & Tags
        etsy_title = cls.generate_etsy_title(base_name, category, keywords)
        etsy_tags = cls.generate_etsy_tags(category, base_name, keywords)

        # Markdown Description Copy
        description = f"""# {base_name} - Instant Digital Download

Elevate your workflow with **{base_name}**, professionally crafted by Digital Products House. Designed for maximum functionality, seamless integration, and premium aesthetic appeal.

---

### 🌟 WHAT IS INCLUDED
- **1x Primary Digital Payload Asset** (High-Resolution / Source Format)
- **1x PDF Instant Customer Guide** (Step-by-step setup instructions)
- **Bonus Creator Resources & Licensing Document**

---

### 🎯 KEY HIGHLIGHTS
- **Instant Access**: Download immediately upon purchase confirmation.
- **Fully Customizable**: Personalize colors, layouts, and data fields effortlessly.
- **Cross-Platform Compatibility**: Works flawlessly on Desktop, Laptop, and Tablet devices.
- **Commercial Use Option**: Suitable for personal and client projects.

---

### ❓ FREQUENTLY ASKED QUESTIONS (FAQ)

**Q: How do I receive my download?**
A: Once payment is processed, Etsy / the sales platform will provide an instant link to download your PDF guide and zip archive.

**Q: Can I edit these files?**
A: Yes! Files are fully unlocked for customization based on your personal license.

---
*© Digital Products House. All rights reserved.*
"""

        raw_data["title"] = etsy_title
        raw_data["tags"] = etsy_tags
        raw_data["description"] = description
        raw_data["faqs"] = [
            {"question": "How do I download my file?", "answer": "Instant download available via order confirmation page."},
            {"question": "Is commercial use allowed?", "answer": f"Included under {raw_data.get('license', 'Personal Use Only')}."}
        ]

        return raw_data
