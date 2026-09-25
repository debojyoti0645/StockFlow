from fastapi import FastAPI

from app.api.routes.auth import router as auth_router
from app.api.routes.categories import router as category_router
from app.api.routes.products import router as product_router
from app.api.routes.suppliers import router as supplier_router
from app.api.routes.supplier_products import router as supplier_product_router
from app.api.routes.warehouses import router as warehouse_router
from app.api.routes.inventory import router as inventory_router
from app.core.database import Base, SessionLocal, engine
from app.core.security import hash_password
from app.models.role import Role
from app.models.user import User
from app.api.routes.inventory_transactions import router as inventory_transaction_router
from app.api.routes.purchase_orders import router as purchase_order_router
from app.api.routes.sales_orders import router as sales_order_router    
from app.api.routes.customers import router as customer_router
from app.api.routes.stock_transfers import router as stock_transfer_router
from app.api.routes.notifications import router as notification_router
from app.api.routes.audit_logs import router as audit_log_router
from app.api.routes.predict import router as predict_router
from app.api.routes.sales_forecasts import router as sales_forecast_router
from app.api.routes import dashboard
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(
    title="StockFlow API",
    description="Smart Inventory & Supply Chain Management System",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def seed_default_admin() -> None:
    db = SessionLocal()

    try:
        role = db.query(Role).filter(Role.name == "ADMIN").first()
        if not role:
            role = Role(name="ADMIN")
            db.add(role)
            db.commit()
            db.refresh(role)

        user = db.query(User).filter(User.email == "admin@stockflow.com").first()
        if not user:
            admin_user = User(
                name="Admin",
                email="admin@stockflow.com",
                password=hash_password("admin123"),
                role_id=role.id,
                is_active=True,
            )
            db.add(admin_user)
            db.commit()
    finally:
        db.close()


@app.on_event("startup")
def startup_event() -> None:
    Base.metadata.create_all(bind=engine)
    seed_default_admin()


app.include_router(auth_router)
app.include_router(category_router)
app.include_router(product_router)
app.include_router(supplier_router)
app.include_router(supplier_product_router)
app.include_router(warehouse_router)
app.include_router(inventory_router)
app.include_router(inventory_transaction_router)
app.include_router(purchase_order_router)   
app.include_router(sales_order_router)
app.include_router(customer_router)
app.include_router(stock_transfer_router)
app.include_router(notification_router)
app.include_router(audit_log_router)
app.include_router(predict_router)
app.include_router(sales_forecast_router)
app.include_router(dashboard.router)

@app.get("/")
def home():
    return {
        "message": "StockFlow API is running"
    }