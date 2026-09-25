from pydantic import BaseModel, ConfigDict
from datetime import datetime


class PurchaseOrderItemCreate(BaseModel):
    product_id: int
    quantity: int
    unit_price: float


class PurchaseOrderCreate(BaseModel):
    po_number: str
    supplier_id: int
    warehouse_id: int
    items: list[PurchaseOrderItemCreate]


class PurchaseOrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float
    subtotal: float

    model_config = ConfigDict(from_attributes=True)


class PurchaseOrderResponse(BaseModel):
    id: int
    po_number: str
    supplier_id: int
    warehouse_id: int
    status: str
    total_amount: float
    order_date: datetime
    items: list[PurchaseOrderItemResponse] = []

    model_config = ConfigDict(from_attributes=True)