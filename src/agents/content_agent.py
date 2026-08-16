"""
Content Agent - Generates descriptions, feature highlights, and instruction guides.
"""

from typing import Dict, Any
from src.agents.base_agent import BaseAIAgent

class ContentAgent(BaseAIAgent):
    def __init__(self):
        super().__init__("Content Agent", "Copywriting & Instructional Content Generation")

    def execute(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        title = payload.get("title", "Digital Asset")
        category = payload.get("category", "Templates")

        copy = f"#{title}\n\nPremium digital resource designed by Digital Products House."
        payload["description"] = copy
        payload["content_status"] = "generated"
        return payload
