# Feature Development Guide

## Feature pattern
For each feature:
1. Add/adjust domain types.
2. Define the database constraints and RLS.
3. Add a migration; do not edit an already-applied migration in shared environments.
4. Implement a query/service function.
5. Implement the UI with loading, empty, success, and error states.
6. Add unit tests for pure logic and integration tests for access boundaries.
7. Update API docs and README.

## CSV/XLSX import
Recommended flow:
1. Parse file client-side only for preview, but treat preview as untrusted.
2. Upload to a server-side function or send parsed rows to a privileged function with size limits.
3. Validate header names, required fields, email format, department code, graduation year, CGPA, and roll number.
4. Detect duplicates in file and database.
5. Return a preview and row-level error list.
6. Commit only after explicit admin confirmation.
7. Use a transaction and unique constraints to handle races.
8. Keep a batch record with totals and error rows.
9. Never overwrite existing rows without an explicit separate update workflow.

## Placement analytics
Use a single shared definition of eligible cohort and placed status. Use `count(distinct student_id)` for unique placed students and `count(offer.id)` for offers. Filter out cancelled drives and rejected/withdrawn applications according to documented policy.

## No-dues transition
- Validate caller is an authorised approver.
- Fetch old status.
- Update clearance and insert audit row in the same transaction.
- Recompute overall status from active mandatory categories.
- Issue certificate only if all required items are cleared/N/A at issuance.
- Do not accept overall status from client.

## QR certificate
- Use a cryptographically random token with enough entropy.
- Store hash of token, not raw token.
- QR URL includes only opaque token.
- Public endpoint returns minimal approved fields.
- Revoke token when certificate is invalidated.
- Rate-limit public verification and avoid exposing raw internal admin UUID if policy considers it personal data.

## Dream offer policy
Implement as a server-side policy evaluator. Store policy configuration and effective dates. Return a structured reason such as `REGULAR_OFFER_RESTRICTION` or `CGPA_BELOW_MINIMUM`, with the current and required values where appropriate. Make rules visible and configurable by the institution.
