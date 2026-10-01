from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.product import Product
from app.models.category import Category
from app.models.user import User

from app.schemas.product import (
    ProductCreate,
    ProductUpdate,
    ProductResponse
)

from app.api.dependencies import get_current_user


router = APIRouter(
    prefix="/products",
    tags=["Products"]
)


@router.post(
    "/",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED
)
def create_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    category = db.query(Category).filter(
        Category.id == product_data.category_id
    ).first()

    if not category:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    # The SKU column is non-null, so assign a temporary value before flush.
    temporary_sku = f"TEMP-{uuid4().hex}"

    product = Product(
        name=product_data.name,
        sku=temporary_sku,
        description=product_data.description,
        price=product_data.price,
        reorder_level=product_data.reorder_level,
        category_id=product_data.category_id
    )

    db.add(product)

    db.flush()

    product.sku = f"PRD-{product.id:05d}"

    db.commit()
    db.refresh(product)

    return product


@router.get(
    "/",
    response_model=list[ProductResponse]
)
def list_products(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    products = db.query(Product).order_by(
        Product.id
    ).all()

    return products


@router.get(
    "/{product_id}",
    response_model=ProductResponse
)
def get_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    return product


@router.put(
    "/{product_id}",
    response_model=ProductResponse
)
def update_product(
    product_id: int,
    product_data: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    if product_data.category_id is not None:

        category = db.query(Category).filter(
            Category.id == product_data.category_id
        ).first()

        if not category:
            raise HTTPException(
                status_code=404,
                detail="Category not found"
            )

        product.category_id = product_data.category_id

    if product_data.name is not None:
        product.name = product_data.name

    if product_data.description is not None:
        product.description = product_data.description

    if product_data.price is not None:
        product.price = product_data.price

    if product_data.reorder_level is not None:
        product.reorder_level = product_data.reorder_level

    db.commit()
    db.refresh(product)

    return product


@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    db.delete(product)
    db.commit()

    return {
        "message": "Product deleted successfully"
    }