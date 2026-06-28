from fastapi import APIRouter

from app.schemas.templates import TemplateListResponse
from app.services.seed_data import get_templates

router = APIRouter()


@router.get("", response_model=TemplateListResponse)
async def list_templates() -> TemplateListResponse:
    return TemplateListResponse(items=get_templates())
