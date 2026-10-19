# Authentication and Security

## Authentication
Use Supabase Auth for password-based or institution-approved SSO. Enable email verification as appropriate. Configure allowed redirect URLs. Use password reset flows and never log passwords or access tokens.

## Role assignment
- A profile's role is trusted only when set through a secure admin-controlled process.
- Public signup must always create a student or remain disabled.
- Never allow a user to update their own role, roll number, department, CGPA, or graduation year without an authorised workflow.
- Frontend route guards improve UX but do not provide security.

## RLS
- Enable RLS on every exposed table.
- Test every table with anonymous, student A, student B, and placement admin sessions.
- Student A must not read Student B's records by changing an ID in the URL.
- Students may read their own placement and clearance records.
- Students may not write clearance decisions or audit entries.
- Privileged operations should use RPC/Edge Functions with explicit role checks.

## Audit logs
Use append-only audit records. Ideally, revoke update/delete access to audit rows and add a database trigger or server-side transaction to ensure every clearance transition creates an audit event.

## Certificate verification
- Never expose a table-wide public SELECT policy.
- Use a high-entropy opaque token; store only a hash.
- Public verifier returns minimum data and checks revoked status.
- Rate-limit requests and avoid search by roll number.
- Do not encode private data directly in QR payload.

## Imports
Limit file size and row count. Validate file type and content, not extension alone. Protect against formula injection in CSV exports by escaping cells starting with `=`, `+`, `-`, or `@`. Commit via transaction and enforce unique constraints.

## Privacy and deployment
Use synthetic demo data. Avoid package/offer details on public endpoints. Set secure headers, HTTPS, restrictive redirects, and least-privilege service keys. Review applicable university privacy policies before processing real records.
