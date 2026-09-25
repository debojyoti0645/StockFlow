from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base


class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    po_number = Column(
        String(100),
        unique=True,
        nullable=False,
        index=True
    )

    supplier_id = Column(
        Integer,
        ForeignKey("suppliers.id"),
        nullable=False
    )

    warehouse_id = Column(
        Integer,
        ForeignKey("warehouses.id"),
        nullable=False
    )

    status = Column(
        String(50),
        default="PENDING",
        nullable=False
    )

    total_amount = Column(
        Float,
        default=0,
        nullable=False
    )

    order_date = Column(
        DateTime,
        default=datetime.utcnow
    )

    supplier = relationship(
        "Supplier"
    )

    warehouse = relationship(
        "Warehouse"
    )

    items = relationship(
        "PurchaseOrderItem",
        back_populates="purchase_order"
    )