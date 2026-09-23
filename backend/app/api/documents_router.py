"""Documents router — categorized document library with version tracking."""

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict

from app.dependencies.role_dependency import require_roles
from app.models.user_model import User
from app.models.career_model import to_camel
from app.models.document_model import DocumentRecord

documents_router = APIRouter(prefix="/documents", tags=["Documents"])

CATEGORIES = [
    "Resume", "Certificate", "Job Description", "Cover Letter",
    "Offer Letter", "Portfolio", "Other",
]


class DocumentCreate(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, extra="ignore")

    category: str = "Other"
    name: str
    description: str = ""
    filename: Optional[str] = None
    file_type: str = "note"
    size: Optional[int] = None
    url: Optional[str] = None


class DocumentUpdate(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, extra="ignore")

    category: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    filename: Optional[str] = None
    file_type: Optional[str] = None
    size: Optional[int] = None
    url: Optional[str] = None


@documents_router.get("/categories")
async def categories():
    return CATEGORIES


@documents_router.get("")
async def list_documents(category: str = "", user: User = Depends(require_roles(["candidate"]))):
    query = DocumentRecord.find(DocumentRecord.user_id == str(user.id))
    if category and category != "All":
        query = query.find(DocumentRecord.category == category)
    docs = await query.sort(-DocumentRecord.created_at).to_list()
    return [d.to_api_dict() for d in docs]


@documents_router.post("")
async def create_document(payload: DocumentCreate, user: User = Depends(require_roles(["candidate"]))):
    doc = DocumentRecord(
        user_id=str(user.id),
        category=payload.category,
        name=payload.name or "Untitled",
        description=payload.description,
        filename=payload.filename,
        file_type=payload.file_type,
        size=payload.size,
        url=payload.url,
    )
    await doc.insert()
    return doc.to_api_dict()


@documents_router.put("/{document_id}")
async def update_document(
    document_id: str,
    payload: DocumentUpdate,
    user: User = Depends(require_roles(["candidate"])),
):
    doc = await DocumentRecord.get(document_id)
    if not doc or doc.user_id != str(user.id):
        raise HTTPException(status_code=404, detail="Document not found")
    for field in ["category", "name", "description", "filename", "file_type", "size", "url"]:
        value = getattr(payload, field)
        if value is not None:
            setattr(doc, field, value)
    doc.updated_at = datetime.utcnow()
    await doc.save()
    return doc.to_api_dict()


@documents_router.delete("/{document_id}")
async def delete_document(document_id: str, user: User = Depends(require_roles(["candidate"]))):
    doc = await DocumentRecord.get(document_id)
    if not doc or doc.user_id != str(user.id):
        raise HTTPException(status_code=404, detail="Document not found")
    await doc.delete()
    return {"message": "Document deleted"}