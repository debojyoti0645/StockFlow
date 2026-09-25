from pydantic import BaseModel, ConfigDict
from datetime import datetime


class StockTransferItemCreate(BaseModel):
    product_id: int
    quantity: int


class StockTransferCreate(BaseModel):
    transfer_number: str
    source_warehouse_id: int
    destination_warehouse_id: int
    items: list[StockTransferItemCreate]
    notes: str | None = None


class StockTransferItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int

    model_config = ConfigDict(from_attributes=True)


class StockTransferResponse(BaseModel):
    id: int
    transfer_number: str
    source_warehouse_id: int
    destination_warehouse_id: int
    status: str
    transfer_date: datetime
    notes: str | None = None
    items: list[StockTransferItemResponse] = []

    model_config = ConfigDict(from_attributes=True)