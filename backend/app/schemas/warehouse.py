from pydantic import BaseModel, ConfigDict


class WarehouseCreate(BaseModel):
    name: str
    location: str | None = None
    manager_name: str | None = None


class WarehouseUpdate(BaseModel):
    name: str | None = None
    location: str | None = None
    manager_name: str | None = None


class WarehouseResponse(BaseModel):
    id: int
    name: str
    location: str | None = None
    manager_name: str | None = None

    model_config = ConfigDict(from_attributes=True)