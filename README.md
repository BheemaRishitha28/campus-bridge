# CampusBridge — University Placement, Student Verification & No-Dues Intelligence Platform

**One Campus. One Connected Placement Journey.**

CampusBridge is a commercial-grade university operating platform that bridges recruitment management, student identity verification, placement intelligence, interview scheduling, and departmental clearance workflows into one secure, unified web application.

---

## ✦ Key Modules & Architectural Highlights

### 1. Enterprise Public Homepage & Dual Authentication
- **Public Homepage**: SaaS aesthetic with brand identity, peach/pink/lavender gradient hero, interactive live dashboard preview, feature breakdowns, dual-experience walkthroughs, and footer.
- **Separate Faculty and Student Portals**:
  - Distinct entry pathways: Faculty Workspace vs Student Portal.
  - Multi-provider authentication: Google OAuth, GitHub OAuth, Institutional Email authentication, and password recovery.
  - Dedicated **Registration & College ID Verification** request submission with upload evidence preview.
  - Pre-configured demo account presets for immediate hackathon evaluation without external API keys (Dr. Arvind Sharma, Student A, Student B, Student C).
  - Clear OAuth and Supabase setup banners when external credentials are unconfigured.

### 2. College Identity Verification & Registration (Part 2)
- **Separate Student and Faculty Registration**:
  - Student: Full Name, Institutional Email (`@campus.edu` validation), Roll Number, Department, Program, Year, CGPA, and ID card evidence preview.
  - Faculty: Full Name, Institutional Email, Staff ID, Department, Designation, and ID card upload.
- **Verification Review Queue** (`/verifications`):
  - Placement administrators inspect submitted ID cards, verify credentials, and approve or reject with formal audit remarks.
  - Approved students are automatically provisioned with active profiles and initialized clearance categories.
  - Unverified users remain in `pending` review and cannot access private placement operations.

### 3. Strict Student Privacy & Database Row-Level Security (RLS)
- **Student Privacy Guaranteed**: Student A can never query or view Student B's applications, interviews, offers, CGPA, backlogs, or private clearance remarks.
- **Permission Enforcement**: Students cannot approve their own clearances, alter application stages, create drives, import cohorts, or inspect audit logs.
- Automated tests prove isolation between Student A and Student B.

### 4. Unified Light and Dark Design System (Part 1)
- **CampusBridge Design System Palette**:
  - **Midnight Navy**: `#14213D`
  - **Slate Charcoal**: `#26334A`
  - **Deep Indigo**: `#4F46E5`
  - **Electric Indigo**: `#6366F1`
  - **Teal**: `#14B8A6`
  - **Pastel Peach**: `#F8DCCF`
  - **Soft Pink**: `#F7DCE8`
  - **Lavender**: `#DCD5FA`
  - **Soft Green**: `#D9EEE4`
  - **Calm Blue**: `#D8EAFB`
  - **Canvas Light**: `#F5F3FF`
  - **White Surfaces**: `#FFFFFF`
  - **Primary Text**: `#172033`
  - **Borders**: `#E5E7EB`
- Class-based theme toggle persisted across page reloads in `localStorage`.
- Comprehensive styling across all modals, tables, forms, charts, dropdowns, and sidebars.

### 5. Faculty & Placement In-Charge Command Center
- **8 Dynamic KPIs** computed directly from database records:
  1. Total Registered Students
  2. Eligible Students (Cohort denominator)
  3. Participating in Recruitment (≥1 drive applied)
  4. Unique Students Placed (Distinct students placed)
  5. Total Offers Received (Includes multiple offers)
  6. Students Not Yet Placed
  7. Active Recruitment Drives
  8. Pending Department Clearances
- **Analytical Intelligence**:
  - Department-wise placement percentages (CSE, ECE, MECH).
  - Highest vs Average package metrics.
  - 5-Stage Recruitment Conversion Funnel (Registered → Shortlisted → Assessment → Interview → Offer).
- **Rule-Based At-Risk Student Widget**:
  - Automatically identifies final-year unplaced students with ≥2 pending/rejected mandatory clearances or 0 drive applications.

### 6. Recruitment Interview Management (Part 8)
- **Schedule Interview Rounds**: Assign candidates to Technical, System Design, or HR rounds with date, time, duration, and candidate instructions.
- **Flexible Modes**:
  - **Online**: Integrated Google Meet, MS Teams, or Zoom links with 1-click launch and link copying.
  - **Offline**: Campus venue assignments (Boardroom, Academic Block, Labs).
- **Candidate Attendance Acknowledgment**: Students can click "Confirm Attendance" or submit "Reschedule Requests" with formal justifications.
- **Interviewer Evaluation**: Faculty record evaluation scores (out of 100), outcomes (`cleared`, `rejected`, `absent`, `rescheduled`), and qualitative technical feedback.

### 7. Configurable No-Dues Workflow & External College Fee Portal (Part 10)
- **6 Default Departments**: Central Library, Laboratories & Equipment, Academic Department, Placement Cell, Finance & Accounts, Hostel & Mess.
- **Critical Institutional Rule**:
  > Overall clearance is granted **IF AND ONLY IF** every mandatory category is **Cleared** or **Not Applicable**.
  > Even a single pending or rejected mandatory clearance immediately holds overall clearance.
- **External Fee Gateway Integration**:
  - Admin-configurable external gateway URL (`https://www.onlinesbi.sbi/sbicollect/icollecthome.htm`).
  - Prominent "Open University Payment Gateway" action for students to pay dues.
  - Student "Submit Payment Reference (UTR)" modal with amount, date, and receipt voucher.
  - Faculty "Verify & Clear Dues" action that reconciles the DU reference and automatically marks the clearance as cleared.

### 8. Dream Offer Policy Engine
- Configurable salary thresholds:
  - Regular Tier: < ₹8.0 LPA
  - Dream Tier: ₹8.0 – ₹14.99 LPA
  - Super Dream Tier: ≥ ₹15.0 LPA
- Dynamic Eligibility Rules:
  - Candidates with 0 offers can apply to any eligible drive.
  - Candidates with a Regular offer can apply for Dream and Super Dream drives.
  - Candidates with a Dream offer can only apply for Super Dream drives.
  - Candidates with a Super Dream offer are locked from further applications.
- Transparent explanations returned for every evaluation (e.g., *"Ineligible CGPA: Required minimum CGPA is 8.00; your recorded CGPA is 7.20"*).

### 9. 10-Step Compliant Bulk Student Ingestion
1. Downloadable official Excel (.xlsx) and CSV templates.
2. Drag-and-drop file upload with SheetJS parsing.
3. Required column validation (`roll_number`, `full_name`, `department_code`, `cgpa`, `backlogs`, etc.).
4. Format validation (CGPA 0.00–10.00, valid university email, positive backlogs).
5. In-file duplicate detection (same roll number repeated).
6. Database duplicate check (existing roll numbers detected).
7. Staged preview with Valid, Invalid, and Duplicate counters.
8. Row-by-row error reporting with explicit line numbers.
9. Explicit confirmation modal before committing records.
10. Automatic initialization of clearance rows and audit log recording.

### 10. Cryptographically Verifiable QR Certificates & Public Registry
- Generated only after 100% mandatory clearance verification.
- Includes Institution seal, student name, roll number, department, clearance date, and unique verification token (`CB-2026-CS-8921-A9D`).
- High-resolution QR code embedding public verification URL.
- One-click vector PDF generation with `jsPDF`.
- **Public Verification Portal** (`/#verify/:token`):
  - Accessible to employers, embassies, and academic bodies without login.
  - Returns authenticated validity, masked student name, roll number, and department.
  - Never leaks student email, phone, or internal clearance remarks.
  - Complete revocation support: revoked certificates display warning and revocation reason.

---

## 🛠 Technology Stack

- **Frontend**: React 18, TypeScript 5.7, Vite 6, Tailwind CSS 3.4
- **Icons**: Lucide React
- **Data Persistence**: Dual-mode engine (Supabase PostgreSQL + Reactive Local Storage)
- **Spreadsheets & Ingestion**: SheetJS (`xlsx`)
- **PDF & QR Code**: `jspdf`, `qrcode`
- **Testing**: Vitest 2.1, React Testing Library, JSDOM

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js LTS (v18+ or v20+)
- npm (v9+)

### 2. Installation
```bash
# Clone the repository and navigate to the project
cd placement_no_dues_portal

# Install dependencies
npm.cmd install
```

### 3. Running the Development Server
```bash
npm.cmd run dev
```
Open `http://localhost:5173` in your browser.

---

## 🧪 Automated Testing

CampusBridge includes a comprehensive automated test suite covering all critical rules, security policies, interview workflows, and calculation logic.

To execute the test suite:
```bash
npm.cmd test -- --run
```

### Verified Test Cases (17/17 Passing)
- **Clearance Critical Rule**: Verified all mandatory cleared/N/A → Cleared; one pending mandatory → Incomplete; one rejected mandatory → Incomplete; missing mandatory row → Incomplete.
- **Placement Analytics Fixture**: Verified distinct student counts (2 unique placed vs 3 offers extended); unplaced count calculation; exclusion of cancelled drives and withdrawn applications.
- **Dream Offer Policy**: Verified CGPA thresholds with transparent reason; verified tier progression (Regular → Dream → Super Dream); verified pinnacle lock.
- **Certificate Verification & Privacy**: Verified token generation format; verified public verification masking; verified revocation invalidation; verified zero private contact info exposure.
- **Student Privacy & Isolation**: Verified Student A cannot query or approve Student B's records.
- **College ID Verification Lifecycle (Part 2)**: Verified pending request creation, institutional email validation, and admin authorization.
- **Interview Scheduling & Outcome Lifecycle (Part 8)**: Verified round scheduling, student attendance confirmation, and evaluator scoring.
- **External Dues Gateway & Receipt Reconciliation (Part 10)**: Verified SBI Collect UTR submission and automated clearance approval.

---

## 📦 Production Build Verification

To verify production compilation:
```bash
npm.cmd run build
```
Build output completes with **0 TypeScript errors** and optimized chunk bundles in `dist/`.

---

## 🔐 Supabase Database Migrations

Run the SQL migrations located in `supabase/migrations/`:
1. `0001_initial_schema.sql`: Core profiles, drives, applications, offers, clearances, and base RLS policies.
2. `0002_campusbridge_enhancements.sql`: Placement policies, notifications, audit logs, and secure public verification RPC function.
3. `0003_interviews_and_verifications.sql`: Interviews, College ID verification queue, and External payment receipts with strict RLS policies.

---

## 👥 Demo Profile Shortcuts

For grading and quick walkthroughs, one-click demo profiles are accessible from the Sign In dialog:
1. **Dr. Arvind Sharma** (`admin@campusbridge.edu`): Placement In-Charge & Dean (Faculty Workspace).
2. **Aditi Rao** (`student.a@campusbridge.edu`): Student A (CSE · 2 Offers · 100% Cleared · Verified Certificate ready).
3. **Rohan Verma** (`student.b@campusbridge.edu`): Student B (ECE · Interview in Progress · Accounts Pending).
4. **Kavya Nair** (`student.c@campusbridge.edu`): Student C (MECH · Unplaced · Rejected Lab Clearance · At-Risk Flagged).

---

*CampusBridge — Built for University Excellence, Student Privacy, and Operational Integrity.*
