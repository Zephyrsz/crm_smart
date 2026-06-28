from fastapi import APIRouter

from app.schemas.system import AuditLogResponse, PermissionMatrix
from app.services.seed_data import get_audit_log, get_permission_matrix

router = APIRouter()


@router.get("/permissions", response_model=PermissionMatrix)
async def permission_matrix() -> PermissionMatrix:
    return get_permission_matrix()


@router.get("/audit-log", response_model=AuditLogResponse)
async def audit_log() -> AuditLogResponse:
    items = get_audit_log()
    return AuditLogResponse(total=len(items), items=items)
