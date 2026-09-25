from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.supplier_product import SupplierProduct
from app.models.supplier import Supplier
from app.models.product import Product
from app.models.user import User

from app.schemas.supplier_product import (
    SupplierProductCreate,
    SupplierProductUpdate,
    SupplierProductResponse
)

from app.api.dependencies import get_current_user


router = APIRouter(
    prefix="/supplier-products",
    tags=["Supplier Products"]
)


@router.post(
    "/",
    response_model=SupplierProductResponse,
    status_code=status.HTTP_201_CREATED
)
def create_supplier_product(
    data: SupplierProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    supplier = db.query(Supplier).filter(
        Supplier.id == data.supplier_id
    ).first()

    if not supplier:
        raise HTTPException(
            status_code=404,
            detail="Supplier not found"
        )

    product = db.query(Product).filter(
        Product.id == data.product_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    existing = db.query(SupplierProduct).filter(
        SupplierProduct.supplier_id == data.supplier_id,
        SupplierProduct.product_id == data.product_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Supplier already mapped to this product"
        )

    supplier_product = SupplierProduct(
        supplier_id=data.supplier_id,
        product_id=data.product_id,
        supplier_price=data.supplier_price
    )

    db.add(supplier_product)
    db.commit()
    db.refresh(supplier_product)

    return supplier_product


@router.get(
    "/",
    response_model=list[SupplierProductResponse]
)
def list_supplier_products(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(SupplierProduct).order_by(
        SupplierProduct.id
    ).all()


@router.get(
    "/{supplier_product_id}",
    response_model=SupplierProductResponse
)
def get_supplier_product(
    supplier_product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = db.query(SupplierProduct).filter(
        SupplierProduct.id == supplier_product_id
    ).first()

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Supplier product mapping not found"
        )

    return item


@router.put(
    "/{supplier_product_id}",
    response_model=SupplierProductResponse
)
def update_supplier_product(
    supplier_product_id: int,
    data: SupplierProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = db.query(SupplierProduct).filter(
        SupplierProduct.id == supplier_product_id
    ).first()

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Supplier product mapping not found"
        )

    item.supplier_price = data.supplier_price

    db.commit()
    db.refresh(item)

    return item


@router.delete("/{supplier_product_id}")
def delete_supplier_product(
    supplier_product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = db.query(SupplierProduct).filter(
        SupplierProduct.id == supplier_product_id
    ).first()

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Supplier product mapping not found"
        )

    db.delete(item)
    db.commit()

    return {
        "message": "Supplier product mapping deleted successfully"
    }