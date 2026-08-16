"""
Thumbnail Agent - Multi-device graphic composition & watermarking.
"""

from typing import Dict, Any
from src.agents.base_agent import BaseAIAgent
from src.media.thumbnail_generator import ThumbnailGenerator

class ThumbnailAgent(BaseAIAgent):
    def __init__(self):
        super().__init__("Thumbnail Agent", "Automated Listing Slide & Mockup Generation")
        self.generator = ThumbnailGenerator()

    def execute(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        output_dir = f"./catalog/active/{payload.get('id', 'temp')}/previews"
        previews = self.generator.generate_all_cards(payload, output_dir)
        payload["previews"] = previews
        return payload
