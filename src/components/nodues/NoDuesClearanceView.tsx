import React, { useState } from "react";
import {
  ClipboardCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  FileDown,
  QrCode,
  ShieldCheck,
  AlertTriangle,
  X,
  FileCheck2,
  ExternalLink,
  Receipt,
  CreditCard,
  CheckCheck,
} from "lucide-react";
import { useStore } from "../../lib/store";
import { StudentClearance, ClearanceStatus, Profile, Certificate, ExternalPaymentReceipt } from "../../types/domain";
import { evaluateStudentNoDues } from "../../lib/policyEngine";
import { downloadCertificatePdf } from "../../lib/certificateUtils";

export const NoDuesClearanceView: React.FC = () => {
  const {
    students,
    clearances,
    categories,
    certificates,
    currentUser,
    updateClearanceStatus,
    generateCertificate,
    revokeCertificate,
    externalDuesConfig,
    paymentReceipts,
    reviewPaymentReceipt,
  } = useStore();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [filterBatch, setFilterBatch] = useState("2026");

  // Clearance Action Modal (Approve / Reject)
  const [actionClearance, setActionClearance] = useState<{
    clearance: StudentClearance;
    student: Profile;
  } | null>(null);
  const [actionStatus, setActionStatus] = useState<ClearanceStatus>("cleared");
  const [remarks, setRemarks] = useState("");
  const [pendingReq, setPendingReq] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Revoke Certificate Modal
  const [revokeCertTarget, setRevokeCertTarget] = useState<Certificate | null>(null);
  const [revokeReason, setRevokeReason] = useState("");

  const isAdmin = currentUser?.role === "placement_admin";

  // Filter clearances
  const filteredRows = clearances.filter((c) => {
    const student = students.find((s) => s.id === c.student_id);
    if (!student) return false;

    if (filterBatch !== "ALL" && student.graduation_year.toString() !== filterBatch) {
      return false;
    }

    const matchesSearch =
      student.full_name.toLowerCase().includes(search.toLowerCase()) ||
      student.roll_number.toLowerCase().includes(search.toLowerCase()) ||
      student.department_code.toLowerCase().includes(search.toLowerCase());

    const matchesCat = selectedCategory === "ALL" || c.category_code === selectedCategory;
    const matchesStatus = selectedStatus === "ALL" || c.status === selectedStatus;

    return matchesSearch && matchesCat && matchesStatus;
  });

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionClearance) return;
    setActionLoading(true);
    try {
      await updateClearanceStatus(
        actionClearance.clearance.id,
        actionStatus,
        remarks || (actionStatus === "cleared" ? "All requirements fulfilled." : "Action needed."),
        actionStatus === "rejected" ? pendingReq : undefined
      );
      setActionClearance(null);
      setRemarks("");
      setPendingReq("");
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevokeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revokeCertTarget || !revokeReason) return;
    try {
      await revokeCertificate(revokeCertTarget.id, revokeReason);
      setRevokeCertTarget(null);
      setRevokeReason("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateCertificateForStudent = async (student: Profile) => {
    const res = await generateCertificate(student.id);
    if (res.certificate) {
      await downloadCertificatePdf(res.certificate);
    } else {
      alert(res.error || "Cannot issue certificate.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#14213D] dark:text-white">
            Departmental No-Dues Clearance Queue
          </h1>
          <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
            Manage approvals across Library, Labs, Academic Dept, Placement, Accounts, & Hostel
          </p>
        </div>

        {/* Institutional Rule Notice Banner */}
        <div className="rounded-2xl border border-emerald-200 bg-[#D9EEE4] px-4 py-2 text-xs font-semibold text-[#065F46]">
          <span className="font-extrabold">CRITICAL RULE:</span> 100% of mandatory categories must be Cleared or N/A.
        </div>
      </div>

      {/* External College Fee/Dues Gateway Integration */}
      <div className="rounded-3xl border border-[#E5E7EB] bg-gradient-to-r from-[#DCD5FA]/30 via-[#D8EAFB]/20 to-white p-5 dark:border-slate-800 dark:bg-[#14213D]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#4F46E5] text-white shadow-md">
              <CreditCard size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-[#14213D] dark:text-white">
                  {externalDuesConfig.portal_name}
                </h3>
                <span className="rounded-full bg-[#D9EEE4] px-2.5 py-0.5 text-[10px] font-extrabold text-[#065F46]">
                  Active Gateway
                </span>
              </div>
              <p className="mt-1 text-xs text-[#64748B] dark:text-slate-400 max-w-2xl leading-relaxed">
                {externalDuesConfig.instructions}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={externalDuesConfig.portal_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-2xl bg-[#4F46E5] px-4 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-indigo-700 transition"
            >
              <span>Open Gateway</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* Submitted Receipts Queue */}
        {paymentReceipts && paymentReceipts.length > 0 && (
          <div className="mt-5 pt-4 border-t border-[#E5E7EB] dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-[#14213D] dark:text-white flex items-center gap-1.5">
                <Receipt size={14} className="text-[#4F46E5]" />
                Submitted Fee References & Payment Receipts ({paymentReceipts.filter(r => r.status === "submitted").length} Pending)
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white dark:border-slate-800 dark:bg-slate-900">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F3FF] font-bold uppercase text-[10px] tracking-wider text-[#14213D] dark:bg-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Student</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Transaction / DU Ref</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Payment Date</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Verification Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB] dark:divide-slate-800">
                  {paymentReceipts.map((rcpt) => (
                    <tr key={rcpt.id} className="hover:bg-[#F5F3FF]/40 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-semibold text-[#14213D] dark:text-slate-200">
                        {rcpt.student_name} <span className="text-[#64748B] font-normal">({rcpt.student_roll})</span>
                      </td>
                      <td className="py-2.5 px-3 font-medium">{rcpt.category_name}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-[#4F46E5] dark:text-indigo-400">
                        {rcpt.transaction_ref}
                      </td>
                      <td className="py-2.5 px-3 font-black text-[#14213D] dark:text-white">
                        ₹{rcpt.amount_paid.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-[#64748B]">{rcpt.payment_date}</td>
                      <td className="py-2.5 px-3">
                        {rcpt.status === "submitted" && (
                          <span className="rounded-full bg-[#F8DCCF] px-2 py-0.5 text-[10px] font-extrabold text-[#9A3412]">
                            Pending Review
                          </span>
                        )}
                        {rcpt.status === "verified" && (
                          <span className="rounded-full bg-[#D9EEE4] px-2 py-0.5 text-[10px] font-extrabold text-[#065F46]">
                            Verified & Cleared
                          </span>
                        )}
                        {rcpt.status === "rejected" && (
                          <span className="rounded-full bg-[#F7DCE8] px-2 py-0.5 text-[10px] font-extrabold text-rose-700">
                            Rejected
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {rcpt.status === "submitted" ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => reviewPaymentReceipt(rcpt.id, "verified", "Payment reference verified with official college portal records.")}
                              className="rounded-lg bg-[#D9EEE4] px-2.5 py-1 text-xs font-bold text-[#065F46] hover:bg-emerald-200 transition"
                            >
                              Verify & Clear Dues
                            </button>
                            <button
                              onClick={() => reviewPaymentReceipt(rcpt.id, "rejected", "Receipt reference not found in university bank scroll.")}
                              className="rounded-lg bg-[#F7DCE8] px-2 py-1 text-xs font-bold text-rose-700 hover:bg-rose-200 transition"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Filters & Queue Selection */}
      <div className="rounded-3xl border border-[#E5E7EB] bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#14213D]">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student or roll number..."
              className="w-full rounded-xl border border-[#E5E7EB] bg-[#F5F3FF]/60 py-2 pl-9 pr-3 text-[#172033] outline-none focus:border-[#4F46E5] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-[#E5E7EB] bg-[#F5F3FF]/60 py-2 px-3 font-semibold text-[#172033] outline-none focus:border-[#4F46E5] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="ALL">All Clearance Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.code}>
                {cat.name} {cat.mandatory ? "(Mandatory)" : "(Optional)"}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-[#E5E7EB] bg-[#F5F3FF]/60 py-2 px-3 font-semibold text-[#172033] outline-none focus:border-[#4F46E5] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="ALL">All Statuses</option>
            <option value="pending">Pending Verification</option>
            <option value="rejected">Rejected / Action Needed</option>
            <option value="cleared">Cleared</option>
            <option value="not_applicable">Not Applicable</option>
          </select>

          <select
            value={filterBatch}
            onChange={(e) => setFilterBatch(e.target.value)}
            className="rounded-xl border border-[#E5E7EB] bg-[#F5F3FF]/60 py-2 px-3 font-semibold text-[#172033] outline-none focus:border-[#4F46E5] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="2026">Batch 2026 (Graduating)</option>
            <option value="2025">Batch 2025</option>
            <option value="ALL">All Batches</option>
          </select>
        </div>
      </div>

      {/* Clearances Table */}
      <div className="rounded-3xl border border-[#E5E7EB] bg-white shadow-sm dark:border-slate-800 dark:bg-[#14213D] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F3FF] dark:bg-slate-800/60 border-b border-[#E5E7EB] dark:border-slate-800 text-[10px] font-black uppercase tracking-wider text-[#14213D] dark:text-[#DCD5FA]">
              <tr>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Clearance Category</th>
                <th className="py-3.5 px-4">Mandatory</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Remarks / Action Note</th>
                <th className="py-3.5 px-4">Updated By</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] dark:divide-slate-800">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-[#64748B]">
                    No clearance records match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredRows.slice(0, 25).map((row) => {
                  const student = students.find((s) => s.id === row.student_id)!;
                  return (
                    <tr key={row.id} className="hover:bg-[#F5F3FF]/40 dark:hover:bg-slate-800/30 transition">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-[#14213D] dark:text-white">{student.full_name}</p>
                        <p className="text-[10px] text-[#64748B]">{student.roll_number} · {student.department_code}</p>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#172033] dark:text-slate-200">
                        {row.category_name}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase ${
                            row.mandatory
                              ? "bg-[#D8EAFB] text-[#14213D]"
                              : "bg-[#F5F3FF] text-[#64748B]"
                          }`}
                        >
                          {row.mandatory ? "Mandatory" : "Optional"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                            row.status === "cleared" || row.status === "not_applicable"
                              ? "bg-[#D9EEE4] text-[#065F46]"
                              : row.status === "rejected"
                              ? "bg-[#F7DCE8] text-rose-700"
                              : "bg-[#F8DCCF] text-[#9A3412]"
                          }`}
                        >
                          {row.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#64748B] max-w-xs truncate">
                        {row.pending_requirement ? (
                          <span className="font-bold text-rose-600">
                            Required: {row.pending_requirement}
                          </span>
                        ) : (
                          row.remarks || "—"
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-[#64748B] text-[11px]">
                        {row.updated_by_name || "Department Staff"}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isAdmin && (
                          <button
                            onClick={() => {
                              setActionClearance({ clearance: row, student });
                              setActionStatus(row.status);
                              setRemarks(row.remarks || "");
                              setPendingReq(row.pending_requirement || "");
                            }}
                            className="rounded-xl bg-[#14213D] px-3.5 py-1.5 font-bold text-white text-[11px] hover:bg-[#26334A] dark:bg-[#4F46E5] shadow-sm transition"
                          >
                            Update Status
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Update Clearance Status */}
      {actionClearance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#14213D]/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-[#14213D]">
            <button
              onClick={() => setActionClearance(null)}
              className="absolute top-5 right-5 rounded-full p-2 text-slate-400 hover:bg-[#F5F3FF] dark:hover:bg-slate-800"
            >
              <X size={18} />
            </button>

            <h3 className="font-extrabold text-base text-[#14213D] dark:text-white mb-1">
              Update {actionClearance.clearance.category_name} Clearance
            </h3>
            <p className="text-xs text-[#64748B] mb-4">
              Student: <strong>{actionClearance.student.full_name}</strong> ({actionClearance.student.roll_number} · {actionClearance.student.department_code})
            </p>

            <form onSubmit={handleActionSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-[#14213D] dark:text-slate-300 mb-1">
                  Clearance Status *
                </label>
                <select
                  value={actionStatus}
                  onChange={(e) => setActionStatus(e.target.value as ClearanceStatus)}
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white p-2.5 outline-none font-bold text-[#14213D] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="cleared">Cleared (No Dues / Complete)</option>
                  <option value="pending">Pending Verification</option>
                  <option value="rejected">Rejected / Action Required</option>
                  <option value="not_applicable">Not Applicable</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#14213D] dark:text-slate-300 mb-1">
                  Department Remarks
                </label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. All laboratory components accounted for."
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white p-2.5 outline-none focus:border-[#4F46E5] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {actionStatus === "rejected" && (
                <div>
                  <label className="block text-[11px] font-bold text-rose-600 mb-1">
                    Specific Student Requirement *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={pendingReq}
                    onChange={(e) => setPendingReq(e.target.value)}
                    placeholder="e.g. Return DSP board or pay ₹1,200 fine at counter."
                    className="w-full rounded-xl border border-rose-300 bg-rose-50/40 p-2.5 outline-none focus:border-rose-500 dark:border-rose-800 dark:bg-rose-950/20 dark:text-white"
                  />
                </div>
              )}

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActionClearance(null)}
                  className="rounded-xl border border-[#E5E7EB] px-4 py-2 font-bold text-[#64748B] hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-xl bg-[#4F46E5] px-5 py-2 font-bold text-white shadow-sm hover:bg-indigo-700 transition"
                >
                  {actionLoading ? "Saving..." : "Save Clearance"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Revoke Certificate */}
      {revokeCertTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#14213D]/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-[#14213D]">
            <button
              onClick={() => setRevokeCertTarget(null)}
              className="absolute top-5 right-5 rounded-full p-2 text-slate-400 hover:bg-[#F5F3FF] dark:hover:bg-slate-800"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 text-rose-600 mb-2">
              <AlertTriangle size={20} />
              <h3 className="font-extrabold text-base">Revoke Issued Certificate</h3>
            </div>
            <p className="text-xs text-[#64748B] mb-4">
              Token: <strong>{revokeCertTarget.verification_token}</strong> ({revokeCertTarget.student_name}).
              Once revoked, the public QR verification page will show an invalid/revoked status.
            </p>

            <form onSubmit={handleRevokeSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-[#14213D] dark:text-slate-300 mb-1">
                  Reason for Revocation *
                </label>
                <textarea
                  rows={2}
                  required
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  placeholder="e.g. Unresolved library dues identified post-audit."
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white p-2.5 outline-none focus:border-rose-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRevokeCertTarget(null)}
                  className="rounded-xl border border-[#E5E7EB] px-4 py-2 font-bold text-[#64748B] hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-rose-600 px-5 py-2 font-bold text-white shadow-sm hover:bg-rose-500 transition"
                >
                  Revoke Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
