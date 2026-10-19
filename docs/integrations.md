# Integrations

## Supabase
Authentication, PostgreSQL, RLS, database migrations, and optional Edge Functions. Use anon/publishable key in browser and privileged keys only in server-side secret storage.

## CSV/XLSX
- MVP: CSV template, preview, validation, commit.
- Next: `.xlsx` parsing with a maintained library in a controlled server-side workflow.
- Enforce size/row limits, schema validation, duplicate detection, and safe export escaping.

## PDF and QR
Generate a PDF statement after the computed no-dues status is cleared. Generate a QR code pointing to a public verification route containing an opaque token. The verification endpoint returns minimal fields and supports revocation.

## Email
Optional: send application-stage or clearance notifications through a transactional email provider. Use templates, rate limits, delivery logging, and opt-out rules where applicable. Do not send sensitive offer details in subject lines.

## University SSO / SIS
Future integration only after the institution provides approved API access, documented identifiers, and privacy/security requirements. Avoid scraping portals or collecting student credentials.

## External College Fee/Dues Gateway (Part 10)
- Configurable portal destination (e.g. SBI Collect / BillDesk / TechProcess / HDFC Qfix gateway).
- Configurable URL managed by Placement Administrators under Settings & Policy.
- Student workflow: student clicks "Open Gateway", completes payment on bank site, and submits transaction reference (DU number / UTR) and payment date.
- Department reconciliation: authorized faculty review submitted payment references and verify against university bank scrolls.
- Automated clearance: verifying a receipt automatically clears the corresponding department clearance record.

## Video Conferencing & Interview Links (Part 8)
- Recruiter round scheduling supports Google Meet, Microsoft Teams, and Zoom links.
- One-click join and clipboard copy buttons embedded directly on candidate and faculty interview cards.
- Offline venue mode available for campus boardroom and laboratory interviews.

## Charts
Use Recharts or accessible tables for department comparison, package summaries, funnel conversion, and no-dues completion. Always provide table equivalents for key metrics.
