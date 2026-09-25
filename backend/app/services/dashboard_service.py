from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.category import Category
from app.models.supplier import Supplier
from app.models.warehouse import Warehouse
from app.models.customer import Customer
from app.models.purchase_order import PurchaseOrder
from app.models.sales_order import SalesOrder
from app.models.inventory import Inventory


def get_dashboard_summary(db: Session):
    total_products = db.query(Product).count()
    total_categories = db.query(Category).count()
    total_suppliers = db.query(Supplier).count()
    total_warehouses = db.query(Warehouse).count()
    total_customers = db.query(Customer).count()
    total_purchase_orders = db.query(PurchaseOrder).count()
    total_sales_orders = db.query(SalesOrder).count()

    low_stock_products = (
        db.query(Inventory)
        .join(Product)
        .filter(Inventory.quantity <= Product.reorder_level)
        .count()
    )

    total_inventory_units = (
        db.query(Inventory.quantity).all()
    )

    total_inventory_units = sum(
        item[0] for item in total_inventory_units
    )

    return {
        "total_products": total_products,
        "total_categories": total_categories,
        "total_suppliers": total_suppliers,
        "total_warehouses": total_warehouses,
        "total_customers": total_customers,
        "total_purchase_orders": total_purchase_orders,
        "total_sales_orders": total_sales_orders,
        "low_stock_products": low_stock_products,
        "total_inventory_units": total_inventory_units,
    }