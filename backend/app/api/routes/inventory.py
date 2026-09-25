from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db

from app.models.inventory import Inventory
from app.models.product import Product
from app.models.warehouse import Warehouse
from app.models.user import User

from app.schemas.inventory import (
    InventoryCreate,
    InventoryUpdate,
    InventoryResponse
)

from app.api.dependencies import get_current_user


router = APIRouter(
    prefix="/inventory",
    tags=["Inventory"]
)


@router.post(
    "/",
    response_model=InventoryResponse,
    status_code=status.HTTP_201_CREATED
)
def create_inventory(
    data: InventoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    product = db.query(Product).filter(
        Product.id == data.product_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    warehouse = db.query(Warehouse).filter(
        Warehouse.id == data.warehouse_id
    ).first()

    if not warehouse:
        raise HTTPException(
            status_code=404,
            detail="Warehouse not found"
        )

    existing = db.query(Inventory).filter(
        Inventory.product_id == data.product_id,
        Inventory.warehouse_id == data.warehouse_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Inventory already exists for this product and warehouse"
        )

    if data.quantity < 0:
        raise HTTPException(
            status_code=400,
            detail="Quantity cannot be negative"
        )

    if data.reserved_quantity < 0:
        raise HTTPException(
            status_code=400,
            detail="Reserved quantity cannot be negative"
        )

    if data.reserved_quantity > data.quantity:
        raise HTTPException(
            status_code=400,
            detail="Reserved quantity cannot exceed quantity"
        )

    inventory = Inventory(
        product_id=data.product_id,
        warehouse_id=data.warehouse_id,
        quantity=data.quantity,
        reserved_quantity=data.reserved_quantity
    )

    db.add(inventory)
    db.commit()
    db.refresh(inventory)

    return inventory


@router.get(
    "/",
    response_model=list[InventoryResponse]
)
def list_inventory(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Inventory).order_by(
        Inventory.id
    ).all()


@router.get(
    "/{inventory_id}",
    response_model=InventoryResponse
)
def get_inventory(
    inventory_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    inventory = db.query(Inventory).filter(
        Inventory.id == inventory_id
    ).first()

    if not inventory:
        raise HTTPException(
            status_code=404,
            detail="Inventory record not found"
        )

    return inventory


@router.put(
    "/{inventory_id}",
    response_model=InventoryResponse
)
def update_inventory(
    inventory_id: int,
    data: InventoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    inventory = db.query(Inventory).filter(
        Inventory.id == inventory_id
    ).first()

    if not inventory:
        raise HTTPException(
            status_code=404,
            detail="Inventory record not found"
        )

    new_quantity = inventory.quantity
    new_reserved = inventory.reserved_quantity

    if data.quantity is not None:
        new_quantity = data.quantity

    if data.reserved_quantity is not None:
        new_reserved = data.reserved_quantity

    if new_quantity < 0:
        raise HTTPException(
            status_code=400,
            detail="Quantity cannot be negative"
        )

    if new_reserved < 0:
        raise HTTPException(
            status_code=400,
            detail="Reserved quantity cannot be negative"
        )

    if new_reserved > new_quantity:
        raise HTTPException(
            status_code=400,
            detail="Reserved quantity cannot exceed quantity"
        )

    inventory.quantity = new_quantity
    inventory.reserved_quantity = new_reserved

    db.commit()
    db.refresh(inventory)

    return inventory


@router.delete("/{inventory_id}")
def delete_inventory(
    inventory_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    inventory = db.query(Inventory).filter(
        Inventory.id == inventory_id
    ).first()

    if not inventory:
        raise HTTPException(
            status_code=404,
            detail="Inventory record not found"
        )

    db.delete(inventory)
    db.commit()

    return {
        "message": "Inventory record deleted successfully"
    }