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
