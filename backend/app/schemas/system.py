from pydantic import BaseModel


class CurrentUser(BaseModel):
    name: str
    role: str


class PermissionRule(BaseModel):
    action: str
    allowed: bool
    scope: str


class RolePermissions(BaseModel):
    role: str
    label: str
    permissions: list[PermissionRule]


class PermissionMatrix(BaseModel):
    current_user: CurrentUser
    roles: list[RolePermissions]


class AuditLogItem(BaseModel):
    id: str
    actor: str
    action: str
    entity: str
    occurred_at: str
    outcome: str


class AuditLogResponse(BaseModel):
    total: int
    items: list[AuditLogItem]
