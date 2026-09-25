from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from fastapi import HTTPException
from app.models.inventory import Inventory
from app.models.inventory_transaction import InventoryTransaction

from app.core.database import get_db
from app.api.dependencies import get_current_user

from app.models.sales_order import SalesOrder
from app.models.sales_order_item import SalesOrderItem
from app.models.customer import Customer
from app.models.warehouse import Warehouse
from app.models.product import Product

from app.services.inventory_service import check_low_stock
from app.services.audit_service import create_audit_log

from app.schemas.sales_order import (
    SalesOrderCreate,
    SalesOrderResponse
)


router = APIRouter(
    prefix="/sales-orders",
    tags=["Sales Orders"]
)


@router.post(
    "/",
    response_model=SalesOrderResponse
)
def create_sales_order(
    order_data: SalesOrderCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    existing_order = db.query(SalesOrder).filter(
        SalesOrder.order_number == order_data.order_number
    ).first()

    if existing_order:
        raise HTTPException(
            status_code=400,
            detail="Sales order number already exists"
        )

    customer = db.query(Customer).filter(
        Customer.id == order_data.customer_id
    ).first()

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found"
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
            detail="Sales order must contain at least one item"
        )

    total_amount = 0

    sales_order = SalesOrder(
        order_number=order_data.order_number,
        customer_id=order_data.customer_id,
        warehouse_id=order_data.warehouse_id,
        status="PENDING",
        total_amount=0
    )

    db.add(sales_order)
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

        sales_item = SalesOrderItem(
            sales_order_id=sales_order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            unit_price=item.unit_price,
            subtotal=subtotal
        )

        db.add(sales_item)

    sales_order.total_amount = total_amount

    db.commit()
    db.refresh(sales_order)

    return sales_order


@router.get(
    "/",
    response_model=list[SalesOrderResponse]
)
def get_sales_orders(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    return db.query(
        SalesOrder
    ).order_by(
        SalesOrder.id.desc()
    ).all()


@router.get(
    "/{sales_order_id}",
    response_model=SalesOrderResponse
)
def get_sales_order(
    sales_order_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    sales_order = db.query(SalesOrder).filter(
        SalesOrder.id == sales_order_id
    ).first()

    if not sales_order:
        raise HTTPException(
            status_code=404,
            detail="Sales order not found"
        )

    return sales_order

@router.post("/{sales_order_id}/complete")
def complete_sales_order(
    sales_order_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    sales_order = (
        db.query(SalesOrder)
        .filter(SalesOrder.id == sales_order_id)
        .first()
    )

    if not sales_order:
        raise HTTPException(
            status_code=404,
            detail="Sales order not found"
        )

    if sales_order.status == "COMPLETED":
        raise HTTPException(
            status_code=400,
            detail="Sales order is already completed"
        )

    for item in sales_order.items:

        inventory = (
            db.query(Inventory)
            .filter(
                Inventory.product_id == item.product_id,
                Inventory.warehouse_id == sales_order.warehouse_id
            )
            .first()
        )

        if not inventory:
            raise HTTPException(
                status_code=404,
                detail="Inventory record not found"
            )

        available_quantity = (
            inventory.quantity - inventory.reserved_quantity
        )

        if available_quantity < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Not enough stock for product {item.product_id}"
            )

        inventory.quantity -= item.quantity
        
        check_low_stock(db, inventory)

        transaction = InventoryTransaction(
            product_id=item.product_id,
            warehouse_id=sales_order.warehouse_id,
            transaction_type="SALE_OUT",
            quantity=item.quantity,
            reference=sales_order.order_number,
            notes=f"Completed sales order {sales_order.order_number}"
        )

        db.add(transaction)

    sales_order.status = "COMPLETED"

    create_audit_log(
        db=db,
        user_id=current_user.id,
        action="COMPLETE",
        entity_type="SALES_ORDER",
        entity_id=sales_order.id,
        description=f"Completed sales order {sales_order.order_number}"
    )

    db.commit()
    db.refresh(sales_order)

    return {
        "message": "Sales order completed successfully",
        "sales_order_id": sales_order.id,
        "order_number": sales_order.order_number,
        "status": sales_order.status
    }