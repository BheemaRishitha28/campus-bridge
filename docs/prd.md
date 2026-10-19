# CampusBridge — Product Requirements Document (PRD)

## 1. Product Summary
**CampusBridge** is an enterprise-grade university placement and departmental clearance intelligence platform. It centralizes student placement journeys, corporate recruitment drives, placement analytics, departmental clearance queues, auditable decision logs, and cryptographically verifiable digital No-Dues certificates into a unified SaaS experience.

## 2. Problem Statement
Modern universities struggle with fragmented recruitment operations:
- Student placement tracking is disconnected from academic departments and finance offices.
- Clearance procedures require students to physically collect rubber stamps from 5+ offices (Library, Lab, Accounts, HOD, Hostel), causing bottlenecks during final graduation.
- Analytics often conflate "Total Offers Received" with "Unique Students Placed", distorting official NIRF/NAAC reports.
- Certificate fraud and lack of instant digital verification create risks for employers and foreign universities.

CampusBridge provides a unified source of truth with strict student privacy boundaries and mathematical integrity.

## 3. Core Personas & Access Boundaries

### Persona 1: Placement In-Charge & Faculty Administrators
- **Full Operational Access**: Create and manage company drives, publish criteria, transition student stages, issue offers, review departmental clearance queues, approve/reject clearances with required notes, issue/revoke certificates, view audit logs, and export NIRF-compliant reports.
- **Role Code**: `placement_admin`

### Persona 2: University Student
- **Autonomous, Private Hub**: View personalized welcome banner, check real-time eligibility with transparent Dream Offer explanations, apply to open campus drives, track interview progression, view published offer letters, inspect departmental no-dues checklist with pending requirements, and download verifiable PDF certificates once 100% cleared.
- **Strict Isolation**: Cannot browse other students' profiles, view peer applications/offers, or alter clearance statuses.
- **Role Code**: `student`

### Persona 3: Public Verifier (Employers, Embassies, Verification Agencies)
- **Zero-Login Verification Portal**: Access via `/#verify/:token` or QR scan.
- **Safe Query**: Queries institutional registry and returns authenticity status, roll number, masked name, department, and issue timestamp.
- **Zero Data Leakage**: Student email, contact phone, package details, and internal remarks are strictly hidden.

## 4. Functional Specifications

### FR-01: Public Homepage & Design System
- SaaS aesthetics with clean typography, generous spacing, subtle transitions, and accessible contrast.
- Enterprise palette: Navy `#14213D`, Blue `#2563EB`, Teal `#0F9D8A`, Light surface `#F5F7FB`, Dark surface `#0B1220`.
- Zero-flicker light/dark mode persistence via `localStorage`.
- Live-looking interactive dashboard preview with demo data labels.

### FR-02: Authentication & Dual Role Gateway
- Explicit choice between Faculty Sign In and Student Sign In.
- Google OAuth, GitHub OAuth, and University Email authentication.
- Password recovery / reset flow.
- Verified database roles linked to authenticated user IDs.
- Quick one-click demo presets for instant evaluation.

### FR-03: Student Privacy & Database Row Level Security (RLS)
- Student A cannot view Student B's applications, offers, CGPA, backlogs, or private clearance remarks.
- RLS policies on PostgreSQL tables (`profiles`, `applications`, `offers`, `student_clearances`, `certificates`, `system_audit_logs`).

### FR-04: Accurate Placement Intelligence & KPIs
- 8 Key Performance Indicators:
  1. Total Registered Students
  2. Eligible Cohort (Denominator)
  3. Participating Candidates
  4. Unique Students Placed (Distinct student count)
  5. Total Offers Received (Includes multiple offers)
  6. Students Not Yet Placed
  7. Active Recruitment Drives
  8. Pending Clearances
- Department conversion rates (CSE, ECE, MECH), package comparison (Highest vs Average LPA), and 5-stage recruitment funnel.

### FR-05: Dream Offer Policy Engine
- Configurable thresholds: Regular (< ₹8 LPA), Dream (₹8–₹14.99 LPA), Super Dream (≥ ₹15 LPA).
- Candidates with a Regular offer can apply for Dream/Super Dream; Dream offer holders can only apply for Super Dream; Super Dream holders are locked.
- Transparent rule explanation returned on every eligibility check.

### FR-06: 10-Step Compliant Bulk Student Ingestion
1. Downloadable Excel (.xlsx) and CSV template.
2. File upload with SheetJS parser.
3. Required columns validation (`roll_number`, `full_name`, `department_code`, `cgpa`, `backlogs`).
4. Data format validation (CGPA 0.00–10.00, valid university email, positive backlogs).
5. In-file duplicate detection.
6. Database duplicate check against existing roll numbers.
7. Staged preview with Valid, Invalid, Duplicate counters.
8. Row-by-row error reporting with line numbers.
9. Explicit confirmation modal.
10. Automatic initialization of clearance rows and audit logging.

### FR-07: Configurable Departmental No-Dues Workflow
- 6 Categories: Library, Laboratories, Academic Dept, Placement Cell, Finance & Accounts, Hostel & Mess.
- **Critical Institutional Rule**:
  > Overall clearance is granted **IF AND ONLY IF** every mandatory category is **Cleared** or **Not Applicable**.
  > Even a single pending or rejected mandatory clearance immediately holds overall clearance.
- Departmental queues for faculty to approve or reject with required actionable notes.

### FR-08: Cryptographically Verifiable QR Certificates
- Generated only after 100% mandatory clearance verification.
- Includes Institution seal, student name, roll number, department, clearance date, and unique verification token (`CB-2026-CS-8921-A9D`).
- High-resolution QR code embedding public verification URL.
- One-click vector PDF generation with `jsPDF`.
- Public Verification Portal (`/#verify/:token`) with complete revocation support.

### FR-09: Rule-Based At-Risk Widget
- Evaluates final-year graduating cohort.
- Flags unplaced students with ≥2 pending/rejected mandatory clearances or 0 drive applications.
- Displays transparent explanation for each flag.

### FR-10: Analytical Reports & Exports
- Pre-built reports for Department Placements, Company Outcomes, Student Placement History, and Pending No-Dues Rosters.
- Export to Excel (.xlsx), CSV, and Print summary.
