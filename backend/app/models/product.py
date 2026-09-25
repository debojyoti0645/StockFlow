from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(
        String(150),
        nullable=False
    )

    sku = Column(
        String(100),
        unique=True,
        nullable=False,
        index=True
    )

    description = Column(
        String(255),
        nullable=True
    )

    price = Column(
        Float,
        nullable=False
    )

    reorder_level = Column(
        Integer,
        default=10
    )

    category_id = Column(
        Integer,
        ForeignKey("categories.id"),
        nullable=False
    )

    category = relationship(
        "Category",
        back_populates="products"
    )