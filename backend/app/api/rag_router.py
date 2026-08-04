"""RAG router — CSV ingestion and RAG query endpoints."""

from fastapi import APIRouter, HTTPException
from typing import Optional
from pydantic import BaseModel

from app.schemas.rag_schemas import QueryRequest, QueryResponse, IngestJobRequest
from app.services.rag_service import ingest_csv_data, query_rag
from app.utils.logger import get_logger

logger = get_logger(__name__)

rag_router = APIRouter(prefix="/rag", tags=["RAG"])

# Directory under which CSV files are allowed to be ingested.
ALLOWED_INGEST_DIR = "/app/data"


def _validate_file_path(file_path: str) -> str:
    """Ensure the requested file path is inside the allowed directory."""
    import os

    allowed_base = os.path.realpath(ALLOWED_INGEST_DIR)
    resolved = os.path.realpath(file_path)

    if not resolved.startswith(allowed_base + os.sep) and resolved != allowed_base:
        raise HTTPException(
            status_code=400,
            detail="Access to the requested file is not permitted",
        )

    if not os.path.isfile(resolved):
        raise HTTPException(status_code=404, detail="File not found")

    return resolved


@rag_router.post("/ingest")
def ingest_data(request: IngestJobRequest):
    """Ingest a CSV file into the ChromaDB vector store."""
    try:
        safe_path = _validate_file_path(request.file_path)
        num_chunks = ingest_csv_data(safe_path)
        return {"status": "success", "chunks_ingested": num_chunks}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ingest error: {e}")
        raise HTTPException(status_code=500, detail="An internal error occurred")


@rag_router.post("/query", response_model=QueryResponse)
def query_data(request: QueryRequest):
    """Query the RAG pipeline for ATS-related answers."""
    try:
        result = query_rag(request.query, request.top_k)
        return result
    except Exception as e:
        logger.error(f"RAG query error: {e}")
        raise HTTPException(status_code=500, detail="An internal error occurred")
