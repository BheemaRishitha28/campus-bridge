# Project Implementation Plan

## Milestone 0 — Repository and design system
- Scaffold Vite, React, TypeScript, Tailwind.
- Add reusable buttons, fields, cards, table, modal, status pill, toast.
- Create responsive navigation and page shells.
- Keep sample UI clearly marked until connected.

## Milestone 1 — Supabase foundation
- Create project and environment variables.
- Apply migrations.
- Configure Auth providers and redirect URLs.
- Add sign-in/out and profile loading.
- Build role-aware navigation; still rely on RLS for actual security.

## Milestone 2 — Students and imports
- Admin student directory with search, department/batch filters and pagination.
- Downloadable CSV template.
- Preview parse: required headers, type validation, row numbers, duplicate-in-file and duplicate-in-database checks.
- Commit through server-side RPC/Edge Function after explicit confirmation.
- Report created/skipped/failed counts; never silently overwrite.

## Milestone 3 — Drives and applications
- Company CRUD.
- Drive editor and lifecycle.
- Eligibility explanation with current vs required values.
- Application stage updates and history.
- Offer table supports multiple offers and joins.
- Enforce open status, deadline and eligibility server-side.

## Milestone 4 — No-dues
- Configure categories and mandatory flag.
- Create missing clearance rows for relevant cohort.
- Admin queue and clearance detail.
- Atomic update + append-only audit entry.
- Overall status computed from mandatory categories.
- Prevent student self-approval at both RLS and server/RPC layers.

## Milestone 5 — Analytics and exports
- Create database views or tested queries for metrics.
- Add filters shared between dashboard and export.
- Validate metrics against hand-calculated fixtures.
- CSV export first; XLSX after core behaviour is stable.

## Milestone 6 — Certificates and advanced features
- Issue certificate only if status is cleared at issuance time.
- Generate cryptographically random opaque token; store only its hash.
- QR points to `/verify/:token`; verifier returns minimal allowed data.
- Support revocation and avoid predictable IDs.
- Add configurable placement policy and explainable eligibility.
- Add recruitment funnel and at-risk query.

## Milestone 7 — Quality and demo
- RLS tests for student A/student B/admin/anonymous.
- Accessibility and mobile checks.
- Test invalid imports, duplicate rows, race conditions, cancelled drives, withdrawn apps, missing mandatory clearance rows.
- Deploy staging and run smoke tests.
- Prepare demo script with synthetic data only.
