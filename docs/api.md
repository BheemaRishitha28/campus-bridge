# CampusBridge — API & Data Contracts

## 1. Authentication & Session Services
- `signInWithOAuth({ provider: 'google' | 'github' })`: Initiates OAuth PKCE authorization.
- `signInWithPassword({ email, password })`: Authenticates faculty or student user.
- `signOut()`: Terminates active session.
- `resetPasswordForEmail(email, { redirectTo })`: Dispatches password recovery link.

## 2. Student Directory & Bulk Ingestion API
- `GET /rest/v1/profiles?select=*`:
  - Enforced via RLS: Students receive only their own row (`id = auth.uid()`).
  - Placement Administrators receive the full university cohort.
- `POST /rest/v1/profiles`: Admin only; creates new student profile.
- `POST /students/import/preview`:
  - Parses uploaded file using SheetJS.
  - Validates required headers (`roll_number`, `full_name`, `department_code`, `cgpa`, `backlogs`).
  - Checks duplicate roll numbers within file and against database.
  - Returns: `{ batch_id, total_rows, valid_rows, invalid_rows, duplicate_rows, errors, preview_data }`.
- `POST /students/import/commit`:
  - Commits valid records inside transaction.
  - Generates initial `student_clearances` rows for all categories.
  - Inserts event to `system_audit_logs`.

## 3. Recruitment Drives & Applications API
- `GET /rest/v1/recruitment_drives`: Returns active and planned company recruitment drives.
- `POST /rest/v1/recruitment_drives`: Admin only; publishes drive with package, tier, and CGPA criteria.
- `POST /rest/v1/applications`:
  - Student application submission.
  - Validates `student_id = auth.uid()`.
  - Evaluates Dream Offer Policy: restricts lower-tier drives once an offer is held.
- `PATCH /rest/v1/applications?id=eq.:app_id`:
  - Admin only; advances stage (`shortlisted`, `assessment_completed`, `interview_in_progress`, `selected`, `offer_received`, `joined`, `rejected`).
- `POST /rest/v1/offers`:
  - Admin only; records package CTC and official offer reference.

## 4. Departmental No-Dues & Clearance API
- `GET /rest/v1/student_clearances`:
  - Students see only their personal clearance checklist.
  - Department faculty and admins see department queues.
- `PATCH /rest/v1/student_clearances?id=eq.:id`:
  - Admin only; updates status to `'cleared'` or `'rejected'`.
  - Rejection requires `pending_requirement` explanation.
- `RPC public.is_student_fully_cleared(p_student_id)`:
  - Returns `true` if and only if every mandatory category is `'cleared'` or `'not_applicable'`.

## 5. Cryptographic QR Verification RPC
- `POST /rest/v1/rpc/verify_certificate_public`:
  - Param: `token_hash` (Text)
  - Publicly accessible to unauthenticated verifiers (`anon` role).
  - Response:
    ```json
    {
      "valid": true,
      "status": "valid",
      "message": "Authentic verified institutional clearance certificate.",
      "roll_number": "22CS101",
      "student_name": "Aditi Rao",
      "department_name": "Computer Science & Engineering",
      "graduation_year": 2026,
      "clearance_date": "2026-10-06T17:00:00Z",
      "issuer_name": "Dr. Arvind Sharma",
      "verification_token": "CB-2026-CS-8921-A9D"
    }
    ```
  - On revoked token:
    ```json
    {
      "valid": false,
      "status": "revoked",
      "message": "Certificate was officially revoked by university administration.",
      "roll_number": "22CS101",
      "department_name": "Computer Science & Engineering"
    }
    ```
