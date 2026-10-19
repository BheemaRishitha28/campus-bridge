import { useState, useEffect } from "react";
import {
  Profile,
  Department,
  ClearanceCategory,
  PlacementPolicy,
  Company,
  RecruitmentDrive,
  Application,
  Offer,
  StudentClearance,
  Certificate,
  AuditLog,
  Notification,
  ApplicationStage,
  ClearanceStatus,
  Interview,
  InterviewOutcome,
  CollegeIdVerificationRequest,
  VerificationStatus,
  ExternalDuesConfig,
  ExternalPaymentReceipt,
} from "../types/domain";
import {
  initialDepartments,
  initialCategories,
  initialPolicy,
  initialCompanies,
  initialDrives,
  initialStudents,
  facultyProfile,
  initialApplications,
  initialOffers,
  initialClearances,
  initialCertificates,
  initialAuditLogs,
  initialNotifications,
  initialInterviews,
  initialVerificationRequests,
  initialExternalDuesConfig,
  initialPaymentReceipts,
} from "./mockData";
import { isSupabaseConfigured, supabase } from "./supabase";
import { evaluateDriveEligibility } from "./policyEngine";
import { issueCertificateForStudent } from "./certificateUtils";

const STORAGE_KEY_PREFIX = "campusbridge_v1_";

function getLocal<T>(key: string, defaultValue: T): T {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error(`Error reading ${key} from localStorage`, e);
  }
  return defaultValue;
}

function setLocal<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to localStorage`, e);
  }
}

// Global Store State
export interface AppStore {
  currentUser: Profile | null;
  departments: Department[];
  categories: ClearanceCategory[];
  policy: PlacementPolicy;
  companies: Company[];
  drives: RecruitmentDrive[];
  students: Profile[];
  applications: Application[];
  offers: Offer[];
  clearances: StudentClearance[];
  certificates: Certificate[];
  auditLogs: AuditLog[];
  notifications: Notification[];
  interviews: Interview[];
  verificationRequests: CollegeIdVerificationRequest[];
  externalDuesConfig: ExternalDuesConfig;
  paymentReceipts: ExternalPaymentReceipt[];
  theme: "light" | "dark";
  isSupabaseConnected: boolean;
  backendStatusMessage: string;

  // Actions
  loginAs: (profile: Profile) => void;
  logout: () => void;
  toggleTheme: () => void;
  checkSupabaseHealth: () => Promise<{ connected: boolean; message: string }>;

  // Students
  addStudent: (student: Partial<Profile>) => Promise<Profile>;
  updateStudent: (id: string, updates: Partial<Profile>) => Promise<Profile>;
  updateStudentProfile: (
    id: string,
    updates: {
      phone?: string;
      bio?: string;
      skills?: string[];
      resume_url?: string;
      linkedin_url?: string;
      github_url?: string;
    }
  ) => Promise<Profile>;
  importStudents: (students: Partial<Profile>[]) => Promise<{ count: number }>;

  // Drives
  createDrive: (drive: Partial<RecruitmentDrive>) => Promise<RecruitmentDrive>;
  updateDriveStatus: (driveId: string, status: RecruitmentDrive["status"]) => Promise<void>;

  // Applications & Offers
  applyForDrive: (studentId: string, driveId: string) => Promise<{ success: boolean; message: string }>;
  updateApplicationStage: (applicationId: string, stage: ApplicationStage, note?: string) => Promise<void>;
  issueOffer: (applicationId: string, offerData: { offer_reference: string; package_lpa: number; offer_date: string }) => Promise<Offer>;

  // Interviews (Part 8)
  scheduleInterview: (interview: Omit<Interview, "id" | "created_at" | "student_acknowledgment" | "outcome">) => Promise<Interview>;
  updateInterviewOutcome: (interviewId: string, outcome: InterviewOutcome, feedback?: string, score?: number) => Promise<void>;
  acknowledgeInterview: (interviewId: string) => Promise<void>;
  requestInterviewReschedule: (interviewId: string, reason: string) => Promise<void>;

  // College ID Verification (Part 2)
  submitVerificationRequest: (req: Omit<CollegeIdVerificationRequest, "id" | "status" | "submitted_at">) => Promise<CollegeIdVerificationRequest>;
  reviewVerificationRequest: (requestId: string, status: VerificationStatus, remarks?: string) => Promise<void>;

  // External Dues (Part 10)
  updateExternalDuesConfig: (config: Partial<ExternalDuesConfig>) => Promise<void>;
  submitPaymentReceipt: (receipt: Omit<ExternalPaymentReceipt, "id" | "status" | "submitted_at">) => Promise<ExternalPaymentReceipt>;
  reviewPaymentReceipt: (receiptId: string, status: "verified" | "rejected", remarks?: string) => Promise<void>;

  // Clearances
  updateClearanceStatus: (
    clearanceId: string,
    status: ClearanceStatus,
    remarks?: string,
    pendingRequirement?: string
  ) => Promise<void>;

  // Certificates
  generateCertificate: (studentId: string) => Promise<{ success: boolean; certificate?: Certificate; error?: string }>;
  revokeCertificate: (certificateId: string, reason: string) => Promise<void>;

  // Settings & Policy
  updatePolicy: (newPolicy: Partial<PlacementPolicy>) => Promise<void>;

  // Notifications
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;

  // Reset to initial demo state
  resetToDemoData: () => void;
}

class StoreManager {
  private listeners = new Set<() => void>();

  public state: {
    currentUser: Profile | null;
    departments: Department[];
    categories: ClearanceCategory[];
    policy: PlacementPolicy;
    companies: Company[];
    drives: RecruitmentDrive[];
    students: Profile[];
    applications: Application[];
    offers: Offer[];
    clearances: StudentClearance[];
    certificates: Certificate[];
    auditLogs: AuditLog[];
    notifications: Notification[];
    interviews: Interview[];
    verificationRequests: CollegeIdVerificationRequest[];
    externalDuesConfig: ExternalDuesConfig;
    paymentReceipts: ExternalPaymentReceipt[];
    theme: "light" | "dark";
    isSupabaseConnected: boolean;
    backendStatusMessage: string;
  };

  constructor() {
    const savedUser = getLocal<Profile | null>("current_user", null);
    const savedTheme = (localStorage.getItem("campusbridge_theme") as "light" | "dark") || "light";

    this.state = {
      currentUser: savedUser,
      departments: getLocal("departments", initialDepartments),
      categories: getLocal("categories", initialCategories),
      policy: getLocal("policy", initialPolicy),
      companies: getLocal("companies", initialCompanies),
      drives: getLocal("drives", initialDrives),
      students: getLocal("students", initialStudents),
      applications: getLocal("applications", initialApplications),
      offers: getLocal("offers", initialOffers),
      clearances: getLocal("clearances", initialClearances),
      certificates: getLocal("certificates", initialCertificates),
      auditLogs: getLocal("audit_logs", initialAuditLogs),
      notifications: getLocal("notifications", initialNotifications),
      interviews: getLocal("interviews", initialInterviews),
      verificationRequests: getLocal("verificationRequests", initialVerificationRequests),
      externalDuesConfig: getLocal("externalDuesConfig", initialExternalDuesConfig),
      paymentReceipts: getLocal("paymentReceipts", initialPaymentReceipts),
      theme: savedTheme,
      isSupabaseConnected: Boolean(isSupabaseConfigured),
      backendStatusMessage: isSupabaseConfigured
        ? "🟢 Cloud PostgreSQL Connected · Supabase Auth & RLS Active"
        : "⚡ Offline Evaluation Mode · Local Storage Persistence · Set VITE_SUPABASE_URL in .env to enable Cloud Sync",
    };

    this.applyTheme(this.state.theme);
    this.syncWithSupabase();
  }

  public async syncWithSupabase() {
    if (!isSupabaseConfigured || !supabase) {
      this.state.isSupabaseConnected = false;
      this.state.backendStatusMessage = "⚡ Offline Evaluation Mode · Local Storage Persistence · Set VITE_SUPABASE_URL in .env to enable Cloud Sync";
      this.emit();
      return;
    }

    try {
      const { error } = await supabase.auth.getSession();
      if (error) {
        this.state.isSupabaseConnected = false;
        this.state.backendStatusMessage = `⚠️ Supabase Auth Error (${error.message}). Running on Local Storage.`;
      } else {
        this.state.isSupabaseConnected = true;
        this.state.backendStatusMessage = "🟢 Cloud Supabase Connected (Auth Service Active)";
      }
    } catch (e: any) {
      this.state.isSupabaseConnected = false;
      this.state.backendStatusMessage = `⚠️ Supabase Connection Error (${e.message}). Running on Local Storage.`;
    }
    this.emit();
  }

  public checkSupabaseHealth = async (): Promise<{ connected: boolean; message: string }> => {
    await this.syncWithSupabase();
    return {
      connected: this.state.isSupabaseConnected,
      message: this.state.backendStatusMessage,
    };
  };

  private emit() {
    this.listeners.forEach((listener) => listener());
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private save<K extends keyof typeof this.state>(key: K) {
    setLocal(String(key), this.state[key]);
  }

  public applyTheme(theme: "light" | "dark") {
    if (typeof document !== "undefined") {
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      localStorage.setItem("campusbridge_theme", theme);
    }
  }

  public toggleTheme = () => {
    const next = this.state.theme === "dark" ? "light" : "dark";
    this.state.theme = next;
    this.applyTheme(next);
    this.emit();
  };

  public loginAs = (profile: Profile) => {
    this.state.currentUser = profile;
    this.save("currentUser" as any);
    this.emit();
  };

  public logout = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error("Supabase signOut error", err);
      }
    }
    this.state.currentUser = null;
    this.save("currentUser" as any);
    this.emit();
  };

  private addAudit(
    action: string,
    targetType: AuditLog["target_type"],
    targetId: string,
    details: string,
    oldValue?: string,
    newValue?: string
  ) {
    const actor = this.state.currentUser || facultyProfile;
    const log: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      actor_id: actor.id,
      actor_name: actor.full_name,
      actor_role: actor.role,
      action,
      target_type: targetType,
      target_id: targetId,
      old_value: oldValue,
      new_value: newValue,
      details,
      timestamp: new Date().toISOString(),
    };

    this.state.auditLogs = [log, ...this.state.auditLogs];
    this.save("auditLogs");
  }

  private sendNotification(userId: string, title: string, message: string, type: Notification["type"], link?: string) {
    const notif: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      user_id: userId,
      title,
      message,
      type,
      read: false,
      link,
      created_at: new Date().toISOString(),
    };
    this.state.notifications = [notif, ...this.state.notifications];
    this.save("notifications");
  }

  // --- Student Actions ---
  public addStudent = async (studentData: Partial<Profile>): Promise<Profile> => {
    const isStaff = this.state.currentUser?.role === "placement_admin" || this.state.currentUser?.role === "faculty";
    if (!isStaff) {
      throw new Error("Unauthorized: Only placement administrators or departmental faculty can add students.");
    }

    const newStudent: Profile = {
      id: `student-${Date.now()}`,
      role: "student",
      roll_number: studentData.roll_number?.trim().toUpperCase() || "",
      full_name: studentData.full_name?.trim() || "",
      department_id: studentData.department_id || "dept-cse",
      department_code: studentData.department_code || "CSE",
      program: studentData.program || "B.Tech",
      year_of_study: studentData.year_of_study || 4,
      section: studentData.section || "A",
      graduation_year: studentData.graduation_year || 2026,
      university_email: studentData.university_email || "",
      phone: studentData.phone || "+91 98765 43210",
      bio: studentData.bio || "Enrolled final year student.",
      skills: studentData.skills || ["Computer Fundamentals", "Problem Solving"],
      cgpa: studentData.cgpa || 7.0,
      backlogs: studentData.backlogs || 0,
      active: true,
      placement_registered: studentData.placement_registered ?? true,
      created_at: new Date().toISOString(),
    };

    // Auto-create initial clearance rows for the student
    const newClearances: StudentClearance[] = this.state.categories.map((cat) => ({
      id: `clr-${newStudent.id}-${cat.id}`,
      student_id: newStudent.id,
      category_id: cat.id,
      category_code: cat.code,
      category_name: cat.name,
      mandatory: cat.mandatory,
      status: "pending",
      remarks: "Awaiting initial departmental verification.",
      updated_by_name: cat.approver_role,
      updated_at: new Date().toISOString(),
    }));

    this.state.students = [newStudent, ...this.state.students];
    this.state.clearances = [...this.state.clearances, ...newClearances];

    this.save("students");
    this.save("clearances");

    this.addAudit(
      "CREATED_STUDENT",
      "student",
      newStudent.id,
      `Added student ${newStudent.full_name} (${newStudent.roll_number}) in ${newStudent.department_code}.`
    );

    if (this.state.isSupabaseConnected && supabase) {
      try {
        await supabase.from("profiles").insert([newStudent]);
        await supabase.from("student_clearances").insert(newClearances);
      } catch (e) {
        console.warn("Supabase insert student sync warning", e);
      }
    }

    this.emit();
    return newStudent;
  };

  public updateStudent = async (id: string, updates: Partial<Profile>): Promise<Profile> => {
    const isStaff = this.state.currentUser?.role === "placement_admin" || this.state.currentUser?.role === "faculty";
    if (!isStaff) {
      throw new Error("Unauthorized: Only placement administrators or departmental faculty can edit student records.");
    }

    const index = this.state.students.findIndex((s) => s.id === id);
    if (index === -1) throw new Error("Student not found.");

    const updated = { ...this.state.students[index], ...updates, updated_at: new Date().toISOString() };
    this.state.students[index] = updated;
    this.save("students");

    this.addAudit(
      "UPDATED_STUDENT",
      "student",
      id,
      `Updated student profile for ${updated.full_name} (${updated.roll_number}).`
    );

    if (this.state.isSupabaseConnected && supabase) {
      try {
        await supabase.from("profiles").update(updates).eq("id", id);
      } catch (e) {
        console.warn("Supabase update student sync warning", e);
      }
    }

    this.emit();
    return updated;
  };

  public updateStudentProfile = async (
    id: string,
    updates: {
      phone?: string;
      bio?: string;
      skills?: string[];
      resume_url?: string;
      linkedin_url?: string;
      github_url?: string;
    }
  ): Promise<Profile> => {
    const isSelf = this.state.currentUser?.id === id;
    const isStaff = this.state.currentUser?.role === "placement_admin" || this.state.currentUser?.role === "faculty";
    if (!isSelf && !isStaff) {
      throw new Error("Unauthorized: You can only edit your own student profile.");
    }

    const index = this.state.students.findIndex((s) => s.id === id);
    if (index === -1) throw new Error("Student record not found.");

    const updated: Profile = {
      ...this.state.students[index],
      phone: updates.phone ?? this.state.students[index].phone,
      bio: updates.bio ?? this.state.students[index].bio,
      skills: updates.skills ?? this.state.students[index].skills,
      resume_url: updates.resume_url ?? this.state.students[index].resume_url,
      linkedin_url: updates.linkedin_url ?? this.state.students[index].linkedin_url,
      github_url: updates.github_url ?? this.state.students[index].github_url,
      updated_at: new Date().toISOString(),
    };

    this.state.students[index] = updated;
    if (this.state.currentUser?.id === id) {
      this.state.currentUser = updated;
      this.save("currentUser" as any);
    }
    this.save("students");

    this.addAudit(
      "UPDATED_STUDENT_PROFILE",
      "student",
      id,
      `Student contact credentials updated for ${updated.full_name} (${updated.roll_number}).`
    );

    if (this.state.isSupabaseConnected && supabase) {
      try {
        await supabase.from("profiles").update({
          phone: updated.phone,
          bio: updated.bio,
          skills: updated.skills,
          resume_url: updated.resume_url,
          linkedin_url: updated.linkedin_url,
          github_url: updated.github_url,
        }).eq("id", id);
      } catch (e) {
        console.warn("Supabase updateStudentProfile sync warning", e);
      }
    }

    this.emit();
    return updated;
  };

  public importStudents = async (newStudents: Partial<Profile>[]): Promise<{ count: number }> => {
    const isStaff = this.state.currentUser?.role === "placement_admin" || this.state.currentUser?.role === "faculty";
    if (!isStaff) {
      throw new Error("Unauthorized: Only placement administrators or faculty can import student records.");
    }

    const createdList: Profile[] = [];
    const createdClearances: StudentClearance[] = [];

    newStudents.forEach((st, idx) => {
      const student: Profile = {
        id: `student-imported-${Date.now()}-${idx}`,
        role: "student",
        roll_number: st.roll_number!.trim().toUpperCase(),
        full_name: st.full_name!.trim(),
        department_id: st.department_id || `dept-${st.department_code?.toLowerCase()}`,
        department_code: st.department_code || "CSE",
        program: st.program || "B.Tech",
        year_of_study: st.year_of_study || 4,
        section: st.section || "A",
        graduation_year: st.graduation_year || 2026,
        university_email: st.university_email || "",
        cgpa: st.cgpa || 7.0,
        backlogs: st.backlogs || 0,
        active: true,
        placement_registered: st.placement_registered ?? true,
        created_at: new Date().toISOString(),
      };

      createdList.push(student);

      this.state.categories.forEach((cat) => {
        createdClearances.push({
          id: `clr-${student.id}-${cat.id}`,
          student_id: student.id,
          category_id: cat.id,
          category_code: cat.code,
          category_name: cat.name,
          mandatory: cat.mandatory,
          status: "pending",
          remarks: "Pending verification following batch import.",
          updated_by_name: cat.approver_role,
          updated_at: new Date().toISOString(),
        });
      });
    });

    this.state.students = [...createdList, ...this.state.students];
    this.state.clearances = [...this.state.clearances, ...createdClearances];

    this.save("students");
    this.save("clearances");

    this.addAudit(
      "IMPORTED_STUDENTS",
      "import",
      `batch-${Date.now()}`,
      `Successfully committed batch import of ${createdList.length} verified student records.`
    );

    this.emit();
    return { count: createdList.length };
  };

  // --- Drive Actions ---
  public createDrive = async (driveData: Partial<RecruitmentDrive>): Promise<RecruitmentDrive> => {
    const isStaff = this.state.currentUser?.role === "placement_admin" || this.state.currentUser?.role === "faculty";
    if (!isStaff) {
      throw new Error("Unauthorized: Only placement administrators or faculty can create recruitment drives.");
    }

    const drive: RecruitmentDrive = {
      id: `drive-${Date.now()}`,
      company_id: driveData.company_id || "comp-custom",
      company_name: driveData.company_name || "Enterprise Partner",
      title: driveData.title || "Campus Recruitment Drive",
      job_role: driveData.job_role || "Associate Engineer",
      description: driveData.description || "Recruitment drive for graduating engineers.",
      eligible_department_ids: driveData.eligible_department_ids || ["dept-cse", "dept-ece", "dept-mech"],
      eligible_department_codes: driveData.eligible_department_codes || ["CSE", "ECE", "MECH"],
      eligible_graduation_years: driveData.eligible_graduation_years || [2026],
      min_cgpa: driveData.min_cgpa ?? 7.0,
      max_active_backlogs: driveData.max_active_backlogs ?? 0,
      skills: driveData.skills || ["Communication", "Problem Solving"],
      registration_deadline: driveData.registration_deadline || new Date(Date.now() + 14 * 86400000).toISOString(),
      stages: driveData.stages || ["Registered", "Eligibility Verified", "Shortlisted", "Interview", "Selected", "Offer Received"],
      location: driveData.location || "Pan-India",
      package_lpa: driveData.package_lpa ?? 8.5,
      tier: driveData.tier || "dream",
      status: driveData.status || "open",
      created_by: this.state.currentUser?.id || "user-admin-1",
      created_at: new Date().toISOString(),
    };

    this.state.drives = [drive, ...this.state.drives];
    this.save("drives");

    this.addAudit(
      "CREATED_DRIVE",
      "drive",
      drive.id,
      `Created recruitment drive for ${drive.company_name} - ${drive.job_role} (${drive.package_lpa} LPA, ${drive.tier}).`
    );

    // Notify eligible students
    this.state.students.forEach((s) => {
      if (drive.eligible_department_codes.includes(s.department_code) && s.cgpa >= drive.min_cgpa) {
        this.sendNotification(
          s.id,
          `New Recruitment Drive: ${drive.company_name}`,
          `${drive.company_name} announced ${drive.job_role} offering ₹${drive.package_lpa} LPA. Check eligibility and apply before deadline.`,
          "info",
          "drives"
        );
      }
    });

    if (this.state.isSupabaseConnected && supabase) {
      try {
        await supabase.from("recruitment_drives").insert([drive]);
      } catch (e) {
        console.warn("Supabase insert drive warning", e);
      }
    }

    this.emit();
    return drive;
  };

  public updateDriveStatus = async (driveId: string, status: RecruitmentDrive["status"]): Promise<void> => {
    const isStaff = this.state.currentUser?.role === "placement_admin" || this.state.currentUser?.role === "faculty";
    if (!isStaff) {
      throw new Error("Unauthorized: Only placement administrators or faculty can modify drive status.");
    }

    const drive = this.state.drives.find((d) => d.id === driveId);
    if (!drive) throw new Error("Drive not found.");

    const old = drive.status;
    drive.status = status;
    drive.updated_at = new Date().toISOString();
    this.save("drives");

    this.addAudit(
      "UPDATED_DRIVE_STATUS",
      "drive",
      driveId,
      `Updated drive status for ${drive.company_name} from '${old}' to '${status}'.`,
      old,
      status
    );

    if (this.state.isSupabaseConnected && supabase) {
      try {
        await supabase.from("recruitment_drives").update({ status, updated_at: drive.updated_at }).eq("id", driveId);
      } catch (e) {
        console.warn("Supabase update drive warning", e);
      }
    }

    this.emit();
  };

  // --- Applications & Offers ---
  public applyForDrive = async (studentId: string, driveId: string): Promise<{ success: boolean; message: string }> => {
    const student = this.state.students.find((s) => s.id === studentId);
    const drive = this.state.drives.find((d) => d.id === driveId);

    if (!student || !drive) {
      return { success: false, message: "Invalid student or drive record." };
    }

    // Role check: Student can only apply for themselves
    if (this.state.currentUser?.role === "student" && this.state.currentUser.id !== studentId) {
      return { success: false, message: "Privacy violation: You can only submit applications for yourself." };
    }

    // Check duplicate application
    const existing = this.state.applications.find((a) => a.student_id === studentId && a.drive_id === driveId);
    if (existing) {
      return { success: false, message: "You have already applied for this recruitment drive." };
    }

    // Policy & Eligibility Evaluation
    const evalResult = evaluateDriveEligibility(student, drive, this.state.offers, this.state.policy);
    if (!evalResult.eligible) {
      return { success: false, message: evalResult.reasons.join(" ") };
    }

    const newApp: Application = {
      id: `app-${Date.now()}`,
      student_id: student.id,
      student_name: student.full_name,
      student_roll: student.roll_number,
      drive_id: drive.id,
      company_name: drive.company_name,
      job_role: drive.job_role,
      package_lpa: drive.package_lpa,
      tier: drive.tier,
      stage: "registered",
      eligibility_note: "Registered. Initial policy criteria verified.",
      applied_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.state.applications = [newApp, ...this.state.applications];
    this.save("applications");

    this.addAudit(
      "APPLIED_DRIVE",
      "application",
      newApp.id,
      `${student.full_name} (${student.roll_number}) submitted application for ${drive.company_name} - ${drive.job_role}.`
    );

    this.sendNotification(
      student.id,
      `Application Submitted: ${drive.company_name}`,
      `Your application for ${drive.job_role} at ${drive.company_name} was submitted successfully. Current stage: Registered.`,
      "success",
      "applications"
    );

    this.emit();
    return { success: true, message: "Application submitted successfully!" };
  };

  public updateApplicationStage = async (
    applicationId: string,
    stage: ApplicationStage,
    note?: string
  ): Promise<void> => {
    const isStaff = this.state.currentUser?.role === "placement_admin" || this.state.currentUser?.role === "faculty";
    if (!isStaff) {
      throw new Error("Unauthorized: Only placement administrators or faculty can transition application stages.");
    }

    const app = this.state.applications.find((a) => a.id === applicationId);
    if (!app) throw new Error("Application not found.");

    const oldStage = app.stage;
    app.stage = stage;
    if (note) app.eligibility_note = note;
    app.updated_at = new Date().toISOString();
    app.outcome_updated_by = this.state.currentUser?.id || "staff";

    this.save("applications");

    this.addAudit(
      "UPDATED_APPLICATION_STAGE",
      "application",
      applicationId,
      `Moved application for ${app.student_name} (${app.company_name}) from '${oldStage}' to '${stage}'.`,
      oldStage,
      stage
    );

    this.sendNotification(
      app.student_id,
      `Application Status Update: ${app.company_name}`,
      `Your application for ${app.job_role} at ${app.company_name} has moved to stage: ${stage.replace("_", " ").toUpperCase()}.${note ? ` Note: ${note}` : ""}`,
      stage === "rejected" ? "alert" : stage === "selected" || stage === "offer_received" ? "success" : "info",
      "applications"
    );

    if (this.state.isSupabaseConnected && supabase) {
      try {
        await supabase.from("applications").update({ stage, updated_at: app.updated_at }).eq("id", applicationId);
      } catch (e) {
        console.warn("Supabase update application warning", e);
      }
    }

    this.emit();
  };

  public issueOffer = async (
    applicationId: string,
    offerData: { offer_reference: string; package_lpa: number; offer_date: string }
  ): Promise<Offer> => {
    const isStaff = this.state.currentUser?.role === "placement_admin" || this.state.currentUser?.role === "faculty";
    if (!isStaff) {
      throw new Error("Unauthorized: Only placement administrators or faculty can record student offers.");
    }

    const app = this.state.applications.find((a) => a.id === applicationId);
    if (!app) throw new Error("Application not found.");

    // Update app stage to offer_received
    app.stage = "offer_received";
    app.updated_at = new Date().toISOString();

    const offer: Offer = {
      id: `off-${Date.now()}`,
      application_id: app.id,
      student_id: app.student_id,
      student_name: app.student_name,
      student_roll: app.student_roll,
      drive_id: app.drive_id,
      company_name: app.company_name,
      job_role: app.job_role,
      offer_reference: offerData.offer_reference,
      package_lpa: offerData.package_lpa,
      currency: "INR",
      tier: app.tier,
      offer_date: offerData.offer_date,
      accepted: true,
      created_at: new Date().toISOString(),
    };

    this.state.offers = [offer, ...this.state.offers];
    this.save("applications");
    this.save("offers");

    this.addAudit(
      "ISSUED_OFFER",
      "offer",
      offer.id,
      `Recorded qualifying placement offer for ${offer.student_name} (${offer.student_roll}) from ${offer.company_name} (₹${offer.package_lpa} LPA, Ref: ${offer.offer_reference}).`
    );

    this.sendNotification(
      offer.student_id,
      `Placement Offer Received: ${offer.company_name}!`,
      `Congratulations! Official offer of ₹${offer.package_lpa} LPA from ${offer.company_name} for role ${offer.job_role} has been recorded.`,
      "success",
      "applications"
    );

    this.emit();
    return offer;
  };

  // --- Interview Actions (Part 8) ---
  public scheduleInterview = async (
    data: Omit<Interview, "id" | "created_at" | "student_acknowledgment" | "outcome">
  ): Promise<Interview> => {
    const isStaff = this.state.currentUser?.role === "placement_admin" || this.state.currentUser?.role === "faculty";
    if (!isStaff) {
      throw new Error("Unauthorized: Only placement administrators or faculty can schedule interviews.");
    }
    const newInterview: Interview = {
      ...data,
      id: `int-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      student_acknowledgment: "pending",
      outcome: "pending",
      created_at: new Date().toISOString(),
    };
    this.state.interviews = [newInterview, ...this.state.interviews];
    this.save("interviews" as any);

    // Notify student
    this.sendNotification(
      newInterview.student_id,
      `Interview Scheduled: ${newInterview.company_name}`,
      `Your ${newInterview.round_name} is scheduled on ${newInterview.scheduled_date} at ${newInterview.scheduled_time} (${newInterview.mode.toUpperCase()}). Please acknowledge attendance.`,
      "info",
      "interviews"
    );

    this.addAudit(
      "SCHEDULED_INTERVIEW",
      "drive",
      newInterview.drive_id,
      `Scheduled ${newInterview.round_name} for ${newInterview.student_name} (${newInterview.student_roll}) at ${newInterview.company_name}.`
    );

    if (this.state.isSupabaseConnected && supabase) {
      try {
        await supabase.from("interviews").insert([newInterview]);
      } catch (e) {
        console.warn("Supabase insert interview warning", e);
      }
    }

    this.emit();
    return newInterview;
  };

  public updateInterviewOutcome = async (
    interviewId: string,
    outcome: InterviewOutcome,
    feedback?: string,
    score?: number
  ): Promise<void> => {
    const isStaff = this.state.currentUser?.role === "placement_admin" || this.state.currentUser?.role === "faculty";
    if (!isStaff) {
      throw new Error("Unauthorized: Only placement administrators or faculty can update interview outcomes.");
    }
    const idx = this.state.interviews.findIndex((i) => i.id === interviewId);
    if (idx === -1) throw new Error("Interview not found.");

    const current = this.state.interviews[idx];
    const oldOutcome = current.outcome;
    const updated: Interview = {
      ...current,
      outcome,
      feedback: feedback !== undefined ? feedback : current.feedback,
      score: score !== undefined ? score : current.score,
      updated_at: new Date().toISOString(),
    };
    const newInterviews = [...this.state.interviews];
    newInterviews[idx] = updated;
    this.state.interviews = newInterviews;
    this.save("interviews" as any);

    // Notify student
    const notifType = outcome === "cleared" ? "success" : outcome === "rejected" ? "alert" : "info";
    this.sendNotification(
      current.student_id,
      `Interview Result: ${current.company_name}`,
      `Your ${current.round_name} outcome is recorded: ${outcome.toUpperCase()}${score ? ` (Score: ${score}/100)` : ""}.`,
      notifType,
      "interviews"
    );

    this.addAudit(
      "UPDATED_INTERVIEW_OUTCOME",
      "drive",
      current.drive_id,
      `Updated interview outcome for ${current.student_name} (${current.round_name}) to ${outcome}.`,
      oldOutcome,
      outcome
    );

    if (this.state.isSupabaseConnected && supabase) {
      try {
        await supabase.from("interviews").update({ outcome, feedback, score, updated_at: updated.updated_at }).eq("id", interviewId);
      } catch (e) {
        console.warn("Supabase update interview warning", e);
      }
    }

    this.emit();
  };

  public acknowledgeInterview = async (interviewId: string): Promise<void> => {
    const idx = this.state.interviews.findIndex((i) => i.id === interviewId);
    if (idx === -1) throw new Error("Interview not found.");

    const current = this.state.interviews[idx];
    const updated: Interview = {
      ...current,
      student_acknowledgment: "acknowledged",
      updated_at: new Date().toISOString(),
    };
    const newInterviews = [...this.state.interviews];
    newInterviews[idx] = updated;
    this.state.interviews = newInterviews;
    this.save("interviews" as any);

    this.addAudit(
      "ACKNOWLEDGED_INTERVIEW",
      "drive",
      current.drive_id,
      `Student ${current.student_name} confirmed attendance for ${current.round_name} at ${current.company_name}.`
    );

    this.emit();
  };

  public requestInterviewReschedule = async (interviewId: string, reason: string): Promise<void> => {
    const idx = this.state.interviews.findIndex((i) => i.id === interviewId);
    if (idx === -1) throw new Error("Interview not found.");

    const current = this.state.interviews[idx];
    const updated: Interview = {
      ...current,
      student_acknowledgment: "reschedule_requested",
      reschedule_reason: reason,
      outcome: "rescheduled",
      updated_at: new Date().toISOString(),
    };
    const newInterviews = [...this.state.interviews];
    newInterviews[idx] = updated;
    this.state.interviews = newInterviews;
    this.save("interviews" as any);

    // Notify placement cell
    this.sendNotification(
      "user-admin-1",
      `Reschedule Requested: ${current.student_name}`,
      `Student ${current.student_name} (${current.student_roll}) requested reschedule for ${current.company_name} - Reason: ${reason}`,
      "warning",
      "interviews"
    );

    this.addAudit(
      "REQUESTED_RESCHEDULE",
      "drive",
      current.drive_id,
      `Student ${current.student_name} requested reschedule for ${current.round_name}. Reason: ${reason}`
    );

    this.emit();
  };

  // --- College ID Verification Actions (Part 2) ---
  public submitVerificationRequest = async (
    req: Omit<CollegeIdVerificationRequest, "id" | "status" | "submitted_at">
  ): Promise<CollegeIdVerificationRequest> => {
    const newReq: CollegeIdVerificationRequest = {
      ...req,
      id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      status: "pending",
      submitted_at: new Date().toISOString(),
    };
    this.state.verificationRequests = [newReq, ...this.state.verificationRequests];
    this.save("verificationRequests" as any);

    this.sendNotification(
      "user-admin-1",
      `New ID Verification: ${newReq.full_name}`,
      `New ${newReq.type.toUpperCase()} registration submitted by ${newReq.full_name} (${newReq.roll_or_emp_id}) awaiting identity approval.`,
      "info",
      "verifications"
    );

    this.addAudit(
      "SUBMITTED_ID_VERIFICATION",
      "student",
      newReq.id,
      `Submitted identity verification registration for ${newReq.full_name} (${newReq.type}).`
    );

    this.emit();
    return newReq;
  };

  public reviewVerificationRequest = async (
    requestId: string,
    status: VerificationStatus,
    remarks?: string
  ): Promise<void> => {
    const isStaff = this.state.currentUser?.role === "placement_admin" || this.state.currentUser?.role === "faculty";
    if (!isStaff) {
      throw new Error("Unauthorized: Only administrators or faculty can review college ID verifications.");
    }
    const idx = this.state.verificationRequests.findIndex((r) => r.id === requestId);
    if (idx === -1) throw new Error("Verification request not found.");

    const current = this.state.verificationRequests[idx];
    const reviewer = this.state.currentUser || facultyProfile;
    const updated: CollegeIdVerificationRequest = {
      ...current,
      status,
      reviewer_remarks: remarks,
      reviewed_by: reviewer.id,
      reviewer_name: reviewer.full_name,
      reviewed_at: new Date().toISOString(),
    };
    const nextRequests = [...this.state.verificationRequests];
    nextRequests[idx] = updated;
    this.state.verificationRequests = nextRequests;
    this.save("verificationRequests" as any);

    // If approved and student, create profile if absent
    if (status === "approved" && current.type === "student") {
      const existing = this.state.students.find((s) => s.roll_number.toLowerCase() === current.roll_or_emp_id.toLowerCase());
      if (!existing) {
        const studentProfile: Profile = {
          id: current.user_id || `student-${Date.now()}`,
          role: "student",
          roll_number: current.roll_or_emp_id,
          full_name: current.full_name,
          department_id: `dept-${current.department_code.toLowerCase()}`,
          department_code: current.department_code,
          program: current.program || "B.Tech",
          year_of_study: current.year_of_study || 4,
          section: "A",
          graduation_year: 2026,
          university_email: current.university_email,
          cgpa: current.cgpa || 7.5,
          backlogs: 0,
          active: true,
          placement_registered: true,
          created_at: new Date().toISOString(),
        };
        this.state.students = [studentProfile, ...this.state.students];
        this.save("students");

        const newClearances: StudentClearance[] = this.state.categories.map((cat) => ({
          id: `clr-${studentProfile.id}-${cat.id}`,
          student_id: studentProfile.id,
          category_id: cat.id,
          category_code: cat.code,
          category_name: cat.name,
          mandatory: cat.mandatory,
          status: "pending",
          updated_at: new Date().toISOString(),
        }));
        this.state.clearances = [...this.state.clearances, ...newClearances];
        this.save("clearances");
      }
    }

    this.sendNotification(
      current.user_id,
      `ID Verification ${status === "approved" ? "Approved" : "Rejected"}`,
      status === "approved"
        ? `Your College Identity has been approved by ${reviewer.full_name}. You now have full access to CampusBridge.`
        : `Your College Identity was rejected. Reason: ${remarks || "Requirements not met."}`,
      status === "approved" ? "success" : "alert",
      "overview"
    );

    this.addAudit(
      "REVIEWED_ID_VERIFICATION",
      "student",
      current.id,
      `Marked identity verification for ${current.full_name} (${current.roll_or_emp_id}) as ${status.toUpperCase()}. Remarks: ${remarks || "None"}`,
      current.status,
      status
    );

    this.emit();
  };

  // --- External Dues Actions (Part 10) ---
  public updateExternalDuesConfig = async (config: Partial<ExternalDuesConfig>): Promise<void> => {
    if (this.state.currentUser?.role !== "placement_admin") {
      throw new Error("Unauthorized: Only placement administrators can configure external dues portal.");
    }
    this.state.externalDuesConfig = {
      ...this.state.externalDuesConfig,
      ...config,
      last_updated_at: new Date().toISOString(),
    };
    this.save("externalDuesConfig" as any);
    this.addAudit(
      "UPDATED_SETTINGS",
      "policy",
      "dues-config",
      `Updated External College Fee/Dues Portal settings. Portal: ${this.state.externalDuesConfig.portal_name}`
    );
    this.emit();
  };

  public submitPaymentReceipt = async (
    receipt: Omit<ExternalPaymentReceipt, "id" | "status" | "submitted_at">
  ): Promise<ExternalPaymentReceipt> => {
    const newReceipt: ExternalPaymentReceipt = {
      ...receipt,
      id: `rcpt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      status: "submitted",
      submitted_at: new Date().toISOString(),
    };
    this.state.paymentReceipts = [newReceipt, ...this.state.paymentReceipts];
    this.save("paymentReceipts" as any);

    this.sendNotification(
      "user-admin-1",
      `Fee Receipt Submitted: ${newReceipt.student_name}`,
      `Student ${newReceipt.student_name} (${newReceipt.student_roll}) submitted receipt for ${newReceipt.category_name} (Ref: ${newReceipt.transaction_ref}, ₹${newReceipt.amount_paid}).`,
      "info",
      "nodues"
    );

    this.addAudit(
      "SUBMITTED_PAYMENT_RECEIPT",
      "clearance",
      newReceipt.id,
      `Submitted payment receipt reference ${newReceipt.transaction_ref} (₹${newReceipt.amount_paid}) for ${newReceipt.category_name}.`
    );

    this.emit();
    return newReceipt;
  };

  public reviewPaymentReceipt = async (
    receiptId: string,
    status: "verified" | "rejected",
    remarks?: string
  ): Promise<void> => {
    const isStaff = this.state.currentUser?.role === "placement_admin" || this.state.currentUser?.role === "faculty";
    if (!isStaff) {
      throw new Error("Unauthorized: Only authorized officers or faculty can review payment receipts.");
    }
    const idx = this.state.paymentReceipts.findIndex((r) => r.id === receiptId);
    if (idx === -1) throw new Error("Payment receipt not found.");

    const current = this.state.paymentReceipts[idx];
    const reviewer = this.state.currentUser || facultyProfile;
    const updated: ExternalPaymentReceipt = {
      ...current,
      status,
      faculty_remarks: remarks,
      verified_by: reviewer.full_name,
      verified_at: new Date().toISOString(),
    };
    const nextList = [...this.state.paymentReceipts];
    nextList[idx] = updated;
    this.state.paymentReceipts = nextList;
    this.save("paymentReceipts" as any);

    // If verified, automatically update corresponding clearance to "cleared"!
    if (status === "verified") {
      const clearance = this.state.clearances.find(
        (c) => c.student_id === current.student_id && c.category_id === current.category_id
      );
      if (clearance) {
        await this.updateClearanceStatus(
          clearance.id,
          "cleared",
          `Payment verified via External Portal Reference: ${current.transaction_ref} (₹${current.amount_paid})`
        );
      }
    }

    this.sendNotification(
      current.student_id,
      `Payment Receipt ${status === "verified" ? "Verified & Cleared" : "Rejected"}`,
      status === "verified"
        ? `Your payment reference ${current.transaction_ref} for ${current.category_name} has been verified and your dues are cleared!`
        : `Your payment reference ${current.transaction_ref} was rejected. Reason: ${remarks || "Invalid reference"}.`,
      status === "verified" ? "success" : "alert",
      "nodues"
    );

    this.addAudit(
      "REVIEWED_PAYMENT_RECEIPT",
      "clearance",
      current.id,
      `Reviewed payment receipt ${current.transaction_ref} for ${current.student_name}: marked ${status.toUpperCase()}.`
    );

    if (this.state.isSupabaseConnected && supabase) {
      try {
        await supabase.from("external_payment_receipts").update({
          status,
          faculty_remarks: remarks,
          verified_by: reviewer.full_name,
          verified_at: updated.verified_at,
        }).eq("id", receiptId);
      } catch (e) {
        console.warn("Supabase update payment receipt warning", e);
      }
    }

    this.emit();
  };

  // --- No-Dues Clearance Actions ---
  public updateClearanceStatus = async (
    clearanceId: string,
    status: ClearanceStatus,
    remarks?: string,
    pendingRequirement?: string
  ): Promise<void> => {
    const isStaff = this.state.currentUser?.role === "placement_admin" || this.state.currentUser?.role === "faculty";
    if (!isStaff) {
      throw new Error("Unauthorized: Students cannot approve or modify their own clearance records.");
    }

    const clr = this.state.clearances.find((c) => c.id === clearanceId);
    if (!clr) throw new Error("Clearance record not found.");

    const oldStatus = clr.status;
    clr.status = status;
    if (remarks !== undefined) clr.remarks = remarks;
    if (pendingRequirement !== undefined) clr.pending_requirement = pendingRequirement;
    clr.updated_by = this.state.currentUser?.id || "admin";
    clr.updated_by_name = this.state.currentUser?.full_name || "Administrator";
    clr.updated_at = new Date().toISOString();

    this.save("clearances");

    this.addAudit(
      "UPDATED_CLEARANCE",
      "clearance",
      clearanceId,
      `Updated ${clr.category_name} clearance for student ID ${clr.student_id} to '${status}'. Remarks: ${remarks || "None"}`,
      oldStatus,
      status
    );

    this.sendNotification(
      clr.student_id,
      `Clearance Update: ${clr.category_name}`,
      `Your ${clr.category_name} clearance is now: ${status.replace("_", " ").toUpperCase()}.${status === "rejected" ? ` Requirement: ${pendingRequirement || remarks}` : ""}`,
      status === "cleared" ? "success" : status === "rejected" ? "alert" : "info",
      "nodues"
    );

    this.emit();
  };

  // --- Certificates ---
  public generateCertificate = async (
    studentId: string
  ): Promise<{ success: boolean; certificate?: Certificate; error?: string }> => {
    const student = this.state.students.find((s) => s.id === studentId);
    if (!student) return { success: false, error: "Student not found." };

    // Check student privacy
    if (this.state.currentUser?.role === "student" && this.state.currentUser.id !== studentId) {
      return { success: false, error: "Privacy violation: Cannot generate certificates for other students." };
    }

    const studentClearances = this.state.clearances.filter((c) => c.student_id === studentId);
    const result = issueCertificateForStudent(
      student,
      studentClearances,
      this.state.currentUser?.full_name || facultyProfile.full_name,
      this.state.currentUser?.id || facultyProfile.id
    );

    if (!result.certificate) {
      return { success: false, error: result.error };
    }

    // Check if certificate already exists
    const existingIndex = this.state.certificates.findIndex((c) => c.student_id === studentId && c.is_valid);
    if (existingIndex >= 0) {
      return { success: true, certificate: this.state.certificates[existingIndex] };
    }

    this.state.certificates = [result.certificate, ...this.state.certificates];
    this.save("certificates");

    this.addAudit(
      "GENERATED_CERTIFICATE",
      "certificate",
      result.certificate.id,
      `Generated official verifiable No-Dues Certificate for ${student.full_name} (${student.roll_number}). Token: ${result.certificate.verification_token}`
    );

    this.sendNotification(
      student.id,
      "Official No-Dues Certificate Issued",
      `Your cryptographically verifiable No-Dues Certificate has been generated! ID: ${result.certificate.verification_token}`,
      "success",
      "nodues"
    );

    this.emit();
    return { success: true, certificate: result.certificate };
  };

  public revokeCertificate = async (certificateId: string, reason: string): Promise<void> => {
    const isStaff = this.state.currentUser?.role === "placement_admin" || this.state.currentUser?.role === "faculty";
    if (!isStaff) {
      throw new Error("Unauthorized: Only authorized officers or faculty can revoke issued certificates.");
    }

    const cert = this.state.certificates.find((c) => c.id === certificateId);
    if (!cert) throw new Error("Certificate not found.");

    cert.is_valid = false;
    cert.revoked_at = new Date().toISOString();
    cert.revocation_reason = reason;

    this.save("certificates");

    this.addAudit(
      "REVOKED_CERTIFICATE",
      "certificate",
      certificateId,
      `Revoked No-Dues Certificate ${cert.verification_token} for ${cert.student_name}. Reason: ${reason}`
    );

    this.sendNotification(
      cert.student_id,
      "Certificate Revoked by Administration",
      `Your No-Dues Certificate (${cert.verification_token}) was revoked: ${reason}. Please contact the department.`,
      "alert",
      "nodues"
    );

    this.emit();
  };

  // --- Policy Settings ---
  public updatePolicy = async (newPolicy: Partial<PlacementPolicy>): Promise<void> => {
    if (this.state.currentUser?.role !== "placement_admin") {
      throw new Error("Unauthorized: Only placement administrators can configure institutional placement policy.");
    }

    this.state.policy = { ...this.state.policy, ...newPolicy };
    this.save("policy");

    this.addAudit(
      "UPDATED_POLICY",
      "policy",
      "institutional_policy",
      `Updated institutional placement policy: Dream threshold ₹${this.state.policy.dream_min_lpa} LPA, Super Dream threshold ₹${this.state.policy.super_dream_min_lpa} LPA.`
    );

    this.emit();
  };

  // --- Notifications ---
  public markNotificationAsRead = (notificationId: string) => {
    const notif = this.state.notifications.find((n) => n.id === notificationId);
    if (notif) {
      notif.read = true;
      this.save("notifications");
      this.emit();
    }
  };

  public markAllNotificationsAsRead = () => {
    const uid = this.state.currentUser?.id;
    this.state.notifications.forEach((n) => {
      if (!uid || n.user_id === uid) {
        n.read = true;
      }
    });
    this.save("notifications");
    this.emit();
  };

  // --- Reset to Demo Data ---
  public resetToDemoData = () => {
    localStorage.clear();
    this.state = {
      currentUser: null,
      departments: initialDepartments,
      categories: initialCategories,
      policy: initialPolicy,
      companies: initialCompanies,
      drives: initialDrives,
      students: initialStudents,
      applications: initialApplications,
      offers: initialOffers,
      clearances: initialClearances,
      certificates: initialCertificates,
      auditLogs: initialAuditLogs,
      notifications: initialNotifications,
      interviews: initialInterviews,
      verificationRequests: initialVerificationRequests,
      externalDuesConfig: initialExternalDuesConfig,
      paymentReceipts: initialPaymentReceipts,
      theme: "light",
      isSupabaseConnected: false,
      backendStatusMessage: "Demo Mode - Local Storage",
    };
    this.applyTheme("light");
    this.emit();
  };
}

export const store = new StoreManager();

/**
 * Custom React hook for accessing the reactive store
 */
export function useStore(): AppStore {
  const [, setVersion] = useState(0);

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setVersion((v) => v + 1);
    });
    return unsubscribe;
  }, []);

  return {
    ...store.state,
    loginAs: store.loginAs,
    logout: store.logout,
    toggleTheme: store.toggleTheme,
    checkSupabaseHealth: store.checkSupabaseHealth,
    addStudent: store.addStudent,
    updateStudent: store.updateStudent,
    updateStudentProfile: store.updateStudentProfile,
    importStudents: store.importStudents,
    createDrive: store.createDrive,
    updateDriveStatus: store.updateDriveStatus,
    applyForDrive: store.applyForDrive,
    updateApplicationStage: store.updateApplicationStage,
    issueOffer: store.issueOffer,
    scheduleInterview: store.scheduleInterview,
    updateInterviewOutcome: store.updateInterviewOutcome,
    acknowledgeInterview: store.acknowledgeInterview,
    requestInterviewReschedule: store.requestInterviewReschedule,
    submitVerificationRequest: store.submitVerificationRequest,
    reviewVerificationRequest: store.reviewVerificationRequest,
    updateExternalDuesConfig: store.updateExternalDuesConfig,
    submitPaymentReceipt: store.submitPaymentReceipt,
    reviewPaymentReceipt: store.reviewPaymentReceipt,
    updateClearanceStatus: store.updateClearanceStatus,
    generateCertificate: store.generateCertificate,
    revokeCertificate: store.revokeCertificate,
    updatePolicy: store.updatePolicy,
    markNotificationAsRead: store.markNotificationAsRead,
    markAllNotificationsAsRead: store.markAllNotificationsAsRead,
    resetToDemoData: store.resetToDemoData,
  };
}
