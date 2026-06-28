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

export type Company = {
  id: string;
  name: string;
  industry: string;
  size: string;
  status: string;
  progress: number;
  contacts_hit: number;
  last_contacted: string;
  feasibility: string;
};

export type CompanyListResponse = {
  total: number;
  items: Company[];
};

export type ImportPreview = {
  source_file: string;
  file_size: string;
  total_rows: number;
  detected_columns: string[];
  mapped_count: number;
  mapping_rows: Array<{
    source_column: string;
    sample_value: string;
    target_field: string;
    confidence: string;
    mapped: boolean;
  }>;
  validation: {
    total_rows: number;
    ready_to_import: number;
    need_attention: number;
    issues: Array<{
      label: string;
      detail: string;
      count: number;
      action: string;
      severity: "error" | "warning" | "info";
    }>;
  };
  verification: {
    stages: Array<{ name: string; passed: number; failed: number }>;
    buckets: VerificationBucket[];
    send_eligible: number;
    suppressed: number;
  };
};

export type Campaign = {
  id: string;
  name: string;
  status: string;
  template_id: string;
  template_name: string;
  manual_confirm_gate: boolean;
  rules: {
    industry: string;
    send_window: string;
    daily_cap_per_mailbox: number;
    active_mailboxes: number;
    send_interval_minutes: number;
    cool_down_days: number;
    dedupe_across_campaigns: boolean;
    auto_suppress_unsubscribed: boolean;
  };
  eligibility: {
    audience: number;
    valid_emails: number;
    suppressed: number;
    eligible_recipients: number;
    estimated_days: number;
  };
};

export type CampaignListResponse = {
  total: number;
  items: Campaign[];
};

export type CampaignLaunchSummary = {
  campaign_id: string;
  launch_label: string;
  route: "review_queue" | "send_queue" | string;
  eligible_recipients: number;
  daily_total: number;
  estimated_days: number;
  first_send: string;
};

export type EmailMessage = {
  id: string;
  direction: "outbound" | "inbound";
  subject: string;
  body: string;
  sent_at: string;
};

export type InboxThread = {
  id: string;
  contact_name: string;
  company: string;
  subject: string;
  intent: string;
  suggested_action: string;
  last_message_at: string;
  messages: EmailMessage[];
};

export type InboxThreadListResponse = {
  total: number;
  items: InboxThread[];
};

export type ManualConfirmItem = {
  id: string;
  contact_name: string;
  company: string;
  intent: string;
  suggested_action: string;
  reply_excerpt: string;
};

export type ManualConfirmQueueResponse = {
  total: number;
  items: ManualConfirmItem[];
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

export function fetchCompanies() {
  return request<CompanyListResponse>("/api/v1/companies");
}

export function fetchImportPreview() {
  return request<ImportPreview>("/api/v1/imports/preview");
}

export function fetchCampaigns() {
  return request<CampaignListResponse>("/api/v1/campaigns");
}

export function fetchCampaignLaunchSummary(campaignId: string) {
  return request<CampaignLaunchSummary>(`/api/v1/campaigns/${campaignId}/launch-summary`);
}

export function fetchInboxThreads() {
  return request<InboxThreadListResponse>("/api/v1/inbox/threads");
}

export function fetchManualConfirmQueue() {
  return request<ManualConfirmQueueResponse>("/api/v1/inbox/manual-confirm");
}

export function fetchTemplates() {
  return request<TemplateListResponse>("/api/v1/templates");
}
