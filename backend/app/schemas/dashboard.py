from pydantic import BaseModel


class DashboardSummary(BaseModel):
    total_products: int
    total_categories: int
    total_suppliers: int
    total_warehouses: int
    total_customers: int
    total_purchase_orders: int
    total_sales_orders: int
    low_stock_products: int
    total_inventory_units: int