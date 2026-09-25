from pydantic import BaseModel, ConfigDict
from datetime import datetime


class SalesOrderItemCreate(BaseModel):
    product_id: int
    quantity: int
    unit_price: float


class SalesOrderCreate(BaseModel):
    order_number: str
    customer_id: int
    warehouse_id: int
    items: list[SalesOrderItemCreate]


class SalesOrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float
    subtotal: float

    model_config = ConfigDict(from_attributes=True)


class SalesOrderResponse(BaseModel):
    id: int
    order_number: str
    customer_id: int
    warehouse_id: int
    status: str
    total_amount: float
    order_date: datetime
    items: list[SalesOrderItemResponse] = []

    model_config = ConfigDict(from_attributes=True)