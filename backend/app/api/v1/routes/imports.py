from fastapi import APIRouter

from app.schemas.imports import ImportPreview
from app.services.seed_data import get_import_preview

router = APIRouter()


@router.get("/preview", response_model=ImportPreview)
async def import_preview() -> ImportPreview:
    return get_import_preview()
