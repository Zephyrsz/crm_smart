from fastapi import APIRouter

from app.schemas.mailboxes import MailboxSummary
from app.services.seed_data import get_mailbox_summary

router = APIRouter()


@router.get("/summary", response_model=MailboxSummary)
async def mailbox_summary() -> MailboxSummary:
    return get_mailbox_summary()
