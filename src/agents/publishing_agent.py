"""
Publishing Agent - Multi-marketplace publishing trigger & sync manager.
"""

from typing import Dict, Any
from src.agents.base_agent import BaseAIAgent
from src.approvals.approval_manager import ApprovalManager

class PublishingAgent(BaseAIAgent):
    def __init__(self):
        super().__init__("Publishing Agent", "Multi-Marketplace Adapter Execution")
        self.approval_mgr = ApprovalManager()

    def execute(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        p_id = payload.get("id")
        if p_id:
            return self.approval_mgr.approve_and_publish(p_id)
        return payload
