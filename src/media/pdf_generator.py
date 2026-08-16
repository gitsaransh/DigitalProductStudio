"""
Customer Instructions PDF Generator for Digital Product Studio
Generates professional PDF guides delivered alongside instant digital downloads.
"""

import os
from typing import Dict, Any

try:
    from reportlab.lib.pagesizes import letter
    from reportlab.pdfgen import canvas
    HAS_REPORTLAB = True
except ImportError:
    HAS_REPORTLAB = False


class PDFGenerator:
    @staticmethod
    def generate_customer_instructions(product_data: Dict[str, Any], output_pdf_path: str):
        """Generates an instant PDF instruction guide for the buyer."""
        os.makedirs(os.path.dirname(os.path.abspath(output_pdf_path)), exist_ok=True)
        title = product_data.get("title", "Digital Asset Download")
        license_type = product_data.get("license", "Personal Use Only")

        if HAS_REPORTLAB:
            c = canvas.Canvas(output_pdf_path, pagesize=letter)
            width, height = letter

            # Header Banner
            c.setFillColorRGB(0.1, 0.15, 0.25)
            c.rect(0, height - 120, width, 120, fill=1, stroke=0)

            c.setFillColorRGB(1, 1, 1)
            c.setFont("Helvetica-Bold", 24)
            c.drawString(40, height - 60, "Thank You For Your Purchase!")

            c.setFont("Helvetica", 12)
            c.drawString(40, height - 85, f"Product: {title}")

            # Main Body Instructions
            c.setFillColorRGB(0, 0, 0)
            c.setFont("Helvetica-Bold", 14)
            c.drawString(40, height - 160, "How to Access & Use Your Files:")

            c.setFont("Helvetica", 11)
            text_lines = [
                "1. Download your attached ZIP or file package from your marketplace account.",
                "2. Extract/unzip the folder on your desktop or iPad/tablet device.",
                "3. Open the primary template or printable file in your preferred software.",
                "4. If you have any questions or need custom assistance, contact our support team.",
                "",
                "License Overview:",
                f"• Grant: {license_type}",
                "• Resale, redistribution, or sharing of raw source files is strictly prohibited.",
                "",
                "Support & Feedback:",
                "We appreciate your review! If you love your purchase, please leave a 5-star rating."
            ]

            y_pos = height - 190
            for line in text_lines:
                c.drawString(40, y_pos, line)
                y_pos -= 22

            c.save()
        else:
            with open(output_pdf_path, "w", encoding="utf-8") as f:
                f.write(f"Customer Instructions Guide for {title}\nLicense: {license_type}\nThank you for your purchase!")
