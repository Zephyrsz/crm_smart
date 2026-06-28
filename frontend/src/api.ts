export type KpiMetric = {
  label: string;
  value: string;
  sub: string;
  trend: string;
};

export type VerificationBucket = {
  label: string;
  count: number;
  pct: number;
  status: "valid" | "risky" | "invalid" | "unknown" | string;
};

export type DashboardSummary = {
  kpis: KpiMetric[];
  verification_buckets: VerificationBucket[];
  sending_queue: {
    queued: number;
    sent_today: number;
    active_mailboxes: number;
    daily_cap_per_mailbox: number;
  };
  reply_intents: Array<{
    intent: string;
    label: string;
    count: number;
  }>;
  suppression: {
    total: number;
    unsubscribed: number;
    invalid: number;
    opted_out: number;
  };
};

export type Contact = {
  id: string;
  name: string;
  title: string;
  email: string;
  company: string;
  email_status: "valid" | "risky" | "invalid" | "unknown" | string;
  stage: string;
};

export type ContactListResponse = {
  total: number;
  items: Contact[];
};

export type EmailTemplate = {
  id: string;
  name: string;
  category: string;
  version: number;
  status: "online" | "offline" | "draft";
  locked: boolean;
  used_by_active_campaigns: string[];
  variables: string[];
  subject: string;
  preview: string;
};

export type TemplateListResponse = {
  items: EmailTemplate[];
};

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export function fetchDashboardSummary() {
  return request<DashboardSummary>("/api/v1/dashboard/summary");
}

export function fetchContacts() {
  return request<ContactListResponse>("/api/v1/contacts");
}

export function fetchTemplates() {
  return request<TemplateListResponse>("/api/v1/templates");
}
