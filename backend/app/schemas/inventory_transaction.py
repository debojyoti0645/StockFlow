from pydantic import BaseModel, ConfigDict
from datetime import datetime


class InventoryTransactionCreate(BaseModel):
    product_id: int
    warehouse_id: int
    transaction_type: str
    quantity: int
    reference: str | None = None
    notes: str | None = None


class InventoryTransactionResponse(BaseModel):
    id: int
    product_id: int
    warehouse_id: int
    transaction_type: str
    quantity: int
    reference: str | None = None
    notes: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)