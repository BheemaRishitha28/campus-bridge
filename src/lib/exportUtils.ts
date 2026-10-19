import * as XLSX from "xlsx";
import { Profile, RecruitmentDrive, Application, Offer, StudentClearance } from "../types/domain";
import { evaluateStudentNoDues } from "./policyEngine";

/**
 * Exports data to CSV or Excel
 */
export function exportDataToSpreadsheet(
  data: Record<string, unknown>[],
  sheetName: string,
  fileName: string,
  format: "xlsx" | "csv" = "xlsx"
) {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31));

  if (format === "csv") {
    XLSX.writeFile(wb, `${fileName}.csv`, { bookType: "csv" });
  } else {
    XLSX.writeFile(wb, `${fileName}.xlsx`, { bookType: "xlsx" });
  }
}

/**
 * Generates Department-wise Placement Report
 */
export function exportDepartmentReport(
  deptStats: { name: string; short: string; total: number; placed: number; offers: number; rate: number }[],
  format: "xlsx" | "csv" = "xlsx"
) {
  const rows = deptStats.map((d) => ({
    "Department Code": d.short,
    "Department Name": d.name,
    "Total Registered Students": d.total,
    "Unique Students Placed": d.placed,
    "Total Offers Received": d.offers,
    "Placement Rate (%)": `${d.rate}%`,
  }));

  exportDataToSpreadsheet(rows, "Dept_Placements", "CampusBridge_Department_Placement_Report", format);
}

/**
 * Generates Company Recruitment Outcomes Report
 */
export function exportCompanyDrivesReport(
  drives: RecruitmentDrive[],
  applications: Application[],
  offers: Offer[],
  format: "xlsx" | "csv" = "xlsx"
) {
  const rows = drives.map((d) => {
    const driveApps = applications.filter((a) => a.drive_id === d.id);
    const driveOffers = offers.filter((o) => o.drive_id === d.id);
    return {
      "Company Name": d.company_name,
      "Job Role": d.job_role,
      "Package (LPA)": `₹${d.package_lpa} LPA`,
      "Tier": d.tier.toUpperCase(),
      "Status": d.status.toUpperCase(),
      "Location": d.location,
      "Total Applicants": driveApps.length,
      "Shortlisted": driveApps.filter((a) => ["shortlisted", "assessment_completed", "interview_in_progress", "selected", "offer_received", "joined"].includes(a.stage)).length,
      "Offers Extended": driveOffers.length,
      "Accepted Offers": driveOffers.filter((o) => o.accepted).length,
    };
  });

  exportDataToSpreadsheet(rows, "Company_Outcomes", "CampusBridge_Company_Recruitment_Report", format);
}

/**
 * Generates Student Placement History Report
 */
export function exportStudentPlacementReport(
  students: Profile[],
  offers: Offer[],
  applications: Application[],
  format: "xlsx" | "csv" = "xlsx"
) {
  const rows = students.map((s) => {
    const studentOffers = offers.filter((o) => o.student_id === s.id);
    const highestOffer = studentOffers.reduce<Offer | null>((max, curr) => {
      if (!max || curr.package_lpa > max.package_lpa) return curr;
      return max;
    }, null);

    const apps = applications.filter((a) => a.student_id === s.id);

    return {
      "Roll Number": s.roll_number,
      "Full Name": s.full_name,
      "Department": s.department_code,
      "Graduation Year": s.graduation_year,
      "CGPA": s.cgpa.toFixed(2),
      "Active Backlogs": s.backlogs,
      "Placement Status": studentOffers.length > 0 ? "PLACED" : "UNPLACED",
      "Total Offers": studentOffers.length,
      "Highest Package (LPA)": highestOffer ? `₹${highestOffer.package_lpa} LPA` : "N/A",
      "Placed Companies": studentOffers.map((o) => o.company_name).join(", ") || "None",
      "Drives Applied": apps.length,
    };
  });

  exportDataToSpreadsheet(rows, "Student_History", "CampusBridge_Student_Placement_History", format);
}

/**
 * Generates Pending No-Dues Clearance Report
 */
export function exportPendingNoDuesReport(
  students: Profile[],
  clearances: StudentClearance[],
  format: "xlsx" | "csv" = "xlsx"
) {
  const rows: Record<string, unknown>[] = [];

  students.forEach((s) => {
    const studentClearances = clearances.filter((c) => c.student_id === s.id);
    const evalResult = evaluateStudentNoDues(studentClearances);

    if (!evalResult.cleared) {
      const pendingCategories = studentClearances
        .filter((c) => c.mandatory && c.status === "pending")
        .map((c) => c.category_name);

      const rejectedCategories = studentClearances
        .filter((c) => c.mandatory && c.status === "rejected")
        .map((c) => `${c.category_name} (${c.remarks || "Action required"})`);

      rows.push({
        "Roll Number": s.roll_number,
        "Full Name": s.full_name,
        "Department": s.department_code,
        "Batch": s.graduation_year,
        "Clearance Progress (%)": `${evalResult.overallPercentage}%`,
        "Pending Categories": pendingCategories.join(", ") || "None",
        "Rejected / Action Required": rejectedCategories.join(", ") || "None",
        "Contact Email": s.university_email,
      });
    }
  });

  exportDataToSpreadsheet(rows, "Pending_No_Dues", "CampusBridge_Pending_No_Dues_Report", format);
}
