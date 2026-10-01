from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.dependencies import get_current_user

from fastapi import HTTPException
from app.models.inventory import Inventory
from app.models.inventory_transaction import InventoryTransaction

from app.models.stock_transfer import StockTransfer
from app.models.stock_transfer_item import StockTransferItem
from app.models.warehouse import Warehouse
from app.models.product import Product

from app.services.inventory_service import check_low_stock
from app.services.audit_service import create_audit_log

from app.schemas.stock_transfer import (
    StockTransferCreate,
    StockTransferResponse
)


router = APIRouter(
    prefix="/stock-transfers",
    tags=["Stock Transfers"]
)


@router.post(
    "/",
    response_model=StockTransferResponse
)
def create_stock_transfer(
    transfer_data: StockTransferCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    existing_transfer = db.query(StockTransfer).filter(
        StockTransfer.transfer_number
        == transfer_data.transfer_number
    ).first()

    if existing_transfer:
        raise HTTPException(
            status_code=400,
            detail="Transfer number already exists"
        )

    if (
        transfer_data.source_warehouse_id
        == transfer_data.destination_warehouse_id
    ):
        raise HTTPException(
            status_code=400,
            detail="Source and destination warehouses must be different"
        )

    source = db.query(Warehouse).filter(
        Warehouse.id == transfer_data.source_warehouse_id
    ).first()

    if not source:
        raise HTTPException(
            status_code=404,
            detail="Source warehouse not found"
        )

    destination = db.query(Warehouse).filter(
        Warehouse.id == transfer_data.destination_warehouse_id
    ).first()

    if not destination:
        raise HTTPException(
            status_code=404,
            detail="Destination warehouse not found"
        )

    if not transfer_data.items:
        raise HTTPException(
            status_code=400,
            detail="Transfer must contain at least one item"
        )

    transfer = StockTransfer(
        transfer_number=transfer_data.transfer_number,
        source_warehouse_id=transfer_data.source_warehouse_id,
        destination_warehouse_id=transfer_data.destination_warehouse_id,
        status="PENDING",
        notes=transfer_data.notes
    )

    db.add(transfer)
    db.flush()

    for item in transfer_data.items:

        if item.quantity <= 0:
            raise HTTPException(
                status_code=400,
                detail="Quantity must be greater than 0"
            )

        product = db.query(Product).filter(
            Product.id == item.product_id
        ).first()

        if not product:
            raise HTTPException(
                status_code=404,
                detail=f"Product {item.product_id} not found"
            )

        transfer_item = StockTransferItem(
            transfer_id=transfer.id,
            product_id=item.product_id,
            quantity=item.quantity
        )

        db.add(transfer_item)

    db.commit()
    db.refresh(transfer)

    return transfer


@router.get(
    "/",
    response_model=list[StockTransferResponse]
)
def get_stock_transfers(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    return db.query(
        StockTransfer
    ).order_by(
        StockTransfer.id.desc()
    ).all()


@router.get(
    "/{transfer_id}",
    response_model=StockTransferResponse
)
def get_stock_transfer(
    transfer_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    transfer = db.query(StockTransfer).filter(
        StockTransfer.id == transfer_id
    ).first()

    if not transfer:
        raise HTTPException(
            status_code=404,
            detail="Stock transfer not found"
        )

    return transfer

@router.post("/{transfer_id}/complete")
def complete_stock_transfer(
    transfer_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    transfer = (
        db.query(StockTransfer)
        .filter(StockTransfer.id == transfer_id)
        .first()
    )

    if not transfer:
        raise HTTPException(
            status_code=404,
            detail="Stock transfer not found"
        )

    if transfer.status == "COMPLETED":
        raise HTTPException(
            status_code=400,
            detail="Stock transfer is already completed"
        )

    for item in transfer.items:

        source_inventory = (
            db.query(Inventory)
            .filter(
                Inventory.product_id == item.product_id,
                Inventory.warehouse_id == transfer.source_warehouse_id
            )
            .first()
        )

        if not source_inventory:
            raise HTTPException(
                status_code=404,
                detail=f"Source inventory not found for product {item.product_id}"
            )

        available_quantity = (
            source_inventory.quantity -
            source_inventory.reserved_quantity
        )

        if available_quantity < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Not enough stock for product {item.product_id}"
            )

        destination_inventory = (
            db.query(Inventory)
            .filter(
                Inventory.product_id == item.product_id,
                Inventory.warehouse_id == transfer.destination_warehouse_id
            )
            .first()
        )

        if not destination_inventory:
            destination_inventory = Inventory(
                product_id=item.product_id,
                warehouse_id=transfer.destination_warehouse_id,
                quantity=0,
                reserved_quantity=0
            )

            db.add(destination_inventory)
            db.flush()

        source_inventory.quantity -= item.quantity
        
        check_low_stock(db, source_inventory)

        destination_inventory.quantity += item.quantity

        transfer_out = InventoryTransaction(
            product_id=item.product_id,
            warehouse_id=transfer.source_warehouse_id,
            transaction_type="TRANSFER_OUT",
            quantity=item.quantity,
            reference=transfer.transfer_number,
            notes=f"Stock transferred to warehouse {transfer.destination_warehouse_id}"
        )

        transfer_in = InventoryTransaction(
            product_id=item.product_id,
            warehouse_id=transfer.destination_warehouse_id,
            transaction_type="TRANSFER_IN",
            quantity=item.quantity,
            reference=transfer.transfer_number,
            notes=f"Stock received from warehouse {transfer.source_warehouse_id}"
        )

        db.add(transfer_out)
        db.add(transfer_in)

    transfer.status = "COMPLETED"

    create_audit_log(
        db=db,
        user_id=current_user.id,
        action="COMPLETE",
        entity_type="STOCK_TRANSFER",
        entity_id=transfer.id,
        description=f"Completed stock transfer {transfer.transfer_number}"
    )

    db.commit()
    db.refresh(transfer)

    return {
        "message": "Stock transfer completed successfully",
        "transfer_id": transfer.id,
        "transfer_number": transfer.transfer_number,
        "status": transfer.status
    }