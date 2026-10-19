import React, { useState } from "react";
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  UserCheck,
  GraduationCap,
  BriefcaseBusiness,
  ExternalLink,
  AlertCircle,
  FileText,
  BadgeCheck,
} from "lucide-react";
import { useStore } from "../../lib/store";
import { CollegeIdVerificationRequest, VerificationStatus } from "../../types/domain";

export const VerificationQueueView: React.FC = () => {
  const { verificationRequests, reviewVerificationRequest, currentUser } = useStore();
  const [filterType, setFilterType] = useState<"all" | "student" | "faculty">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | VerificationStatus>("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<CollegeIdVerificationRequest | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredRequests = verificationRequests.filter((req) => {
    if (filterType !== "all" && req.type !== filterType) return false;
    if (filterStatus !== "all" && req.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        req.full_name.toLowerCase().includes(q) ||
        req.roll_or_emp_id.toLowerCase().includes(q) ||
        req.university_email.toLowerCase().includes(q) ||
        req.department_code.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pendingCount = verificationRequests.filter((r) => r.status === "pending").length;
  const approvedCount = verificationRequests.filter((r) => r.status === "approved").length;
  const rejectedCount = verificationRequests.filter((r) => r.status === "rejected").length;

  const handleOpenReview = (req: CollegeIdVerificationRequest, action: "approve" | "reject") => {
    setSelectedRequest(req);
    setActionType(action);
    setRemarks(
      action === "approve"
        ? "College identity card verified against registrar records. Institutional clearance access granted."
        : "Institutional email or roll number does not match registrar database. Please re-upload official ID."
    );
    setReviewModalOpen(true);
  };

  const handleConfirmReview = async () => {
    if (!selectedRequest) return;
    setIsSubmitting(true);
    try {
      await reviewVerificationRequest(
        selectedRequest.id,
        actionType === "approve" ? "approved" : "rejected",
        remarks
      );
      setReviewModalOpen(false);
      setSelectedRequest(null);
    } catch (err: any) {
      alert(err.message || "Failed to process verification.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl bg-gradient-to-r from-midnight via-charcoal to-deepIndigo p-6 sm:p-8 text-white shadow-soft">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md mb-2">
            <ShieldCheck size={14} className="text-tealAccent" />
            <span>Identity Governance · RBAC</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            College ID Verification Queue
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-xl">
            Authorize genuine students and departmental faculty. Unverified users cannot access private placement drives, submit clearance workflows, or view student records.
          </p>
        </div>

        {/* Stats Pill */}
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 p-3 sm:p-4 text-center min-w-[90px]">
            <p className="text-2xl font-black text-amber-300">{pendingCount}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Pending</p>
          </div>
          <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 p-3 sm:p-4 text-center min-w-[90px]">
            <p className="text-2xl font-black text-tealAccent">{approvedCount}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Approved</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-3xl border border-cbBorder bg-[#D8EAFB]/70 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Pending Review</span>
            <span className="rounded-2xl bg-white/80 p-2 text-amber-700 shadow-xs dark:bg-amber-950/60 dark:text-amber-400">
              <Clock size={18} />
            </span>
          </div>
          <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">{pendingCount}</p>
          <p className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-400">Requires Placement Cell sign-off</p>
        </div>

        <div className="rounded-3xl border border-cbBorder bg-[#D9EEE4]/70 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Verified Institutional Users</span>
            <span className="rounded-2xl bg-white/80 p-2 text-emerald-700 shadow-xs dark:bg-emerald-950/60 dark:text-emerald-400">
              <BadgeCheck size={18} />
            </span>
          </div>
          <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">{approvedCount}</p>
          <p className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-400">Full platform privileges active</p>
        </div>

        <div className="rounded-3xl border border-cbBorder bg-[#F7DCE8]/70 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Rejected / Suspicious</span>
            <span className="rounded-2xl bg-white/80 p-2 text-rose-700 shadow-xs dark:bg-rose-950/60 dark:text-rose-400">
              <XCircle size={18} />
            </span>
          </div>
          <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">{rejectedCount}</p>
          <p className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-400">Failed email / ID verification check</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-cbBorder bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, roll number, employee ID, or university email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-deepIndigo focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800">
            <button
              onClick={() => setFilterType("all")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                filterType === "all" ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white" : "text-slate-500"
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setFilterType("student")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                filterType === "student" ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white" : "text-slate-500"
              }`}
            >
              Students
            </button>
            <button
              onClick={() => setFilterType("faculty")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                filterType === "faculty" ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white" : "text-slate-500"
              }`}
            >
              Faculty
            </button>
          </div>

          <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800">
            <button
              onClick={() => setFilterStatus("all")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                filterStatus === "all" ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white" : "text-slate-500"
              }`}
            >
              All Status
            </button>
            <button
              onClick={() => setFilterStatus("pending")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                filterStatus === "pending" ? "bg-white text-amber-700 shadow-sm dark:bg-slate-700 dark:text-amber-400" : "text-slate-500"
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setFilterStatus("approved")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                filterStatus === "approved" ? "bg-white text-emerald-700 shadow-sm dark:bg-slate-700 dark:text-emerald-400" : "text-slate-500"
              }`}
            >
              Approved
            </button>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="overflow-hidden rounded-3xl border border-cbBorder bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-cbBorder bg-[#F5F3FF]/80 font-bold uppercase tracking-wider text-slate-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
              <tr>
                <th className="py-4 px-5">Applicant</th>
                <th className="py-4 px-5">Role / Department</th>
                <th className="py-4 px-5">College Roll / Emp ID</th>
                <th className="py-4 px-5">ID Card Evidence</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5">Submitted Date</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cbBorder dark:divide-slate-800">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <UserCheck size={36} className="mx-auto mb-2 opacity-30 text-deepIndigo" />
                    <p className="font-semibold text-slate-600 dark:text-slate-300">No verification requests found</p>
                    <p className="text-[11px] text-slate-400">All student and faculty identity applications have been processed.</p>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-[#F5F3FF]/40 dark:hover:bg-slate-800/40 transition">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-2xl text-xs font-bold shadow-xs ${
                            req.type === "faculty"
                              ? "bg-[#D8EAFB] text-blue-900 dark:bg-blue-950 dark:text-blue-300"
                              : "bg-[#DCD5FA] text-deepIndigo dark:bg-indigo-950 dark:text-indigo-300"
                          }`}
                        >
                          {req.type === "faculty" ? <BriefcaseBusiness size={18} /> : <GraduationCap size={18} />}
                        </div>
                        <div>
                          <p className="font-extrabold text-[#172033] dark:text-white">{req.full_name}</p>
                          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{req.university_email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {req.type.toUpperCase()} · {req.department_code}
                      </span>
                      {req.program && (
                        <p className="mt-1 text-[11px] text-slate-500">
                          {req.program} (Yr {req.year_of_study})
                        </p>
                      )}
                    </td>

                    <td className="py-4 px-5">
                      <span className="font-mono font-bold text-slate-900 dark:text-slate-200">
                        {req.roll_or_emp_id}
                      </span>
                      {req.cgpa && (
                        <p className="text-[11px] font-semibold text-slate-500">CGPA: {req.cgpa.toFixed(2)}</p>
                      )}
                    </td>

                    <td className="py-4 px-5">
                      {req.id_card_url ? (
                        <a
                          href={req.id_card_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-bold text-deepIndigo hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-indigo-400 transition shadow-xs"
                        >
                          <FileText size={13} />
                          <span>View ID Card</span>
                          <ExternalLink size={10} />
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-400">Digital Smart Card</span>
                      )}
                    </td>

                    <td className="py-4 px-5">
                      {req.status === "pending" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F8DCCF] border border-amber-200/60 px-3 py-1 text-[10px] font-extrabold text-amber-900 dark:bg-amber-950/60 dark:text-amber-300">
                          <Clock size={11} /> Pending Review
                        </span>
                      )}
                      {req.status === "approved" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D9EEE4] border border-emerald-200/60 px-3 py-1 text-[10px] font-extrabold text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300">
                          <CheckCircle2 size={11} /> Verified Active
                        </span>
                      )}
                      {req.status === "rejected" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F7DCE8] border border-rose-200/60 px-3 py-1 text-[10px] font-extrabold text-rose-900 dark:bg-rose-950/60 dark:text-rose-300">
                          <XCircle size={11} /> Rejected
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-5 text-slate-500 font-medium">
                      {new Date(req.submitted_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    <td className="py-4 px-5 text-right">
                      {req.status === "pending" ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenReview(req, "approve")}
                            className="rounded-xl bg-tealAccent px-3 py-1.5 text-xs font-extrabold text-slate-900 hover:bg-teal-400 dark:text-slate-900 shadow-xs transition"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleOpenReview(req, "reject")}
                            className="rounded-xl bg-[#F7DCE8] border border-rose-200 px-3 py-1.5 text-xs font-extrabold text-rose-900 hover:bg-rose-200 dark:bg-rose-950 dark:text-rose-300 transition"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] font-bold text-slate-400">
                          {req.reviewer_name || "Processed"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {reviewModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-cbBorder bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-cbBorder dark:border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-xl text-white ${
                    actionType === "approve" ? "bg-tealAccent" : "bg-rose-500"
                  }`}
                >
                  {actionType === "approve" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {actionType === "approve" ? "Approve University Identity" : "Reject Identity Request"}
                  </h3>
                  <p className="text-[10px] text-slate-400">{selectedRequest.full_name} ({selectedRequest.roll_or_emp_id})</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-800/60">
                <p className="font-bold text-slate-700 dark:text-slate-300">Applicant Details</p>
                <div className="mt-1 space-y-1 text-slate-500 dark:text-slate-400 text-[11px]">
                  <p>Email: <span className="text-slate-800 dark:text-slate-200 font-medium">{selectedRequest.university_email}</span></p>
                  <p>Department: <span className="text-slate-800 dark:text-slate-200 font-medium">{selectedRequest.department_code}</span></p>
                  <p>Type: <span className="text-slate-800 dark:text-slate-200 font-medium uppercase">{selectedRequest.type}</span></p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Official Verification Remarks
                </label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter remarks recorded in audit trail..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-deepIndigo dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirmReview}
                  className={`rounded-xl px-4 py-2 text-xs font-bold text-white shadow-sm transition ${
                    actionType === "approve"
                      ? "bg-teal-600 hover:bg-teal-700"
                      : "bg-rose-600 hover:bg-rose-700"
                  }`}
                >
                  {isSubmitting ? "Processing..." : actionType === "approve" ? "Confirm & Authorize" : "Reject Request"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
