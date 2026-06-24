from pydantic import BaseModel
from typing import Optional

class DocumentInput(BaseModel):
    document_id: str
    text_content: str
    metadata: Optional[dict] = None
