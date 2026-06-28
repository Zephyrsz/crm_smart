from typing import Literal

from pydantic import BaseModel


class EmailMessage(BaseModel):
    id: str
    direction: Literal["outbound", "inbound"]
    subject: str
    body: str
    sent_at: str


class InboxThread(BaseModel):
    id: str
    contact_name: str
    company: str
    subject: str
    intent: str
    suggested_action: str
    last_message_at: str
    messages: list[EmailMessage]


class InboxThreadListResponse(BaseModel):
    total: int
    items: list[InboxThread]


class ManualConfirmItem(BaseModel):
    id: str
    contact_name: str
    company: str
    intent: str
    suggested_action: str
    reply_excerpt: str


class ManualConfirmQueueResponse(BaseModel):
    total: int
    items: list[ManualConfirmItem]
