from pydantic import BaseModel, Field
from typing import List, Optional

class QueryRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=5000)
    top_k: int = Field(default=5, ge=1, le=50)

class QueryResponse(BaseModel):
    answer: str
    sources: Optional[List[str]] = None

class IngestJobRequest(BaseModel):
    file_path: str = Field(..., min_length=1, max_length=255)
