from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship

from app.core.database import Base


class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)

    product_id = Column(
        Integer,
        ForeignKey("products.id"),
        nullable=False
    )

    warehouse_id = Column(
        Integer,
        ForeignKey("warehouses.id"),
        nullable=False
    )

    quantity = Column(
        Integer,
        default=0,
        nullable=False
    )

    reserved_quantity = Column(
        Integer,
        default=0,
        nullable=False
    )

    warehouse = relationship(
        "Warehouse",
        back_populates="inventories"
    )

    product = relationship(
        "Product"
    )

    __table_args__ = (
        UniqueConstraint(
            "product_id",
            "warehouse_id",
            name="uq_product_warehouse"
        ),
    )