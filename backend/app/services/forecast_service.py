from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.sales_order_item import SalesOrderItem
from app.models.sales_order import SalesOrder


def calculate_average_sales(
    db: Session,
    product_id: int
):
    result = db.query(
        func.avg(SalesOrderItem.quantity)
    ).join(
        SalesOrder,
        SalesOrder.id == SalesOrderItem.sales_order_id
    ).filter(
        SalesOrderItem.product_id == product_id,
        SalesOrder.status != "CANCELLED"
    ).scalar()

    if result is None:
        return 0

    return float(result)