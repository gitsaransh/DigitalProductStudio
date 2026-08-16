"""

Etsy Storefront Branding Asset Engine for Digital Product Studio

Generates graphics (Logo 500x500, Banner 1200x300, Icon 280x280) and complete storefront copy

(Announcement, About Section, Shop Policies, FAQs, Thank-You Messages) for approved shop names.

"""



import os

from typing import Dict, Any



try:

    from PIL import Image, ImageDraw, ImageFont

    HAS_PIL = True

except ImportError:

    HAS_PIL = False





class StorefrontBrandingEngine:

    def __init__(self, shop_name: str = "ZenithPlanners Co."):

        self.shop_name = shop_name



    def generate_all_branding_assets(self, output_dir: str = "./assets/etsy_storefront") -> Dict[str, Any]:

        """Renders complete suite of Etsy storefront graphic assets and copy documents."""

        os.makedirs(output_dir, exist_ok=True)



        logo_path = os.path.join(output_dir, "shop_logo_500x500.png")

        banner_path = os.path.join(output_dir, "shop_banner_1200x300.png")

        icon_path = os.path.join(output_dir, "shop_icon_280x280.png")

        copy_path = os.path.join(output_dir, "storefront_copy_and_policies.md")



        # 1. Render Logo

        self._render_graphic(logo_path, 500, 500, self.shop_name, "EST. 2026 • DIGITAL STUDIO")



        # 2. Render Banner

        self._render_graphic(banner_path, 1200, 300, self.shop_name.upper(), "PREMIUM INSTANT DIGITAL DOWNLOADS • NOTION OS • PRINTABLES • CANVA KITS")



        # 3. Render Shop Icon

        self._render_graphic(icon_path, 280, 280, "DPS", self.shop_name[:12])



        # 4. Generate Complete Storefront Copy Suite

        copy_content = self.generate_storefront_copy()

        with open(copy_path, "w", encoding="utf-8") as f:

            f.write(copy_content)



        print(f"[BrandingEngine] Generated complete Etsy storefront assets in {output_dir}")

        return {

            "shop_name": self.shop_name,

            "logo_path": logo_path,

            "banner_path": banner_path,

            "icon_path": icon_path,

            "copy_path": copy_path

        }



    def _render_graphic(self, output_path: str, width: int, height: int, main_text: str, sub_text: str):

        if HAS_PIL:

            img = Image.new("RGB", (width, height), color=(11, 15, 25))

            draw = ImageDraw.Draw(img)



            # Elegant background accents

            draw.rectangle([0, 0, width, height], fill=(15, 23, 42))

            draw.rectangle([0, height - 12, width, height], fill=(99, 102, 241)) # Accent bar



            try:

                font_main = ImageFont.truetype("arial.ttf", int(height * 0.16))

                font_sub = ImageFont.truetype("arial.ttf", int(height * 0.08))

            except IOError:

                font_main = ImageFont.load_default()

                font_sub = ImageFont.load_default()



            draw.text((30, int(height * 0.3)), main_text, fill=(255, 255, 255), font=font_main)

            draw.text((30, int(height * 0.6)), sub_text, fill=(165, 180, 252), font=font_sub)



            img.save(output_path, "PNG")

        else:

            with open(output_path, "wb") as f:

                f.write(f"ETSY_GRAPHIC_{width}x{height}".encode("utf-8"))



    def generate_storefront_copy(self) -> str:

        return f"""# Etsy Storefront Configuration & Copy Suite



**Shop Name**: {self.shop_name}  

**Niche**: Premium Digital Products (Planners, Notion OS, Canva Templates, Spreadsheets, AI Prompts)  



---



## 1. Shop Announcement

> "Welcome to **{self.shop_name}**! ✦ Instant Digital Downloads designed to elevate your daily workflow, productivity, and business operations. All purchases include immediate download links and step-by-step PDF user guides. Thank you for supporting our digital studio!"



---



## 2. About Section & Brand Story

**Heading**: Professionally Engineered Digital Resources for Modern Creators & Professionals  



**Story**:  

At **{self.shop_name}**, we believe digital tools should be both exceptionally functional and visually stunning. Every planner, template, spreadsheet, and prompt kit in our catalog is engineered to save you hours of work while delivering an unmatched user experience. 



---



## 3. Shop Policies

- **Digital Delivery**: 100% Instant Download. Files are delivered automatically via your account immediately after payment confirmation.

- **Returns & Exchanges**: Due to the instant nature of digital file downloads, all sales are final. However, customer satisfaction is our top priority—if you experience any technical difficulty, contact us and we will resolve it within 24 hours.

- **Licensing & Terms**: All digital downloads include Personal Use rights unless marked with Commercial License inclusion. Resale, redistribution, or sharing of raw source files is strictly prohibited.



---



## 4. Frequently Asked Questions (FAQs)

**Q: How do I access my files after purchasing?**  

A: Your files will be available for instant download in your Etsy account under **Purchases & Reviews**. You will also receive an automated email confirmation containing direct download links.



**Q: Can I use these templates on iPad, Mac, and Windows?**  

A: Yes! Our digital planners and Notion systems are 100% cross-platform and work seamlessly on desktop, laptop, iPad, and mobile devices.



---



## 5. Order Thank-You Message (Instant Digital Delivery)

> "Hi there! Thank you so much for your purchase from **{self.shop_name}**! 🌟 Your files are ready for instant download. We've included a step-by-step PDF Customer Guide in your download package to ensure seamless setup. If you love your new digital download, we'd greatly appreciate a 5-star review!"

"""

