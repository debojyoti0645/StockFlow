from pydantic import BaseModel, ConfigDict


class ProductCreate(BaseModel):
    name: str
    description: str | None = None
    price: float
    reorder_level: int = 10
    category_id: int


class ProductUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    price: float | None = None
    reorder_level: int | None = None
    category_id: int | None = None


class ProductResponse(BaseModel):
    id: int
    name: str
    sku: str
    description: str | None = None
    price: float
    reorder_level: int
    category_id: int

    model_config = ConfigDict(from_attributes=True)