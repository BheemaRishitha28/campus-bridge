export type AppRole = "placement_admin" | "faculty" | "student";

export type DriveStatus = "planned" | "open" | "in_progress" | "completed" | "cancelled";

export type ApplicationStage =
  | "registered"
  | "eligibility_verified"
  | "shortlisted"
  | "assessment_completed"
  | "interview_in_progress"
  | "selected"
  | "offer_received"
  | "joined"
  | "rejected"
  | "withdrawn";

export type ClearanceStatus = "pending" | "cleared" | "not_applicable" | "rejected";

export type DriveTier = "regular" | "dream" | "super_dream";

export interface Department {
  id: string;
  code: string;
  name: string;
  created_at?: string;
}

export interface Profile {
  id: string;
  role: AppRole;
  roll_number: string;
  full_name: string;
  department_id: string;
  department_code: string;
  program: string;
  year_of_study: number;
  section: string;
  graduation_year: number;
  university_email: string;
  cgpa: number;
  backlogs: number;
  active: boolean;
  placement_registered: boolean;
  phone?: string;
  bio?: string;
  skills?: string[];
  resume_url?: string;
  linkedin_url?: string;
  github_url?: string;
  assigned_department_code?: string;
  assigned_category_id?: string;
  created_at: string;
  updated_at?: string;
}

export interface Company {
  id: string;
  name: string;
  website?: string;
  industry?: string;
  location?: string;
  created_at?: string;
}

export interface RecruitmentDrive {
  id: string;
  company_id: string;
  company_name: string;
  title: string;
  job_role: string;
  description: string;
  eligible_department_ids: string[];
  eligible_department_codes: string[];
  eligible_graduation_years: number[];
  min_cgpa: number;
  max_active_backlogs: number;
  skills: string[];
  registration_deadline: string;
  stages: string[];
  location: string;
  package_lpa: number;
  tier: DriveTier;
  status: DriveStatus;
  created_by?: string;
  created_at: string;
  updated_at?: string;
}

export interface Application {
  id: string;
  student_id: string;
  student_name: string;
  student_roll: string;
  drive_id: string;
  company_name: string;
  job_role: string;
  package_lpa: number;
  tier: DriveTier;
  stage: ApplicationStage;
  eligibility_note?: string;
  applied_at: string;
  updated_at: string;
  outcome_updated_by?: string;
}

export interface Offer {
  id: string;
  application_id: string;
  student_id: string;
  student_name: string;
  student_roll: string;
  drive_id: string;
  company_name: string;
  job_role: string;
  offer_reference: string;
  package_lpa: number;
  currency: string;
  tier: DriveTier;
  offer_date: string;
  accepted?: boolean;
  joined_at?: string;
  created_at: string;
}

export interface ClearanceCategory {
  id: string;
  code: string;
  name: string;
  mandatory: boolean;
  active: boolean;
  sort_order: number;
  approver_role?: string;
  created_at?: string;
}

export interface StudentClearance {
  id: string;
  student_id: string;
  category_id: string;
  category_code: string;
  category_name: string;
  mandatory: boolean;
  status: ClearanceStatus;
  remarks?: string;
  pending_requirement?: string;
  updated_by?: string;
  updated_by_name?: string;
  updated_at: string;
}

export interface Certificate {
  id: string;
  student_id: string;
  student_name: string;
  student_roll: string;
  department_name: string;
  graduation_year: number;
  cgpa: number;
  verification_token: string;
  issued_by: string;
  issued_by_name: string;
  issued_at: string;
  revoked_at?: string | null;
  revocation_reason?: string | null;
  is_valid: boolean;
  snapshot: Record<string, unknown>;
}

export interface AuditLog {
  id: string;
  actor_id: string;
  actor_name: string;
  actor_role: AppRole;
  action: string;
  target_type: "student" | "drive" | "application" | "offer" | "clearance" | "certificate" | "import" | "policy";
  target_id: string;
  old_value?: string;
  new_value?: string;
  details: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "alert";
  read: boolean;
  link?: string;
  created_at: string;
}

export interface PlacementPolicy {
  regular_max_lpa: number;
  dream_min_lpa: number;
  dream_max_lpa: number;
  super_dream_min_lpa: number;
  allow_dream_after_regular: boolean;
  allow_super_dream_after_dream: boolean;
  max_offers_allowed: number;
  strict_backlog_check: boolean;
}

export interface ImportRowError {
  row_number: number;
  roll_number?: string;
  error_code: string;
  message: string;
}

export interface ImportSummary {
  batch_id: string;
  file_name: string;
  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
  duplicate_rows: number;
  errors: ImportRowError[];
  preview_data: Partial<Profile>[];
}

export interface DashboardMetric {
  label: string;
  value: string | number;
  helper?: string;
  delta?: string;
  up?: boolean;
  tone?: "blue" | "green" | "violet" | "amber" | "rose";
}

export interface FunnelStageMetric {
  stage: ApplicationStage;
  label: string;
  count: number;
  percentage: number;
}

export interface AtRiskStudent {
  student: Profile;
  pending_mandatory_count: number;
  rejected_mandatory_count: number;
  reasons: string[];
  applied_count: number;
  has_offer: boolean;
}

// ----------------------------------------------------
// Interview Management (Part 8)
// ----------------------------------------------------
export type InterviewMode = "online" | "offline";
export type InterviewOutcome = "pending" | "cleared" | "rejected" | "absent" | "rescheduled";
export type InterviewAcknowledgment = "pending" | "acknowledged" | "reschedule_requested";

export interface Interview {
  id: string;
  application_id: string;
  drive_id: string;
  company_name: string;
  job_role: string;
  student_id: string;
  student_name: string;
  student_roll: string;
  round_number: number;
  round_name: string; // e.g. "Round 1: DSA & Core CS", "Round 2: System Architecture", "Round 3: Leadership & Cultural Fit"
  scheduled_date: string; // YYYY-MM-DD
  scheduled_time: string; // HH:MM
  duration_minutes: number;
  mode: InterviewMode;
  meet_link?: string;
  venue?: string;
  interviewer_name?: string;
  instructions?: string;
  student_acknowledgment: InterviewAcknowledgment;
  reschedule_reason?: string;
  outcome: InterviewOutcome;
  feedback?: string;
  score?: number;
  created_at: string;
  updated_at?: string;
}

// ----------------------------------------------------
// College Identity Verification & Registration (Part 2)
// ----------------------------------------------------
export type VerificationStatus = "pending" | "approved" | "rejected";
export type VerificationType = "student" | "faculty";

export interface CollegeIdVerificationRequest {
  id: string;
  user_id: string;
  type: VerificationType;
  full_name: string;
  university_email: string;
  roll_or_emp_id: string;
  department_code: string;
  program?: string;
  year_of_study?: number;
  cgpa?: number;
  id_card_url?: string;
  status: VerificationStatus;
  reviewed_by?: string;
  reviewer_name?: string;
  reviewer_remarks?: string;
  submitted_at: string;
  reviewed_at?: string;
}

// ----------------------------------------------------
// External College Dues Portal (Part 10)
// ----------------------------------------------------
export interface ExternalDuesConfig {
  enabled: boolean;
  portal_name: string;
  portal_url: string;
  instructions: string;
  support_email: string;
  last_updated_at?: string;
}

export interface ExternalPaymentReceipt {
  id: string;
  student_id: string;
  student_name: string;
  student_roll: string;
  category_id: string;
  category_name: string;
  transaction_ref: string;
  amount_paid: number;
  payment_date: string;
  receipt_filename?: string;
  receipt_preview_url?: string;
  status: "submitted" | "verified" | "rejected";
  faculty_remarks?: string;
  verified_by?: string;
  submitted_at: string;
  verified_at?: string;
}

