from pydantic import BaseModel


class KpiMetric(BaseModel):
    label: str
    value: str
    sub: str
    trend: str


class VerificationBucket(BaseModel):
    label: str
    count: int
    pct: int
    status: str


class SendingQueue(BaseModel):
    queued: int
    sent_today: int
    active_mailboxes: int
    daily_cap_per_mailbox: int


class ReplyIntent(BaseModel):
    intent: str
    label: str
    count: int


class SuppressionSummary(BaseModel):
    total: int
    unsubscribed: int
    invalid: int
    opted_out: int


class DashboardSummary(BaseModel):
    kpis: list[KpiMetric]
    verification_buckets: list[VerificationBucket]
    sending_queue: SendingQueue
    reply_intents: list[ReplyIntent]
    suppression: SuppressionSummary
