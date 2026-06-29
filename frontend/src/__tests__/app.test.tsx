import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import App from "../App";

const dashboardSummary = {
  kpis: [
    { label: "Contacts", value: "4,860", sub: "+312 this week", trend: "+6.9%" },
    { label: "Deliverable", value: "78%", sub: "3,792 verified valid", trend: "+2.1%" },
    { label: "Active campaigns", value: "3", sub: "2 throttled · 1 review", trend: "live" },
    { label: "Awaiting confirm", value: "12", sub: "high-intent replies", trend: "+4" }
  ],
  verification_buckets: [
    { label: "Valid · deliverable", count: 3792, pct: 78, status: "valid" },
    { label: "Risky · catch-all", count: 612, pct: 13, status: "risky" }
  ],
  sending_queue: { queued: 412, sent_today: 92, active_mailboxes: 3, daily_cap_per_mailbox: 200 },
  reply_intents: [{ intent: "interested", label: "Interested", count: 5 }],
  suppression: { total: 386, unsubscribed: 142, invalid: 188, opted_out: 56 }
};

const contacts = {
  total: 1,
  items: [
    {
      id: "mara-whitfield",
      name: "Mara Whitfield",
      title: "VP Marketing",
      email: "mara.w@northwind.io",
      company: "Northwind Labs",
      email_status: "valid",
      stage: "Replied · interested"
    }
  ]
};

const templates = {
  items: [
    {
      id: "intro_saas",
      name: "SaaS intro · short",
      category: "Cold outreach",
      version: 3,
      status: "online",
      locked: true,
      used_by_active_campaigns: ["APAC · B2B SaaS"],
      variables: ["{first_name}", "{company}"],
      subject: "cut {company} onboarding time by 40%",
      preview: "Hi {first_name}, noticed {company} is scaling fast…"
    }
  ]
};

const importPreview = {
  source_file: "leads_q2_apac.xlsx",
  total_rows: 1248,
  detected_columns: ["first_name", "last_name", "work_email"],
  mapped_count: 7,
  mapping_rows: [
    {
      source_column: "work_email",
      sample_value: "mara.w@northwind.io",
      target_field: "Email",
      confidence: "auto 99%",
      mapped: true
    }
  ],
  validation: {
    ready_to_import: 1006,
    need_attention: 242,
    issues: [
      {
        label: "Missing email address",
        detail: "rows 44, 109, 251 ... cannot be contacted",
        count: 38,
        action: "skip",
        severity: "error"
      }
    ]
  },
  verification: {
    send_eligible: 842,
    suppressed: 406,
    buckets: [{ label: "Valid · deliverable", count: 842, pct: 67, status: "valid" }]
  }
};

const companies = {
  total: 1,
  items: [
    {
      id: "northwind-labs",
      name: "Northwind Labs",
      industry: "B2B SaaS",
      size: "200-500",
      status: "active",
      progress: 70,
      contacts_hit: 8,
      last_contacted: "2d",
      feasibility: "Valid"
    }
  ]
};

const campaigns = {
  total: 1,
  items: [
    {
      id: "apac-saas",
      name: "APAC · B2B SaaS",
      status: "live",
      template_id: "intro_saas",
      template_name: "SaaS intro · short",
      manual_confirm_gate: true,
      rules: {
        industry: "B2B SaaS",
        send_window: "09:00-16:30 local",
        daily_cap_per_mailbox: 200,
        active_mailboxes: 3,
        send_interval_minutes: 7,
        cool_down_days: 14,
        dedupe_across_campaigns: true,
        auto_suppress_unsubscribed: true
      },
      eligibility: {
        audience: 1248,
        valid_emails: 842,
        suppressed: 406,
        eligible_recipients: 842,
        estimated_days: 2
      }
    }
  ]
};

const launchSummary = {
  campaign_id: "apac-saas",
  launch_label: "Queue for review",
  route: "review_queue",
  eligible_recipients: 842,
  daily_total: 600,
  estimated_days: 2,
  first_send: "Tomorrow · 09:00"
};

const inboxThreads = {
  total: 1,
  items: [
    {
      id: "thread-mara",
      contact_name: "Mara Whitfield",
      company: "Northwind Labs",
      subject: "Re: cut Northwind onboarding time by 40%",
      intent: "interested",
      suggested_action: "Send next-step template",
      last_message_at: "2026-06-28T09:30:00Z",
      messages: [
        { id: "msg-1", direction: "outbound", subject: "cut Northwind onboarding time by 40%", body: "Hi Mara...", sent_at: "2026-06-27T09:00:00Z" },
        { id: "msg-2", direction: "inbound", subject: "Re: cut Northwind onboarding time by 40%", body: "This looks relevant. Can you send details?", sent_at: "2026-06-28T09:30:00Z" }
      ]
    }
  ]
};

const manualConfirm = {
  total: 1,
  items: [
    {
      id: "confirm-mara",
      contact_name: "Mara Whitfield",
      company: "Northwind Labs",
      intent: "interested",
      suggested_action: "send_next",
      reply_excerpt: "This looks relevant. Can you send details?"
    }
  ]
};

const companyProgress = {
  company_id: "northwind-labs",
  company_name: "Northwind Labs",
  industry: "B2B SaaS",
  overall_status: "replied_interested",
  feasibility: "Worth follow-up",
  last_contacted_at: "2026-06-28T09:30:00Z",
  contacts_hit: 8,
  total_contacts: 12,
  latest_reply: {
    contact_name: "Mara Whitfield",
    intent: "interested",
    excerpt: "This looks relevant. Can you send details?",
    received_at: "2026-06-28T09:30:00Z"
  }
};

const contactTimeline = {
  contact_id: "mara-whitfield",
  contact_name: "Mara Whitfield",
  company_name: "Northwind Labs",
  current_state: "replied_interested",
  items: [
    {
      id: "tl-1",
      event_type: "sent",
      title: "Template sent",
      detail: "SaaS intro · short v3",
      occurred_at: "2026-06-27T09:00:00Z"
    },
    {
      id: "tl-2",
      event_type: "reply",
      title: "Interested reply",
      detail: "This looks relevant. Can you send details?",
      occurred_at: "2026-06-28T09:30:00Z"
    }
  ]
};

const mailboxSummary = {
  shared_account: {
    email: "outbound@northwind.io",
    provider: "Microsoft Graph",
    auth_method: "OAuth2 refresh token",
    status: "connected",
    scopes: ["Mail.Send", "Mail.Read"],
    token_storage: "Encrypted at rest"
  },
  pool: [
    {
      id: "outbound-primary",
      email: "outbound@northwind.io",
      sent_today: 92,
      daily_cap: 200,
      warmup_pct: 46,
      state: "healthy"
    }
  ],
  dns_checks: [
    { name: "SPF", detail: "v=spf1 include:_spf.northwind.io", status: "aligned" },
    { name: "DKIM", detail: "2048-bit selector s1", status: "valid" },
    { name: "DMARC", detail: "p=quarantine rua reporting on", status: "valid" }
  ],
  deliverability: {
    bounce_rate: "1.4%",
    complaint_rate: "0.02%",
    reply_rate: "7.8%"
  }
};

const permissions = {
  current_user: { name: "Dana Keller", role: "sales_ops_admin" },
  roles: [
    {
      role: "sales_ops_admin",
      label: "Sales Ops Admin",
      permissions: [
        { action: "campaign.launch", allowed: true, scope: "all campaigns" },
        { action: "template.offline", allowed: false, scope: "locked templates" }
      ]
    },
    {
      role: "sales_bd",
      label: "Sales / BD",
      permissions: [{ action: "reply.confirm", allowed: true, scope: "assigned contacts" }]
    }
  ]
};

const auditLog = {
  total: 3,
  items: [
    {
      id: "audit-1",
      actor: "Dana Keller",
      action: "template.offline_rejected",
      entity: "SaaS intro · short v3",
      occurred_at: "2026-06-28T10:12:00Z",
      outcome: "blocked"
    }
  ]
};

function renderApp() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });

  return render(
    <QueryClientProvider client={client}>
      <App />
    </QueryClientProvider>
  );
}

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string | URL | Request) => {
      const path = String(url);
      if (path.endsWith("/api/v1/dashboard/summary")) {
        return Response.json(dashboardSummary);
      }
      if (path.endsWith("/api/v1/contacts")) {
        return Response.json(contacts);
      }
      if (path.endsWith("/api/v1/templates")) {
        return Response.json(templates);
      }
      if (path.endsWith("/api/v1/imports/preview")) {
        return Response.json(importPreview);
      }
      if (path.endsWith("/api/v1/companies")) {
        return Response.json(companies);
      }
      if (path.endsWith("/api/v1/campaigns/apac-saas/launch-summary")) {
        return Response.json(launchSummary);
      }
      if (path.endsWith("/api/v1/campaigns")) {
        return Response.json(campaigns);
      }
      if (path.endsWith("/api/v1/inbox/threads")) {
        return Response.json(inboxThreads);
      }
      if (path.endsWith("/api/v1/inbox/manual-confirm")) {
        return Response.json(manualConfirm);
      }
      if (path.endsWith("/api/v1/progress/companies/northwind-labs")) {
        return Response.json(companyProgress);
      }
      if (path.endsWith("/api/v1/progress/contacts/mara-whitfield/timeline")) {
        return Response.json(contactTimeline);
      }
      if (path.endsWith("/api/v1/mailboxes/summary")) {
        return Response.json(mailboxSummary);
      }
      if (path.endsWith("/api/v1/system/permissions")) {
        return Response.json(permissions);
      }
      if (path.endsWith("/api/v1/system/audit-log")) {
        return Response.json(auditLog);
      }
      return new Response("Not found", { status: 404 });
    })
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Outreach OS shell", () => {
  test("renders the dashboard with metrics fetched from the API", async () => {
    renderApp();

    expect(await screen.findByRole("heading", { name: "Outreach overview" })).toBeInTheDocument();
    expect(screen.getByText("Broad-send & fishing stage · APAC + NA cold pipeline")).toBeInTheDocument();
    expect(await screen.findByText("4,860")).toBeInTheDocument();
    expect(screen.getByText("Email verification health")).toBeInTheDocument();
    expect(screen.getByText("412")).toBeInTheDocument();
    expect(screen.getByText("386")).toBeInTheDocument();
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Import$/ })).not.toBeInTheDocument();
  });

  test("navigates to contacts and renders email status plus outreach stage", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole("button", { name: "Contacts" }));

    expect(await screen.findByRole("heading", { name: "Contacts" })).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: "Search contacts" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Import$/ })).not.toBeInTheDocument();
    const row = screen.getByRole("row", { name: /Mara Whitfield/ });
    expect(within(row).getByText("Valid")).toBeInTheDocument();
    expect(within(row).getByText("Replied · interested")).toBeInTheDocument();
  });

  test("shows template lifecycle status and edit lock separately", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole("button", { name: "Templates" }));

    expect(await screen.findByRole("heading", { name: "Templates" })).toBeInTheDocument();
    expect(screen.getByText("Online")).toBeInTheDocument();
    expect(screen.getByText("Locked")).toBeInTheDocument();
    expect(screen.getByText("In use · APAC · B2B SaaS")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Clone to edit SaaS intro · short" })).toBeInTheDocument();
  });

  test("renders the M1 import wizard with validation and send eligibility data", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole("button", { name: "Import data" }));

    expect(await screen.findByRole("heading", { name: "Import contacts" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Import$/ })).toBeInTheDocument();
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
    expect(await screen.findByText("leads_q2_apac.xlsx")).toBeInTheDocument();
    expect(screen.getByText("1,006")).toBeInTheDocument();
    expect(screen.getByText("Missing email address")).toBeInTheDocument();
    expect(within(screen.getByText("Send eligibility").closest("section")!).getByText("842")).toBeInTheDocument();
  });

  test("renders company progress and feasibility status", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole("button", { name: "Companies" }));

    expect(await screen.findByRole("heading", { name: "Companies" })).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: "Search companies" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Import$/ })).not.toBeInTheDocument();
    const row = screen.getByRole("row", { name: /Northwind Labs/ });
    expect(within(row).getByText("B2B SaaS")).toBeInTheDocument();
    expect(within(row).getByText("70%")).toBeInTheDocument();
    expect(within(row).getByText("Valid")).toBeInTheDocument();
  });

  test("renders campaign rules, suppression, and manual-confirm gate", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole("button", { name: "Campaigns" }));

    expect(await screen.findByRole("heading", { name: "Campaign configuration" })).toBeInTheDocument();
    expect(await screen.findByText("APAC · B2B SaaS")).toBeInTheDocument();
    expect(screen.getByText("On — review before send")).toBeInTheDocument();
    expect(screen.getByText("200")).toBeInTheDocument();
    expect(screen.getByText("14 days")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Queue for review" })).toBeInTheDocument();
  });

  test("renders inbox threads with intent and manual-confirm queue", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole("button", { name: "Inbox" }));

    expect(await screen.findByRole("heading", { name: "Inbox" })).toBeInTheDocument();
    expect((await screen.findAllByText("Mara Whitfield")).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Interested").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Send next-step template")).toBeInTheDocument();
    expect(screen.getAllByText("This looks relevant. Can you send details?").length).toBeGreaterThanOrEqual(1);
  });

  test("renders outreach progress with company feasibility and contact timeline", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole("button", { name: "Progress" }));

    expect(await screen.findByRole("heading", { name: "Outreach progress" })).toBeInTheDocument();
    expect(await screen.findByText("Worth follow-up")).toBeInTheDocument();
    expect(screen.getByText("8 of 12 contacts hit")).toBeInTheDocument();
    expect(screen.getByText("Mara Whitfield")).toBeInTheDocument();
    expect(screen.getByText("Template sent")).toBeInTheDocument();
    expect(screen.getByText("Interested reply")).toBeInTheDocument();
  });

  test("renders mailbox infrastructure with OAuth and deliverability health", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole("button", { name: "Mailboxes" }));

    expect(await screen.findByRole("heading", { name: "Mailbox infrastructure" })).toBeInTheDocument();
    expect((await screen.findAllByText("outbound@northwind.io")).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Microsoft Graph")).toBeInTheDocument();
    expect(screen.getByText("OAuth2 refresh token")).toBeInTheDocument();
    expect(screen.getByText("Mail.Send · Mail.Read")).toBeInTheDocument();
    expect(screen.getByText("SPF")).toBeInTheDocument();
    expect(screen.getByText("1.4%")).toBeInTheDocument();
  });

  test("renders system permissions and audit log", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole("button", { name: "System" }));

    expect(await screen.findByRole("heading", { name: "System controls" })).toBeInTheDocument();
    expect(screen.getAllByText("Dana Keller").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Sales Ops Admin")).toBeInTheDocument();
    expect(screen.getByText("campaign.launch")).toBeInTheDocument();
    expect(screen.getByText("template.offline_rejected")).toBeInTheDocument();
    expect(screen.getAllByText("blocked").length).toBeGreaterThanOrEqual(1);
  });
});
