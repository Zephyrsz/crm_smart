from fastapi import APIRouter

from app.schemas.inbox import InboxThreadListResponse, ManualConfirmQueueResponse
from app.services.seed_data import get_inbox_threads, get_manual_confirm_queue

router = APIRouter()


@router.get("/threads", response_model=InboxThreadListResponse)
async def inbox_threads() -> InboxThreadListResponse:
    threads = get_inbox_threads()
    return InboxThreadListResponse(total=len(threads), items=threads)


@router.get("/manual-confirm", response_model=ManualConfirmQueueResponse)
async def manual_confirm_queue() -> ManualConfirmQueueResponse:
    items = get_manual_confirm_queue()
    return ManualConfirmQueueResponse(total=len(items), items=items)
