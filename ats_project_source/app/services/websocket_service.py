"""WebSocket service for real-time communication."""

from typing import Set
from app.utils.logger import get_logger

logger = get_logger(__name__)


class WebSocketService:
    """Manage WebSocket connections."""

    def __init__(self):
        """Initialize WebSocket service."""
        self.active_connections: Set[str] = set()

    async def connect(self, client_id: str) -> None:
        """Handle client connection."""
        self.active_connections.add(client_id)
        logger.info(f"Client connected: {client_id}")

    async def disconnect(self, client_id: str) -> None:
        """Handle client disconnection."""
        self.active_connections.discard(client_id)
        logger.info(f"Client disconnected: {client_id}")

    async def send_progress(self, client_id: str, progress: int) -> None:
        """Send progress update to client."""
        logger.debug(f"Sending progress to {client_id}: {progress}%")
