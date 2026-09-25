from pydantic import BaseModel, ConfigDict
from datetime import date, datetime


class SalesForecastCreate(BaseModel):
    product_id: int
    forecast_date: date
    predicted_quantity: float


class SalesForecastResponse(BaseModel):
    id: int
    product_id: int
    forecast_date: date
    predicted_quantity: float
    actual_quantity: float | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)