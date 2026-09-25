from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(
        String(150),
        nullable=False
    )

    email = Column(
        String(150),
        nullable=True
    )

    phone = Column(
        String(30),
        nullable=True
    )

    address = Column(
        String(255),
        nullable=True
    )

    supplier_products = relationship(
        "SupplierProduct",
        back_populates="supplier"
    )
    