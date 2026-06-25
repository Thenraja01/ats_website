from fastapi import APIRouter, HTTPException, UploadFile, File, Depends, Request
from app.schemas.rag_schemas import QueryRequest, QueryResponse, IngestJobRequest
from app.services import rag
from app.schemas.resume_schemas import AnalyzeRequest, ATSResult
from app.parsers.resume_parser import extract_text_from_pdf, extract_text_from_docx
from app.services.ats_service import run_ats_pipeline
from datetime import datetime, timedelta, timezone
from app.models.upload_model import UploadRecord
from app.dependencies.auth_dependency import get_optional_current_user
from app.models.user_model import User

api_router = APIRouter()

LIMITS = {
    "guest": 1,
    "candidate": 3,
    "recruiter": 999999
}

@api_router.get("/health")
def health_check():
    return {"status": "ok"}

@api_router.post("/rag/ingest")
def ingest_data(request: IngestJobRequest):
    try:
        num_chunks = rag.ingest_csv_data(request.file_path)
        return {"status": "success", "chunks_ingested": num_chunks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/rag/query", response_model=QueryResponse)
def query_data(request: QueryRequest):
    try:
        result = rag.query_rag(request.query, request.top_k)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/resume/upload")
async def upload_resume(
    request: Request,
    file: UploadFile = File(...),
    current_user: User = Depends(get_optional_current_user)
):
    try:
        # Determine limit based on role
        role = "guest"
        user_id = None
        ip_address = request.client.host if request.client else None
        
        if current_user:
            role = current_user.role
            user_id = str(current_user.id)
            
        limit = LIMITS.get(role, 0)
        
        # Check upload counts for today
        start_of_day = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        
        if role == "guest":
            upload_count = await UploadRecord.find(
                UploadRecord.ip_address == ip_address,
                UploadRecord.created_at >= start_of_day
            ).count()
        else:
            upload_count = await UploadRecord.find(
                UploadRecord.user_id == user_id,
                UploadRecord.created_at >= start_of_day
            ).count()
            
        if upload_count >= limit:
            raise HTTPException(
                status_code=429, 
                detail=f"Daily upload limit reached for {role}. Limit: {limit}"
            )
            
        # Proceed with upload extraction
        contents = await file.read()
        if file.filename.endswith(".pdf"):
            text = extract_text_from_pdf(contents)
        elif file.filename.endswith(".docx"):
            text = extract_text_from_docx(contents)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format")
            
        # Record successful upload
        await UploadRecord(user_id=user_id, ip_address=ip_address).insert()
            
        return {"filename": file.filename, "extracted_text": text}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/resume/analyze", response_model=ATSResult)
def analyze_resume(request: AnalyzeRequest):
    try:
        result = run_ats_pipeline(request.resume_text, request.jd_text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/login")
def login(request: AnalyzeRequest):
    return {"message": "Login successful"}