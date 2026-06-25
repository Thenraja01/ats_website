"""Vector store wrapper for ChromaDB (placeholder).

Provides simple store and query functions to be replaced with real ChromaDB client.
"""
from typing import List, Dict
from app.utils.logger import get_logger

logger = get_logger(__name__)


class VectorStore:
    """Simple in-memory vector store placeholder."""

    def __init__(self, persist_path: str = None):
        self.persist_path = persist_path
        self._store = []  # list of dicts: {id, text, vector, metadata}

    def add_documents(self, docs: List[Dict]) -> None:
        logger.info(f"Adding {len(docs)} documents to vector store")
        for d in docs:
            self._store.append(d)

    def query(self, vector, top_k: int = 5):
        # Placeholder: return first top_k docs
        logger.debug("Querying vector store (placeholder)")
        return self._store[:top_k]

    def persist(self):
        logger.info("Persisting vector store (placeholder)")

    def load(self):
        logger.info("Loading vector store (placeholder)")
