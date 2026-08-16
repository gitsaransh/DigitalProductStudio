"""
Data Provenance & Source Attribution Standard for Digital Products House
Enforces strict zero-fabrication real-world data rules across all metrics, reports, and UI widgets.
"""

from enum import Enum
from typing import Dict, Any, Optional

class DataSource(Enum):
    LIVE_API = "Live API"
    INTERNAL_DB = "Internal Database"
    USER_INPUT = "User Input"
    ESTIMATED = "Estimated"
    NOT_CONNECTED = "Not Connected"
    AWAITING_INTEGRATION = "Awaiting Integration"

def format_metric_with_source(
    value: Any,
    source: DataSource,
    unit: str = "",
    not_connected_message: str = "Awaiting Integration"
) -> Dict[str, Any]:
    """
    Wraps any business metric with mandatory data source provenance.
    If source is NOT_CONNECTED or value is None, displays clean real-world state.
    """
    is_connected = source not in [DataSource.NOT_CONNECTED, DataSource.AWAITING_INTEGRATION]
    
    if not is_connected or value is None:
        display_val = not_connected_message
    elif source == DataSource.ESTIMATED:
        display_val = f"ESTIMATED: {unit}{value}" if unit else f"ESTIMATED: {value}"
    else:
        display_val = f"{unit}{value}" if unit else str(value)

    return {
        "value": value if is_connected else None,
        "display_value": display_val,
        "source": source.value,
        "is_connected": is_connected,
        "is_estimated": source == DataSource.ESTIMATED
    }
