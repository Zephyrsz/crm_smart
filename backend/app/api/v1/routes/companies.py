from fastapi import APIRouter

from app.schemas.companies import CompanyListResponse
from app.services.seed_data import get_companies

router = APIRouter()


@router.get("", response_model=CompanyListResponse)
async def list_companies() -> CompanyListResponse:
    companies = get_companies()
    return CompanyListResponse(total=len(companies), items=companies)
