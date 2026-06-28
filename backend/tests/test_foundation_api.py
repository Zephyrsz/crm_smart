from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health_endpoint_reports_service_and_api_version():
    response = client.get("/api/v1/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "service": "outreach-os-api",
        "api_version": "v1",
    }


def test_dashboard_summary_exposes_p1_operational_metrics():
    response = client.get("/api/v1/dashboard/summary")

    assert response.status_code == 200
    payload = response.json()
    assert payload["kpis"][0] == {
        "label": "Contacts",
        "value": "4,860",
        "sub": "+312 this week",
        "trend": "+6.9%",
    }
    assert payload["verification_buckets"] == [
        {"label": "Valid · deliverable", "count": 3792, "pct": 78, "status": "valid"},
        {"label": "Risky · catch-all", "count": 612, "pct": 13, "status": "risky"},
        {"label": "Invalid · bounce", "count": 288, "pct": 6, "status": "invalid"},
        {"label": "Unknown", "count": 168, "pct": 3, "status": "unknown"},
    ]
    assert payload["sending_queue"]["queued"] == 412
    assert payload["sending_queue"]["daily_cap_per_mailbox"] == 200
    assert payload["reply_intents"][0]["intent"] == "interested"
    assert payload["suppression"]["total"] == 386


def test_contacts_endpoint_returns_email_status_and_outreach_stage():
    response = client.get("/api/v1/contacts")

    assert response.status_code == 200
    payload = response.json()
    assert payload["total"] == 8
    assert payload["items"][0] == {
        "id": "mara-whitfield",
        "name": "Mara Whitfield",
        "title": "VP Marketing",
        "email": "mara.w@northwind.io",
        "company": "Northwind Labs",
        "email_status": "valid",
        "stage": "Replied · interested",
    }


def test_templates_endpoint_marks_active_campaign_templates_locked():
    response = client.get("/api/v1/templates")

    assert response.status_code == 200
    payload = response.json()
    intro = next(item for item in payload["items"] if item["id"] == "intro_saas")
    assert intro["status"] == "online"
    assert intro["locked"] is True
    assert intro["used_by_active_campaigns"] == ["APAC · B2B SaaS"]

    draft = next(item for item in payload["items"] if item["id"] == "breakup")
    assert draft["status"] == "draft"
    assert draft["locked"] is False


def test_import_preview_exposes_mapping_validation_and_verification_stages():
    response = client.get("/api/v1/imports/preview")

    assert response.status_code == 200
    payload = response.json()
    assert payload["source_file"] == "leads_q2_apac.xlsx"
    assert payload["total_rows"] == 1248
    assert payload["detected_columns"][:3] == ["first_name", "last_name", "work_email"]
    assert payload["mapped_count"] == 7
    assert payload["validation"]["ready_to_import"] == 1006
    assert payload["validation"]["issues"][0] == {
        "label": "Missing email address",
        "detail": "rows 44, 109, 251 ... cannot be contacted",
        "count": 38,
        "action": "skip",
        "severity": "error",
    }
    assert payload["verification"]["send_eligible"] == 842
    assert payload["verification"]["buckets"][0]["status"] == "valid"


def test_companies_endpoint_returns_account_progress_and_feasibility():
    response = client.get("/api/v1/companies")

    assert response.status_code == 200
    payload = response.json()
    assert payload["total"] == 6
    assert payload["items"][0] == {
        "id": "northwind-labs",
        "name": "Northwind Labs",
        "industry": "B2B SaaS",
        "size": "200-500",
        "status": "active",
        "progress": 70,
        "contacts_hit": 8,
        "last_contacted": "2d",
        "feasibility": "Valid",
    }


def test_campaigns_endpoint_exposes_rules_gate_and_launch_summary():
    response = client.get("/api/v1/campaigns")

    assert response.status_code == 200
    payload = response.json()
    assert payload["total"] == 3
    campaign = payload["items"][0]
    assert campaign["name"] == "APAC · B2B SaaS"
    assert campaign["template_id"] == "intro_saas"
    assert campaign["manual_confirm_gate"] is True
    assert campaign["rules"]["daily_cap_per_mailbox"] == 200
    assert campaign["rules"]["cool_down_days"] == 14
    assert campaign["eligibility"] == {
        "audience": 1248,
        "valid_emails": 842,
        "suppressed": 406,
        "eligible_recipients": 842,
        "estimated_days": 2,
    }


def test_campaign_launch_summary_respects_manual_confirm_gate():
    response = client.get("/api/v1/campaigns/apac-saas/launch-summary")

    assert response.status_code == 200
    assert response.json() == {
        "campaign_id": "apac-saas",
        "launch_label": "Queue for review",
        "route": "review_queue",
        "eligible_recipients": 842,
        "daily_total": 600,
        "estimated_days": 2,
        "first_send": "Tomorrow · 09:00",
    }


def test_inbox_threads_expose_inbound_outbound_history_and_intent():
    response = client.get("/api/v1/inbox/threads")

    assert response.status_code == 200
    payload = response.json()
    assert payload["total"] == 3
    assert payload["items"][0]["contact_name"] == "Mara Whitfield"
    assert payload["items"][0]["intent"] == "interested"
    assert payload["items"][0]["suggested_action"] == "Send next-step template"
    assert payload["items"][0]["messages"][0]["direction"] == "outbound"
    assert payload["items"][0]["messages"][1]["direction"] == "inbound"


def test_manual_confirm_queue_exposes_actionable_replies():
    response = client.get("/api/v1/inbox/manual-confirm")

    assert response.status_code == 200
    payload = response.json()
    assert payload["total"] == 2
    assert payload["items"][0] == {
        "id": "confirm-mara",
        "contact_name": "Mara Whitfield",
        "company": "Northwind Labs",
        "intent": "interested",
        "suggested_action": "send_next",
        "reply_excerpt": "This looks relevant. Can you send details?",
    }
