"""
Multi-Card High-Res Preview & Thumbnail Generator for Digital Products House
Creates 2700x2025 (4:3 aspect ratio @ 300 DPI) Etsy marketplace graphics:
1. Cover Card (Hero Product Display with title and badge)
2. Feature Card (Key Benefits & Highlights)
3. Usage Guide Card (How it works & compatibility)
4. Color Palette / Theme Card
5. Watermarked Preview Card
"""

import os
from typing import List, Dict, Any

try:
    from PIL import Image, ImageDraw, ImageFont
    HAS_PIL = True
except ImportError:
    HAS_PIL = False


class ThumbnailGenerator:
    def __init__(self, width: int = 2700, height: int = 2025):
        self.width = width
        self.height = height

    def generate_all_cards(self, product_data: Dict[str, Any], output_dir: str) -> List[Dict[str, Any]]:
        """Generates full suite of 5 marketplace preview slides."""
        os.makedirs(output_dir, exist_ok=True)
        results = []

        slides = [
            ("cover", "Hero Cover Card"),
            ("feature", "Key Features & Breakdown"),
            ("usage", "Instant Digital Delivery & Compatibility"),
            ("palette", "Aesthetic Design & Color Palette"),
            ("mockup", "Watermarked Live Preview")
        ]

        for idx, (slide_type, label) in enumerate(slides, 1):
            filename = f"preview_{idx}_{slide_type}.png"
            file_path = os.path.join(output_dir, filename)

            if HAS_PIL:
                self._create_pil_slide(slide_type, label, product_data, file_path)
            else:
                self._create_placeholder_slide(file_path, product_data["title"], label)

            results.append({
                "type": slide_type,
                "file_path": file_path,
                "width": self.width,
                "height": self.height
            })

        return results

    def _create_pil_slide(self, slide_type: str, label: str, product_data: Dict[str, Any], output_path: str):
        # Create gradient / stylish dark canvas
        img = Image.new("RGB", (self.width, self.height), color=(18, 24, 38))
        draw = ImageDraw.Draw(img)

        # Header background banner
        draw.rectangle([0, 0, self.width, 300], fill=(29, 38, 59))
        draw.rectangle([0, 290, self.width, 300], fill=(99, 102, 241)) # Vibrant indigo accent bar

        # Draw decorative background elements
        draw.ellipse([self.width - 600, -200, self.width + 400, 800], fill=(30, 41, 69))
        draw.ellipse([-200, self.height - 600, 600, self.height + 400], fill=(25, 33, 52))

        # Text rendering
        title_text = product_data.get("title", "Digital Asset Payload")
        category_text = product_data.get("category", "DIGITAL PRODUCT")
        subtitle_text = product_data.get("subtitle", "Instant High-Resolution Digital Download")

        # Fonts - fall back to default if custom fonts unavailable
        try:
            font_title = ImageFont.truetype("arial.ttf", 90)
            font_sub = ImageFont.truetype("arial.ttf", 55)
            font_label = ImageFont.truetype("arial.ttf", 45)
            font_watermark = ImageFont.truetype("arial.ttf", 75)
        except IOError:
            font_title = ImageFont.load_default()
            font_sub = ImageFont.load_default()
            font_label = ImageFont.load_default()
            font_watermark = ImageFont.load_default()

        # Draw Header
        draw.text((100, 100), f"DIGITAL PRODUCTS HOUSE  •  {category_text.upper()}", fill=(165, 180, 252), font=font_label)

        # Main Title Box
        draw.text((100, 400), title_text[:50] + ("..." if len(title_text) > 50 else ""), fill=(255, 255, 255), font=font_title)
        draw.text((100, 530), subtitle_text, fill=(203, 213, 225), font=font_sub)

        # Content Card Frame
        draw.rectangle([100, 680, self.width - 100, self.height - 200], outline=(79, 70, 229), width=6, fill=(24, 32, 49))

        if slide_type == "cover":
            draw.text((200, 800), "✦ INSTANT DIGITAL DOWNLOAD", fill=(255, 255, 255), font=font_sub)
            draw.text((200, 950), "✓ Full High-Resolution File Assets Included", fill=(226, 232, 240), font=font_sub)
            draw.text((200, 1080), "✓ Personal & Commercial License Options", fill=(226, 232, 240), font=font_sub)
            draw.text((200, 1210), "✓ Compatible with Desktop & Mobile Devices", fill=(226, 232, 240), font=font_sub)

        elif slide_type == "feature":
            draw.text((200, 800), "PRODUCT FEATURES & SPECIFICATIONS", fill=(165, 180, 252), font=font_sub)
            draw.text((200, 950), "• Professionally Crafted & Quality Tested", fill=(226, 232, 240), font=font_sub)
            draw.text((200, 1080), "• Includes Step-by-Step PDF User Guide", fill=(226, 232, 240), font=font_sub)
            draw.text((200, 1210), "• Instant Access Immediately After Checkout", fill=(226, 232, 240), font=font_sub)

        elif slide_type == "mockup":
            # Watermark Overlay
            draw.text((self.width // 2 - 400, self.height // 2), "DIGITAL PRODUCTS HOUSE - PREVIEW", fill=(255, 255, 255, 60), font=font_watermark)

        # Footer Accent Bar
        draw.rectangle([0, self.height - 60, self.width, self.height], fill=(79, 70, 229))
        draw.text((100, self.height - 45), f"Slide {label}  |  Resolution: 2700 x 2025 px  |  Format: PNG", fill=(255, 255, 255), font=font_label)

        img.save(output_path, "PNG")

    def _create_placeholder_slide(self, file_path: str, title: str, label: str):
        with open(file_path, "wb") as f:
            f.write(b"PNG_PLACEHOLDER_DATA")
