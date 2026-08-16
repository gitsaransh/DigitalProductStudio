"""
Automatic Multi-Device & Social Media Mockup Generator for Digital Product Studio
Generates device frames and social media promo graphics across 9 target dimensions:
1. Laptop Mockup (1440 x 900 px)
2. Desktop Display (1920 x 1080 px)
3. Tablet Mockup (1024 x 768 px)
4. Mobile Phone Mockup (375 x 812 px)
5. Instagram Square Post (1080 x 1080 px)
6. Instagram Story (1080 x 1920 px)
7. Pinterest Pin (1000 x 1500 px)
8. Facebook Cover Graphic (1200 x 630 px)
9. Etsy Product Gallery (2700 x 2025 px)
"""

import os
from typing import Dict, Any, List

try:
    from PIL import Image, ImageDraw, ImageFont
    HAS_PIL = True
except ImportError:
    HAS_PIL = False

MOCKUP_SPECS = [
    ("laptop", 1440, 900, "MacBook Pro Display"),
    ("desktop", 1920, 1080, "iMac 5K Desktop"),
    ("tablet", 1024, 768, "iPad Pro Display"),
    ("phone", 375, 812, "iPhone Pro Frame"),
    ("ig_post", 1080, 1080, "Instagram Post Graphic"),
    ("ig_story", 1080, 1920, "Instagram Story Pin"),
    ("pinterest", 1000, 1500, "Pinterest Pin Showcase"),
    ("facebook", 1200, 630, "Facebook Promo Graphic"),
    ("etsy_gallery", 2700, 2025, "Etsy High-Res Gallery")
]

class MockupEngine:
    @staticmethod
    def generate_mockups(product_data: Dict[str, Any], output_dir: str) -> List[Dict[str, Any]]:
        os.makedirs(output_dir, exist_ok=True)
        results = []
        title = product_data.get("title", "Digital Product")

        for key, w, h, label in MOCKUP_SPECS:
            file_name = f"mockup_{key}_{w}x{h}.png"
            file_path = os.path.join(output_dir, file_name)

            if HAS_PIL:
                img = Image.new("RGB", (w, h), color=(15, 23, 42))
                draw = ImageDraw.Draw(img)

                # Stylish Glass Card Frame
                margin = int(min(w, h) * 0.08)
                draw.rectangle([margin, margin, w - margin, h - margin], fill=(30, 41, 59), outline=(99, 102, 241), width=4)

                try:
                    font = ImageFont.truetype("arial.ttf", int(min(w, h) * 0.05))
                    font_sub = ImageFont.truetype("arial.ttf", int(min(w, h) * 0.03))
                except IOError:
                    font = ImageFont.load_default()
                    font_sub = ImageFont.load_default()

                draw.text((margin + 20, margin + 40), f"{label.upper()}", fill=(165, 180, 252), font=font_sub)
                draw.text((margin + 20, margin + 90), title[:30] + "...", fill=(255, 255, 255), font=font)

                # Mockup Graphic Screen Placeholder
                screen_box = [margin + 40, margin + 180, w - margin - 40, h - margin - 60]
                draw.rectangle(screen_box, fill=(15, 23, 42), outline=(79, 70, 229), width=2)
                draw.text((screen_box[0] + 20, screen_box[1] + 40), "✦ INSTANT DIGITAL ACCESS", fill=(16), font=font_sub)

                img.save(file_path, "PNG")
            else:
                with open(file_path, "wb") as f:
                    f.write(f"MOCKUP_{key}_{w}x{h}".encode("utf-8"))

            results.append({
                "format_key": key,
                "label": label,
                "width": w,
                "height": h,
                "file_path": file_path
            })

        print(f"[MockupEngine] Generated {len(results)} multi-device & social mockups in {output_dir}")
        return results
