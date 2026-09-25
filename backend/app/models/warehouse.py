from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class Warehouse(Base):
    __tablename__ = "warehouses"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(
        String(150),
        nullable=False
    )

    location = Column(
        String(255),
        nullable=True
    )

    manager_name = Column(
        String(100),
        nullable=True
    )

    inventories = relationship(
        "Inventory",
        back_populates="warehouse"
    )