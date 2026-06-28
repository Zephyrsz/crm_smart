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
  });

  test("navigates to contacts and renders email status plus outreach stage", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole("button", { name: "Contacts" }));

    expect(await screen.findByRole("heading", { name: "Contacts" })).toBeInTheDocument();
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
    const row = screen.getByRole("row", { name: /Northwind Labs/ });
    expect(within(row).getByText("B2B SaaS")).toBeInTheDocument();
    expect(within(row).getByText("70%")).toBeInTheDocument();
    expect(within(row).getByText("Valid")).toBeInTheDocument();
  });
});
