from sqlalchemy.orm import Session

from app.models.inventory import Inventory
from app.models.notification import Notification
from app.models.user import User
from app.models.product import Product


def check_low_stock(db: Session, inventory: Inventory):

    product = (
        db.query(Product)
        .filter(Product.id == inventory.product_id)
        .first()
    )

    if not product:
        return

    if inventory.quantity > product.reorder_level:
        return

    admin_user = (
        db.query(User)
        .filter(User.role_id == 1)
        .first()
    )

    if not admin_user:
        return

    existing_notification = (
        db.query(Notification)
        .filter(
            Notification.user_id == admin_user.id,
            Notification.notification_type == "LOW_STOCK",
            Notification.message.like(f"%{product.name}%"),
            Notification.is_read == False
        )
        .first()
    )

    if existing_notification:
        return

    notification = Notification(
        user_id=admin_user.id,
        title="Low Stock Alert",
        message=(
            f"{product.name} stock is low. "
            f"Current quantity: {inventory.quantity}. "
            f"Reorder level: {product.reorder_level}."
        ),
        notification_type="LOW_STOCK",
        is_read=False
    )

    db.add(notification)