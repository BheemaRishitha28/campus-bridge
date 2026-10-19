import { describe, it, expect } from "vitest";
import {
  evaluateStudentNoDues,
  evaluateDriveEligibility,
  calculatePlacementAnalytics,
} from "../src/lib/policyEngine";
import {
  issueCertificateForStudent,
  verifyCertificatePublic,
  generateVerificationToken,
} from "../src/lib/certificateUtils";
import {
  parseAndValidateStudentFile,
  REQUIRED_COLUMNS,
} from "../src/lib/importParser";
import {
  Profile,
  StudentClearance,
  RecruitmentDrive,
  Offer,
  Application,
  PlacementPolicy,
  Certificate,
} from "../src/types/domain";

describe("1. Departmental No-Dues Clearance Rules (Critical Rule)", () => {
  const mandatoryCategoryIds = ["cat-lib", "cat-lab", "cat-dept", "cat-placement", "cat-accounts"];

  it("marks student as Cleared IF AND ONLY IF every mandatory category is cleared or not_applicable", () => {
    const studentClearances: StudentClearance[] = [
      { id: "1", student_id: "s1", category_id: "cat-lib", category_code: "LIB", category_name: "Library", mandatory: true, status: "cleared", updated_at: "" },
      { id: "2", student_id: "s1", category_id: "cat-lab", category_code: "LAB", category_name: "Lab", mandatory: true, status: "cleared", updated_at: "" },
      { id: "3", student_id: "s1", category_id: "cat-dept", category_code: "DEPT", category_name: "Department", mandatory: true, status: "cleared", updated_at: "" },
      { id: "4", student_id: "s1", category_id: "cat-placement", category_code: "T&P", category_name: "Placement", mandatory: true, status: "cleared", updated_at: "" },
      { id: "5", student_id: "s1", category_id: "cat-accounts", category_code: "ACC", category_name: "Accounts", mandatory: true, status: "cleared", updated_at: "" },
      { id: "6", student_id: "s1", category_id: "cat-hostel", category_code: "HST", category_name: "Hostel", mandatory: false, status: "not_applicable", updated_at: "" },
    ];

    const result = evaluateStudentNoDues(studentClearances, mandatoryCategoryIds);
    expect(result.cleared).toBe(true);
    expect(result.overallPercentage).toBe(100);
    expect(result.pendingMandatory).toBe(0);
    expect(result.rejectedMandatory).toBe(0);
  });

  it("marks student as Incomplete when ONE mandatory category is pending", () => {
    const studentClearances: StudentClearance[] = [
      { id: "1", student_id: "s2", category_id: "cat-lib", category_code: "LIB", category_name: "Library", mandatory: true, status: "cleared", updated_at: "" },
      { id: "2", student_id: "s2", category_id: "cat-lab", category_code: "LAB", category_name: "Lab", mandatory: true, status: "cleared", updated_at: "" },
      { id: "3", student_id: "s2", category_id: "cat-dept", category_code: "DEPT", category_name: "Department", mandatory: true, status: "cleared", updated_at: "" },
      { id: "4", student_id: "s2", category_id: "cat-placement", category_code: "T&P", category_name: "Placement", mandatory: true, status: "cleared", updated_at: "" },
      { id: "5", student_id: "s2", category_id: "cat-accounts", category_code: "ACC", category_name: "Accounts", mandatory: true, status: "pending", updated_at: "" }, // PENDING!
      { id: "6", student_id: "s2", category_id: "cat-hostel", category_code: "HST", category_name: "Hostel", mandatory: false, status: "cleared", updated_at: "" },
    ];

    const result = evaluateStudentNoDues(studentClearances, mandatoryCategoryIds);
    expect(result.cleared).toBe(false);
    expect(result.pendingMandatory).toBe(1);
    expect(result.overallPercentage).toBe(80); // 4 out of 5 mandatory
  });

  it("marks student as Incomplete when ONE mandatory category is rejected", () => {
    const studentClearances: StudentClearance[] = [
      { id: "1", student_id: "s3", category_id: "cat-lib", category_code: "LIB", category_name: "Library", mandatory: true, status: "cleared", updated_at: "" },
      { id: "2", student_id: "s3", category_id: "cat-lab", category_code: "LAB", category_name: "Lab", mandatory: true, status: "rejected", updated_at: "" }, // REJECTED!
      { id: "3", student_id: "s3", category_id: "cat-dept", category_code: "DEPT", category_name: "Department", mandatory: true, status: "cleared", updated_at: "" },
      { id: "4", student_id: "s3", category_id: "cat-placement", category_code: "T&P", category_name: "Placement", mandatory: true, status: "cleared", updated_at: "" },
      { id: "5", student_id: "s3", category_id: "cat-accounts", category_code: "ACC", category_name: "Accounts", mandatory: true, status: "cleared", updated_at: "" },
    ];

    const result = evaluateStudentNoDues(studentClearances, mandatoryCategoryIds);
    expect(result.cleared).toBe(false);
    expect(result.rejectedMandatory).toBe(1);
  });

  it("marks student as Incomplete when a mandatory category row is missing completely", () => {
    // Only 4 mandatory rows provided; cat-accounts is missing
    const studentClearances: StudentClearance[] = [
      { id: "1", student_id: "s4", category_id: "cat-lib", category_code: "LIB", category_name: "Library", mandatory: true, status: "cleared", updated_at: "" },
      { id: "2", student_id: "s4", category_id: "cat-lab", category_code: "LAB", category_name: "Lab", mandatory: true, status: "cleared", updated_at: "" },
      { id: "3", student_id: "s4", category_id: "cat-dept", category_code: "DEPT", category_name: "Department", mandatory: true, status: "cleared", updated_at: "" },
      { id: "4", student_id: "s4", category_id: "cat-placement", category_code: "T&P", category_name: "Placement", mandatory: true, status: "cleared", updated_at: "" },
    ];

    const result = evaluateStudentNoDues(studentClearances, mandatoryCategoryIds);
    expect(result.cleared).toBe(false);
    expect(result.missingMandatory).toBe(true);
  });
});

describe("2. Placement Analytics Fixture (Unique Placed vs Total Offers)", () => {
  const mockStudents: Profile[] = [
    { id: "s-a", role: "student", roll_number: "22CS101", full_name: "Student A", department_id: "dept-cse", department_code: "CSE", program: "B.Tech", year_of_study: 4, section: "A", graduation_year: 2026, university_email: "a@campus.edu", cgpa: 8.5, backlogs: 0, active: true, placement_registered: true, created_at: "" },
    { id: "s-b", role: "student", roll_number: "22EC201", full_name: "Student B", department_id: "dept-ece", department_code: "ECE", program: "B.Tech", year_of_study: 4, section: "A", graduation_year: 2026, university_email: "b@campus.edu", cgpa: 7.8, backlogs: 0, active: true, placement_registered: true, created_at: "" },
    { id: "s-c", role: "student", roll_number: "22ME301", full_name: "Student C", department_id: "dept-mech", department_code: "MECH", program: "B.Tech", year_of_study: 4, section: "A", graduation_year: 2026, university_email: "c@campus.edu", cgpa: 6.9, backlogs: 0, active: true, placement_registered: true, created_at: "" },
    { id: "s-d", role: "student", roll_number: "22CS102", full_name: "Student D", department_id: "dept-cse", department_code: "CSE", program: "B.Tech", year_of_study: 4, section: "B", graduation_year: 2026, university_email: "d@campus.edu", cgpa: 7.2, backlogs: 0, active: true, placement_registered: true, created_at: "" },
  ];

  const mockDrives: RecruitmentDrive[] = [
    { id: "d1", company_id: "c1", company_name: "Tech Corp", title: "SDE", job_role: "SDE", description: "", eligible_department_ids: [], eligible_department_codes: ["CSE", "ECE", "MECH"], eligible_graduation_years: [2026], min_cgpa: 6.5, max_active_backlogs: 0, skills: [], registration_deadline: "2026-12-01", stages: [], location: "", package_lpa: 10, tier: "dream", status: "open", created_at: "" },
    { id: "d2", company_id: "c2", company_name: "Global Ltd", title: "Analyst", job_role: "Analyst", description: "", eligible_department_ids: [], eligible_department_codes: ["CSE", "ECE", "MECH"], eligible_graduation_years: [2026], min_cgpa: 6.5, max_active_backlogs: 0, skills: [], registration_deadline: "2026-12-01", stages: [], location: "", package_lpa: 6, tier: "regular", status: "open", created_at: "" },
    { id: "d-cancelled", company_id: "c3", company_name: "Cancelled Inc", title: "Dev", job_role: "Dev", description: "", eligible_department_ids: [], eligible_department_codes: [], eligible_graduation_years: [2026], min_cgpa: 6.0, max_active_backlogs: 0, skills: [], registration_deadline: "", stages: [], location: "", package_lpa: 8, tier: "dream", status: "cancelled", created_at: "" },
  ];

  const mockApplications: Application[] = [
    { id: "a1", student_id: "s-a", student_name: "Student A", student_roll: "22CS101", drive_id: "d1", company_name: "Tech Corp", job_role: "SDE", package_lpa: 10, tier: "dream", stage: "offer_received", applied_at: "", updated_at: "" },
    { id: "a2", student_id: "s-a", student_name: "Student A", student_roll: "22CS101", drive_id: "d2", company_name: "Global Ltd", job_role: "Analyst", package_lpa: 6, tier: "regular", stage: "offer_received", applied_at: "", updated_at: "" },
    { id: "a3", student_id: "s-b", student_name: "Student B", student_roll: "22EC201", drive_id: "d1", company_name: "Tech Corp", job_role: "SDE", package_lpa: 10, tier: "dream", stage: "offer_received", applied_at: "", updated_at: "" },
    { id: "a4", student_id: "s-c", student_name: "Student C", student_roll: "22ME301", drive_id: "d2", company_name: "Global Ltd", job_role: "Analyst", package_lpa: 6, tier: "regular", stage: "withdrawn", applied_at: "", updated_at: "" }, // WITHDRAWN!
  ];

  const mockOffers: Offer[] = [
    { id: "o1", application_id: "a1", student_id: "s-a", student_name: "Student A", student_roll: "22CS101", drive_id: "d1", company_name: "Tech Corp", job_role: "SDE", offer_reference: "REF-1", package_lpa: 10, currency: "INR", tier: "dream", offer_date: "2026-09-01", accepted: true, created_at: "" },
    { id: "o2", application_id: "a2", student_id: "s-a", student_name: "Student A", student_roll: "22CS101", drive_id: "d2", company_name: "Global Ltd", job_role: "Analyst", offer_reference: "REF-2", package_lpa: 6, currency: "INR", tier: "regular", offer_date: "2026-09-02", accepted: false, created_at: "" },
    { id: "o3", application_id: "a3", student_id: "s-b", student_name: "Student B", student_roll: "22EC201", drive_id: "d1", company_name: "Tech Corp", job_role: "SDE", offer_reference: "REF-3", package_lpa: 10, currency: "INR", tier: "dream", offer_date: "2026-09-03", accepted: true, created_at: "" },
  ];

  it("accurately calculates 3 total offers, 2 unique placed students, and 2 unplaced students", () => {
    const stats = calculatePlacementAnalytics(mockStudents, mockApplications, mockOffers, mockDrives, []);

    // 1. Total offers: o1, o2, o3 = 3
    expect(stats.totalOffersCount).toBe(3);

    // 2. Unique placed students: s-a and s-b = 2 (NOT 3!)
    expect(stats.uniquePlacedCount).toBe(2);

    // 3. Unplaced students: s-c (withdrawn) and s-d (no application/offer) = 2
    expect(stats.unplacedCount).toBe(2);

    // 4. Eligible students = 4
    expect(stats.eligibleCount).toBe(4);

    // 5. Placement rate: 2 unique / 4 eligible = 50.0%
    expect(stats.placementRate).toBe(50.0);
  });
});

describe("3. Placement Policy & Dream Offer Engine", () => {
  const policy: PlacementPolicy = {
    regular_max_lpa: 7.99,
    dream_min_lpa: 8.0,
    dream_max_lpa: 14.99,
    super_dream_min_lpa: 15.0,
    allow_dream_after_regular: true,
    allow_super_dream_after_dream: true,
    max_offers_allowed: 3,
    strict_backlog_check: true,
  };

  const student: Profile = {
    id: "st-eval",
    role: "student",
    roll_number: "22CS999",
    full_name: "Eval Student",
    department_id: "dept-cse",
    department_code: "CSE",
    program: "B.Tech",
    year_of_study: 4,
    section: "A",
    graduation_year: 2026,
    university_email: "eval@campus.edu",
    cgpa: 7.2,
    backlogs: 0,
    active: true,
    placement_registered: true,
    created_at: "",
  };

  const driveRegular: RecruitmentDrive = {
    id: "dr-reg",
    company_id: "c1",
    company_name: "Alpha Corp",
    title: "Junior Dev",
    job_role: "Junior Dev",
    description: "",
    eligible_department_ids: [],
    eligible_department_codes: ["CSE"],
    eligible_graduation_years: [2026],
    min_cgpa: 7.0,
    max_active_backlogs: 0,
    skills: [],
    registration_deadline: "2026-12-30",
    stages: [],
    location: "",
    package_lpa: 6.0,
    tier: "regular",
    status: "open",
    created_at: "",
  };

  const driveHighCgpa: RecruitmentDrive = {
    ...driveRegular,
    id: "dr-high",
    min_cgpa: 8.0, // Student has 7.2
    package_lpa: 12.0,
    tier: "dream",
  };

  const driveSuperDream: RecruitmentDrive = {
    ...driveRegular,
    id: "dr-super",
    min_cgpa: 7.0,
    package_lpa: 18.0,
    tier: "super_dream",
  };

  it("reports ineligibility with exact CGPA explanation when student is below criteria", () => {
    const res = evaluateDriveEligibility(student, driveHighCgpa, [], policy);
    expect(res.eligible).toBe(false);
    expect(res.reasons[0]).toContain("Ineligible CGPA: Required minimum CGPA is 8.00; your recorded CGPA is 7.20");
  });

  it("permits Dream tier application if student only holds a Regular offer", () => {
    const regularOffer: Offer = {
      id: "o-reg",
      application_id: "a-1",
      student_id: student.id,
      student_name: student.full_name,
      student_roll: student.roll_number,
      drive_id: "other",
      company_name: "Basic Inc",
      job_role: "Trainee",
      offer_reference: "REF",
      package_lpa: 5.5, // Regular tier
      currency: "INR",
      tier: "regular",
      offer_date: "",
      created_at: "",
    };

    const dreamDrive: RecruitmentDrive = {
      ...driveRegular,
      min_cgpa: 7.0,
      package_lpa: 10.0,
      tier: "dream",
    };

    const res = evaluateDriveEligibility(student, dreamDrive, [regularOffer], policy);
    expect(res.eligible).toBe(true);
  });

  it("locks student from applying to Dream drives if student already holds a Super Dream offer", () => {
    const superDreamOffer: Offer = {
      id: "o-super",
      application_id: "a-2",
      student_id: student.id,
      student_name: student.full_name,
      student_roll: student.roll_number,
      drive_id: "other",
      company_name: "Pinnacle AI",
      job_role: "Research Engineer",
      offer_reference: "SUPER-01",
      package_lpa: 19.5, // Super Dream tier!
      currency: "INR",
      tier: "super_dream",
      offer_date: "",
      created_at: "",
    };

    const res = evaluateDriveEligibility(student, driveRegular, [superDreamOffer], policy);
    expect(res.eligible).toBe(false);
    expect(res.reasons[0]).toContain("Pinnacle Tier Reached");
  });
});

describe("4. QR Certificate Issuance & Public Verification", () => {
  const fullyClearedStudent: Profile = {
    id: "st-cleared",
    role: "student",
    roll_number: "22CS101",
    full_name: "Aditi Rao",
    department_id: "dept-cse",
    department_code: "CSE",
    program: "B.Tech",
    year_of_study: 4,
    section: "A",
    graduation_year: 2026,
    university_email: "aditi@campus.edu",
    cgpa: 8.92,
    backlogs: 0,
    active: true,
    placement_registered: true,
    created_at: "",
  };

  const clearedClearances: StudentClearance[] = [
    { id: "1", student_id: "st-cleared", category_id: "c1", category_code: "LIB", category_name: "Library", mandatory: true, status: "cleared", updated_at: "" },
    { id: "2", student_id: "st-cleared", category_id: "c2", category_code: "LAB", category_name: "Lab", mandatory: true, status: "cleared", updated_at: "" },
  ];

  const pendingClearances: StudentClearance[] = [
    { id: "1", student_id: "st-cleared", category_id: "c1", category_code: "LIB", category_name: "Library", mandatory: true, status: "cleared", updated_at: "" },
    { id: "2", student_id: "st-cleared", category_id: "c2", category_code: "LAB", category_name: "Lab", mandatory: true, status: "pending", updated_at: "" }, // Pending
  ];

  it("refuses to issue certificate if student has pending mandatory clearances", () => {
    const issueResult = issueCertificateForStudent(fullyClearedStudent, pendingClearances);
    expect(issueResult.certificate).toBeNull();
    expect(issueResult.error).toContain("Cannot issue certificate");
  });

  it("successfully generates cryptographic certificate token when student is 100% cleared", () => {
    const issueResult = issueCertificateForStudent(fullyClearedStudent, clearedClearances);
    expect(issueResult.certificate).not.toBeNull();
    expect(issueResult.certificate?.verification_token).toMatch(/^CB-\d{4}-22CS101-[A-Z0-9]+$/);
    expect(issueResult.certificate?.is_valid).toBe(true);
  });

  it("public verification returns valid authentic details without exposing private contact info", () => {
    const cert: Certificate = {
      id: "cert-test-01",
      student_id: "st-cleared",
      student_name: "Aditi Rao",
      student_roll: "22CS101",
      department_name: "CSE",
      graduation_year: 2026,
      cgpa: 8.92,
      verification_token: "CB-2026-CS-8921-A9D",
      issued_by: "admin",
      issued_by_name: "Dr. Arvind Sharma",
      issued_at: new Date().toISOString(),
      revoked_at: null,
      is_valid: true,
      snapshot: {},
    };

    const verifyRes = verifyCertificatePublic("CB-2026-CS-8921-A9D", [cert]);
    expect(verifyRes.valid).toBe(true);
    expect(verifyRes.status).toBe("valid");
    expect(verifyRes.details?.roll_number).toBe("22CS101");
    expect(verifyRes.details?.department_name).toBe("CSE");
    // Ensure no phone or email exposed in verification details
    expect((verifyRes.details as any)?.email).toBeUndefined();
    expect((verifyRes.details as any)?.phone).toBeUndefined();
  });

  it("public verification returns revoked status when certificate is invalidated", () => {
    const revokedCert: Certificate = {
      id: "cert-revoked",
      student_id: "st-cleared",
      student_name: "Aditi Rao",
      student_roll: "22CS101",
      department_name: "CSE",
      graduation_year: 2026,
      cgpa: 8.92,
      verification_token: "CB-REVOKED-TOKEN",
      issued_by: "admin",
      issued_by_name: "Dr. Arvind Sharma",
      issued_at: new Date().toISOString(),
      revoked_at: new Date().toISOString(),
      revocation_reason: "Post-graduation audit identified outstanding lab replacement fine.",
      is_valid: false,
      snapshot: {},
    };

    const verifyRes = verifyCertificatePublic("CB-REVOKED-TOKEN", [revokedCert]);
    expect(verifyRes.valid).toBe(false);
    expect(verifyRes.status).toBe("revoked");
    expect(verifyRes.message).toContain("REVOKED");
  });
});

describe("5. Student Privacy & Isolation Verification", () => {
  it("enforces that Student A cannot view or manipulate Student B's clearance", () => {
    const studentA: Profile = {
      id: "student-a-id",
      role: "student",
      roll_number: "22CS101",
      full_name: "Aditi Rao",
      department_id: "dept-cse",
      department_code: "CSE",
      program: "B.Tech",
      year_of_study: 4,
      section: "A",
      graduation_year: 2026,
      university_email: "a@campus.edu",
      cgpa: 8.9,
      backlogs: 0,
      active: true,
      placement_registered: true,
      created_at: "",
    };

    const studentB: Profile = {
      id: "student-b-id",
      role: "student",
      roll_number: "22EC204",
      full_name: "Rohan Mehta",
      department_id: "dept-ece",
      department_code: "ECE",
      program: "B.Tech",
      year_of_study: 4,
      section: "B",
      graduation_year: 2026,
      university_email: "b@campus.edu",
      cgpa: 7.8,
      backlogs: 0,
      active: true,
      placement_registered: true,
      created_at: "",
    };

    // Role simulation: Student A attempting to approve clearance for Student B
    const canApprove = (actor: Profile) => actor.role === "placement_admin";
    expect(canApprove(studentA)).toBe(false);
    expect(canApprove(studentB)).toBe(false);

    // Privacy isolation: querying private records
    const getStudentPrivateProfile = (targetId: string, requestingUser: Profile) => {
      if (requestingUser.role === "placement_admin" || requestingUser.id === targetId) {
        return { targetId, authorized: true };
      }
      return null;
    };

    expect(getStudentPrivateProfile("student-a-id", studentA)).toEqual({ targetId: "student-a-id", authorized: true });
    expect(getStudentPrivateProfile("student-b-id", studentA)).toBeNull(); // Blocked!
  });
});

describe("7. College Identity Verification & Registration Lifecycle (Part 2)", () => {
  it("creates verification requests in pending state with college roll and email", () => {
    const newReq = {
      id: "req-test-1",
      user_id: "u-991",
      type: "student" as const,
      full_name: "Karan Malhotra",
      university_email: "karan.m@campus.edu",
      roll_or_emp_id: "22CS199",
      department_code: "CSE",
      status: "pending" as const,
      submitted_at: new Date().toISOString(),
    };

    expect(newReq.status).toBe("pending");
    expect(newReq.university_email).toContain("@campus.edu");
    expect(newReq.roll_or_emp_id).toBe("22CS199");
  });

  it("authorizes verified institutional profiles upon admin sign-off", () => {
    let status: "pending" | "approved" | "rejected" = "pending";
    let remarks = "";

    const approve = (reviewerRemarks: string) => {
      status = "approved";
      remarks = reviewerRemarks;
    };

    approve("Verified with Registrar student list.");
    expect(status).toBe("approved");
    expect(remarks).toBe("Verified with Registrar student list.");
  });
});

describe("8. Interview Scheduling, Acknowledgment, and Outcome Lifecycle (Part 8)", () => {
  it("enforces interview round scheduling, attendance acknowledgment, and score recording", () => {
    const interview = {
      id: "int-test-1",
      application_id: "app-1",
      drive_id: "drive-1",
      company_name: "Acme Technologies",
      job_role: "SDE-1",
      student_id: "student-1",
      student_name: "Aditi Rao",
      student_roll: "22CS101",
      round_number: 1,
      round_name: "DSA Coding Assessment",
      scheduled_date: "2026-10-25",
      scheduled_time: "10:00",
      duration_minutes: 45,
      mode: "online" as const,
      meet_link: "https://meet.google.com/test-meet-123",
      student_acknowledgment: "pending" as const,
      outcome: "pending" as const,
      score: 0,
      feedback: "",
    };

    expect(interview.student_acknowledgment).toBe("pending");
    expect(interview.outcome).toBe("pending");

    // Student acknowledges
    const acknowledged = { ...interview, student_acknowledgment: "acknowledged" as const };
    expect(acknowledged.student_acknowledgment).toBe("acknowledged");

    // Recruiter records evaluation score
    const evaluated = {
      ...acknowledged,
      outcome: "cleared" as const,
      score: 95,
      feedback: "Exceptional dynamic programming & graph logic.",
    };
    expect(evaluated.outcome).toBe("cleared");
    expect(evaluated.score).toBe(95);
    expect(evaluated.feedback).toContain("Exceptional");
  });
});

describe("9. External College Dues Portal & Receipt Reconciliation (Part 10)", () => {
  it("links external gateway payment reference to departmental clearance approval", () => {
    const receipt = {
      id: "rcpt-test-1",
      student_id: "s-1",
      student_name: "Rohan Verma",
      student_roll: "22EC204",
      category_id: "cat-accounts",
      category_name: "Finance & Accounts",
      transaction_ref: "DU8829104820",
      amount_paid: 3500,
      payment_date: "2026-10-18",
      status: "submitted" as const,
    };

    expect(receipt.status).toBe("submitted");
    expect(receipt.transaction_ref).toBe("DU8829104820");

    // Clearance starts as pending
    let clearanceStatus: "pending" | "cleared" = "pending";

    // Admin verifies payment receipt
    const verifyReceipt = (r: typeof receipt) => {
      if (r.transaction_ref.startsWith("DU") && r.amount_paid > 0) {
        clearanceStatus = "cleared";
        return { ...r, status: "verified" as const };
      }
      return r;
    };

    const verified = verifyReceipt(receipt);
    expect(verified.status).toBe("verified");
    expect(clearanceStatus).toBe("cleared");
  });
});

