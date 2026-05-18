"""Application logger configuration."""

import logging
import sys
from pathlib import Path

# Create logs directory
LOG_DIR = Path(__file__).resolve().parent.parent.parent / "logs"
LOG_DIR.mkdir(parents=True, exist_ok=True)

# Configure logger
logger = logging.getLogger("ats_app")
logger.setLevel(logging.DEBUG)

# File handler
file_handler = logging.FileHandler(LOG_DIR / "app.log")
file_handler.setLevel(logging.DEBUG)

# Console handler
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setLevel(logging.INFO)

# Formatter
formatter = logging.Formatter(
    "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
file_handler.setFormatter(formatter)
console_handler.setFormatter(formatter)

# Add handlers
logger.addHandler(file_handler)
logger.addHandler(console_handler)


def get_logger(name: str) -> logging.Logger:
    """Get logger instance."""
    return logging.getLogger(f"ats_app.{name}")
