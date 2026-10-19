# Testing and Q&A

## Required test layers
- Unit: placement metric calculations, eligibility explanations, clearance-status function, CSV validators.
- Component: forms, loading/empty/error states, role-aware screens.
- Integration: Supabase queries, transactions, RLS policies, import commit, audit generation.
- End-to-end: sign in, apply, update stage, clear a category, verify no-dues state, export report.
- Security: IDOR, privilege escalation, public certificate enumeration, student self-approval.

## Acceptance test checklist
- [ ] Import template downloads with documented headers.
- [ ] Missing required column is rejected.
- [ ] Invalid CGPA/year/email is reported with row number.
- [ ] Duplicate roll number in file is flagged.
- [ ] Existing roll number is flagged; no silent overwrite.
- [ ] Preview counts match commit summary.
- [ ] Multiple offers for one student count as multiple offers but one unique placed student.
- [ ] Rejected/withdrawn applications and cancelled drives are excluded per policy.
- [ ] Student A cannot access Student B's application, offer, clearance, or certificate.
- [ ] Student cannot set a clearance to `cleared`.
- [ ] One mandatory pending/rejected/missing item keeps overall status incomplete.
- [ ] `not_applicable` works only when set by an authorised approver.
- [ ] Every clearance transition writes an audit event.
- [ ] Certificate cannot be issued while any mandatory clearance is incomplete.
- [ ] Revoked/unknown QR token returns invalid status without private data.
- [ ] Export results match current filters and database rows.
- [ ] Keyboard-only navigation and responsive layout are usable.

## Q&A for hackathon judges
**How is this different from a spreadsheet?** It links records, enforces role boundaries, computes metrics from source data, tracks audit history, and prevents invalid clearance/placement counts.

**How do you handle multiple offers?** Offers are separate rows linked to applications; unique placed students are counted using distinct student IDs.

**Can students approve their own no-dues?** No. RLS and privileged transition functions restrict clearance updates to authorised staff.

**What if an admin marks a pending item as cleared by mistake?** The audit log records the change. A correction is another audited transition; production may add approval or reversal controls.

**Is the QR code itself secure?** The QR contains an opaque token, not the certificate data. The verifier checks the token hash and revocation state and returns minimal fields.

**Is the project production-ready?** The starter is not. Production requires complete feature implementation, RLS and penetration testing, institution policy review, privacy review, backups, monitoring, and deployment hardening.

**How do you validate placement percentage?** Define the eligible cohort and placed-status policy, calculate distinct placed students divided by that cohort, and test against hand-calculated fixtures.
