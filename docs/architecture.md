# CampusBridge — System Architecture Specification

## 1. System Overview
CampusBridge is structured as a robust, layered single-page web application (React 18 + TypeScript + Vite) paired with a dual-mode persistence architecture:
1. **Cloud PostgreSQL Backend (Supabase)**: Real-time queries, Row Level Security (RLS), and database-enforced integrity.
2. **Autonomous Local State Provider**: For zero-configuration hackathon grading and evaluation without requiring cloud database setup.

```text
                               +-----------------------------+
                               |     CampusBridge Frontend   |
                               | (React 18, TS, TailwindCSS) |
                               +--------------+--------------+
                                              |
                   +--------------------------+--------------------------+
                   |                                                     |
         [Cloud Production Mode]                               [Autonomous Demo Mode]
                   |                                                     |
        +----------v----------+                               +----------v----------+
        |    Supabase Auth    |                               | Reactive App Store  |
        |  (Google, GitHub,   |                               |  - Policy Engine    |
        |   Email/Password)   |                               |  - In-Memory Cache  |
        +----------+----------+                               |  - LocalStorage     |
                   |                                          +---------------------+
        +----------v----------+
        |   PostgreSQL + RLS  |
        |  - Tables & Indexes |
        |  - Audit Ledger     |
        |  - Public RPC       |
        +---------------------+
```

## 2. Directory Layout & Module Responsibilities

```text
src/
├── components/
│   ├── auth/                 # Distinct Faculty & Student login modal, OAuth triggers
│   ├── common/               # AppLayout, Sidebar, ThemeToggle, NotificationDropdown
│   ├── landing/              # Enterprise SaaS Homepage, Hero, Live Preview, Footer
│   ├── dashboard/            # FacultyDashboard (8 KPIs, Funnel, At-Risk) & StudentDashboard
│   ├── students/             # Student directory, 10-step bulk import, profile modal
│   ├── drives/               # Recruitment drive management, applicant pipeline, offer issuing
│   ├── nodues/               # Departmental clearance queues & 100% mandatory validation
│   ├── certificates/         # Public verification view (masking & revocation)
│   ├── reports/              # Excel/CSV exports & analytical summaries
│   ├── audit/                # Immutable system audit trail table
│   └── settings/             # Dream policy threshold configuration & demo controls
├── lib/
│   ├── store.ts              # Centralized reactive state store & security checks
│   ├── policyEngine.ts       # Dream offer calculation & No-Dues critical rule evaluation
│   ├── certificateUtils.ts   # QR code generation, jsPDF certificate export, public verification
│   ├── importParser.ts       # SheetJS 10-step XLSX/CSV parser with duplicate detection
│   ├── exportUtils.ts        # XLSX and CSV export routines
│   ├── mockData.ts           # 32+ students, 3 departments, 6 drives, varied statuses
│   └── supabase.ts           # Supabase client singleton & configuration detection
├── types/
│   └── domain.ts             # Strict TypeScript domain interfaces
tests/
└── campusbridge.test.ts      # Vitest test suite (13 passing tests)
```

## 3. Data Integrity & Invariants

1. **Denominators**: Placement rate is strictly `unique_students_placed / eligible_students * 100`.
2. **Clearance Invariant**: A student is cleared if and only if all mandatory categories are `cleared` or `not_applicable`.
3. **Dream Policy Invariant**: Applications cannot violate salary tier unlock conditions.
4. **Student Privacy Invariant**: Students cannot access records outside `student_id = auth.uid()`.
