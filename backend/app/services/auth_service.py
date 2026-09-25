from sqlalchemy.orm import Session

from app.models.user import User
from app.core.security import verify_password, create_access_token


def authenticate_user(
    db: Session,
    email: str,
    password: str
):
    user = db.query(User).filter(User.email == email).first()

    if not user:
        return None

    if not verify_password(password, user.password):
        return None

    return user


def create_user_token(user: User):
    token_data = {
        "user_id": user.id,
        "role_id": user.role_id
    }

    return create_access_token(token_data)