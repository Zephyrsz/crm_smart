from pydantic import BaseModel


class CampaignRules(BaseModel):
    industry: str
    send_window: str
    daily_cap_per_mailbox: int
    active_mailboxes: int
    send_interval_minutes: int
    cool_down_days: int
    dedupe_across_campaigns: bool
    auto_suppress_unsubscribed: bool


class CampaignEligibility(BaseModel):
    audience: int
    valid_emails: int
    suppressed: int
    eligible_recipients: int
    estimated_days: int


class Campaign(BaseModel):
    id: str
    name: str
    status: str
    template_id: str
    template_name: str
    manual_confirm_gate: bool
    rules: CampaignRules
    eligibility: CampaignEligibility


class CampaignListResponse(BaseModel):
    total: int
    items: list[Campaign]


class CampaignLaunchSummary(BaseModel):
    campaign_id: str
    launch_label: str
    route: str
    eligible_recipients: int
    daily_total: int
    estimated_days: int
    first_send: str
