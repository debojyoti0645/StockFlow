from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.warehouse import Warehouse
from app.models.user import User

from app.schemas.warehouse import (
    WarehouseCreate,
    WarehouseUpdate,
    WarehouseResponse
)

from app.api.dependencies import get_current_user


router = APIRouter(
    prefix="/warehouses",
    tags=["Warehouses"]
)


@router.post(
    "/",
    response_model=WarehouseResponse,
    status_code=status.HTTP_201_CREATED
)
def create_warehouse(
    data: WarehouseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    warehouse = Warehouse(
        name=data.name,
        location=data.location,
        manager_name=data.manager_name
    )

    db.add(warehouse)
    db.commit()
    db.refresh(warehouse)

    return warehouse


@router.get(
    "/",
    response_model=list[WarehouseResponse]
)
def list_warehouses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Warehouse).order_by(
        Warehouse.id
    ).all()


@router.get(
    "/{warehouse_id}",
    response_model=WarehouseResponse
)
def get_warehouse(
    warehouse_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    warehouse = db.query(Warehouse).filter(
        Warehouse.id == warehouse_id
    ).first()

    if not warehouse:
        raise HTTPException(
            status_code=404,
            detail="Warehouse not found"
        )

    return warehouse


@router.put(
    "/{warehouse_id}",
    response_model=WarehouseResponse
)
def update_warehouse(
    warehouse_id: int,
    data: WarehouseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    warehouse = db.query(Warehouse).filter(
        Warehouse.id == warehouse_id
    ).first()

    if not warehouse:
        raise HTTPException(
            status_code=404,
            detail="Warehouse not found"
        )

    if data.name is not None:
        warehouse.name = data.name

    if data.location is not None:
        warehouse.location = data.location

    if data.manager_name is not None:
        warehouse.manager_name = data.manager_name

    db.commit()
    db.refresh(warehouse)

    return warehouse


@router.delete("/{warehouse_id}")
def delete_warehouse(
    warehouse_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    warehouse = db.query(Warehouse).filter(
        Warehouse.id == warehouse_id
    ).first()

    if not warehouse:
        raise HTTPException(
            status_code=404,
            detail="Warehouse not found"
        )

    db.delete(warehouse)
    db.commit()

    return {
        "message": "Warehouse deleted successfully"
    }