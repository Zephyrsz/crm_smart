from pydantic import BaseModel


class LatestReply(BaseModel):
    contact_name: str
    intent: str
    excerpt: str
    received_at: str


class CompanyProgress(BaseModel):
    company_id: str
    company_name: str
    industry: str
    overall_status: str
    feasibility: str
    last_contacted_at: str
    contacts_hit: int
    total_contacts: int
    latest_reply: LatestReply


class TimelineEvent(BaseModel):
    id: str
    event_type: str
    title: str
    detail: str
    occurred_at: str


class ContactTimeline(BaseModel):
    contact_id: str
    contact_name: str
    company_name: str
    current_state: str
    items: list[TimelineEvent]
