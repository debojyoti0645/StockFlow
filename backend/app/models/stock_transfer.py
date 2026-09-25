from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base


class StockTransfer(Base):
    __tablename__ = "stock_transfers"

    id = Column(Integer, primary_key=True, index=True)
    transfer_number = Column(
        String(100),
        unique=True,
        nullable=False,
        index=True
    )

    source_warehouse_id = Column(
        Integer,
        ForeignKey("warehouses.id"),
        nullable=False
    )

    destination_warehouse_id = Column(
        Integer,
        ForeignKey("warehouses.id"),
        nullable=False
    )

    status = Column(String(50), default="PENDING", nullable=False)
    transfer_date = Column(DateTime, default=datetime.utcnow)
    notes = Column(String(255), nullable=True)

    source_warehouse = relationship(
        "Warehouse",
        foreign_keys=[source_warehouse_id]
    )

    destination_warehouse = relationship(
        "Warehouse",
        foreign_keys=[destination_warehouse_id]
    )

    items = relationship(
        "StockTransferItem",
        back_populates="transfer"
    )