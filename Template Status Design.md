# Template Status & Edit-Lock Design

How email templates move through their lifecycle, when they can be edited, and how that
is shown in the UI. This spec covers the **Templates** module (M2) and its dependency on
**Campaigns** (M2).

---

## 1. Why two concepts, not one

A template needs to answer two *independent* questions:

1. **Is it available to send with?** → its **lifecycle status**: `Online` / `Offline` / `Draft`
2. **Can its content be changed right now?** → its **edit lock**: `Editable` / `Locked`

These are deliberately separate. A template can be `Online` **and** `Editable`
(published but not yet attached to a live campaign), or `Online` **and** `Locked`
(published *and* in use). Collapsing them into one field forces impossible states
(e.g. "Active but how do I know if editing is safe?").

---

## 2. Lifecycle status

| Status | Meaning | Selectable in a campaign? | Default editability |
|---|---|---|---|
| **Draft** | Work in progress, never published. | No | Editable |
| **Online** | Published and live. The only state a campaign can attach. | Yes | Editable *until* attached to an active campaign |
| **Offline** | Previously published, now paused. Hidden from the campaign picker; existing finished campaigns keep their historical copy. | No (cannot be newly selected) | Editable |

**Transitions**

```
            publish                 take offline
  Draft ───────────────▶ Online ◀───────────────▶ Offline
   ▲                       │   take online            │
   │      (clone)          │                          │
   └───────────────────────┴──────────────────────────┘
        a Locked template is cloned into a new Draft
```

- `Draft → Online` — **Publish online**. Validates required variables exist.
- `Online → Offline` — **Take offline**. Blocked if the template is Locked (see §3).
- `Offline → Online` — **Take online**. Always allowed.
- `Online → Draft` — not allowed directly; create a new version via **Clone** instead.

---

## 3. Edit lock — the core rule

> **A template that is bound to at least one *active* campaign is Locked (read-only).**

"Active" = a campaign that is live / sending / queued for review — i.e. one that is
currently relying on the template's exact copy. Editing a template mid-flight would
silently change messages already scheduled or under human review, and breaks auditability
of what was actually sent.

- **Locked** ⇒ subject, body, variables, and category are read-only. The lifecycle
  status is also pinned to `Online` (you cannot take it offline while a live campaign
  depends on it).
- To change a locked template, **Clone to edit**: this creates a new `Draft` (v+1) that
  you edit freely and publish. The original keeps serving its campaign untouched.
- A template becomes editable again automatically once **every** active campaign using it
  finishes, is paused, or is pointed at a different template — `usedBy` drops to empty,
  the lock releases.

`locked = template.usedByActiveCampaigns.length > 0`
`editable = !locked`

### State matrix

| Lifecycle | In active campaign? | Lock | What the user can do |
|---|---|---|---|
| Draft | — (drafts can't be attached) | Editable | Edit · Publish online |
| Online | No | Editable | Edit · Take offline |
| Online | **Yes** | **Locked** | Clone to edit *(content frozen, status pinned)* |
| Offline | No | Editable | Edit · Take online |

> Note: Offline templates cannot be newly attached to a campaign, so an Offline template
> is never Locked. If a template is in an active campaign it is, by definition, Online.

---

## 4. UI treatment

**Status pill** (top-right of each card) — one pill, color-coded by lifecycle:

| Status | Dot / text color | Background |
|---|---|---|
| Online | green `oklch(0.46 0.13 150)` | `oklch(0.95 0.04 150)` |
| Offline | slate `oklch(0.5 0.012 265)` | `oklch(0.95 0.004 265)` |
| Draft | amber `oklch(0.55 0.12 65)` | `oklch(0.96 0.05 82)` |

**Lock badge** — an indigo `🔒 Locked` chip shown *next to* the status pill only when
locked. Lock is an overlay on top of status, never a replacement for it, so both facts
stay visible at a glance.

**Usage line** — one line under the variables:
- Locked: `In use · APAC · B2B SaaS` (indigo, with a filled dot)
- Editable + published: `Not in any active campaign` (muted)
- Draft: `Unpublished draft` (muted)

**Card footer controls**
- *Availability* (left): an Online⇄Offline toggle for editable published templates;
  a **Publish online** button for drafts; for locked templates a static
  `🔒 Online · pinned by campaign` label (no toggle).
- *Edit* (right): an **Edit** button when editable; a **Clone to edit** button
  (indigo, copy icon) when locked.

---

## 5. Edge cases & rules of record

- **Sending the lock down:** the lock is evaluated server-side at send/queue time, not
  just in the UI. Even if a client is stale, an edit to a locked template is rejected.
- **Versioning:** publishing always stamps a version (`v3 → v4`). A campaign records the
  exact version it launched with, so historical sends remain reproducible.
- **Multiple campaigns:** if two active campaigns share a template, `usedBy` lists both;
  the lock releases only when the **last** one releases it.
- **Offline safety:** taking a template offline never affects campaigns that already
  finished — they keep their captured copy. It only removes the template from the picker
  for *new* campaigns.
- **Deletion:** a Locked or Online template cannot be hard-deleted; it must be taken
  Offline first (and unlocked), which preserves audit history.
