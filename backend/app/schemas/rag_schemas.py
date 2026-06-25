from pydantic import BaseModel
from typing import List, Optional

class QueryRequest(BaseModel):
    query: str
    top_k: int = 5

class QueryResponse(BaseModel):
    answer: str
    sources: Optional[List[str]] = None

class IngestJobRequest(BaseModel):
    file_path: str = "../data/jobs.csv"
