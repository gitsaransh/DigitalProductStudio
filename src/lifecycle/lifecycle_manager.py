"""
Product Lifecycle State Machine & History Tracker
Governs transitions across 9 states:
Idea -> Research -> Generating -> Review -> Approved -> Published -> Scaling -> Updating -> Retired
"""

import time
from typing import Dict, Any, List, Optional
from src.core.database import ProductDatabase

VALID_STATES = [
    "idea",
    "research",
    "generating",
    "review",
    "approved",
    "published",
    "scaling",
    "updating",
    "retired"
]

TRANSITION_MAP = {
    "idea": ["research", "retired"],
    "research": ["generating", "idea", "retired"],
    "generating": ["review", "research", "retired"],
    "review": ["approved", "generating", "retired"],
    "approved": ["published", "updating", "retired"],
    "published": ["scaling", "updating", "retired"],
    "scaling": ["updating", "retired"],
    "updating": ["review", "published", "retired"],
    "retired": ["idea"] # Can reactivate from idea phase
}

class ProductLifecycleManager:
    def __init__(self, db: Optional[ProductDatabase] = None):
        self.db = db or ProductDatabase()

    def transition_state(self, product_id: str, new_state: str, actor: str = "AI COO", notes: str = "") -> Dict[str, Any]:
        """Validates state machine rules and transitions product to new state with history logging."""
        new_state = new_state.lower().strip()
        if new_state not in VALID_STATES:
            raise ValueError(f"Invalid lifecycle state '{new_state}'. Allowed: {VALID_STATES}")

        product = self.db.get_product(product_id)
        if not product:
            raise ValueError(f"Product {product_id} not found")

        current_state = product.get("lifecycle_state", product.get("status", "idea"))
        allowed_next = TRANSITION_MAP.get(current_state, [])

        if new_state not in allowed_next and new_state != current_state:
            print(f"[Warning] Forced transition from {current_state} -> {new_state}")

        history = product.get("lifecycle_history", [])
        history.append({
            "from_state": current_state,
            "to_state": new_state,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "actor": actor,
            "notes": notes or f"Transitioned from {current_state} to {new_state}"
        })

        product["lifecycle_state"] = new_state
        # Keep status in sync for backward compatibility with existing queries.
        # Faithful mapping — does not collapse granular states to "draft" (D-009).
        if new_state in ("published", "scaling"):
            product["status"] = "published"
        elif new_state == "approved":
            product["status"] = "approved"
        elif new_state == "review":
            product["status"] = "pending_approval"
        elif new_state == "retired":
            product["status"] = "retired"
        else:
            # idea, research, generating, updating → use lifecycle_state as status
            product["status"] = new_state
        product["lifecycle_history"] = history
        product["updated_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ")

        self.db.upsert_product(product)
        print(f"[Lifecycle] Product '{product['title'][:30]}' [{product_id[:8]}] Moved: {current_state.upper()} -> {new_state.upper()}")
        return product

    def get_products_by_state(self, state: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Returns list of products currently in specified lifecycle state."""
        all_products = self.db.list_products(limit=500)
        return [p for p in all_products if p.get("lifecycle_state", p.get("status")) == state][:limit]
