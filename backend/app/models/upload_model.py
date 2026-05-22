from beanie import Document
from datetime import datetime
from pydantic import Field
from typing import Optional

class UploadRecord(Document):
    user_id: Optional[str] = None # None for guests
    ip_address: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "upload_records"
