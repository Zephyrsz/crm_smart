from pydantic import BaseModel, EmailStr


class SharedMailboxAccount(BaseModel):
    email: EmailStr
    provider: str
    auth_method: str
    status: str
    scopes: list[str]
    token_storage: str


class MailboxPoolItem(BaseModel):
    id: str
    email: EmailStr
    sent_today: int
    daily_cap: int
    warmup_pct: int
    state: str


class DnsCheck(BaseModel):
    name: str
    detail: str
    status: str


class DeliverabilitySummary(BaseModel):
    bounce_rate: str
    complaint_rate: str
    reply_rate: str


class MailboxSummary(BaseModel):
    shared_account: SharedMailboxAccount
    pool: list[MailboxPoolItem]
    dns_checks: list[DnsCheck]
    deliverability: DeliverabilitySummary
