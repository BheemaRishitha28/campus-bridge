import React, { useState } from "react";
import {
  ClipboardCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  FileDown,
  ExternalLink,
  CreditCard,
  Receipt,
  QrCode,
  ShieldCheck,
  AlertTriangle,
  Info,
  Calendar,
  Building2,
  BookOpen,
  FlaskConical,
  Award,
  Layers,
  Sparkles,
} from "lucide-react";
import { useStore } from "../../lib/store";
import { evaluateStudentNoDues } from "../../lib/policyEngine";
import { downloadCertificatePdf } from "../../lib/certificateUtils";
import { Profile } from "../../types/domain";

interface StudentClearanceViewProps {
  onNavigate?: (tab: string) => void;
}

export const StudentClearanceView: React.FC<StudentClearanceViewProps> = ({ onNavigate }) => {
  const {
    currentUser,
    clearances,
    categories,
    certificates,
    externalDuesConfig,
    paymentReceipts,
    submitPaymentReceipt,
    generateCertificate,
  } = useStore();

  const student = currentUser as Profile;
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedReceiptCatId, setSelectedReceiptCatId] = useState("");
  const [transactionRef, setTransactionRef] = useState("");
  const [amountPaid, setAmountPaid] = useState<number>(1500);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [receiptSubmitting, setReceiptSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; success: boolean } | null>(null);

  if (!student) return null;

  // Student's private records
  const myClearances = clearances.filter((c) => c.student_id === student.id);
  const myCert = certificates.find((c) => c.student_id === student.id && c.is_valid);
  const myReceipts = paymentReceipts.filter((r) => r.student_id === student.id);

  // Clearance evaluation
  const noDuesEval = evaluateStudentNoDues(myClearances);

  const handleDownloadCertificate = async () => {
    if (!noDuesEval.cleared) return;
    if (myCert) {
      await downloadCertificatePdf(myCert);
    } else {
      const res = await generateCertificate(student.id);
      if (res.certificate) {
        await downloadCertificatePdf(res.certificate);
      }
    }
  };

  const handleSubmitReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReceiptCatId || !transactionRef) {
      alert("Please select a category and enter your transaction/UTR reference.");
      return;
    }
    const cat = categories.find((c) => c.id === selectedReceiptCatId);
    setReceiptSubmitting(true);
    try {
      await submitPaymentReceipt({
        student_id: student.id,
        student_name: student.full_name,
        student_roll: student.roll_number,
        category_id: selectedReceiptCatId,
        category_name: cat?.name || "Departmental Fee",
        transaction_ref: transactionRef.trim(),
        amount_paid: Number(amountPaid),
        payment_date: paymentDate,
        receipt_filename: `Receipt_${transactionRef.trim()}.pdf`,
      });
      setToastMsg({
        text: "Payment receipt submitted successfully! Accounts Officer will verify and update your clearance status.",
        success: true,
      });
      setReceiptModalOpen(false);
      setTransactionRef("");
    } catch (err: any) {
      setToastMsg({ text: err.message || "Failed to submit receipt", success: false });
    } finally {
      setReceiptSubmitting(false);
    }
  };

  const getCategoryIcon = (code: string) => {
    switch (code) {
      case "LIBRARY":
        return <BookOpen size={20} />;
      case "LAB":
        return <FlaskConical size={20} />;
      case "DEPARTMENT":
        return <Building2 size={20} />;
      case "ACCOUNTS":
        return <CreditCard size={20} />;
      default:
        return <ClipboardCheck size={20} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div
          className={`flex items-center justify-between rounded-2xl p-4 text-xs font-bold shadow-sm ${
            toastMsg.success
              ? "bg-[#D9EEE4] text-[#065F46] border border-emerald-300"
              : "bg-[#F7DCE8] text-[#9F1239] border border-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMsg.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{toastMsg.text}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="opacity-70 hover:opacity-100">
            ×
          </button>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl bg-gradient-to-r from-[#14213D] via-[#26334A] to-[#4F46E5] p-6 sm:p-8 text-white shadow-soft">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md mb-2">
            <ClipboardCheck size={14} className="text-[#14B8A6]" />
            <span>Institutional Governance · Departmental Clearance Status</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Department No-Dues Clearance
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-xl">
            Track mandatory clearances across Library, Labs, Academic Department, Placement Cell, and Finance before graduation and offer release.
          </p>
        </div>

        {/* Action Button: Pay Dues or Download Certificate */}
        <div className="flex items-center gap-3">
          {noDuesEval.cleared ? (
            <button
              onClick={handleDownloadCertificate}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 px-5 py-3 text-xs font-extrabold text-white shadow-lg shadow-teal-500/25 hover:from-teal-600 hover:to-emerald-700 transition"
            >
              <FileDown size={16} /> Download Clearance Certificate (PDF)
            </button>
          ) : (
            <button
              onClick={() => {
                if (categories.length > 0) setSelectedReceiptCatId(categories[0].id);
                setReceiptModalOpen(true);
              }}
              className="flex items-center gap-2 rounded-2xl bg-[#14B8A6] px-5 py-3 text-xs font-extrabold text-white shadow-lg hover:bg-teal-700 transition"
            >
              <Receipt size={16} /> Submit Fee Payment Receipt
            </button>
          )}
        </div>
      </div>

      {/* Clearance KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-3xl border border-[#E5E7EB] bg-[#D8EAFB]/70 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Clearance Completion</span>
          <p className="mt-2 text-3xl font-black text-[#14213D] dark:text-white">
            {noDuesEval.overallPercentage}%
          </p>
          <div className="mt-2 h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div
              className={`h-full rounded-full ${noDuesEval.cleared ? "bg-[#14B8A6]" : "bg-[#4F46E5]"}`}
              style={{ width: `${noDuesEval.overallPercentage}%` }}
            />
          </div>
        </div>

        <div className="rounded-3xl border border-[#E5E7EB] bg-[#D9EEE4]/70 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Cleared Categories</span>
          <p className="mt-2 text-3xl font-black text-emerald-800 dark:text-emerald-400">
            {myClearances.filter((c) => c.status === "cleared").length} / {myClearances.length}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Institutional sign-offs verified</p>
        </div>

        <div className="rounded-3xl border border-[#E5E7EB] bg-[#F8DCCF]/70 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Pending Actions</span>
          <p className="mt-2 text-3xl font-black text-amber-800 dark:text-amber-400">
            {noDuesEval.pendingMandatory}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Awaiting department sign-off</p>
        </div>

        <div className="rounded-3xl border border-[#E5E7EB] bg-[#F7DCE8]/70 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Rejected / Hold</span>
          <p className="mt-2 text-3xl font-black text-rose-800 dark:text-rose-400">
            {noDuesEval.rejectedMandatory}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Requires dues settlement</p>
        </div>
      </div>

      {/* External College Dues Portal Notice Banner */}
      <div className="rounded-3xl border border-indigo-200/60 bg-[#F5F3FF] p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard size={18} className="text-[#4F46E5]" />
            <h3 className="text-sm font-extrabold text-[#14213D] dark:text-white">
              {externalDuesConfig.portal_name}
            </h3>
          </div>
          <p className="mt-1 text-xs text-[#64748B] dark:text-slate-400 max-w-2xl leading-relaxed">
            {externalDuesConfig.instructions} Returning from the payment portal does not automatically clear dues. Upload your transaction reference (UTR) below for verified accounts reconciliation.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href={externalDuesConfig.portal_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-[#14213D] shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white transition"
          >
            Open Payment Portal <ExternalLink size={13} />
          </a>
          <button
            onClick={() => {
              if (categories.length > 0) setSelectedReceiptCatId(categories[0].id);
              setReceiptModalOpen(true);
            }}
            className="rounded-xl bg-[#4F46E5] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition"
          >
            Submit Receipt
          </button>
        </div>
      </div>

      {/* Clearance Checklist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {myClearances.map((item) => (
          <div
            key={item.id}
            className="rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between text-xs"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#DCD5FA] text-[#4F46E5]">
                    {getCategoryIcon(item.category_code)}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[#172033] dark:text-white text-sm">
                      {item.category_name}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {item.updated_by_name || "Department In-Charge"}
                    </p>
                  </div>
                </div>

                <div>
                  {item.status === "cleared" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#D9EEE4] px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800">
                      <CheckCircle2 size={11} /> Cleared
                    </span>
                  )}
                  {item.status === "pending" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#F8DCCF] px-2.5 py-0.5 text-[10px] font-extrabold text-amber-900">
                      <Clock size={11} /> Pending
                    </span>
                  )}
                  {item.status === "rejected" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#F7DCE8] px-2.5 py-0.5 text-[10px] font-extrabold text-rose-900">
                      <XCircle size={11} /> Hold / Dues
                    </span>
                  )}
                </div>
              </div>

              {/* Status Note / Remarks */}
              <div className="mt-4 rounded-2xl bg-[#F5F3FF]/70 p-3.5 border border-[#E5E7EB] dark:border-slate-800 dark:bg-slate-800/50">
                <p className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                  {item.remarks || "No administrative notes recorded."}
                </p>
                {item.pending_requirement && (
                  <p className="mt-1 text-[11px] font-bold text-rose-700 dark:text-rose-400">
                    Action required: {item.pending_requirement}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#E5E7EB] dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
              <span>{item.mandatory ? "Mandatory Criterion" : "Optional Section"}</span>
              <span className="font-mono text-[10px]">
                {item.updated_at ? new Date(item.updated_at).toLocaleDateString() : "Pending"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Submitted Payment Receipts History */}
      <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-slate-800 pb-3 mb-4">
          <div>
            <h3 className="text-base font-extrabold text-[#172033] dark:text-white">
              Fee Receipts Submitted for Clearance
            </h3>
            <p className="text-xs text-slate-500">
              Audit trail of payment receipts uploaded for Accounts Officer verification.
            </p>
          </div>
          <span className="rounded-full bg-[#D8EAFB] px-3 py-1 text-xs font-bold text-blue-900">
            {myReceipts.length} Recorded Receipts
          </span>
        </div>

        {myReceipts.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No fee payment receipts submitted yet. If you have overdue library fines or lab breakages, pay on SBI Collect and submit the transaction reference above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F3FF] dark:bg-slate-800 font-bold uppercase text-[10px] text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="p-3">Department Category</th>
                  <th className="p-3">Transaction UTR</th>
                  <th className="p-3">Amount Paid</th>
                  <th className="p-3">Payment Date</th>
                  <th className="p-3">Verification Status</th>
                  <th className="p-3">Accounts Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] dark:divide-slate-800">
                {myReceipts.map((r) => (
                  <tr key={r.id}>
                    <td className="p-3 font-bold text-[#172033] dark:text-white">{r.category_name}</td>
                    <td className="p-3 font-mono font-semibold text-[#4F46E5]">{r.transaction_ref}</td>
                    <td className="p-3 font-bold text-slate-800 dark:text-slate-200">₹{r.amount_paid}</td>
                    <td className="p-3 text-slate-500">{new Date(r.payment_date).toLocaleDateString()}</td>
                    <td className="p-3">
                      {r.status === "verified" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#D9EEE4] px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800">
                          <CheckCircle2 size={11} /> Verified
                        </span>
                      ) : r.status === "rejected" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#F7DCE8] px-2.5 py-0.5 text-[10px] font-extrabold text-rose-800">
                          <XCircle size={11} /> Rejected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#F8DCCF] px-2.5 py-0.5 text-[10px] font-extrabold text-amber-800">
                          <Clock size={11} /> In Review
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-slate-500">{r.faculty_remarks || "Awaiting Accounts reconciliation"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Submit Payment Receipt Modal */}
      {receiptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#14213D]/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-[#14213D]">
            <h3 className="text-lg font-extrabold text-[#14213D] dark:text-white mb-1">
              Submit Fee Payment Receipt
            </h3>
            <p className="text-xs text-[#64748B] mb-4">
              Enter the bank transaction/UTR reference after completing payment on the University SBI Collect gateway.
            </p>

            <form onSubmit={handleSubmitReceipt} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#14213D] dark:text-slate-200 mb-1">
                  Clearance Department Category
                </label>
                <select
                  value={selectedReceiptCatId}
                  onChange={(e) => setSelectedReceiptCatId(e.target.value)}
                  className="w-full rounded-xl border border-[#E5E7EB] p-2.5 outline-none focus:border-[#4F46E5] dark:border-slate-700 dark:bg-slate-800 dark:text-white font-semibold"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#14213D] dark:text-slate-200 mb-1">
                  Bank Transaction / UTR Reference Number
                </label>
                <input
                  type="text"
                  required
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="e.g., DU8829104820 or SBIN0001234"
                  className="w-full rounded-xl border border-[#E5E7EB] p-2.5 outline-none focus:border-[#4F46E5] dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#14213D] dark:text-slate-200 mb-1">
                    Amount Paid (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(Number(e.target.value))}
                    className="w-full rounded-xl border border-[#E5E7EB] p-2.5 outline-none focus:border-[#4F46E5] dark:border-slate-700 dark:bg-slate-800 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#14213D] dark:text-slate-200 mb-1">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full rounded-xl border border-[#E5E7EB] p-2.5 outline-none focus:border-[#4F46E5] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5E7EB] dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setReceiptModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={receiptSubmitting}
                  className="rounded-xl bg-[#4F46E5] px-5 py-2 font-bold text-white shadow-sm hover:bg-indigo-700 transition"
                >
                  {receiptSubmitting ? "Submitting..." : "Submit Receipt Reference"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
