"""
Base AI Agent Class for Digital Products House Agent Swarm Architecture
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List

class BaseAIAgent(ABC):
    def __init__(self, agent_name: str, role: str):
        self.agent_name = agent_name
        self.role = role

    @abstractmethod
    def execute(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Executes agent-specific task payload and returns updated state result."""
        pass
