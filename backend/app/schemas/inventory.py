from pydantic import BaseModel, ConfigDict


class InventoryCreate(BaseModel):
    product_id: int
    warehouse_id: int
    quantity: int = 0
    reserved_quantity: int = 0


class InventoryUpdate(BaseModel):
    quantity: int | None = None
    reserved_quantity: int | None = None


class InventoryResponse(BaseModel):
    id: int
    product_id: int
    warehouse_id: int
    quantity: int
    reserved_quantity: int

    model_config = ConfigDict(from_attributes=True)