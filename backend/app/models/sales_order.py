from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base


class SalesOrder(Base):
    __tablename__ = "sales_orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(100), unique=True, nullable=False, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False)

    status = Column(String(50), default="PENDING", nullable=False)
    total_amount = Column(Float, default=0, nullable=False)
    order_date = Column(DateTime, default=datetime.utcnow)

    customer = relationship("Customer", back_populates="sales_orders")
    warehouse = relationship("Warehouse")
    items = relationship("SalesOrderItem", back_populates="sales_order")