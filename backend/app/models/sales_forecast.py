from sqlalchemy import Column, Integer, Float, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base


class SalesForecast(Base):
    __tablename__ = "sales_forecasts"

    id = Column(Integer, primary_key=True, index=True)

    product_id = Column(
        Integer,
        ForeignKey("products.id"),
        nullable=False
    )

    forecast_date = Column(Date, nullable=False)

    predicted_quantity = Column(
        Float,
        nullable=False
    )

    actual_quantity = Column(
        Float,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    product = relationship("Product")