# CampusBridge — Security & Student Privacy Specification

## 1. Threat Model & Privacy Principles

CampusBridge handles sensitive institutional records:
- Academic records (CGPA, active backlogs, disciplinary records)
- Placement offers (CTC package, employer correspondence, offer letters)
- Departmental clearance statuses (library fines, lab liabilities, fee dues)

### Core Invariant: Student Isolation
**Student A must never be able to read, query, infer, or modify Student B's private records.**

## 2. Row Level Security (RLS) Implementation

| Table | Student Permissions | Placement Admin / Faculty Permissions | Public / Anon Permissions |
|---|---|---|---|
| `profiles` | SELECT (own row where `id = auth.uid()`) | SELECT, INSERT, UPDATE all | None |
| `applications` | SELECT, INSERT (for self: `student_id = auth.uid()`) | SELECT, UPDATE, DELETE all | None |
| `offers` | SELECT (own offers where `student_id = auth.uid()`) | SELECT, INSERT, UPDATE, DELETE all | None |
| `student_clearances` | SELECT (own records: `student_id = auth.uid()`) | SELECT, UPDATE, INSERT all | None |
| `clearance_audit_log` | None (denied) | SELECT, INSERT (for self actions) | None |
| `system_audit_logs` | None (denied) | SELECT, INSERT | None |
| `certificates` | SELECT (own certificate metadata) | SELECT, INSERT, UPDATE (revoke) | RPC only (`verify_certificate_public`) |
| `import_batches` | None (denied) | SELECT, INSERT, UPDATE | None |

## 3. Cryptographic QR Verification Security

- **Public Endpoint Security**: No direct public `SELECT` on `certificates`.
- **RPC Function**: `verify_certificate_public(token_hash)` executes as `SECURITY DEFINER` and returns strictly sanitized fields:
  - Masked Student Name (e.g. `A****i R*o`)
  - Roll Number
  - Department Name
  - Graduation Year
  - Clearance Timestamp
  - Validity Status (`valid`, `revoked`, or `not_found`)
- **Protected Fields**: Student email, contact phone, home address, private department remarks, CTC package, and fine amounts are **never** returned to public verifiers.
- **Revocation Check**: Immediate database check. Once revoked, certificates show unambiguous invalidation notices.

## 4. Role Assignment & Escalation Prevention

- Roles are stored in `profiles.role` (`'placement_admin' | 'student'`).
- Auth tokens do not allow client-side role elevation.
- Any attempt by a student to invoke clearance approvals, stage transitions, drive creations, or bulk imports is rejected both at the application store layer and via PostgreSQL RLS policies.
