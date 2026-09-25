from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.models.inventory import Inventory
from app.models.inventory_transaction import InventoryTransaction

from app.core.database import get_db
from app.api.dependencies import get_current_user

from app.models.purchase_order import PurchaseOrder
from app.models.purchase_order_item import PurchaseOrderItem
from app.models.supplier import Supplier
from app.models.warehouse import Warehouse
from app.models.product import Product

from app.services.inventory_service import check_low_stock
from app.services.audit_service import create_audit_log

from app.schemas.purchase_order import (
    PurchaseOrderCreate,
    PurchaseOrderResponse
)


router = APIRouter(
    prefix="/purchase-orders",
    tags=["Purchase Orders"]
)


@router.post(
    "/",
    response_model=PurchaseOrderResponse
)
def create_purchase_order(
    order_data: PurchaseOrderCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    existing_order = db.query(PurchaseOrder).filter(
        PurchaseOrder.po_number == order_data.po_number
    ).first()

    if existing_order:
        raise HTTPException(
            status_code=400,
            detail="Purchase order number already exists"
        )

    supplier = db.query(Supplier).filter(
        Supplier.id == order_data.supplier_id
    ).first()

    if not supplier:
        raise HTTPException(
            status_code=404,
            detail="Supplier not found"
        )

    warehouse = db.query(Warehouse).filter(
        Warehouse.id == order_data.warehouse_id
    ).first()

    if not warehouse:
        raise HTTPException(
            status_code=404,
            detail="Warehouse not found"
        )

    if not order_data.items:
        raise HTTPException(
            status_code=400,
            detail="Purchase order must contain at least one item"
        )

    total_amount = 0

    purchase_order = PurchaseOrder(
        po_number=order_data.po_number,
        supplier_id=order_data.supplier_id,
        warehouse_id=order_data.warehouse_id,
        status="PENDING",
        total_amount=0
    )

    db.add(purchase_order)
    db.flush()

    for item in order_data.items:

        if item.quantity <= 0:
            raise HTTPException(
                status_code=400,
                detail="Quantity must be greater than 0"
            )

        if item.unit_price < 0:
            raise HTTPException(
                status_code=400,
                detail="Unit price cannot be negative"
            )

        product = db.query(Product).filter(
            Product.id == item.product_id
        ).first()

        if not product:
            raise HTTPException(
                status_code=404,
                detail=f"Product {item.product_id} not found"
            )

        subtotal = item.quantity * item.unit_price
        total_amount += subtotal

        purchase_item = PurchaseOrderItem(
            purchase_order_id=purchase_order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            unit_price=item.unit_price,
            subtotal=subtotal
        )

        db.add(purchase_item)

    purchase_order.total_amount = total_amount

    db.commit()
    db.refresh(purchase_order)

    return purchase_order


@router.get(
    "/",
    response_model=list[PurchaseOrderResponse]
)
def get_purchase_orders(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    return db.query(
        PurchaseOrder
    ).order_by(
        PurchaseOrder.id.desc()
    ).all()


@router.get(
    "/{purchase_order_id}",
    response_model=PurchaseOrderResponse
)
def get_purchase_order(
    purchase_order_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    purchase_order = db.query(PurchaseOrder).filter(
        PurchaseOrder.id == purchase_order_id
    ).first()

    if not purchase_order:
        raise HTTPException(
            status_code=404,
            detail="Purchase order not found"
        )

    return purchase_order

@router.post("/{purchase_order_id}/receive")
def receive_purchase_order(
    purchase_order_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    purchase_order = (
        db.query(PurchaseOrder)
        .filter(PurchaseOrder.id == purchase_order_id)
        .first()
    )

    if not purchase_order:
        raise HTTPException(
            status_code=404,
            detail="Purchase order not found"
        )

    if purchase_order.status == "RECEIVED":
        raise HTTPException(
            status_code=400,
            detail="Purchase order is already received"
        )

    for item in purchase_order.items:

        inventory = (
            db.query(Inventory)
            .filter(
                Inventory.product_id == item.product_id,
                Inventory.warehouse_id == purchase_order.warehouse_id
            )
            .first()
        )

        if not inventory:
            inventory = Inventory(
                product_id=item.product_id,
                warehouse_id=purchase_order.warehouse_id,
                quantity=0,
                reserved_quantity=0
            )

            db.add(inventory)
            db.flush()

        inventory.quantity += item.quantity
        
        check_low_stock(db, inventory)
        
        transaction = InventoryTransaction(
            product_id=item.product_id,
            warehouse_id=purchase_order.warehouse_id,
            transaction_type="PURCHASE_IN",
            quantity=item.quantity,
            reference=purchase_order.po_number,
            notes=f"Received purchase order {purchase_order.po_number}"
        )

        db.add(transaction)

    purchase_order.status = "RECEIVED"
    
    create_audit_log(
        db=db,
        user_id=current_user.id,
        action="RECEIVE",
        entity_type="PURCHASE_ORDER",
        entity_id=purchase_order.id,
        description=f"Received purchase order {purchase_order.po_number}"
    )

    db.commit()
    db.refresh(purchase_order)

    return {
        "message": "Purchase order received successfully",
        "purchase_order_id": purchase_order.id,
        "po_number": purchase_order.po_number,
        "status": purchase_order.status
    }