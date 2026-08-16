"""
Unit Tests for AI Agent Swarm Modules
"""

import unittest
from src.agents.content_agent import ContentAgent
from src.agents.seo_agent import SEOAgent
from src.agents.qa_agent import QAAgent
from src.agents.analytics_agent import AnalyticsAgent
from src.agents.support_agent import SupportAgent

class TestAIAgentSwarm(unittest.TestCase):
    def test_agents_execution(self):
        sample_payload = {
            "title": "Agent Test Digital Payload",
            "category": "Planners",
            "tags": ["test"],
            "analytics_summary": {"total_views": 200, "total_downloads": 20}
        }

        c_agent = ContentAgent()
        res1 = c_agent.execute(sample_payload)
        self.assertIn("description", res1)

        qa_agent = QAAgent()
        res2 = qa_agent.execute(res1)
        self.assertTrue(res2["qa_passed"])

        analytics_agent = AnalyticsAgent()
        res3 = analytics_agent.execute(res2)
        self.assertEqual(res3["analytics_summary"]["conversion_rate"], 10.0)

        support_agent = SupportAgent()
        resp = support_agent.generate_review_response(5, "Awesome download!")
        self.assertIn("5-star", resp)

if __name__ == "__main__":
    unittest.main()
