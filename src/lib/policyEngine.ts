import {
  Profile,
  RecruitmentDrive,
  Offer,
  StudentClearance,
  PlacementPolicy,
  Application,
  AtRiskStudent,
} from "../types/domain";

export interface EligibilityResult {
  eligible: boolean;
  reasons: string[];
  currentTier?: string;
  highestOfferLpa?: number;
}

/**
 * Calculates Dream Offer and Drive Eligibility for a student based on university policy
 */
export function evaluateDriveEligibility(
  student: Profile,
  drive: RecruitmentDrive,
  existingOffers: Offer[],
  policy: PlacementPolicy
): EligibilityResult {
  const reasons: string[] = [];

  // 1. Placement registration check
  if (!student.placement_registered) {
    reasons.push("Student is not registered for university placements.");
  }

  // 2. Department eligibility
  const matchesDept =
    drive.eligible_department_codes.length === 0 ||
    drive.eligible_department_codes.includes(student.department_code) ||
    drive.eligible_department_ids.includes(student.department_id);

  if (!matchesDept) {
    reasons.push(
      `Ineligible department: Drive is open to [${drive.eligible_department_codes.join(", ")}], but your department is ${student.department_code}.`
    );
  }

  // 3. Batch / Graduation year eligibility
  const matchesYear =
    drive.eligible_graduation_years.length === 0 ||
    drive.eligible_graduation_years.includes(student.graduation_year);

  if (!matchesYear) {
    reasons.push(
      `Ineligible batch: Drive is open for batch [${drive.eligible_graduation_years.join(", ")}], but your graduation year is ${student.graduation_year}.`
    );
  }

  // 4. CGPA eligibility
  if (student.cgpa < drive.min_cgpa) {
    reasons.push(
      `Ineligible CGPA: Required minimum CGPA is ${drive.min_cgpa.toFixed(2)}; your recorded CGPA is ${student.cgpa.toFixed(2)}.`
    );
  }

  // 5. Backlogs eligibility
  if (student.backlogs > drive.max_active_backlogs) {
    reasons.push(
      `Backlog restriction: Maximum active backlogs allowed is ${drive.max_active_backlogs}; you currently have ${student.backlogs}.`
    );
  }

  // 6. Deadline check
  if (drive.registration_deadline) {
    const deadline = new Date(drive.registration_deadline);
    if (new Date() > deadline) {
      reasons.push(`Registration deadline expired on ${deadline.toLocaleDateString()}.`);
    }
  }

  // 7. Drive status check
  if (drive.status !== "open") {
    reasons.push(`Drive is currently '${drive.status.replace("_", " ")}', not accepting new applications.`);
  }

  // 8. Dream Offer Policy Rules
  const studentOffers = existingOffers.filter((o) => o.student_id === student.id);
  const highestOffer = studentOffers.reduce<Offer | null>((max, curr) => {
    if (!max || curr.package_lpa > max.package_lpa) return curr;
    return max;
  }, null);

  const highestLpa = highestOffer ? highestOffer.package_lpa : 0;

  if (studentOffers.length >= policy.max_offers_allowed) {
    reasons.push(
      `Max offer limit reached: University policy permits maximum ${policy.max_offers_allowed} offers per student.`
    );
  } else if (highestOffer) {
    // Current highest offer tier
    const isRegular = highestLpa <= policy.regular_max_lpa;
    const isDream = highestLpa >= policy.dream_min_lpa && highestLpa <= policy.dream_max_lpa;
    const isSuperDream = highestLpa >= policy.super_dream_min_lpa;

    if (isSuperDream) {
      reasons.push(
        `Pinnacle Tier Reached: You already hold a Super Dream offer of ₹${highestLpa} LPA (${highestOffer.company_name}). Under university rules, students with Super Dream offers cannot apply for additional drives.`
      );
    } else if (isDream) {
      if (drive.tier !== "super_dream") {
        reasons.push(
          `Dream Offer Lock: You currently hold a Dream offer of ₹${highestLpa} LPA (${highestOffer.company_name}). You may only apply for Super Dream drives (>= ₹${policy.super_dream_min_lpa} LPA). This drive is '${drive.tier}'.`
        );
      }
    } else if (isRegular) {
      if (drive.tier === "regular" && !policy.allow_dream_after_regular) {
        reasons.push(
          `Offer Upgrade Restriction: You hold a Regular offer of ₹${highestLpa} LPA. Policy restricts applying to another Regular tier drive.`
        );
      }
    }
  }

  return {
    eligible: reasons.length === 0,
    reasons: reasons.length === 0 ? ["All criteria satisfied. Eligible to apply."] : reasons,
    currentTier: highestOffer ? highestOffer.tier : "unplaced",
    highestOfferLpa: highestLpa,
  };
}

export interface NoDuesEvaluation {
  cleared: boolean;
  totalMandatory: number;
  clearedMandatory: number;
  pendingMandatory: number;
  rejectedMandatory: number;
  overallPercentage: number;
  allClearancesCount: number;
  missingMandatory: boolean;
}

/**
 * Evaluates whether a student is fully cleared for university No-Dues.
 * CRITICAL RULE: A student is cleared IF AND ONLY IF every mandatory category has status 'cleared' or 'not_applicable'.
 * Even ONE pending or rejected mandatory clearance immediately causes cleared = false.
 */
export function evaluateStudentNoDues(
  clearances: StudentClearance[],
  mandatoryCategoryIds?: string[]
): NoDuesEvaluation {
  // If category IDs are provided, ensure no missing mandatory categories
  const mandatoryItems = clearances.filter((c) => c.mandatory);
  const totalMandatory = mandatoryItems.length;

  let clearedMandatory = 0;
  let pendingMandatory = 0;
  let rejectedMandatory = 0;

  for (const c of mandatoryItems) {
    if (c.status === "cleared" || c.status === "not_applicable") {
      clearedMandatory++;
    } else if (c.status === "pending") {
      pendingMandatory++;
    } else if (c.status === "rejected") {
      rejectedMandatory++;
    }
  }

  let missingMandatory = false;
  if (mandatoryCategoryIds && mandatoryCategoryIds.length > 0) {
    const presentCategoryIds = new Set(clearances.map((c) => c.category_id));
    for (const catId of mandatoryCategoryIds) {
      if (!presentCategoryIds.has(catId)) {
        missingMandatory = true;
        break;
      }
    }
  }

  const isCleared =
    totalMandatory > 0 &&
    clearedMandatory === totalMandatory &&
    pendingMandatory === 0 &&
    rejectedMandatory === 0 &&
    !missingMandatory;

  const percentage =
    totalMandatory > 0 ? Math.round((clearedMandatory / totalMandatory) * 100) : 0;

  return {
    cleared: isCleared,
    totalMandatory,
    clearedMandatory,
    pendingMandatory,
    rejectedMandatory,
    overallPercentage: percentage,
    allClearancesCount: clearances.length,
    missingMandatory,
  };
}

/**
 * Calculates core university placement statistics with strict distinction between
 * Unique Students Placed vs Total Offers Received
 */
export function calculatePlacementAnalytics(
  students: Profile[],
  applications: Application[],
  offers: Offer[],
  drives: RecruitmentDrive[],
  clearances: StudentClearance[],
  filters?: { department?: string; batch?: number }
) {
  let filteredStudents = students;
  if (filters?.department && filters.department !== "All departments") {
    filteredStudents = filteredStudents.filter((s) => s.department_code === filters.department);
  }
  if (filters?.batch) {
    filteredStudents = filteredStudents.filter((s) => s.graduation_year === filters.batch);
  }

  const studentIds = new Set(filteredStudents.map((s) => s.id));

  // Registered students
  const totalRegistered = filteredStudents.filter((s) => s.placement_registered).length;

  // Eligible students (registered, active, <= 1 backlog)
  const eligibleStudents = filteredStudents.filter(
    (s) => s.placement_registered && s.active && s.backlogs <= 1
  );

  // Filtered applications and offers
  const filteredApps = applications.filter((a) => studentIds.has(a.student_id));
  const filteredOffers = offers.filter((o) => studentIds.has(o.student_id));

  // Participating students (students who submitted at least one application)
  const participatingStudentIds = new Set(filteredApps.map((a) => a.student_id));
  const participatingCount = participatingStudentIds.size;

  // Placed students definition:
  // Distinct student IDs who have received a qualifying offer OR have application in selected/offer_received/joined
  const placedStudentIds = new Set<string>();

  filteredOffers.forEach((o) => {
    // Check if the associated drive is not cancelled
    const drive = drives.find((d) => d.id === o.drive_id);
    if (!drive || drive.status !== "cancelled") {
      placedStudentIds.add(o.student_id);
    }
  });

  filteredApps.forEach((a) => {
    if (["selected", "offer_received", "joined"].includes(a.stage)) {
      const drive = drives.find((d) => d.id === a.drive_id);
      if (!drive || drive.status !== "cancelled") {
        placedStudentIds.add(a.student_id);
      }
    }
  });

  const uniquePlacedCount = placedStudentIds.size;
  const totalOffersCount = filteredOffers.length;
  const unplacedCount = Math.max(0, eligibleStudents.length - uniquePlacedCount);

  // Placement percentage denominator: eligible students
  const placementRate =
    eligibleStudents.length > 0
      ? Number(((uniquePlacedCount / eligibleStudents.length) * 100).toFixed(1))
      : 0;

  // Highest and Average Package
  const packages = filteredOffers.map((o) => o.package_lpa).filter((p) => p > 0);
  const highestPackage = packages.length > 0 ? Math.max(...packages) : 0;
  const averagePackage =
    packages.length > 0
      ? Number((packages.reduce((a, b) => a + b, 0) / packages.length).toFixed(2))
      : 0;

  // Pending No-Dues count among filtered students
  let pendingNoDuesStudentsCount = 0;
  filteredStudents.forEach((st) => {
    const studentClearances = clearances.filter((c) => c.student_id === st.id);
    const evalResult = evaluateStudentNoDues(studentClearances);
    if (!evalResult.cleared) {
      pendingNoDuesStudentsCount++;
    }
  });

  // Department-wise breakdown
  const deptSummary: Record<
    string,
    { name: string; short: string; total: number; placed: number; offers: number; rate: number }
  > = {
    CSE: { name: "Computer Science & Engineering", short: "CSE", total: 0, placed: 0, offers: 0, rate: 0 },
    ECE: { name: "Electronics & Communication", short: "ECE", total: 0, placed: 0, offers: 0, rate: 0 },
    MECH: { name: "Mechanical Engineering", short: "MECH", total: 0, placed: 0, offers: 0, rate: 0 },
  };

  filteredStudents.forEach((st) => {
    const d = deptSummary[st.department_code];
    if (d) {
      d.total++;
      if (placedStudentIds.has(st.id)) {
        d.placed++;
      }
    }
  });

  filteredOffers.forEach((o) => {
    const st = students.find((s) => s.id === o.student_id);
    if (st && deptSummary[st.department_code]) {
      deptSummary[st.department_code].offers++;
    }
  });

  Object.values(deptSummary).forEach((d) => {
    d.rate = d.total > 0 ? Number(((d.placed / d.total) * 100).toFixed(1)) : 0;
  });

  return {
    totalStudents: filteredStudents.length,
    totalRegistered,
    eligibleCount: eligibleStudents.length,
    participatingCount,
    uniquePlacedCount,
    totalOffersCount,
    unplacedCount,
    placementRate,
    highestPackage,
    averagePackage,
    pendingNoDuesStudentsCount,
    deptSummary: Object.values(deptSummary),
    activeDrivesCount: drives.filter((d) => d.status === "open" || d.status === "in_progress").length,
  };
}

/**
 * Transparent, rule-based At-Risk assessment for final year students
 */
export function getAtRiskStudents(
  students: Profile[],
  clearances: StudentClearance[],
  applications: Application[],
  offers: Offer[]
): AtRiskStudent[] {
  const atRiskList: AtRiskStudent[] = [];
  const currentGradYear = 2026;

  // Filter final year students
  const finalYearStudents = students.filter((s) => s.graduation_year === currentGradYear && s.active);

  finalYearStudents.forEach((student) => {
    const studentClearances = clearances.filter((c) => c.student_id === student.id);
    const studentApps = applications.filter((a) => a.student_id === student.id);
    const studentOffers = offers.filter((o) => o.student_id === student.id);

    const hasOffer = studentOffers.length > 0;
    const isPlaced =
      hasOffer || studentApps.some((a) => ["selected", "offer_received", "joined"].includes(a.stage));

    let pendingMandatory = 0;
    let rejectedMandatory = 0;
    const pendingNames: string[] = [];
    const rejectedNames: string[] = [];

    studentClearances.forEach((c) => {
      if (c.mandatory) {
        if (c.status === "pending") {
          pendingMandatory++;
          pendingNames.push(c.category_name);
        } else if (c.status === "rejected") {
          rejectedMandatory++;
          rejectedNames.push(c.category_name);
        }
      }
    });

    const reasons: string[] = [];

    // Condition 1: Final year, unplaced, with multiple pending/rejected mandatory clearances
    if (!isPlaced && (pendingMandatory + rejectedMandatory >= 2)) {
      if (rejectedMandatory > 0) {
        reasons.push(
          `Unplaced with ${rejectedMandatory} rejected clearance (${rejectedNames.join(", ")}) and ${pendingMandatory} pending.`
        );
      } else {
        reasons.push(
          `Unplaced with ${pendingMandatory} mandatory clearances still pending (${pendingNames.join(", ")}).`
        );
      }
    }

    // Condition 2: Registered for placement, 0 applications, academic backlog
    if (student.placement_registered && studentApps.length === 0 && student.backlogs > 0) {
      reasons.push(
        `Placement registered but 0 drive applications submitted; ${student.backlogs} active backlog.`
      );
    }

    if (reasons.length > 0) {
      atRiskList.push({
        student,
        pending_mandatory_count: pendingMandatory,
        rejected_mandatory_count: rejectedMandatory,
        reasons,
        applied_count: studentApps.length,
        has_offer: hasOffer,
      });
    }
  });

  return atRiskList;
}
