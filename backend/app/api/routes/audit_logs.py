from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.dependencies import get_current_user

from app.models.audit_log import AuditLog

from app.schemas.audit_log import (
    AuditLogCreate,
    AuditLogResponse
)


router = APIRouter(
    prefix="/audit-logs",
    tags=["Audit Logs"]
)


@router.post(
    "/",
    response_model=AuditLogResponse
)
def create_audit_log(
    log_data: AuditLogCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    audit_log = AuditLog(
        user_id=current_user.id,
        action=log_data.action,
        entity_type=log_data.entity_type,
        entity_id=log_data.entity_id,
        description=log_data.description
    )

    db.add(audit_log)
    db.commit()
    db.refresh(audit_log)

    return audit_log


@router.get(
    "/",
    response_model=list[AuditLogResponse]
)
def get_audit_logs(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    return db.query(
        AuditLog
    ).order_by(
        AuditLog.id.desc()
    ).all()


@router.get(
    "/{log_id}",
    response_model=AuditLogResponse
)
def get_audit_log(
    log_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    return db.query(
        AuditLog
    ).filter(
        AuditLog.id == log_id
    ).first()