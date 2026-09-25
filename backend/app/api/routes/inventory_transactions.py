from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.dependencies import get_current_user

from app.models.inventory_transaction import InventoryTransaction
from app.models.product import Product
from app.models.warehouse import Warehouse

from app.schemas.inventory_transaction import (
    InventoryTransactionCreate,
    InventoryTransactionResponse
)


router = APIRouter(
    prefix="/inventory-transactions",
    tags=["Inventory Transactions"]
)


@router.post(
    "/",
    response_model=InventoryTransactionResponse
)
def create_transaction(
    transaction_data: InventoryTransactionCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    product = db.query(Product).filter(
        Product.id == transaction_data.product_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    warehouse = db.query(Warehouse).filter(
        Warehouse.id == transaction_data.warehouse_id
    ).first()

    if not warehouse:
        raise HTTPException(
            status_code=404,
            detail="Warehouse not found"
        )

    if transaction_data.quantity <= 0:
        raise HTTPException(
            status_code=400,
            detail="Quantity must be greater than 0"
        )

    transaction = InventoryTransaction(
        product_id=transaction_data.product_id,
        warehouse_id=transaction_data.warehouse_id,
        transaction_type=transaction_data.transaction_type,
        quantity=transaction_data.quantity,
        reference=transaction_data.reference,
        notes=transaction_data.notes
    )

    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    return transaction


@router.get(
    "/",
    response_model=list[InventoryTransactionResponse]
)
def get_transactions(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return db.query(
        InventoryTransaction
    ).order_by(
        InventoryTransaction.id.desc()
    ).all()


@router.get(
    "/{transaction_id}",
    response_model=InventoryTransactionResponse
)
def get_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    transaction = db.query(
        InventoryTransaction
    ).filter(
        InventoryTransaction.id == transaction_id
    ).first()

    if not transaction:
        raise HTTPException(
            status_code=404,
            detail="Inventory transaction not found"
        )

    return transaction