from fastapi import APIRouter

from app.schemas.contacts import ContactListResponse
from app.services.seed_data import get_contacts

router = APIRouter()


@router.get("", response_model=ContactListResponse)
async def list_contacts() -> ContactListResponse:
    contacts = get_contacts()
    return ContactListResponse(total=len(contacts), items=contacts)
