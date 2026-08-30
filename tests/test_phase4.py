"""
Unit Tests for Phase 4 Etsy Go-Live Modules
"""

import unittest
import os
import shutil
import tempfile
from src.etsy.branding_engine import StorefrontBrandingEngine
from src.etsy.oauth_handler import EtsyOAuthHandler
from src.etsy.go_live_reporter import GoLiveReporter

class TestPhase4GoLive(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.mkdtemp()

    def tearDown(self):
        shutil.rmtree(self.temp_dir)

    def test_branding_engine(self):
        engine = StorefrontBrandingEngine("ZenithPlanners Co.")
        assets = engine.generate_all_branding_assets(self.temp_dir)
        self.assertTrue(os.path.exists(assets["logo_path"]))
        self.assertTrue(os.path.exists(assets["banner_path"]))
        self.assertTrue(os.path.exists(assets["icon_path"]))
        self.assertTrue(os.path.exists(assets["copy_path"]))

    def test_oauth_handler_pkce(self):
        handler = EtsyOAuthHandler(client_id="test_client_id")
        auth_url, state, verifier = handler.generate_authorization_url()
        self.assertIn("https://www.etsy.com/oauth/connect", auth_url)
        self.assertIn("test_client_id", auth_url)
        self.assertTrue(handler.validate_callback_params("sample_code", state, state))

    def test_oauth_handler_token_methods(self):
        handler = EtsyOAuthHandler(client_id="test_client_id")
        tokens = handler.exchange_code_for_tokens("sample_code", "sample_verifier")
        self.assertIn("access_token", tokens)
        self.assertIn("refresh_token", tokens)
        
        refreshed = handler.refresh_access_token("sample_refresh_token")
        self.assertIn("access_token", refreshed)
        self.assertIn("refresh_token", refreshed)

    def test_go_live_reporter(self):
        # Writes to a temp dir, not the tracked docs/GO_LIVE_REPORT.md,
        # so running the test suite doesn't dirty the real repo file.
        report_path = GoLiveReporter.generate_report("ZenithPlanners Co.", output_dir=self.temp_dir)
        self.assertTrue(os.path.exists(report_path))

if __name__ == "__main__":
    unittest.main()
