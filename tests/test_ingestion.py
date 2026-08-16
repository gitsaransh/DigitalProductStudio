"""
Unit Tests for Duplicate Detector & Ingestion Modules
"""

import unittest
import os
import shutil
import tempfile
from src.ingestion.duplicate_detector import DuplicateDetector
from src.media.thumbnail_generator import ThumbnailGenerator
from src.media.pdf_generator import PDFGenerator
from src.marketing.listing_generator import ListingGenerator

class TestIngestionAndMedia(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.mkdtemp()

    def tearDown(self):
        shutil.rmtree(self.temp_dir)

    def test_file_hash_calculation(self):
        file_path = os.path.join(self.temp_dir, "sample.txt")
        with open(file_path, "w", encoding="utf-8") as f:
            f.write("Test Hash Payload Content")

        h1 = DuplicateDetector.calculate_file_hash(file_path)
        self.assertEqual(len(h1), 64)

        # Same content produces identical hash
        h2 = DuplicateDetector.calculate_file_hash(file_path)
        self.assertEqual(h1, h2)

    def test_thumbnail_generator(self):
        gen = ThumbnailGenerator()
        product_data = {
            "title": "Test Thumbnail Title",
            "category": "Planners & Organizers",
            "subtitle": "Instant Download"
        }
        previews_dir = os.path.join(self.temp_dir, "previews")
        results = gen.generate_all_cards(product_data, previews_dir)
        self.assertEqual(len(results), 5)
        for card in results:
            self.assertTrue(os.path.exists(card["file_path"]))

    def test_pdf_generator(self):
        pdf_path = os.path.join(self.temp_dir, "Customer_Guide.pdf")
        product_data = {"title": "Test Product Guide", "license": "Commercial Use Included"}
        PDFGenerator.generate_customer_instructions(product_data, pdf_path)
        self.assertTrue(os.path.exists(pdf_path))

    def test_listing_generator_limits(self):
        title = ListingGenerator.generate_etsy_title("Very Long Base Name That Exceeds Normal Title Limits", "Planners", ["kw1", "kw2"])
        self.assertLessEqual(len(title), 140)

        tags = ListingGenerator.generate_etsy_tags("Planners", "Test Product", ["tag1", "tag2"])
        self.assertEqual(len(tags), 13)
        for t in tags:
            self.assertLessEqual(len(t), 20)

if __name__ == "__main__":
    unittest.main()
