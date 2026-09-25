from pydantic import BaseModel, ConfigDict


class SupplierProductCreate(BaseModel):
    supplier_id: int
    product_id: int
    supplier_price: float


class SupplierProductUpdate(BaseModel):
    supplier_price: float


class SupplierProductResponse(BaseModel):
    id: int
    supplier_id: int
    product_id: int
    supplier_price: float

    model_config = ConfigDict(from_attributes=True)