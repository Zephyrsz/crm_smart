from app.schemas.contacts import Contact
from app.schemas.companies import Company
from app.schemas.campaigns import (
    Campaign,
    CampaignEligibility,
    CampaignLaunchSummary,
    CampaignRules,
)
from app.schemas.dashboard import (
    DashboardSummary,
    KpiMetric,
    ReplyIntent,
    SendingQueue,
    SuppressionSummary,
    VerificationBucket,
)
from app.schemas.templates import EmailTemplate
from app.schemas.imports import (
    ImportPreview,
    ImportValidationSummary,
    ImportVerificationSummary,
    MappingRow,
    ValidationIssue,
    VerificationBucket as ImportVerificationBucket,
    VerificationStage,
)
from app.schemas.inbox import EmailMessage, InboxThread, ManualConfirmItem
from app.schemas.progress import CompanyProgress, ContactTimeline, LatestReply, TimelineEvent


def get_dashboard_summary() -> DashboardSummary:
    return DashboardSummary(
        kpis=[
            KpiMetric(label="Contacts", value="4,860", sub="+312 this week", trend="+6.9%"),
            KpiMetric(label="Deliverable", value="78%", sub="3,792 verified valid", trend="+2.1%"),
            KpiMetric(label="Active campaigns", value="3", sub="2 throttled · 1 review", trend="live"),
            KpiMetric(label="Awaiting confirm", value="12", sub="high-intent replies", trend="+4"),
        ],
        verification_buckets=[
            VerificationBucket(label="Valid · deliverable", count=3792, pct=78, status="valid"),
            VerificationBucket(label="Risky · catch-all", count=612, pct=13, status="risky"),
            VerificationBucket(label="Invalid · bounce", count=288, pct=6, status="invalid"),
            VerificationBucket(label="Unknown", count=168, pct=3, status="unknown"),
        ],
        sending_queue=SendingQueue(
            queued=412,
            sent_today=92,
            active_mailboxes=3,
            daily_cap_per_mailbox=200,
        ),
        reply_intents=[
            ReplyIntent(intent="interested", label="Interested", count=5),
            ReplyIntent(intent="meeting", label="Meeting requested", count=3),
            ReplyIntent(intent="later", label="Later / nurture", count=4),
            ReplyIntent(intent="referral", label="Referral / forward", count=2),
            ReplyIntent(intent="declined", label="Not interested", count=6),
        ],
        suppression=SuppressionSummary(total=386, unsubscribed=142, invalid=188, opted_out=56),
    )


def get_contacts() -> list[Contact]:
    rows = [
        ("mara-whitfield", "Mara Whitfield", "VP Marketing", "mara.w@northwind.io", "Northwind Labs", "valid", "Replied · interested"),
        ("diego-santos", "Diego Santos", "Head of Growth", "diego@brightforge.co", "BrightForge", "valid", "Awaiting reply"),
        ("priya-nair", "Priya Nair", "RevOps Lead", "priya.nair@lumenpay.io", "LumenPay", "risky", "Not contacted"),
        ("tom-becker", "Tom Becker", "CTO", "tom@hexadata.dev", "Hexadata", "valid", "Meeting set"),
        ("aiko-tanaka", "Aiko Tanaka", "VP Sales", "aiko@sakuracloud.jp", "Sakura Cloud", "valid", "Replied · later"),
        ("sam-olsen", "Sam Olsen", "Founder", "sam@driftly.app", "Driftly", "invalid", "Suppressed"),
        ("lena-brandt", "Lena Brandt", "Marketing Dir.", "lena.b@vantawave.io", "VantaWave", "unknown", "Verifying"),
        ("raj-patel", "Raj Patel", "COO", "raj@finquark.com", "FinQuark", "valid", "Awaiting reply"),
    ]
    return [
        Contact(
            id=id_,
            name=name,
            title=title,
            email=email,
            company=company,
            email_status=email_status,
            stage=stage,
        )
        for id_, name, title, email, company, email_status, stage in rows
    ]


def get_companies() -> list[Company]:
    rows = [
        ("northwind-labs", "Northwind Labs", "B2B SaaS", "200-500", "active", 70, 8, "2d", "Valid"),
        ("brightforge", "BrightForge", "MarTech", "50-200", "engaged", 55, 5, "4d", "Blue"),
        ("lumenpay", "LumenPay", "Fintech", "500+", "stalled", 30, 12, "11d", "Risky"),
        ("hexadata", "Hexadata", "Data Infra", "50-200", "meeting", 90, 4, "1d", "Valid"),
        ("sakura-cloud", "Sakura Cloud", "Cloud", "200-500", "active", 60, 7, "3d", "Valid"),
        ("finquark", "FinQuark", "Fintech", "500+", "searching", 20, 9, "6d", "Unknown"),
    ]
    return [
        Company(
            id=id_,
            name=name,
            industry=industry,
            size=size,
            status=status,
            progress=progress,
            contacts_hit=contacts_hit,
            last_contacted=last_contacted,
            feasibility=feasibility,
        )
        for id_, name, industry, size, status, progress, contacts_hit, last_contacted, feasibility in rows
    ]


def get_import_preview() -> ImportPreview:
    mapping_rows = [
        ("first_name", "Mara", "First name", "auto 98%", True),
        ("last_name", "Whitfield", "Last name", "auto 97%", True),
        ("work_email", "mara.w@northwind.io", "Email", "auto 99%", True),
        ("company", "Northwind Labs", "Company", "auto 96%", True),
        ("title", "VP Marketing", "Job title", "auto 94%", True),
        ("sector", "B2B SaaS", "Industry", "auto 71%", True),
        ("mobile", "+1 415 555 0148", "Phone", "auto 92%", True),
        ("li_url", "linkedin.com/in/maraw", "Ignore", "manual", False),
        ("notes", "met at SaaStr 25", "Ignore", "manual", False),
    ]
    return ImportPreview(
        source_file="leads_q2_apac.xlsx",
        file_size="2.4 MB",
        total_rows=1248,
        detected_columns=[row[0] for row in mapping_rows],
        mapped_count=7,
        mapping_rows=[
            MappingRow(
                source_column=source,
                sample_value=sample,
                target_field=target,
                confidence=confidence,
                mapped=mapped,
            )
            for source, sample, target, confidence, mapped in mapping_rows
        ],
        validation=ImportValidationSummary(
            total_rows=1248,
            ready_to_import=1006,
            need_attention=242,
            issues=[
                ValidationIssue(
                    label="Missing email address",
                    detail="rows 44, 109, 251 ... cannot be contacted",
                    count=38,
                    action="skip",
                    severity="error",
                ),
                ValidationIssue(
                    label="Invalid email format",
                    detail='examples: "john@@acme", "n/a", "-"',
                    count=64,
                    action="skip",
                    severity="error",
                ),
                ValidationIssue(
                    label="Duplicate within file",
                    detail="same address appears 2+ times",
                    count=92,
                    action="merge",
                    severity="warning",
                ),
                ValidationIssue(
                    label="Already in CRM",
                    detail="matched existing contact; upsert available",
                    count=48,
                    action="update",
                    severity="info",
                ),
            ],
        ),
        verification=ImportVerificationSummary(
            stages=[
                VerificationStage(name="Syntax", passed=1210, failed=38),
                VerificationStage(name="MX record", passed=1180, failed=30),
                VerificationStage(name="SMTP probe", passed=998, failed=182),
                VerificationStage(name="Catch-all", passed=810, failed=188),
            ],
            buckets=[
                ImportVerificationBucket(label="Valid · deliverable", count=842, pct=67, status="valid"),
                ImportVerificationBucket(label="Risky · catch-all", count=188, pct=15, status="risky"),
                ImportVerificationBucket(label="Invalid · bounce", count=142, pct=11, status="invalid"),
                ImportVerificationBucket(label="Unknown", count=76, pct=7, status="unknown"),
            ],
            send_eligible=842,
            suppressed=406,
        ),
    )


def get_campaigns() -> list[Campaign]:
    base_rules = CampaignRules(
        industry="B2B SaaS",
        send_window="09:00-16:30 local",
        daily_cap_per_mailbox=200,
        active_mailboxes=3,
        send_interval_minutes=7,
        cool_down_days=14,
        dedupe_across_campaigns=True,
        auto_suppress_unsubscribed=True,
    )
    return [
        Campaign(
            id="apac-saas",
            name="APAC · B2B SaaS",
            status="live",
            template_id="intro_saas",
            template_name="SaaS intro · short",
            manual_confirm_gate=True,
            rules=base_rules,
            eligibility=CampaignEligibility(
                audience=1248,
                valid_emails=842,
                suppressed=406,
                eligible_recipients=842,
                estimated_days=2,
            ),
        ),
        Campaign(
            id="fintech-series-b",
            name="Fintech Series-B",
            status="review",
            template_id="case_study",
            template_name="Case study drop",
            manual_confirm_gate=True,
            rules=base_rules.model_copy(update={"industry": "Fintech", "daily_cap_per_mailbox": 150}),
            eligibility=CampaignEligibility(
                audience=864,
                valid_emails=410,
                suppressed=122,
                eligible_recipients=410,
                estimated_days=1,
            ),
        ),
        Campaign(
            id="na-enterprise",
            name="NA Enterprise",
            status="draft",
            template_id="breakup",
            template_name="Break-up nudge",
            manual_confirm_gate=False,
            rules=base_rules.model_copy(update={"industry": "Enterprise", "cool_down_days": 21}),
            eligibility=CampaignEligibility(
                audience=2104,
                valid_emails=1204,
                suppressed=386,
                eligible_recipients=1204,
                estimated_days=3,
            ),
        ),
    ]


def get_campaign_launch_summary(campaign_id: str) -> CampaignLaunchSummary | None:
    campaign = next((item for item in get_campaigns() if item.id == campaign_id), None)
    if campaign is None:
        return None
    daily_total = campaign.rules.daily_cap_per_mailbox * campaign.rules.active_mailboxes
    return CampaignLaunchSummary(
        campaign_id=campaign.id,
        launch_label="Queue for review" if campaign.manual_confirm_gate else "Launch campaign",
        route="review_queue" if campaign.manual_confirm_gate else "send_queue",
        eligible_recipients=campaign.eligibility.eligible_recipients,
        daily_total=daily_total,
        estimated_days=campaign.eligibility.estimated_days,
        first_send="Tomorrow · 09:00",
    )


def get_inbox_threads() -> list[InboxThread]:
    return [
        InboxThread(
            id="thread-mara",
            contact_name="Mara Whitfield",
            company="Northwind Labs",
            subject="Re: cut Northwind onboarding time by 40%",
            intent="interested",
            suggested_action="Send next-step template",
            last_message_at="2026-06-28T09:30:00Z",
            messages=[
                EmailMessage(
                    id="msg-mara-1",
                    direction="outbound",
                    subject="cut Northwind onboarding time by 40%",
                    body="Hi Mara, noticed Northwind is scaling fast...",
                    sent_at="2026-06-27T09:00:00Z",
                ),
                EmailMessage(
                    id="msg-mara-2",
                    direction="inbound",
                    subject="Re: cut Northwind onboarding time by 40%",
                    body="This looks relevant. Can you send details?",
                    sent_at="2026-06-28T09:30:00Z",
                ),
            ],
        ),
        InboxThread(
            id="thread-tom",
            contact_name="Tom Becker",
            company="Hexadata",
            subject="Re: times that work?",
            intent="meeting",
            suggested_action="Book team meeting",
            last_message_at="2026-06-28T08:15:00Z",
            messages=[
                EmailMessage(
                    id="msg-tom-1",
                    direction="inbound",
                    subject="Re: times that work?",
                    body="Happy to meet next week. Please send a calendar link.",
                    sent_at="2026-06-28T08:15:00Z",
                )
            ],
        ),
        InboxThread(
            id="thread-aiko",
            contact_name="Aiko Tanaka",
            company="Sakura Cloud",
            subject="Re: cloud migration benchmarks",
            intent="later",
            suggested_action="Schedule nurture follow-up",
            last_message_at="2026-06-27T16:10:00Z",
            messages=[
                EmailMessage(
                    id="msg-aiko-1",
                    direction="inbound",
                    subject="Re: cloud migration benchmarks",
                    body="Interesting, but our planning cycle starts next quarter.",
                    sent_at="2026-06-27T16:10:00Z",
                )
            ],
        ),
    ]


def get_manual_confirm_queue() -> list[ManualConfirmItem]:
    return [
        ManualConfirmItem(
            id="confirm-mara",
            contact_name="Mara Whitfield",
            company="Northwind Labs",
            intent="interested",
            suggested_action="send_next",
            reply_excerpt="This looks relevant. Can you send details?",
        ),
        ManualConfirmItem(
            id="confirm-tom",
            contact_name="Tom Becker",
            company="Hexadata",
            intent="meeting",
            suggested_action="book_meeting",
            reply_excerpt="Happy to meet next week. Please send a calendar link.",
        ),
    ]


def get_company_progress(company_id: str) -> CompanyProgress | None:
    progress_by_id = {
        "northwind-labs": CompanyProgress(
            company_id="northwind-labs",
            company_name="Northwind Labs",
            industry="B2B SaaS",
            overall_status="replied_interested",
            feasibility="Worth follow-up",
            last_contacted_at="2026-06-28T09:30:00Z",
            contacts_hit=8,
            total_contacts=12,
            latest_reply=LatestReply(
                contact_name="Mara Whitfield",
                intent="interested",
                excerpt="This looks relevant. Can you send details?",
                received_at="2026-06-28T09:30:00Z",
            ),
        )
    }
    return progress_by_id.get(company_id)


def get_contact_timeline(contact_id: str) -> ContactTimeline | None:
    timeline_by_id = {
        "mara-whitfield": ContactTimeline(
            contact_id="mara-whitfield",
            contact_name="Mara Whitfield",
            company_name="Northwind Labs",
            current_state="replied_interested",
            items=[
                TimelineEvent(
                    id="timeline-mara-1",
                    event_type="sent",
                    title="Template sent",
                    detail="SaaS intro · short v3",
                    occurred_at="2026-06-27T09:00:00Z",
                ),
                TimelineEvent(
                    id="timeline-mara-2",
                    event_type="reply",
                    title="Interested reply",
                    detail="This looks relevant. Can you send details?",
                    occurred_at="2026-06-28T09:30:00Z",
                ),
                TimelineEvent(
                    id="timeline-mara-3",
                    event_type="state_change",
                    title="State changed",
                    detail="awaiting_reply -> replied_interested",
                    occurred_at="2026-06-28T09:31:00Z",
                ),
            ],
        )
    }
    return timeline_by_id.get(contact_id)


def get_templates() -> list[EmailTemplate]:
    return [
        EmailTemplate(
            id="intro_saas",
            name="SaaS intro · short",
            category="Cold outreach",
            version=3,
            status="online",
            locked=True,
            used_by_active_campaigns=["APAC · B2B SaaS"],
            variables=["{first_name}", "{company}"],
            subject="cut {company} onboarding time by 40%",
            preview="Hi {first_name}, noticed {company} is scaling fast...",
        ),
        EmailTemplate(
            id="case_study",
            name="Case study drop",
            category="Nurture",
            version=2,
            status="online",
            locked=False,
            used_by_active_campaigns=[],
            variables=["{industry}", "{first_name}"],
            subject="how {industry} teams ship faster",
            preview="Sharing a quick result from a peer in {industry}...",
        ),
        EmailTemplate(
            id="breakup",
            name="Break-up nudge",
            category="Follow-up",
            version=1,
            status="draft",
            locked=False,
            used_by_active_campaigns=[],
            variables=["{first_name}"],
            subject="should I close your file, {first_name}?",
            preview="Hi {first_name}, haven't heard back so I'll assume...",
        ),
        EmailTemplate(
            id="meeting_confirm",
            name="Meeting confirm",
            category="Booking",
            version=4,
            status="offline",
            locked=False,
            used_by_active_campaigns=[],
            variables=["{first_name}", "{company}"],
            subject="{first_name} - times that work?",
            preview="Great to hear you're interested. Here's my calendar...",
        ),
    ]
