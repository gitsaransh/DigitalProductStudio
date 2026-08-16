"""
Support Agent - Handles buyer FAQs, instant download troubleshooting responses, and review thank-you notes.
"""

from typing import Dict, Any
from src.agents.base_agent import BaseAIAgent

class SupportAgent(BaseAIAgent):
    def __init__(self):
        super().__init__("Support Agent", "Automated Buyer Assistance & Review Response Management")

    def execute(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        payload["support_template"] = "Thank you for purchasing! Your download link is ready in your account."
        return payload

    def generate_review_response(self, rating: int, comment: str) -> str:
        if rating >= 4:
            return "Thank you so much for your 5-star review! We're thrilled you love your digital download."
        return "Thank you for your feedback! Please reach out to our support team so we can assist you right away."
