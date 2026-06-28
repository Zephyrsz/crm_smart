from fastapi import APIRouter, HTTPException

from app.schemas.campaigns import CampaignLaunchSummary, CampaignListResponse
from app.services.seed_data import get_campaign_launch_summary, get_campaigns

router = APIRouter()


@router.get("", response_model=CampaignListResponse)
async def list_campaigns() -> CampaignListResponse:
    campaigns = get_campaigns()
    return CampaignListResponse(total=len(campaigns), items=campaigns)


@router.get("/{campaign_id}/launch-summary", response_model=CampaignLaunchSummary)
async def campaign_launch_summary(campaign_id: str) -> CampaignLaunchSummary:
    summary = get_campaign_launch_summary(campaign_id)
    if summary is None:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return summary
