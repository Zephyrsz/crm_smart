from fastapi import APIRouter, HTTPException

from app.schemas.progress import CompanyProgress, ContactTimeline
from app.services.seed_data import get_company_progress, get_contact_timeline

router = APIRouter()


@router.get("/companies/{company_id}", response_model=CompanyProgress)
async def company_progress(company_id: str) -> CompanyProgress:
    progress = get_company_progress(company_id)
    if progress is None:
        raise HTTPException(status_code=404, detail="Company progress not found")
    return progress


@router.get("/contacts/{contact_id}/timeline", response_model=ContactTimeline)
async def contact_timeline(contact_id: str) -> ContactTimeline:
    timeline = get_contact_timeline(contact_id)
    if timeline is None:
        raise HTTPException(status_code=404, detail="Contact timeline not found")
    return timeline
