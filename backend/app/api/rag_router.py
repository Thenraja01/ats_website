"""RAG router — CSV ingestion and RAG query endpoints."""

from fastapi import APIRouter, HTTPException

from app.schemas.rag_schemas import QueryRequest, QueryResponse, IngestJobRequest
from app.services.rag_service import ingest_csv_data, query_rag
from app.utils.logger import get_logger

logger = get_logger(__name__)

rag_router = APIRouter(prefix="/rag", tags=["RAG"])


@rag_router.post("/ingest")
def ingest_data(request: IngestJobRequest):
    """Ingest a CSV file into the ChromaDB vector store."""
    try:
        num_chunks = ingest_csv_data(request.file_path)
        return {"status": "success", "chunks_ingested": num_chunks}
    except Exception as e:
        logger.error(f"Ingest error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@rag_router.post("/query", response_model=QueryResponse)
def query_data(request: QueryRequest):
    """Query the RAG pipeline for ATS-related answers."""
    try:
        result = query_rag(request.query, request.top_k)
        return result
    except Exception as e:
        logger.error(f"RAG query error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
