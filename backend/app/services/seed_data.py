from app.schemas.contacts import Contact
from app.schemas.dashboard import (
    DashboardSummary,
    KpiMetric,
    ReplyIntent,
    SendingQueue,
    SuppressionSummary,
    VerificationBucket,
)
from app.schemas.templates import EmailTemplate


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
