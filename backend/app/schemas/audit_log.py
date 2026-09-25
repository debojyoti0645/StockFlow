from pydantic import BaseModel, ConfigDict
from datetime import datetime


class AuditLogCreate(BaseModel):
    action: str
    entity_type: str
    entity_id: int | None = None
    description: str | None = None


class AuditLogResponse(BaseModel):
    id: int
    user_id: int | None = None
    action: str
    entity_type: str
    entity_id: int | None = None
    description: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)