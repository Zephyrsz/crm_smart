from typing import Literal

from pydantic import BaseModel

TemplateStatus = Literal["online", "offline", "draft"]


class EmailTemplate(BaseModel):
    id: str
    name: str
    category: str
    version: int
    status: TemplateStatus
    locked: bool
    used_by_active_campaigns: list[str]
    variables: list[str]
    subject: str
    preview: str


class TemplateListResponse(BaseModel):
    items: list[EmailTemplate]
