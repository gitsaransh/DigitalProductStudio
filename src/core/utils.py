"""
Utilities, Retry Decorators & Security Sanitization for Digital Product Studio
"""

import time
import logging
import functools
import re
from typing import Callable, Any

# Setup structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("DigitalProductStudio")

def retry_with_backoff(retries: int = 3, backoff_in_seconds: float = 1.0) -> Callable:
    """
    Decorator for retrying network/API calls with exponential backoff.
    """
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            x = 0
            while True:
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if x == retries:
                        logger.error(f"Function {func.__name__} failed after {retries} retries. Error: {e}")
                        raise e
                    sleep_time = backoff_in_seconds * (2 ** x)
                    logger.warning(f"Function {func.__name__} failed ({e}). Retrying in {sleep_time:.1f}s...")
                    time.sleep(sleep_time)
                    x += 1
        return wrapper
    return decorator

def sanitize_input(text: str) -> str:
    """
    Sanitizes string inputs to prevent SQL Injection patterns and XSS script tags.
    """
    if not isinstance(text, str):
        return ""
    # Strip dangerous HTML script/iframe tags
    text = re.sub(r'<script.*?>.*?</script>', '', text, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r'<iframe.*?>.*?</iframe>', '', text, flags=re.DOTALL | re.IGNORECASE)
    # Strip SQL injection comment sequences
    text = text.replace("--", "").replace(";", "")
    return text.strip()
