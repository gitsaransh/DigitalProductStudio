import os
from PIL import Image, ImageDraw, ImageFont

def render_premium_graphic(path, width, height, main_text, sub_text, accent_text="DIGITAL PRODUCT STUDIO"):
    # Dark Slate base background
    img = Image.new("RGB", (width, height), color=(11, 15, 25))
    draw = ImageDraw.Draw(img)
    
    # Accent bar at the bottom
    draw.rectangle([0, height - int(height * 0.04), width, height], fill=(99, 102, 241))
    
    # Gradient/Light decorative elements
    draw.ellipse([width - int(width * 0.4), -int(height * 0.4), width + int(width * 0.2), int(height * 0.6)], fill=(30, 41, 59))
    draw.ellipse([-int(width * 0.2), height - int(height * 0.6), int(width * 0.4), height + int(height * 0.4)], fill=(17, 24, 39))

    try:
        font_main = ImageFont.truetype("arial.ttf", int(height * 0.14))
        font_sub = ImageFont.truetype("arial.ttf", int(height * 0.06))
        font_accent = ImageFont.truetype("arial.ttf", int(height * 0.04))
    except IOError:
        font_main = ImageFont.load_default()
        font_sub = ImageFont.load_default()
        font_accent = ImageFont.load_default()

    # Text Placement
    draw.text((30, int(height * 0.2)), accent_text.upper(), fill=(165, 180, 252), font=font_accent)
    draw.text((30, int(height * 0.35)), main_text, fill=(255, 255, 255), font=font_main)
    draw.text((30, int(height * 0.65)), sub_text, fill=(148, 163, 184), font=font_sub)

    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    img.save(path, "PNG")
    print(f"[Asset Rendered] {path} ({width}x{height})")

def generate_email_signature(path):
    html_content = """<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #f1f5f9; background-color: #0b0f19; padding: 24px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.07); max-width: 450px;">
  <div style="display: flex; align-items: center; gap: 16px;">
    <div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #a78bfa, #6366f1); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 20px; color: white;">
      DPS
    </div>
    <div>
      <div style="font-size: 16px; font-weight: 800; color: white;">Digital Product Studio Support</div>
      <div style="font-size: 13px; color: #94a3b8;">Premium Templates & Systems</div>
      <div style="font-size: 12px; color: #6366f1; margin-top: 4px;">
        <a href="https://digitalproductstudio.in" style="color: #6366f1; text-decoration: none;">digitalproductstudio.in</a> | 
        <a href="mailto:hello@digitalproductstudio.in" style="color: #6366f1; text-decoration: none;">hello@digitalproductstudio.in</a>
      </div>
    </div>
  </div>
</div>
"""
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(html_content)
    print(f"[Asset Rendered] {path} (HTML)")

def main():
    # 1. Storefront / Etsy assets
    render_premium_graphic("assets/etsy_storefront/shop_logo_500x500.png", 500, 500, "Digital Product Studio", "EST. 2026 • DIGITAL STUDIO")
    render_premium_graphic("assets/etsy_storefront/shop_banner_1200x300.png", 1200, 300, "DIGITAL PRODUCT STUDIO", "PREMIUM DOWNLOADS • NOTION OS • SPREADSHEETS • CANVA KITS")
    render_premium_graphic("assets/etsy_storefront/shop_icon_280x280.png", 280, 280, "DPS", "Digital Product Studio")
    
    # 2. General brand assets
    render_premium_graphic("assets/brand/app_icon.png", 512, 512, "DPS", "Digital Product Studio")
    render_premium_graphic("assets/brand/website_banner.png", 1920, 1080, "Digital Product Studio", "Premium Excel, Notion, Canva & AI templates for professionals.")
    render_premium_graphic("assets/brand/social_cover.png", 1200, 630, "Digital Product Studio", "Premium Templates & Systems • digitalproductstudio.in")
    
    # 3. Email Signature HTML
    generate_email_signature("assets/brand/email_signature.html")

    # 4. Generate copy files via Etsy Branding Engine
    from src.etsy.branding_engine import StorefrontBrandingEngine
    engine = StorefrontBrandingEngine("Digital Product Studio")
    engine.generate_all_branding_assets()

if __name__ == "__main__":
    main()
