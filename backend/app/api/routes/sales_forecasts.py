from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date

from app.core.database import get_db
from app.api.dependencies import get_current_user

from app.models.sales_forecast import SalesForecast
from app.models.product import Product

from app.schemas.sales_forecast import (
    SalesForecastCreate,
    SalesForecastResponse
)

from app.services.forecast_service import calculate_average_sales


router = APIRouter(
    prefix="/sales-forecasts",
    tags=["Sales Forecasting"]
)


@router.post(
    "/generate/{product_id}",
    response_model=SalesForecastResponse
)
def generate_forecast(
    product_id: int,
    forecast_date: date,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    predicted_quantity = calculate_average_sales(
        db,
        product_id
    )

    forecast = SalesForecast(
        product_id=product_id,
        forecast_date=forecast_date,
        predicted_quantity=predicted_quantity
    )

    db.add(forecast)
    db.commit()
    db.refresh(forecast)

    return forecast


@router.post(
    "/",
    response_model=SalesForecastResponse
)
def create_forecast(
    forecast_data: SalesForecastCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    product = db.query(Product).filter(
        Product.id == forecast_data.product_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    forecast = SalesForecast(
        product_id=forecast_data.product_id,
        forecast_date=forecast_data.forecast_date,
        predicted_quantity=forecast_data.predicted_quantity
    )

    db.add(forecast)
    db.commit()
    db.refresh(forecast)

    return forecast


@router.get(
    "/",
    response_model=list[SalesForecastResponse]
)
def get_forecasts(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    return db.query(
        SalesForecast
    ).order_by(
        SalesForecast.forecast_date.desc()
    ).all()


@router.get(
    "/product/{product_id}",
    response_model=list[SalesForecastResponse]
)
def get_product_forecasts(
    product_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    return db.query(
        SalesForecast
    ).filter(
        SalesForecast.product_id == product_id
    ).order_by(
        SalesForecast.forecast_date.desc()
    ).all()