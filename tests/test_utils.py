"""
Unit Tests for Config, Secrets Masking & Utilities
"""

import unittest
from src.core.config import ConfigManager
from src.core.utils import sanitize_input, retry_with_backoff

class TestUtilsAndConfig(unittest.TestCase):
    def test_secrets_masking(self):
        self.assertEqual(ConfigManager.mask_secret(""), "********")
        masked = ConfigManager.mask_secret("etsy_sec_99182312001")
        self.assertTrue(masked.startswith("etsy"))
        self.assertTrue(masked.endswith("2001"))

    def test_input_sanitization(self):
        malicious_xss = "Normal Title <script>alert('xss')</script>"
        clean = sanitize_input(malicious_xss)
        self.assertNotIn("<script>", clean)
        self.assertIn("Normal Title", clean)

        malicious_sqli = "SELECT * FROM products; --"
        clean_sqli = sanitize_input(malicious_sqli)
        self.assertNotIn("--", clean_sqli)

    def test_retry_decorator(self):
        attempts = 0

        @retry_with_backoff(retries=2, backoff_in_seconds=0.01)
        def flaky_func():
            nonlocal attempts
            attempts += 1
            if attempts < 2:
                raise ValueError("Temporary failure")
            return "Success"

        res = flaky_func()
        self.assertEqual(res, "Success")
        self.assertEqual(attempts, 2)

if __name__ == "__main__":
    unittest.main()
