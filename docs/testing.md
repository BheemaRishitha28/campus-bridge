# CampusBridge — Automated Testing & Quality Assurance Guide

## Test Suite Overview

CampusBridge uses **Vitest** with **JSDOM** and **@testing-library/jest-dom** for high-speed, deterministic unit and integration tests.

Run tests:
```bash
npm test
# On Windows PowerShell:
npm.cmd test
```

## Test Coverage Matrix

| Test Suite | Test Cases | Invariants Verified |
|---|---|---|
| **1. No-Dues Clearance Rules** | 4 Tests | - All mandatory categories cleared/N.A. → overall `cleared = true`<br>- 1 mandatory pending → overall `cleared = false`<br>- 1 mandatory rejected → overall `cleared = false`<br>- Missing mandatory row → overall `cleared = false` |
| **2. Placement Analytics Fixture** | 1 Test | - Strict distinction between `unique_placed` (2) vs `total_offers` (3)<br>- Denominator uses eligible cohort (4)<br>- Withdrawn applications & cancelled drives excluded from placement metrics |
| **3. Dream Offer Policy Engine** | 3 Tests | - CGPA criteria check with exact difference reported<br>- Regular offer holder eligible for Dream/Super Dream<br>- Super Dream holder locked from lower tier drives |
| **4. QR Certificates & Verification** | 4 Tests | - Refuses certificate issuance when mandatory clearance is pending<br>- Generates formatted verification token on 100% clearance<br>- Public verification returns sanitized data without private email/phone<br>- Invalidation/revocation immediate state check |
| **5. Student Privacy & Isolation** | 1 Test | - Student A cannot view Student B's profile or clearance records<br>- Student cannot approve their own or other students' clearances |
| **6. College ID Verification Lifecycle** | 2 Tests | - Pending status defaults on registration submission<br>- Institutional email and roll number checks<br>- Administrative approval updates privileges |
| **7. Interview Management Lifecycle** | 1 Test | - Multi-stage round scheduling (Date, Time, Meet link)<br>- Candidate attendance acknowledgment<br>- Technical evaluation score (out of 100) and qualitative feedback |
| **8. External Dues & Payment Receipts** | 1 Test | - SBI Collect transaction DU reference submitted<br>- Automated clearance approval upon receipt verification |

## Acceptance Verification Results
- **17 of 17 Automated Tests Passing** cleanly in ~290ms execution time.
- Production TypeScript compilation (`tsc -b && vite build`) passing with **0 errors**.

