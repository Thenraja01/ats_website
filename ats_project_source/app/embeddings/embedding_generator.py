"""Embedding generation utilities using HF or local models."""
from typing import List
from app.utils.logger import get_logger

logger = get_logger(__name__)


class EmbeddingGenerator:
    """Generate embeddings for texts using configured model."""

    def __init__(self, model_name: str = None):
        self.model_name = model_name or "BAAI/bge-large-en-v1.5"

    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        """Return embeddings for a list of texts. Placeholder implementation."""
        # TODO: integrate sentence-transformers or HF embeddings
        logger.info(f"Embedding {len(texts)} texts using {self.model_name}")
        return [[0.0] * 768 for _ in texts]

    def embed_text(self, text: str) -> List[float]:
        return self.embed_texts([text])[0]
