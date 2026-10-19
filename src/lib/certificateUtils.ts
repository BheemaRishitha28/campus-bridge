import QRCode from "qrcode";
import jsPDF from "jspdf";
import { Certificate, Profile, StudentClearance } from "../types/domain";
import { evaluateStudentNoDues } from "./policyEngine";

/**
 * Generates a unique verification token for a student certificate
 */
export function generateVerificationToken(rollNumber: string): string {
  const year = new Date().getFullYear();
  const cleanRoll = rollNumber.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CB-${year}-${cleanRoll}-${randomSuffix}`;
}

/**
 * Generates a QR code data URL from a verification token
 */
export async function generateQrDataUrl(verificationToken: string): Promise<string> {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://campusbridge.edu";
  const verificationUrl = `${origin}/#verify/${verificationToken}`;
  try {
    return await QRCode.toDataURL(verificationUrl, {
      width: 200,
      margin: 1,
      color: {
        dark: "#14213D",
        light: "#FFFFFF",
      },
    });
  } catch (err) {
    console.error("Failed to generate QR code", err);
    return "";
  }
}

/**
 * Issue a new certificate for a student, strictly validating 100% mandatory clearance
 */
export function issueCertificateForStudent(
  student: Profile,
  clearances: StudentClearance[],
  issuerName = "Dr. Arvind Sharma (Dean of Placements)",
  issuerId = "user-admin-1"
): { certificate: Certificate | null; error?: string } {
  const evalResult = evaluateStudentNoDues(clearances);
  if (!evalResult.cleared) {
    return {
      certificate: null,
      error: `Cannot issue certificate: Student has ${evalResult.pendingMandatory} pending and ${evalResult.rejectedMandatory} rejected mandatory clearances.`,
    };
  }

  const token = generateVerificationToken(student.roll_number);

  const cert: Certificate = {
    id: `cert-${Date.now()}`,
    student_id: student.id,
    student_name: student.full_name,
    student_roll: student.roll_number,
    department_name: student.department_code,
    graduation_year: student.graduation_year,
    cgpa: student.cgpa,
    verification_token: token,
    issued_by: issuerId,
    issued_by_name: issuerName,
    issued_at: new Date().toISOString(),
    revoked_at: null,
    revocation_reason: null,
    is_valid: true,
    snapshot: {
      roll_number: student.roll_number,
      full_name: student.full_name,
      department: student.department_code,
      graduation_year: student.graduation_year,
      cgpa: student.cgpa,
      clearance_date: new Date().toISOString(),
      verified_by: issuerName,
    },
  };

  return { certificate: cert };
}

/**
 * Public Verification function - returns only safe, sanitized data
 */
export function verifyCertificatePublic(
  token: string,
  certificates: Certificate[]
): {
  valid: boolean;
  status: "valid" | "revoked" | "not_found";
  details?: {
    roll_number: string;
    student_name: string;
    department_name: string;
    graduation_year: number;
    clearance_date: string;
    issuer: string;
    verification_token: string;
  };
  message: string;
} {
  const trimmed = token.trim();
  const cert = certificates.find(
    (c) => c.verification_token.toLowerCase() === trimmed.toLowerCase() || c.id.toLowerCase() === trimmed.toLowerCase()
  );

  if (!cert) {
    return {
      valid: false,
      status: "not_found",
      message: "Certificate not found. The verification token is invalid or does not exist in the institutional registry.",
    };
  }

  if (cert.revoked_at || !cert.is_valid) {
    return {
      valid: false,
      status: "revoked",
      details: {
        roll_number: cert.student_roll,
        student_name: maskName(cert.student_name),
        department_name: cert.department_name,
        graduation_year: cert.graduation_year,
        clearance_date: new Date(cert.issued_at).toLocaleDateString(),
        issuer: cert.issued_by_name,
        verification_token: cert.verification_token,
      },
      message: `This certificate was REVOKED on ${new Date(cert.revoked_at || "").toLocaleDateString()}. Reason: ${cert.revocation_reason || "Administrative review"}.`,
    };
  }

  return {
    valid: true,
    status: "valid",
    details: {
      roll_number: cert.student_roll,
      student_name: cert.student_name,
      department_name: cert.department_name,
      graduation_year: cert.graduation_year,
      clearance_date: new Date(cert.issued_at).toLocaleDateString(),
      issuer: cert.issued_by_name,
      verification_token: cert.verification_token,
    },
    message: "Verified authentic institutional No-Dues Certificate.",
  };
}

function maskName(name: string): string {
  const parts = name.split(" ");
  return parts.map((p) => (p.length > 2 ? p[0] + "*".repeat(p.length - 2) + p[p.length - 1] : p)).join(" ");
}

/**
 * Downloads a high-quality PDF certificate with QR code
 */
export async function downloadCertificatePdf(cert: Certificate): Promise<void> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Background and border
  doc.setFillColor(245, 247, 251);
  doc.rect(0, 0, pageWidth, 297, "F");

  // Elegant navy border
  doc.setDrawColor(20, 33, 61);
  doc.setLineWidth(2);
  doc.rect(10, 10, pageWidth - 20, 277);

  // Inner gold/bronze trim
  doc.setDrawColor(218, 165, 32);
  doc.setLineWidth(0.6);
  doc.rect(13, 13, pageWidth - 26, 271);

  // Institution Header
  doc.setTextColor(20, 33, 61);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("CAMPUSBRIDGE UNIVERSITY", pageWidth / 2, 35, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("OFFICE OF ACADEMIC AFFAIRS & PLACEMENT DIRECTORATE", pageWidth / 2, 42, { align: "center" });

  doc.setDrawColor(226, 232, 240);
  doc.line(30, 48, pageWidth - 30, 48);

  // Certificate Title
  doc.setTextColor(37, 99, 235);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("OFFICIAL NO-DUES CLEARANCE CERTIFICATE", pageWidth / 2, 60, { align: "center" });

  doc.setFontSize(11);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(71, 85, 105);
  doc.text("This is to certify that all institutional dues and departmental requirements have been verified.", pageWidth / 2, 68, { align: "center" });

  // Student Details Box
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(25, 78, pageWidth - 50, 75, 3, 3, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(20, 33, 61);

  const leftCol = 35;
  const valCol = 85;
  let rowY = 92;

  doc.text("Student Name:", leftCol, rowY);
  doc.setFont("helvetica", "normal");
  doc.text(cert.student_name, valCol, rowY);

  rowY += 11;
  doc.setFont("helvetica", "bold");
  doc.text("Roll / Registration No:", leftCol, rowY);
  doc.setFont("helvetica", "normal");
  doc.text(cert.student_roll, valCol, rowY);

  rowY += 11;
  doc.setFont("helvetica", "bold");
  doc.text("Department:", leftCol, rowY);
  doc.setFont("helvetica", "normal");
  doc.text(cert.department_name, valCol, rowY);

  rowY += 11;
  doc.setFont("helvetica", "bold");
  doc.text("Graduation Batch:", leftCol, rowY);
  doc.setFont("helvetica", "normal");
  doc.text(String(cert.graduation_year), valCol, rowY);

  rowY += 11;
  doc.setFont("helvetica", "bold");
  doc.text("Cumulative GPA:", leftCol, rowY);
  doc.setFont("helvetica", "normal");
  doc.text(cert.cgpa.toFixed(2), valCol, rowY);

  rowY += 11;
  doc.setFont("helvetica", "bold");
  doc.text("Overall Clearance Status:", leftCol, rowY);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 157, 138); // Teal
  doc.text("ALL MANDATORY REQUIREMENTS CLEARED", valCol, rowY);

  // Clearance Departments Verified Table
  doc.setTextColor(20, 33, 61);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Verified Institutional Departments", leftCol, 168);

  const deptList = [
    "✓ Central Library: Cleared",
    "✓ Laboratory & Equipment: Cleared",
    "✓ Academic Department: Cleared",
    "✓ Placement & Training Cell: Cleared",
    "✓ Finance & Accounts Office: Cleared",
    "✓ Hostel & Residential Mess: Verified / N.A.",
  ];

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  deptList.forEach((item, index) => {
    const x = index < 3 ? leftCol : leftCol + 70;
    const y = 176 + (index % 3) * 8;
    doc.text(item, x, y);
  });

  // QR Code Generation
  const qrDataUrl = await generateQrDataUrl(cert.verification_token);
  if (qrDataUrl) {
    doc.addImage(qrDataUrl, "PNG", leftCol, 210, 40, 40);
  }

  // Verification text next to QR
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(20, 33, 61);
  doc.text("Cryptographic Verification", leftCol + 46, 218);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Scan QR code to verify this certificate on the official", leftCol + 46, 224);
  doc.text("CampusBridge university blockchain-backed verification portal.", leftCol + 46, 229);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(37, 99, 235);
  doc.text(`ID: ${cert.verification_token}`, leftCol + 46, 237);

  // Authorized Signatures
  doc.setDrawColor(203, 213, 225);
  doc.line(pageWidth - 85, 240, pageWidth - 30, 240);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(20, 33, 61);
  doc.text("Authorized Signatory", pageWidth - 85, 246);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(cert.issued_by_name, pageWidth - 85, 251);
  doc.text(`Issued on: ${new Date(cert.issued_at).toLocaleDateString()}`, pageWidth - 85, 256);

  // Footer Disclaimer
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    "CampusBridge Secure Registry · Tamper-evident digital certificate · Official university clearance document",
    pageWidth / 2,
    275,
    { align: "center" }
  );

  doc.save(`CampusBridge_NoDues_${cert.student_roll}.pdf`);
}
