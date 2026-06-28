import { useState } from "react";
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BadgeCheck,
  Building2,
  Check,
  ChevronRight,
  Copy,
  Database,
  FileText,
  Grid2X2,
  Inbox as InboxIcon,
  ListChecks,
  Lock,
  Mail,
  Search,
  Send,
  Upload,
  Users,
} from "lucide-react";

import {
  type Campaign,
  type CampaignLaunchSummary,
  type Company,
  type CompanyProgress,
  type Contact,
  type ContactTimeline,
  type DashboardSummary,
  type EmailTemplate,
  type ImportPreview,
  type InboxThread,
  type MailboxSummary,
  type ManualConfirmItem,
  fetchCampaignLaunchSummary,
  fetchCampaigns,
  fetchCompanies,
  fetchCompanyProgress,
  fetchContactTimeline,
  fetchContacts,
  fetchDashboardSummary,
  fetchInboxThreads,
  fetchImportPreview,
  fetchMailboxSummary,
  fetchManualConfirmQueue,
  fetchTemplates,
} from "./api";

type Screen = "dashboard" | "contacts" | "companies" | "import" | "campaigns" | "inbox" | "progress" | "templates" | "mailboxes";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: Grid2X2 },
  { id: "contacts", label: "Contacts", icon: Users },
  { id: "companies", label: "Companies", icon: Building2 },
  { id: "import", label: "Import data", icon: Upload },
  { id: "campaigns", label: "Campaigns", icon: Send },
  { id: "inbox", label: "Inbox", icon: InboxIcon },
  { id: "progress", label: "Progress", icon: ListChecks },
  { id: "templates", label: "Templates", icon: FileText },
] satisfies Array<{ id: Screen; label: string; icon: typeof Grid2X2 }>;

const infrastructureItems = [{ id: "mailboxes", label: "Mailboxes", icon: Mail }] satisfies Array<{
  id: Screen;
  label: string;
  icon: typeof Mail;
}>;

const statusLabels: Record<string, string> = {
  valid: "Valid",
  risky: "Risky",
  invalid: "Invalid",
  unknown: "Unknown",
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function statusLabel(status: string) {
  return statusLabels[status] ?? status;
}

function App() {
  const [screen, setScreen] = useState<Screen>("dashboard");

  return (
    <div className="app-shell">
      <Sidebar current={screen} onNavigate={setScreen} />
      <div className="workspace">
        <Topbar screen={screen} onImport={() => setScreen("import")} />
        <main className="main-panel">
          {screen === "dashboard" && <Dashboard />}
          {screen === "contacts" && <Contacts />}
          {screen === "companies" && <Companies />}
          {screen === "import" && <ImportWizard />}
          {screen === "campaigns" && <Campaigns />}
          {screen === "inbox" && <Inbox />}
          {screen === "progress" && <Progress />}
          {screen === "templates" && <Templates />}
          {screen === "mailboxes" && <Mailboxes />}
        </main>
      </div>
    </div>
  );
}

function Sidebar({ current, onNavigate }: { current: Screen; onNavigate: (screen: Screen) => void }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark" aria-hidden="true">
          <span />
        </div>
        <div>
          <strong>Outreach OS</strong>
          <small>sales engagement</small>
        </div>
      </div>

      <NavGroup title="Workspace" items={navItems} current={current} onNavigate={onNavigate} />
      <NavGroup title="Infrastructure" items={infrastructureItems} current={current} onNavigate={onNavigate} />

      <div className="user-card">
        <div className="avatar">DK</div>
        <div>
          <strong>Dana Keller</strong>
          <span>Sales Ops · Admin</span>
        </div>
      </div>
    </aside>
  );
}

function NavGroup({
  title,
  items,
  current,
  onNavigate,
}: {
  title: string;
  items: Array<{ id: Screen; label: string; icon: typeof Grid2X2 }>;
  current: Screen;
  onNavigate: (screen: Screen) => void;
}) {
  return (
    <div className="nav-group">
      <div className="nav-label">{title}</div>
      <nav>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              className={item.id === current ? "nav-item active" : "nav-item"}
              key={item.id}
              onClick={() => onNavigate(item.id)}
              type="button"
            >
              <Icon size={16} strokeWidth={1.8} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function Topbar({ screen, onImport }: { screen: Screen; onImport: () => void }) {
  const crumbs: Record<Screen, [string, string?]> = {
    dashboard: ["Dashboard"],
    contacts: ["Contacts"],
    companies: ["Companies"],
    import: ["Import data", "New import"],
    campaigns: ["Campaigns", "Configuration"],
    inbox: ["Inbox"],
    progress: ["Progress"],
    templates: ["Templates"],
    mailboxes: ["Mailboxes"],
  };
  const [root, leaf] = crumbs[screen];

  return (
    <header className="topbar">
      <div className="crumbs">
        <strong>{root}</strong>
        {leaf ? (
          <>
            <ChevronRight size={14} />
            <span>{leaf}</span>
          </>
        ) : null}
      </div>
      <div className="topbar-actions">
        <div className="search-box">
          <Search size={14} />
          <span>Search contacts, companies...</span>
          <kbd>⌘K</kbd>
        </div>
        <button className="primary-button" onClick={onImport} type="button">
          <Upload size={14} />
          Import
        </button>
      </div>
    </header>
  );
}

function Dashboard() {
  const query = useQuery({ queryKey: ["dashboard-summary"], queryFn: fetchDashboardSummary });

  return (
    <section className="screen screen-wide">
      <ScreenHeader
        title="Outreach overview"
        subtitle="Broad-send & fishing stage · APAC + NA cold pipeline"
        meta="Sending live · 28 Jun 2026"
      />
      <QueryState query={query}>
        {(data) => <DashboardContent data={data} />}
      </QueryState>
    </section>
  );
}

function DashboardContent({ data }: { data: DashboardSummary }) {
  return (
    <>
      <div className="kpi-grid">
        {data.kpis.map((kpi) => (
          <article className="metric-card" key={kpi.label}>
            <div className="metric-topline">
              <span>{kpi.label}</span>
              <strong>{kpi.trend}</strong>
            </div>
            <div className="metric-value">{kpi.value}</div>
            <p>{kpi.sub}</p>
          </article>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="column-stack">
          <Panel title="Email verification health" subtitle="4,860 contacts · syntax → MX → SMTP → catch-all">
            <div className="verification-layout">
              <div className="donut" aria-label="78% deliverable">
                <div>
                  <strong>78%</strong>
                  <span>deliverable</span>
                </div>
              </div>
              <div className="bucket-list">
                {data.verification_buckets.map((bucket) => (
                  <div className="bucket" key={bucket.status}>
                    <div>
                      <span className={`status-dot ${bucket.status}`} />
                      <span>{bucket.label}</span>
                      <strong>{formatNumber(bucket.count)}</strong>
                      <small>{bucket.pct}%</small>
                    </div>
                    <progress value={bucket.pct} max={100} aria-label={bucket.label} />
                  </div>
                ))}
              </div>
            </div>
          </Panel>

          <Panel title="Recent imports">
            <div className="mini-table">
              <div className="mini-head">
                <span>Source file</span>
                <span>Rows</span>
                <span>Status</span>
                <span>Date</span>
              </div>
              {[
                ["leads_q2_apac.xlsx", "1,248", "Verifying", "28 Jun"],
                ["fintech_seriesb.xlsx", "864", "Imported", "26 Jun"],
                ["webinar_signups.csv", "392", "Imported", "24 Jun"],
                ["enterprise_na.xlsx", "2,104", "48 errors", "21 Jun"],
              ].map((row) => (
                <div className="mini-row" key={row[0]}>
                  <span>{row[0]}</span>
                  <span>{row[1]}</span>
                  <span>
                    <Badge tone={row[2] === "Imported" ? "valid" : row[2] === "48 errors" ? "invalid" : "info"}>{row[2]}</Badge>
                  </span>
                  <span>{row[3]}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="column-stack">
          <Panel title="Sending queue" tag="Throttled">
            <div className="queue-number">
              <strong>{data.sending_queue.queued}</strong>
              <span>queued · {data.sending_queue.daily_cap_per_mailbox}/day per mailbox</span>
            </div>
            <progress className="queue-progress" value={46} max={100} aria-label="Sending queue progress" />
            <div className="split-note">
              <span>{data.sending_queue.sent_today} sent today</span>
              <span>{data.sending_queue.active_mailboxes} mailboxes active</span>
            </div>
          </Panel>

          <Panel title="Replies by intent" subtitle="last 7d">
            <div className="intent-list">
              {data.reply_intents.map((intent) => (
                <div key={intent.intent}>
                  <span className={`status-dot ${intent.intent}`} />
                  <span>{intent.label}</span>
                  <strong>{intent.count}</strong>
                </div>
              ))}
            </div>
            <div className="review-callout">
              <BadgeCheck size={16} />
              <span>
                <strong>12 replies</strong> awaiting manual confirmation
              </span>
            </div>
          </Panel>

          <Panel title="Suppression list">
            <div className="suppression-total">{data.suppression.total}</div>
            <div className="tag-row">
              <span>unsub {data.suppression.unsubscribed}</span>
              <span>invalid {data.suppression.invalid}</span>
              <span>opted-out {data.suppression.opted_out}</span>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}

function Contacts() {
  const query = useQuery({ queryKey: ["contacts"], queryFn: fetchContacts });

  return (
    <section className="screen screen-wide">
      <ScreenHeader title="Contacts" subtitle="Search, verify, and track individual outreach status." />
      <QueryState query={query}>
        {(data) => (
          <Panel title={`${data.total} contacts`}>
            <div className="data-table" role="table" aria-label="Contacts">
              <div className="table-row table-head" role="row">
                <span role="columnheader">Contact</span>
                <span role="columnheader">Company</span>
                <span role="columnheader">Email status</span>
                <span role="columnheader">Stage</span>
              </div>
              {data.items.map((contact) => (
                <ContactRow contact={contact} key={contact.id} />
              ))}
            </div>
          </Panel>
        )}
      </QueryState>
    </section>
  );
}

function ContactRow({ contact }: { contact: Contact }) {
  return (
    <div className="table-row" role="row">
      <span role="cell">
        <strong>{contact.name}</strong>
        <small>
          {contact.title} · {contact.email}
        </small>
      </span>
      <span role="cell">{contact.company}</span>
      <span role="cell">
        <Badge tone={contact.email_status}>{statusLabel(contact.email_status)}</Badge>
      </span>
      <span role="cell">{contact.stage}</span>
    </div>
  );
}

function Companies() {
  const query = useQuery({ queryKey: ["companies"], queryFn: fetchCompanies });

  return (
    <section className="screen screen-wide">
      <ScreenHeader title="Companies" subtitle="Account-level progress, last contact, and feasibility status." />
      <QueryState query={query}>
        {(data) => (
          <Panel title={`${data.total} companies`}>
            <div className="data-table company-table" role="table" aria-label="Companies">
              <div className="table-row table-head" role="row">
                <span role="columnheader">Company</span>
                <span role="columnheader">Industry</span>
                <span role="columnheader">Progress</span>
                <span role="columnheader">Feasibility</span>
                <span role="columnheader">Last contact</span>
              </div>
              {data.items.map((company) => (
                <CompanyRow company={company} key={company.id} />
              ))}
            </div>
          </Panel>
        )}
      </QueryState>
    </section>
  );
}

function CompanyRow({ company }: { company: Company }) {
  return (
    <div className="table-row" role="row">
      <span role="cell">
        <strong>{company.name}</strong>
        <small>
          {company.size} · {company.contacts_hit} contacts hit
        </small>
      </span>
      <span role="cell">{company.industry}</span>
      <span role="cell">
        <span className="progress-cell">
          <progress value={company.progress} max={100} aria-label={`${company.name} progress`} />
          <strong>{company.progress}%</strong>
        </span>
      </span>
      <span role="cell">
        <Badge tone={company.feasibility.toLowerCase()}>{company.feasibility}</Badge>
      </span>
      <span role="cell">{company.last_contacted}</span>
    </div>
  );
}

function Templates() {
  const query = useQuery({ queryKey: ["templates"], queryFn: fetchTemplates });

  return (
    <section className="screen screen-wide">
      <ScreenHeader
        title="Templates"
        subtitle="Lifecycle status controls send availability. Edit lock protects active campaigns."
      />
      <QueryState query={query}>
        {(data) => (
          <div className="template-grid">
            {data.items.map((template) => (
              <TemplateCard template={template} key={template.id} />
            ))}
          </div>
        )}
      </QueryState>
    </section>
  );
}

function TemplateCard({ template }: { template: EmailTemplate }) {
  const usage = template.locked
    ? `In use · ${template.used_by_active_campaigns.join(", ")}`
    : template.status === "draft"
      ? "Unpublished draft"
      : "Not in any active campaign";

  return (
    <article className={template.locked ? "template-card locked" : "template-card"}>
      <div className="template-top">
        <div>
          <strong>{template.name}</strong>
          <span>
            {template.category} · v{template.version}
          </span>
        </div>
        <div className="template-badges">
          <Badge tone={template.status}>{template.status[0].toUpperCase() + template.status.slice(1)}</Badge>
          {template.locked ? (
            <Badge tone="locked">
              <Lock size={12} />
              Locked
            </Badge>
          ) : null}
        </div>
      </div>
      <div className="subject-line">Subject: {template.subject}</div>
      <p>{template.preview}</p>
      <div className="variables">
        {template.variables.map((variable) => (
          <code key={variable}>{variable}</code>
        ))}
      </div>
      <div className="usage-line">
        <span className={template.locked ? "usage-dot active" : "usage-dot"} />
        {usage}
      </div>
      <div className="template-actions">
        {template.locked ? (
          <span className="pinned-status">
            <Lock size={13} />
            Online · pinned by campaign
          </span>
        ) : template.status === "draft" ? (
          <button className="secondary-button" type="button">
            Publish online
          </button>
        ) : (
          <button className="secondary-button" type="button">
            {template.status === "online" ? "Take offline" : "Take online"}
          </button>
        )}
        <button className={template.locked ? "primary-button compact" : "secondary-button"} type="button" aria-label={`${template.locked ? "Clone to edit" : "Edit"} ${template.name}`}>
          {template.locked ? <Copy size={14} /> : null}
          {template.locked ? "Clone to edit" : "Edit"}
        </button>
      </div>
    </article>
  );
}

function ImportWizard() {
  const query = useQuery({ queryKey: ["import-preview"], queryFn: fetchImportPreview });
  const steps = ["Upload", "Map fields", "Validate", "Verify", "Done"];

  return (
    <section className="screen">
      <ScreenHeader title="Import contacts" subtitle="Excel / CSV → field mapping → validation → email verification" />
      <QueryState query={query}>
        {(preview) => (
          <Panel>
            <div className="stepper" aria-label="Import steps">
              {steps.map((step, index) => (
                <div className={index <= 3 ? "step active" : "step"} key={step}>
                  <span>{index < 3 ? <Check size={13} /> : index + 1}</span>
                  {step}
                </div>
              ))}
            </div>
            <ImportContent preview={preview} />
          </Panel>
        )}
      </QueryState>
    </section>
  );
}

function ImportContent({ preview }: { preview: ImportPreview }) {
  return (
    <div className="import-grid">
      <div className="file-card">
        <Database size={24} />
        <div>
          <strong>{preview.source_file}</strong>
          <span>
            {preview.file_size} · parsed {formatNumber(preview.total_rows)} rows · {preview.detected_columns.length} columns detected
          </span>
        </div>
        <Badge tone="valid">Parsed</Badge>
      </div>

      <div className="mapping-list">
        <div className="mapping-head">
          <strong>{preview.mapped_count} of {preview.detected_columns.length}</strong>
          <span>columns mapped · Email required field</span>
        </div>
        {preview.mapping_rows.slice(0, 5).map((row) => (
          <div className="mapping-row" key={row.source_column}>
            <code>{row.source_column}</code>
            <span>{row.sample_value}</span>
            <strong>{row.target_field}</strong>
            <Badge tone={row.mapped ? "valid" : "unknown"}>{row.mapped ? "Mapped" : "Skipped"}</Badge>
          </div>
        ))}
      </div>

      <div className="validation-cards">
        <article>
          <span>Total rows</span>
          <strong>{formatNumber(preview.validation.total_rows)}</strong>
        </article>
        <article>
          <span>Ready to import</span>
          <strong>{formatNumber(preview.validation.ready_to_import)}</strong>
        </article>
        <article>
          <span>Need attention</span>
          <strong>{formatNumber(preview.validation.need_attention)}</strong>
        </article>
      </div>

      <div className="issue-list">
        {preview.validation.issues.map((issue) => (
          <div className="issue-row" key={issue.label}>
            <span className={`status-dot ${issue.severity === "error" ? "invalid" : issue.severity === "warning" ? "risky" : "meeting"}`} />
            <div>
              <strong>{issue.label}</strong>
              <small>{issue.detail}</small>
            </div>
            <b>{issue.count}</b>
            <Badge tone={issue.severity === "error" ? "invalid" : "info"}>{issue.action}</Badge>
          </div>
        ))}
      </div>

      <div className="verification-summary">
        <Panel title="Verification result" subtitle={`${formatNumber(preview.total_rows)} emails`}>
          <div className="bucket-list">
            {preview.verification.buckets.map((bucket) => (
              <div className="bucket" key={bucket.status}>
                <div>
                  <span className={`status-dot ${bucket.status}`} />
                  <span>{bucket.label}</span>
                  <strong>{formatNumber(bucket.count)}</strong>
                  <small>{bucket.pct}%</small>
                </div>
                <progress value={bucket.pct} max={100} aria-label={bucket.label} />
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Send eligibility">
          <div className="sendable-number">{formatNumber(preview.verification.send_eligible)}</div>
          <p className="body-copy">{formatNumber(preview.verification.suppressed)} routed to suppression</p>
        </Panel>
      </div>
    </div>
  );
}

function Campaigns() {
  const campaignsQuery = useQuery({ queryKey: ["campaigns"], queryFn: fetchCampaigns });

  return (
    <section className="screen screen-wide">
      <ScreenHeader title="Campaign configuration" subtitle="Template · industry rules · throttle · suppression" />
      <QueryState query={campaignsQuery}>
        {(data) => <CampaignsContent campaign={data.items[0]} />}
      </QueryState>
    </section>
  );
}

function CampaignsContent({ campaign }: { campaign: Campaign }) {
  const launchQuery = useQuery({
    queryKey: ["campaign-launch-summary", campaign.id],
    queryFn: () => fetchCampaignLaunchSummary(campaign.id),
  });

  return (
    <div className="campaign-layout">
      <Panel title="Campaign">
        <div className="campaign-title">
          <div>
            <strong>{campaign.name}</strong>
            <span>
              {campaign.status} · {campaign.template_name}
            </span>
          </div>
          <Badge tone={campaign.status === "live" ? "valid" : "info"}>{campaign.status}</Badge>
        </div>
        <div className="summary-row">
          <span>Audience</span>
          <strong>{formatNumber(campaign.eligibility.audience)}</strong>
        </div>
        <div className="summary-row">
          <span>Eligible recipients</span>
          <strong>{formatNumber(campaign.eligibility.eligible_recipients)}</strong>
        </div>
        <div className="summary-row">
          <span>Suppressed</span>
          <strong>{formatNumber(campaign.eligibility.suppressed)}</strong>
        </div>
      </Panel>

      <Panel title="Manual-confirm gate" tag={campaign.manual_confirm_gate ? "GATED" : "BROAD-SEND"}>
        <div className="gate-state">{campaign.manual_confirm_gate ? "On — review before send" : "Off — broad-send"}</div>
        <p className="body-copy">
          {campaign.manual_confirm_gate
            ? "Replies and outbound route to a review queue. Nothing leaves without human approval for this segment."
            : "Eligible recipients go directly into the throttled send queue."}
        </p>
        <QueryState query={launchQuery}>
          {(summary) => <LaunchSummary summary={summary} />}
        </QueryState>
      </Panel>

      <Panel title="Throttle and suppression">
        <div className="summary-row">
          <span>Daily cap per mailbox</span>
          <strong>{campaign.rules.daily_cap_per_mailbox}</strong>
        </div>
        <div className="summary-row">
          <span>Active mailboxes</span>
          <strong>{campaign.rules.active_mailboxes}</strong>
        </div>
        <div className="summary-row">
          <span>Send interval</span>
          <strong>{campaign.rules.send_interval_minutes} min</strong>
        </div>
        <div className="summary-row">
          <span>Cool-down</span>
          <strong>{campaign.rules.cool_down_days} days</strong>
        </div>
        <div className="summary-row">
          <span>Cross-campaign dedupe</span>
          <strong>{campaign.rules.dedupe_across_campaigns ? "On" : "Off"}</strong>
        </div>
        <div className="summary-row">
          <span>Auto-suppress unsubscribed</span>
          <strong>{campaign.rules.auto_suppress_unsubscribed ? "On" : "Off"}</strong>
        </div>
      </Panel>

      <Panel title="Industry rule">
        <div className="summary-row">
          <span>Industry</span>
          <strong>{campaign.rules.industry}</strong>
        </div>
        <div className="summary-row">
          <span>Sending window</span>
          <strong>{campaign.rules.send_window}</strong>
        </div>
        <div className="summary-row">
          <span>Template</span>
          <strong>{campaign.template_name}</strong>
        </div>
      </Panel>
    </div>
  );
}

function LaunchSummary({ summary }: { summary: CampaignLaunchSummary }) {
  return (
    <div className="launch-summary">
      <div className="summary-row">
        <span>Daily total</span>
        <strong>{summary.daily_total}/day</strong>
      </div>
      <div className="summary-row">
        <span>ETA</span>
        <strong>{summary.estimated_days} days</strong>
      </div>
      <div className="summary-row">
        <span>First send</span>
        <strong>{summary.first_send}</strong>
      </div>
      <button className="primary-button" type="button">
        {summary.launch_label}
      </button>
    </div>
  );
}

function Inbox() {
  const threadsQuery = useQuery({ queryKey: ["inbox-threads"], queryFn: fetchInboxThreads });
  const confirmQuery = useQuery({ queryKey: ["manual-confirm"], queryFn: fetchManualConfirmQueue });

  return (
    <section className="screen screen-wide">
      <ScreenHeader title="Inbox" subtitle="Inbound replies, intent analysis, and manual-confirm actions." />
      <div className="inbox-layout">
        <Panel title="Shared inbox">
          <QueryState query={threadsQuery}>
            {(data) => (
              <div className="thread-list">
                {data.items.map((thread) => (
                  <ThreadCard thread={thread} key={thread.id} />
                ))}
              </div>
            )}
          </QueryState>
        </Panel>
        <Panel title="Manual-confirm queue">
          <QueryState query={confirmQuery}>
            {(data) => (
              <div className="confirm-list">
                {data.items.map((item) => (
                  <ManualConfirmCard item={item} key={item.id} />
                ))}
              </div>
            )}
          </QueryState>
        </Panel>
      </div>
    </section>
  );
}

function ThreadCard({ thread }: { thread: InboxThread }) {
  const latest = thread.messages[thread.messages.length - 1];
  return (
    <article className="thread-card">
      <div className="thread-head">
        <div>
          <strong>{thread.contact_name}</strong>
          <span>{thread.company}</span>
        </div>
        <Badge tone={thread.intent}>{thread.intent[0].toUpperCase() + thread.intent.slice(1)}</Badge>
      </div>
      <div className="subject-line">{thread.subject}</div>
      <p>{latest.body}</p>
      <div className="thread-footer">
        <span>{latest.direction}</span>
        <strong>{thread.suggested_action}</strong>
      </div>
    </article>
  );
}

function ManualConfirmCard({ item }: { item: ManualConfirmItem }) {
  return (
    <article className="confirm-card">
      <div className="thread-head">
        <div>
          <strong>{item.contact_name}</strong>
          <span>{item.company}</span>
        </div>
        <Badge tone={item.intent}>{item.intent[0].toUpperCase() + item.intent.slice(1)}</Badge>
      </div>
      <p>{item.reply_excerpt}</p>
      <div className="confirm-actions">
        <button className="primary-button compact" type="button">
          {item.suggested_action === "book_meeting" ? "Book meeting" : "Send next"}
        </button>
        <button className="secondary-button" type="button">
          Suppress
        </button>
      </div>
    </article>
  );
}

function Progress() {
  const companyQuery = useQuery({
    queryKey: ["company-progress", "northwind-labs"],
    queryFn: () => fetchCompanyProgress("northwind-labs"),
  });
  const timelineQuery = useQuery({
    queryKey: ["contact-timeline", "mara-whitfield"],
    queryFn: () => fetchContactTimeline("mara-whitfield"),
  });

  return (
    <section className="screen screen-wide">
      <ScreenHeader title="Outreach progress" subtitle="Company feasibility, last contact, and contact timeline." />
      <div className="progress-layout">
        <Panel title="Company progress" subtitle="Northwind Labs">
          <QueryState query={companyQuery}>
            {(company) => <CompanyProgressCard progress={company} />}
          </QueryState>
        </Panel>
        <Panel title="Contact timeline" subtitle="Latest activity">
          <QueryState query={timelineQuery}>
            {(timeline) => <ContactTimelineList timeline={timeline} />}
          </QueryState>
        </Panel>
      </div>
    </section>
  );
}

function CompanyProgressCard({ progress }: { progress: CompanyProgress }) {
  const hitRate = Math.round((progress.contacts_hit / progress.total_contacts) * 100);

  return (
    <div className="progress-card">
      <div className="progress-topline">
        <div>
          <strong>{progress.company_name}</strong>
          <span>{progress.industry}</span>
        </div>
        <Badge tone="interested">{progress.feasibility}</Badge>
      </div>

      <div className="progress-meter">
        <div>
          <span>Contacts reached</span>
          <strong>
            {progress.contacts_hit} of {progress.total_contacts} contacts hit
          </strong>
        </div>
        <progress value={hitRate} max={100} aria-label={`${progress.company_name} contacts hit`} />
      </div>

      <div className="summary-row">
        <span>Overall status</span>
        <strong>{progress.overall_status.replace("_", " · ")}</strong>
      </div>
      <div className="summary-row">
        <span>Last contact</span>
        <strong>{progress.last_contacted_at}</strong>
      </div>
      <div className="latest-reply">
        <span>Latest reply</span>
        <strong>{progress.latest_reply.contact_name}</strong>
        <p>{progress.latest_reply.excerpt}</p>
        <Badge tone={progress.latest_reply.intent}>{progress.latest_reply.intent}</Badge>
      </div>
    </div>
  );
}

function ContactTimelineList({ timeline }: { timeline: ContactTimeline }) {
  return (
    <div className="timeline-list">
      <div className="timeline-state">
        <Badge tone="interested">{timeline.current_state.replace("_", " · ")}</Badge>
      </div>
      {timeline.items.map((item) => (
        <article className="timeline-item" key={item.id}>
          <span className={`status-dot ${item.event_type === "reply" ? "interested" : item.event_type === "sent" ? "meeting" : "valid"}`} />
          <div>
            <strong>{item.title}</strong>
            <p>{item.detail}</p>
            <time>{item.occurred_at}</time>
          </div>
        </article>
      ))}
    </div>
  );
}

function Mailboxes() {
  const query = useQuery({ queryKey: ["mailbox-summary"], queryFn: fetchMailboxSummary });

  return (
    <section className="screen screen-wide">
      <ScreenHeader title="Mailbox infrastructure" subtitle="Shared sending account, OAuth authorization, and deliverability." />
      <QueryState query={query}>{(data) => <MailboxContent data={data} />}</QueryState>
    </section>
  );
}

function MailboxContent({ data }: { data: MailboxSummary }) {
  return (
    <div className="mailbox-layout">
      <div className="column-stack">
        <Panel title="Shared mailbox" tag={data.shared_account.status}>
          <div className="mailbox-account">
            <div>
              <strong>{data.shared_account.email}</strong>
              <span>Shared sending and inbox sync</span>
            </div>
            <Badge tone="valid">{data.shared_account.status}</Badge>
          </div>
          <div className="mailbox-facts">
            <div>
              <span>Provider</span>
              <strong>{data.shared_account.provider}</strong>
            </div>
            <div>
              <span>Auth</span>
              <strong>{data.shared_account.auth_method}</strong>
            </div>
            <div>
              <span>Scopes</span>
              <strong>{data.shared_account.scopes.join(" · ")}</strong>
            </div>
          </div>
          <div className="token-note">
            <Lock size={14} />
            <span>{data.shared_account.token_storage} · revocable · least-privilege scopes only</span>
          </div>
        </Panel>

        <Panel title="Sending pool" subtitle="Warm-up and daily caps">
          <div className="mailbox-pool">
            {data.pool.map((mailbox) => (
              <div className="mailbox-row" key={mailbox.id}>
                <span>{mailbox.email}</span>
                <strong>
                  {mailbox.sent_today}/{mailbox.daily_cap}
                </strong>
                <progress value={mailbox.warmup_pct} max={100} aria-label={`${mailbox.email} warm-up`} />
                <Badge tone={mailbox.state === "healthy" ? "valid" : "later"}>{mailbox.state}</Badge>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="Deliverability health">
        <div className="dns-list">
          {data.dns_checks.map((check) => (
            <div className="dns-row" key={check.name}>
              <span className={`status-dot ${check.status === "aligned" || check.status === "valid" ? "valid" : "risky"}`} />
              <div>
                <strong>{check.name}</strong>
                <span>{check.detail}</span>
              </div>
              <Badge tone="valid">{check.status}</Badge>
            </div>
          ))}
        </div>
        <div className="deliverability-rates">
          <div className="summary-row">
            <span>Bounce rate</span>
            <strong>{data.deliverability.bounce_rate}</strong>
          </div>
          <div className="summary-row">
            <span>Spam complaint</span>
            <strong>{data.deliverability.complaint_rate}</strong>
          </div>
          <div className="summary-row">
            <span>Reply rate</span>
            <strong>{data.deliverability.reply_rate}</strong>
          </div>
        </div>
      </Panel>
    </div>
  );
}

function PlaceholderScreen({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <section className="screen screen-wide">
      <ScreenHeader title={title} subtitle={subtitle} />
      <Panel>
        <div className="empty-state">
          <Building2 size={24} />
          <strong>{title} module foundation</strong>
          <span>Screen route is wired. Module-specific endpoints and workflows come in the next build slices.</span>
        </div>
      </Panel>
    </section>
  );
}

function ScreenHeader({ title, subtitle, meta }: { title: string; subtitle: string; meta?: string }) {
  return (
    <div className="screen-header">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {meta ? <div className="live-meta">{meta}</div> : null}
    </div>
  );
}

function Panel({ title, subtitle, tag, children }: { title?: string; subtitle?: string; tag?: string; children: ReactNode }) {
  return (
    <section className="panel">
      {title || subtitle || tag ? (
        <div className="panel-header">
          <div>
            {title ? <h2>{title}</h2> : null}
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          {tag ? <Badge tone="valid">{tag}</Badge> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

function Badge({ tone, children }: { tone: string; children: ReactNode }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

function QueryState<T>({
  query,
  children,
}: {
  query: { data?: T; isLoading: boolean; isError: boolean; error: Error | null };
  children: (data: T) => ReactNode;
}) {
  if (query.isLoading) {
    return (
      <div className="skeleton-stack" aria-label="Loading">
        <span />
        <span />
        <span />
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="error-state" role="alert">
        {query.error?.message ?? "Unable to load data"}
      </div>
    );
  }

  return query.data ? <>{children(query.data)}</> : null;
}

export default App;
