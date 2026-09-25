from logging.config import fileConfig

from sqlalchemy import create_engine
from alembic import context

from app.models.category import Category
from app.models.product import Product

from app.models.supplier import Supplier
from app.models.supplier_product import SupplierProduct

from app.models.warehouse import Warehouse
from app.models.inventory import Inventory

from app.models.inventory_transaction import InventoryTransaction

from app.models.purchase_order import PurchaseOrder
from app.models.purchase_order_item import PurchaseOrderItem

from app.models.customer import Customer
from app.models.sales_order import SalesOrder
from app.models.sales_order_item import SalesOrderItem

from app.models.stock_transfer import StockTransfer
from app.models.stock_transfer_item import StockTransferItem

from app.models.notification import Notification
from app.models.audit_log import AuditLog

from app.models.sales_forecast import SalesForecast

from app.core.database import Base

from app.core.config import get_database_url

from app.models.role import Role
from app.models.permission import Permission
from app.models.role_permission import RolePermission
from app.models.user import User


# Alembic Config object
config = context.config


# Configure Python logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)


# SQLAlchemy metadata
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """
    Run migrations in offline mode.
    """

    database_url = get_database_url()

    context.configure(
        url=database_url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={
            "paramstyle": "named"
        }
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """
    Run migrations in online mode.
    """

    database_url = get_database_url()

    connectable = create_engine(database_url)

    with connectable.connect() as connection:

        context.configure(
            connection=connection,
            target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()