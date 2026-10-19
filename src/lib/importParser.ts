import * as XLSX from "xlsx";
import { Profile, ImportSummary, ImportRowError } from "../types/domain";

export const REQUIRED_COLUMNS = [
  "roll_number",
  "full_name",
  "department_code",
  "program",
  "year_of_study",
  "section",
  "graduation_year",
  "university_email",
  "cgpa",
  "backlogs",
];

export const SAMPLE_STUDENT_TEMPLATE = [
  {
    roll_number: "22CS111",
    full_name: "Aman Varma",
    department_code: "CSE",
    program: "B.Tech Computer Science",
    year_of_study: 4,
    section: "A",
    graduation_year: 2026,
    university_email: "aman.v@campusbridge.edu",
    cgpa: 8.45,
    backlogs: 0,
    placement_registered: true,
  },
  {
    roll_number: "22EC211",
    full_name: "Preeti Shenoy",
    department_code: "ECE",
    program: "B.Tech Electronics & Comm",
    year_of_study: 4,
    section: "B",
    graduation_year: 2026,
    university_email: "preeti.s@campusbridge.edu",
    cgpa: 7.9,
    backlogs: 0,
    placement_registered: true,
  },
  {
    roll_number: "22ME310",
    full_name: "Saurabh Mishra",
    department_code: "MECH",
    program: "B.Tech Mechanical",
    year_of_study: 4,
    section: "C",
    graduation_year: 2026,
    university_email: "saurabh.m@campusbridge.edu",
    cgpa: 7.12,
    backlogs: 1,
    placement_registered: true,
  },
];

/**
 * Downloads a sample template in CSV or XLSX format
 */
export function downloadSampleTemplate(format: "csv" | "xlsx" = "xlsx") {
  const ws = XLSX.utils.json_to_sheet(SAMPLE_STUDENT_TEMPLATE);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Students_Template");

  if (format === "csv") {
    XLSX.writeFile(wb, "CampusBridge_Student_Import_Template.csv", { bookType: "csv" });
  } else {
    XLSX.writeFile(wb, "CampusBridge_Student_Import_Template.xlsx", { bookType: "xlsx" });
  }
}

/**
 * Parses and validates an uploaded student CSV or XLSX file
 */
export async function parseAndValidateStudentFile(
  file: File,
  existingStudents: Profile[]
): Promise<ImportSummary> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  // Convert to JSON
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: "" });

  const errors: ImportRowError[] = [];
  const previewData: Partial<Profile>[] = [];
  const existingRollSet = new Set(existingStudents.map((s) => s.roll_number.trim().toUpperCase()));
  const fileRollSet = new Set<string>();

  let duplicateCount = 0;
  let invalidCount = 0;
  let validCount = 0;

  // Check empty file
  if (rawRows.length === 0) {
    return {
      batch_id: `batch-${Date.now()}`,
      file_name: file.name,
      total_rows: 0,
      valid_rows: 0,
      invalid_rows: 0,
      duplicate_rows: 0,
      errors: [
        {
          row_number: 1,
          error_code: "EMPTY_FILE",
          message: "The uploaded file does not contain any data rows.",
        },
      ],
      preview_data: [],
    };
  }

  // Check required columns in first row headers
  const firstRow = rawRows[0];
  const rawHeaders = Object.keys(firstRow).map((k) => k.trim().toLowerCase());
  const missingColumns = REQUIRED_COLUMNS.filter((col) => !rawHeaders.includes(col));

  if (missingColumns.length > 0) {
    errors.push({
      row_number: 1,
      error_code: "MISSING_REQUIRED_COLUMNS",
      message: `File header is missing required columns: ${missingColumns.join(", ")}`,
    });
  }

  // Row by row validation
  rawRows.forEach((row, index) => {
    const rowNum = index + 2; // header is row 1
    const rollNumber = String(row["roll_number"] || row["Roll Number"] || "").trim().toUpperCase();
    const fullName = String(row["full_name"] || row["Student Name"] || "").trim();
    const deptCode = String(row["department_code"] || row["Department"] || "").trim().toUpperCase();
    const program = String(row["program"] || row["Program"] || "B.Tech").trim();
    const yearOfStudy = parseInt(String(row["year_of_study"] || row["Year"] || 4), 10);
    const section = String(row["section"] || row["Section"] || "A").trim().toUpperCase();
    const gradYear = parseInt(String(row["graduation_year"] || row["Graduation Year"] || 2026), 10);
    const email = String(row["university_email"] || row["Email"] || "").trim().toLowerCase();
    const cgpaRaw = parseFloat(String(row["cgpa"] || row["CGPA"] || -1));
    const backlogsRaw = parseInt(String(row["backlogs"] || row["Backlogs"] || 0), 10);
    const placementReg = String(row["placement_registered"] ?? "true").toLowerCase() !== "false";

    let hasRowError = false;

    // 1. Roll number validation
    if (!rollNumber) {
      errors.push({
        row_number: rowNum,
        error_code: "MISSING_ROLL_NUMBER",
        message: "Missing roll number.",
      });
      hasRowError = true;
    } else if (fileRollSet.has(rollNumber)) {
      errors.push({
        row_number: rowNum,
        roll_number: rollNumber,
        error_code: "DUPLICATE_IN_FILE",
        message: `Duplicate roll number '${rollNumber}' found multiple times within the file.`,
      });
      duplicateCount++;
      hasRowError = true;
    } else if (existingRollSet.has(rollNumber)) {
      errors.push({
        row_number: rowNum,
        roll_number: rollNumber,
        error_code: "DUPLICATE_IN_DATABASE",
        message: `Roll number '${rollNumber}' already exists in the institutional database.`,
      });
      duplicateCount++;
      hasRowError = true;
    }

    fileRollSet.add(rollNumber);

    // 2. Full name check
    if (!fullName) {
      errors.push({
        row_number: rowNum,
        roll_number: rollNumber,
        error_code: "MISSING_NAME",
        message: "Student name cannot be empty.",
      });
      hasRowError = true;
    }

    // 3. Department check
    const validDepts = ["CSE", "ECE", "MECH", "IT", "EEE", "CIVIL"];
    if (!deptCode || !validDepts.includes(deptCode)) {
      errors.push({
        row_number: rowNum,
        roll_number: rollNumber,
        error_code: "INVALID_DEPARTMENT",
        message: `Invalid department '${deptCode}'. Must be one of: ${validDepts.join(", ")}.`,
      });
      hasRowError = true;
    }

    // 4. CGPA check
    if (isNaN(cgpaRaw) || cgpaRaw < 0.0 || cgpaRaw > 10.0) {
      errors.push({
        row_number: rowNum,
        roll_number: rollNumber,
        error_code: "INVALID_CGPA",
        message: `Invalid CGPA '${row["cgpa"]}'. Must be a numeric value between 0.00 and 10.00.`,
      });
      hasRowError = true;
    }

    // 5. Backlogs check
    if (isNaN(backlogsRaw) || backlogsRaw < 0) {
      errors.push({
        row_number: rowNum,
        roll_number: rollNumber,
        error_code: "INVALID_BACKLOGS",
        message: `Invalid backlogs '${row["backlogs"]}'. Must be a non-negative integer.`,
      });
      hasRowError = true;
    }

    // 6. Email check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      errors.push({
        row_number: rowNum,
        roll_number: rollNumber,
        error_code: "INVALID_EMAIL",
        message: `Invalid university email '${email}'.`,
      });
      hasRowError = true;
    }

    // 7. Year and graduation year check
    if (isNaN(yearOfStudy) || yearOfStudy < 1 || yearOfStudy > 6) {
      errors.push({
        row_number: rowNum,
        roll_number: rollNumber,
        error_code: "INVALID_YEAR_OF_STUDY",
        message: `Invalid year of study '${yearOfStudy}'. Must be between 1 and 6.`,
      });
      hasRowError = true;
    }

    if (isNaN(gradYear) || gradYear < 2000 || gradYear > 2100) {
      errors.push({
        row_number: rowNum,
        roll_number: rollNumber,
        error_code: "INVALID_GRAD_YEAR",
        message: `Invalid graduation year '${gradYear}'. Must be between 2000 and 2100.`,
      });
      hasRowError = true;
    }

    if (hasRowError) {
      invalidCount++;
    } else {
      validCount++;
      previewData.push({
        id: `student-import-${Date.now()}-${index}`,
        roll_number: rollNumber,
        full_name: fullName,
        department_id: `dept-${deptCode.toLowerCase()}`,
        department_code: deptCode,
        program,
        year_of_study: yearOfStudy,
        section,
        graduation_year: gradYear,
        university_email: email,
        cgpa: Number(cgpaRaw.toFixed(2)),
        backlogs: backlogsRaw,
        active: true,
        placement_registered: placementReg,
        created_at: new Date().toISOString(),
      });
    }
  });

  return {
    batch_id: `batch-${Date.now()}`,
    file_name: file.name,
    total_rows: rawRows.length,
    valid_rows: validCount,
    invalid_rows: invalidCount,
    duplicate_rows: duplicateCount,
    errors,
    preview_data: previewData,
  };
}
