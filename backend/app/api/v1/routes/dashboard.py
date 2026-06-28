from fastapi import APIRouter

from app.schemas.dashboard import DashboardSummary
from app.services.seed_data import get_dashboard_summary

router = APIRouter()


@router.get("/summary", response_model=DashboardSummary)
async def dashboard_summary() -> DashboardSummary:
    return get_dashboard_summary()
