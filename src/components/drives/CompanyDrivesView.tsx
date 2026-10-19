import React, { useState } from "react";
import {
  BriefcaseBusiness,
  Building2,
  Calendar,
  Clock,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  Users,
  Award,
  ChevronRight,
  ArrowRight,
  X,
  AlertCircle,
  Layers,
} from "lucide-react";
import { useStore } from "../../lib/store";
import { RecruitmentDrive, Application, ApplicationStage, DriveTier, DriveStatus } from "../../types/domain";
import { evaluateDriveEligibility } from "../../lib/policyEngine";

interface CompanyDrivesViewProps {
  isCreateOpen?: boolean;
  onCloseCreate?: () => void;
}

export const CompanyDrivesView: React.FC<CompanyDrivesViewProps> = ({
  isCreateOpen = false,
  onCloseCreate,
}) => {
  const {
    drives,
    applications,
    offers,
    currentUser,
    policy,
    createDrive,
    updateDriveStatus,
    updateApplicationStage,
    issueOffer,
    applyForDrive,
  } = useStore();

  const [search, setSearch] = useState("");
  const [filterTier, setFilterTier] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");

  // Selected Drive for viewing applicants / details
  const [selectedDrive, setSelectedDrive] = useState<RecruitmentDrive | null>(null);

  // Create Drive Modal
  const [showCreateModal, setShowCreateModal] = useState(isCreateOpen);
  const [driveForm, setDriveForm] = useState({
    company_name: "",
    job_role: "",
    title: "",
    description: "",
    package_lpa: 9.5,
    tier: "dream" as DriveTier,
    min_cgpa: 7.0,
    max_active_backlogs: 0,
    eligible_department_codes: ["CSE", "ECE"],
    eligible_graduation_years: [2026],
    registration_deadline: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
    location: "Bengaluru, India",
    status: "open" as DriveStatus,
  });
  const [createError, setCreateError] = useState<string | null>(null);

  // Issue Offer Modal
  const [offerApp, setOfferApp] = useState<Application | null>(null);
  const [offerForm, setOfferForm] = useState({
    package_lpa: 10.0,
    offer_reference: "",
    offer_date: new Date().toISOString().split("T")[0],
  });

  const isStaff = currentUser?.role === "placement_admin" || currentUser?.role === "faculty";
  const [applyLoading, setApplyLoading] = useState<string | null>(null);
  const [applyToast, setApplyToast] = useState<{ message: string; success: boolean } | null>(null);

  React.useEffect(() => {
    setShowCreateModal(isCreateOpen);
  }, [isCreateOpen]);

  const filteredDrives = drives.filter((d) => {
    const matchesSearch =
      d.company_name.toLowerCase().includes(search.toLowerCase()) ||
      d.job_role.toLowerCase().includes(search.toLowerCase()) ||
      d.location.toLowerCase().includes(search.toLowerCase());

    const matchesTier = filterTier === "ALL" || d.tier === filterTier;
    const matchesStatus = filterStatus === "ALL" || d.status === filterStatus;

    return matchesSearch && matchesTier && matchesStatus;
  });

  // Applicants for selected drive
  const driveApplications = selectedDrive
    ? applications.filter((a) => a.drive_id === selectedDrive.id)
    : [];

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    if (!driveForm.company_name || !driveForm.job_role) {
      setCreateError("Company name and Job role are required.");
      return;
    }

    try {
      await createDrive({
        ...driveForm,
        eligible_department_ids: driveForm.eligible_department_codes.map((c) => `dept-${c.toLowerCase()}`),
        stages: ["Registered", "Eligibility Verified", "Shortlisted", "Assessment Completed", "Interview in Progress", "Selected", "Offer Received"],
      });
      setShowCreateModal(false);
      if (onCloseCreate) onCloseCreate();
    } catch (err: any) {
      setCreateError(err?.message || "Failed to create recruitment drive.");
    }
  };

  const handleIssueOfferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerApp) return;
    try {
      await issueOffer(offerApp.id, {
        package_lpa: offerForm.package_lpa,
        offer_reference: offerForm.offer_reference || `OFF-${Date.now().toString().slice(-6)}`,
        offer_date: offerForm.offer_date,
      });
      setOfferApp(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#14213D] dark:text-white">
            Company Drives & Recruitment
          </h1>
          <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
            Manage corporate recruitment, multi-tier compensation packages, and applicant pipelines
          </p>
        </div>

        {isStaff && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-[#4F46E5] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition"
          >
            <Plus size={15} /> Create Company Drive
          </button>
        )}
      </div>

      {applyToast && (
        <div
          className={`flex items-center justify-between rounded-2xl p-4 text-xs font-bold shadow-sm ${
            applyToast.success
              ? "bg-[#D9EEE4] text-[#065F46] border border-emerald-300"
              : "bg-[#F7DCE8] text-[#9F1239] border border-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {applyToast.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{applyToast.message}</span>
          </div>
          <button onClick={() => setApplyToast(null)} className="opacity-70 hover:opacity-100">
            <X size={15} />
          </button>
        </div>
      )}

      {/* Filters and Search */}
      <div className="rounded-3xl border border-[#E5E7EB] bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#14213D]">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search companies, job roles, locations..."
              className="w-full rounded-xl border border-[#E5E7EB] bg-[#F5F3FF]/60 py-2 pl-9 pr-3 text-[#172033] outline-none focus:border-[#4F46E5] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
            className="rounded-xl border border-[#E5E7EB] bg-[#F5F3FF]/60 py-2 px-3 font-semibold text-[#172033] outline-none focus:border-[#4F46E5] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="ALL">All Compensation Tiers</option>
            <option value="regular">Regular Tier (&lt; 8 LPA)</option>
            <option value="dream">Dream Tier (8 - 14.99 LPA)</option>
            <option value="super_dream">Super Dream Tier (&gt;= 15 LPA)</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-xl border border-[#E5E7EB] bg-[#F5F3FF]/60 py-2 px-3 font-semibold text-[#172033] outline-none focus:border-[#4F46E5] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="ALL">All Drive Statuses</option>
            <option value="open">Open (Accepting Applications)</option>
            <option value="in_progress">In Progress (Interviews Underway)</option>
            <option value="planned">Planned (Upcoming)</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Drives Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDrives.map((drive) => {
          const appCount = applications.filter((a) => a.drive_id === drive.id).length;
          const offerCount = offers.filter((o) => o.drive_id === drive.id).length;

          return (
            <div
              key={drive.id}
              className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#14213D] flex flex-col justify-between text-xs"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-extrabold text-base text-[#14213D] dark:text-white">{drive.company_name}</h3>
                    <p className="font-bold text-[#4F46E5] dark:text-indigo-400 mt-0.5">{drive.job_role}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider shrink-0 ${
                      drive.tier === "super_dream"
                        ? "bg-[#DCD5FA] text-[#3730A3]"
                        : drive.tier === "dream"
                        ? "bg-[#D8EAFB] text-[#14213D]"
                        : "bg-[#F5F3FF] text-[#64748B]"
                    }`}
                  >
                    {drive.tier.replace("_", " ")}
                  </span>
                </div>

                <p className="mt-2 text-[#64748B] dark:text-slate-400 text-[11px] line-clamp-2 leading-relaxed">
                  {drive.description}
                </p>

                {/* Criteria Box */}
                <div className="mt-4 rounded-2xl bg-[#F5F3FF]/70 border border-[#E5E7EB] dark:bg-slate-800/40 dark:border-slate-800 p-3.5 space-y-1.5 text-[11px] text-[#172033] dark:text-slate-200">
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Package</span>
                    <span className="font-black text-[#14213D] dark:text-white">₹{drive.package_lpa} LPA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Eligible Depts</span>
                    <span className="font-semibold">{drive.eligible_department_codes.join(", ")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Min CGPA</span>
                    <span className="font-semibold">{drive.min_cgpa.toFixed(2)} (Backlogs: ≤{drive.max_active_backlogs})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Deadline</span>
                    <span className="font-semibold">{new Date(drive.registration_deadline).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Status and Applicant Counter */}
                <div className="mt-4 flex items-center justify-between text-[11px]">
                  <span
                    className={`rounded-full px-2.5 py-0.5 font-extrabold uppercase text-[9px] ${
                      drive.status === "open"
                        ? "bg-[#D9EEE4] text-[#065F46]"
                        : drive.status === "in_progress"
                        ? "bg-[#D8EAFB] text-[#14213D]"
                        : "bg-[#F5F3FF] text-[#64748B]"
                    }`}
                  >
                    {drive.status.replace("_", " ")}
                  </span>
                  <span className="text-[#64748B]">
                    <strong className="text-[#14213D] dark:text-white">{appCount}</strong> applicants · <strong className="text-[#065F46]">{offerCount}</strong> offers
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-[#E5E7EB] dark:border-slate-800 flex items-center justify-between">
                {isStaff ? (
                  <button
                    onClick={() => setSelectedDrive(drive)}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-[#14213D] py-2.5 font-bold text-white shadow-sm hover:bg-[#26334A] dark:bg-[#4F46E5] transition"
                  >
                    <Users size={14} /> Manage Applicants ({appCount})
                  </button>
                ) : (() => {
                  const myApp = applications.find((a) => a.student_id === currentUser?.id && a.drive_id === drive.id);
                  const isApplied = Boolean(myApp);
                  const studentOffers = offers.filter((o) => o.student_id === currentUser?.id);
                  const eligibility = currentUser
                    ? evaluateDriveEligibility(currentUser, drive, studentOffers, policy)
                    : { eligible: false, reasons: ["Login required"] };

                  if (isApplied) {
                    return (
                      <div className="w-full flex items-center justify-between rounded-xl bg-[#D9EEE4] px-3.5 py-2.5 text-xs font-extrabold text-[#065F46] border border-emerald-300">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 size={15} /> Applied
                        </span>
                        <span className="capitalize text-[10px] bg-white px-2 py-0.5 rounded-lg shadow-xs text-slate-800">
                          {myApp?.stage.replace("_", " ")}
                        </span>
                      </div>
                    );
                  }

                  if (!eligibility.eligible) {
                    return (
                      <button
                        disabled
                        className="w-full rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 py-2.5 text-xs font-bold border border-slate-200 dark:border-slate-700 cursor-not-allowed text-center"
                        title={eligibility.reasons.join(" • ")}
                      >
                        Ineligible ({eligibility.reasons[0] || "Requirements not met"})
                      </button>
                    );
                  }

                  return (
                    <button
                      onClick={async () => {
                        if (!currentUser) return;
                        setApplyLoading(drive.id);
                        try {
                          const res = await applyForDrive(currentUser.id, drive.id);
                          setApplyToast({ message: res.message || "Applied successfully!", success: res.success });
                        } catch (e: any) {
                          setApplyToast({ message: e.message || "Failed to apply", success: false });
                        } finally {
                          setApplyLoading(null);
                        }
                      }}
                      disabled={applyLoading === drive.id || drive.status !== "open"}
                      className="w-full rounded-xl bg-[#14B8A6] hover:bg-teal-700 py-2.5 font-extrabold text-white shadow-sm transition disabled:opacity-40"
                    >
                      {applyLoading === drive.id ? "Submitting Application..." : "Apply Now"}
                    </button>
                  );
                })()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Drawer: Manage Applicants for Selected Drive */}
      {selectedDrive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#14213D]/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-[#14213D] md:p-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedDrive(null)}
              className="absolute top-5 right-5 rounded-full p-2 text-slate-400 hover:bg-[#F5F3FF] dark:hover:bg-slate-800"
            >
              <X size={18} />
            </button>

            {/* Drive Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E7EB] dark:border-slate-800 pb-4 mb-5">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#4F46E5]">
                  Drive Recruitment Pipeline
                </span>
                <h2 className="text-xl font-extrabold text-[#14213D] dark:text-white">
                  {selectedDrive.company_name} — {selectedDrive.job_role}
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Package: ₹{selectedDrive.package_lpa} LPA · Tier: {selectedDrive.tier.toUpperCase()} · Location: {selectedDrive.location}
                </p>
              </div>

              {/* Status Update Dropdown for Drive */}
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-[#64748B]">Drive Status:</span>
                <select
                  value={selectedDrive.status}
                  onChange={(e) => updateDriveStatus(selectedDrive.id, e.target.value as DriveStatus)}
                  className="rounded-xl border border-[#E5E7EB] bg-white py-1.5 px-3 font-bold text-[#14213D] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="planned">Planned</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Applicants Table */}
            <div className="overflow-x-auto rounded-2xl border border-[#E5E7EB] dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F3FF] dark:bg-slate-800/60 text-[#14213D] font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Applicant</th>
                    <th className="p-3">Applied At</th>
                    <th className="p-3">Current Stage</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB] dark:divide-slate-800">
                  {driveApplications.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-[#64748B]">
                        No candidates have applied for this drive yet.
                      </td>
                    </tr>
                  ) : (
                    driveApplications.map((app) => (
                      <tr key={app.id} className="hover:bg-[#F5F3FF]/40 dark:hover:bg-slate-800/30">
                        <td className="p-3">
                          <p className="font-bold text-[#14213D] dark:text-white">{app.student_name}</p>
                          <p className="text-[10px] text-[#64748B]">{app.student_roll}</p>
                        </td>
                        <td className="p-3 text-[#64748B]">{new Date(app.applied_at).toLocaleDateString()}</td>
                        <td className="p-3">
                          <select
                            value={app.stage}
                            onChange={(e) => updateApplicationStage(app.id, e.target.value as ApplicationStage)}
                            className="rounded-lg border border-[#E5E7EB] bg-white py-1 px-2 text-[11px] font-bold text-[#172033] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                          >
                            <option value="registered">Registered</option>
                            <option value="eligibility_verified">Eligibility Verified</option>
                            <option value="shortlisted">Shortlisted</option>
                            <option value="assessment_completed">Assessment Completed</option>
                            <option value="interview_in_progress">Interview in Progress</option>
                            <option value="selected">Selected</option>
                            <option value="offer_received">Offer Received</option>
                            <option value="joined">Joined</option>
                            <option value="rejected">Rejected</option>
                            <option value="withdrawn">Withdrawn</option>
                          </select>
                        </td>
                        <td className="p-3 text-right">
                          {app.stage === "selected" || app.stage === "offer_received" ? (
                            <span className="text-[11px] font-extrabold text-[#065F46] bg-[#D9EEE4] px-2.5 py-1 rounded-full">
                              ✓ Offer Active
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                setOfferApp(app);
                                setOfferForm({
                                  package_lpa: selectedDrive.package_lpa,
                                  offer_reference: `${selectedDrive.company_name.substring(0, 3).toUpperCase()}-2026-${app.student_roll}`,
                                  offer_date: new Date().toISOString().split("T")[0],
                                });
                              }}
                              className="rounded-xl bg-[#14B8A6] px-3.5 py-1.5 font-bold text-white text-[11px] hover:bg-teal-700 shadow-sm transition"
                            >
                              Issue Offer
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Issue Offer */}
      {offerApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#14213D]/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-[#14213D]">
            <button
              onClick={() => setOfferApp(null)}
              className="absolute top-5 right-5 rounded-full p-2 text-slate-400 hover:bg-[#F5F3FF] dark:hover:bg-slate-800"
            >
              <X size={18} />
            </button>

            <h3 className="font-extrabold text-base text-[#14213D] dark:text-white mb-1">
              Issue Official Placement Offer
            </h3>
            <p className="text-xs text-[#64748B] mb-4">
              Recording qualifying offer for {offerApp.student_name} ({offerApp.student_roll}) from {offerApp.company_name}.
            </p>

            <form onSubmit={handleIssueOfferSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-[#14213D] dark:text-slate-300 mb-1">
                  Package CTC (LPA) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={offerForm.package_lpa}
                  onChange={(e) => setOfferForm({ ...offerForm, package_lpa: parseFloat(e.target.value) })}
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white p-2.5 outline-none focus:border-[#4F46E5] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#14213D] dark:text-slate-300 mb-1">
                  Offer Letter Reference Code *
                </label>
                <input
                  type="text"
                  required
                  value={offerForm.offer_reference}
                  onChange={(e) => setOfferForm({ ...offerForm, offer_reference: e.target.value })}
                  placeholder="e.g. ACME-2026-SWE-048"
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white p-2.5 outline-none focus:border-[#4F46E5] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#14213D] dark:text-slate-300 mb-1">
                  Offer Date
                </label>
                <input
                  type="date"
                  value={offerForm.offer_date}
                  onChange={(e) => setOfferForm({ ...offerForm, offer_date: e.target.value })}
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white p-2.5 outline-none focus:border-[#4F46E5] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOfferApp(null)}
                  className="rounded-xl border border-[#E5E7EB] px-4 py-2 font-bold text-[#64748B] hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#14B8A6] px-5 py-2 font-bold text-white shadow-sm hover:bg-teal-700 transition"
                >
                  Confirm & Record Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Company Drive */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#14213D]/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-[#14213D] md:p-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowCreateModal(false);
                if (onCloseCreate) onCloseCreate();
              }}
              className="absolute top-5 right-5 rounded-full p-2 text-slate-400 hover:bg-[#F5F3FF] dark:hover:bg-slate-800"
            >
              <X size={18} />
            </button>

            <h2 className="text-xl font-extrabold text-[#14213D] dark:text-white mb-1">
              Create New Company Drive
            </h2>
            <p className="text-xs text-[#64748B] mb-5">
              Publish recruitment criteria, salary tier, and registration deadline to students.
            </p>

            {createError && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
                <AlertCircle size={15} /> {createError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#14213D] dark:text-slate-300 mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={driveForm.company_name}
                    onChange={(e) => setDriveForm({ ...driveForm, company_name: e.target.value })}
                    placeholder="e.g. Acme Technologies"
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white p-2.5 outline-none focus:border-[#4F46E5] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#14213D] dark:text-slate-300 mb-1">
                    Job Role *
                  </label>
                  <input
                    type="text"
                    required
                    value={driveForm.job_role}
                    onChange={(e) => setDriveForm({ ...driveForm, job_role: e.target.value })}
                    placeholder="e.g. SDE-1 (Full Stack)"
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white p-2.5 outline-none focus:border-[#4F46E5] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#14213D] dark:text-slate-300 mb-1">
                  Job Description
                </label>
                <textarea
                  rows={2}
                  value={driveForm.description}
                  onChange={(e) => setDriveForm({ ...driveForm, description: e.target.value })}
                  placeholder="Responsibilities, technical stack, interview stages..."
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white p-2.5 outline-none focus:border-[#4F46E5] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#14213D] dark:text-slate-300 mb-1">
                    Package (LPA) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={driveForm.package_lpa}
                    onChange={(e) => setDriveForm({ ...driveForm, package_lpa: parseFloat(e.target.value) })}
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white p-2.5 outline-none focus:border-[#4F46E5] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#14213D] dark:text-slate-300 mb-1">
                    Tier
                  </label>
                  <select
                    value={driveForm.tier}
                    onChange={(e) => setDriveForm({ ...driveForm, tier: e.target.value as DriveTier })}
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white p-2.5 outline-none focus:border-[#4F46E5] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="regular">Regular (&lt; 8 LPA)</option>
                    <option value="dream">Dream (8 - 14.99 LPA)</option>
                    <option value="super_dream">Super Dream (&gt;= 15 LPA)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#14213D] dark:text-slate-300 mb-1">
                    Min CGPA Required
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={driveForm.min_cgpa}
                    onChange={(e) => setDriveForm({ ...driveForm, min_cgpa: parseFloat(e.target.value) })}
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white p-2.5 outline-none focus:border-[#4F46E5] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#14213D] dark:text-slate-300 mb-1">
                    Max Backlogs Permitted
                  </label>
                  <input
                    type="number"
                    value={driveForm.max_active_backlogs}
                    onChange={(e) => setDriveForm({ ...driveForm, max_active_backlogs: parseInt(e.target.value, 10) })}
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white p-2.5 outline-none focus:border-[#4F46E5] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#14213D] dark:text-slate-300 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={driveForm.location}
                    onChange={(e) => setDriveForm({ ...driveForm, location: e.target.value })}
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white p-2.5 outline-none focus:border-[#4F46E5] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#14213D] dark:text-slate-300 mb-1">
                    Registration Deadline
                  </label>
                  <input
                    type="date"
                    value={driveForm.registration_deadline}
                    onChange={(e) => setDriveForm({ ...driveForm, registration_deadline: e.target.value })}
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white p-2.5 outline-none focus:border-[#4F46E5] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-[#E5E7EB] px-4 py-2.5 font-bold text-[#64748B] hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#4F46E5] px-5 py-2.5 font-bold text-white shadow-sm hover:bg-indigo-700 transition"
                >
                  Publish Drive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
