# Product

## Register

product

## Users

Outreach OS is used by internal sales, BD, sales operations, administrators, and team leads. Users work in an operational context where they import lead data, verify email quality, configure outreach campaigns, monitor shared mailbox health, triage replies, and track account progress.

## Product Purpose

The product standardizes the cold-outreach loop: data import, email verification, throttled sending, reply capture, intent-based follow-up, and progress tracking. Success means the team can run broad-send and fishing campaigns without losing deliverability control, duplicating outreach, or missing high-intent replies.

## Brand Personality

Operational, controlled, and trustworthy. The interface should feel like a reliable internal command surface: dense enough for daily work, clear about system state, and restrained in its visual language.

## Anti-references

Avoid marketing-page composition, decorative dashboards, prototype-only interactions, and standalone UI drafts outside the React frontend. The UI should not depend on Design Composer runtime files or root-level HTML mockups once a feature is implemented in `frontend/`.

## Design Principles

- Make system state explicit: verification, suppression, locks, queue routes, and permissions must be visible at the point of action.
- Prefer workflow clarity over decoration: every screen should help users decide the next operational step.
- Keep auditability intact: locked templates, OAuth scopes, and campaign routing should communicate why actions are allowed or blocked.
- Build from API-backed module boundaries: frontend screens should reflect the FastAPI `/api/v1` contract, not local prototype state.
- Support dense scanning: tables, cards, badges, and progress indicators should be compact, consistent, and readable.

## Accessibility & Inclusion

Target WCAG AA contrast for text and controls. Preserve keyboard-reachable navigation and actions, visible focus states, semantic headings, reduced-motion compatibility, and non-color-only status indicators where practical.
