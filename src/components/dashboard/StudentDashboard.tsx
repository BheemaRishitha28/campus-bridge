import React, { useState } from "react";
import {
  GraduationCap,
  BriefcaseBusiness,
  ClipboardCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileDown,
  ArrowRight,
  QrCode,
  Building2,
  Calendar,
  Lock,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Video,
  MapPin,
  CreditCard,
  ExternalLink,
  Receipt,
  X,
} from "lucide-react";
import { useStore } from "../../lib/store";
import { evaluateStudentNoDues, evaluateDriveEligibility } from "../../lib/policyEngine";
import { downloadCertificatePdf } from "../../lib/certificateUtils";
import { Profile } from "../../types/domain";

interface StudentDashboardProps {
  onNavigate: (section: string) => void;
  onOpenCertificateModal: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onNavigate,
  onOpenCertificateModal,
}) => {
  const {
    currentUser,
    drives,
    applications,
    offers,
    clearances,
    categories,
    policy,
    certificates,
    interviews,
    acknowledgeInterview,
    externalDuesConfig,
    paymentReceipts,
    submitPaymentReceipt,
    applyForDrive,
    generateCertificate,
  } = useStore();

  const [applyLoadingId, setApplyLoadingId] = useState<string | null>(null);
  const [applyFeedback, setApplyFeedback] = useState<{ driveId: string; message: string; success: boolean } | null>(null);

  // External Payment Receipt Submission Modal state
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedReceiptCatId, setSelectedReceiptCatId] = useState<string>("");
  const [transactionRef, setTransactionRef] = useState("");
  const [amountPaid, setAmountPaid] = useState<number>(1500);
  const [paymentDate, setPaymentDate] = useState("2026-10-18");
  const [receiptSuccessMsg, setReceiptSuccessMsg] = useState<string | null>(null);
  const [receiptSubmitting, setReceiptSubmitting] = useState(false);

  // Current student fallback (strictly isolated to currentUser)
  const student = currentUser as Profile;
  if (!student) return null;

  // Student's private records
  const myApplications = applications.filter((a) => a.student_id === student.id);
  const myOffers = offers.filter((o) => o.student_id === student.id);
  const myClearances = clearances.filter((c) => c.student_id === student.id);
  const myCert = certificates.find((c) => c.student_id === student.id && c.is_valid);
  const myInterviews = interviews.filter((i) => i.student_id === student.id);

  // Clearance evaluation
  const noDuesEval = evaluateStudentNoDues(myClearances);

  // Filter open drives and calculate eligibility
  const openDrivesWithEligibility = drives
    .filter((d) => d.status === "open" || d.status === "in_progress")
    .map((drive) => {
      const eligibility = evaluateDriveEligibility(student, drive, myOffers, policy);
      const isApplied = myApplications.some((a) => a.drive_id === drive.id);
      return { drive, eligibility, isApplied };
    });

  const handleApply = async (driveId: string) => {
    setApplyLoadingId(driveId);
    setApplyFeedback(null);
    try {
      const res = await applyForDrive(student.id, driveId);
      setApplyFeedback({ driveId, message: res.message, success: res.success });
    } catch (err: any) {
      setApplyFeedback({ driveId, message: err?.message || "Failed to submit application", success: false });
    } finally {
      setApplyLoadingId(null);
    }
  };

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
        transaction_ref: transactionRef,
        amount_paid: Number(amountPaid),
        payment_date: paymentDate,
        receipt_filename: `SBI_Receipt_${transactionRef}.pdf`,
      });
      setReceiptSuccessMsg("Payment receipt reference submitted successfully for faculty verification!");
      setTimeout(() => {
        setReceiptModalOpen(false);
        setReceiptSuccessMsg(null);
        setTransactionRef("");
      }, 1800);
    } catch (err: any) {
      alert(err.message || "Failed to submit payment receipt.");
    } finally {
      setReceiptSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#14213D] md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#4F46E5] to-[#6366F1] text-white font-black text-xl shadow-lg shadow-indigo-600/30">
              {student.full_name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-[#14213D] dark:text-white">
                  Welcome, {student.full_name}
                </h1>
                <span className="rounded-full bg-[#D8EAFB] px-3 py-0.5 text-[11px] font-extrabold text-[#14213D]">
                  {student.roll_number}
                </span>
                <span className="rounded-full bg-[#DCD5FA] px-3 py-0.5 text-[11px] font-extrabold text-[#3730A3]">
                  {student.department_code} · Batch {student.graduation_year}
                </span>
              </div>
              <p className="mt-1 text-xs text-[#64748B] dark:text-slate-400">
                {student.program} · Section {student.section} · CGPA: <strong className="text-[#14213D] dark:text-white">{student.cgpa.toFixed(2)}</strong> · Active Backlogs: <strong className="text-[#14213D] dark:text-white">{student.backlogs}</strong>
              </p>
            </div>
          </div>

          {/* Placement & No-Dues Status Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl border border-emerald-200/80 bg-[#D9EEE4] p-3 text-right">
              <p className="text-[10px] font-extrabold uppercase text-[#065F46] opacity-80">Placement Status</p>
              <p className="text-sm font-extrabold text-[#065F46] mt-0.5">
                {myOffers.length > 0 ? (
                  <span>Placed ({myOffers.length} {myOffers.length === 1 ? "Offer" : "Offers"})</span>
                ) : myApplications.length > 0 ? (
                  <span>In Recruitment Pipeline</span>
                ) : (
                  <span>Registered</span>
                )}
              </p>
            </div>

            <div className="rounded-2xl border border-orange-200/80 bg-[#F8DCCF] p-3 text-right">
              <p className="text-[10px] font-extrabold uppercase text-[#9A3412] opacity-80">No-Dues Status</p>
              <p className="text-sm font-extrabold text-[#9A3412] mt-0.5">
                {noDuesEval.cleared ? (
                  <span>100% Cleared ✓</span>
                ) : (
                  <span>{noDuesEval.overallPercentage}% In Progress</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Scheduled Interviews */}
      <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#14213D]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#DCD5FA] text-[#3730A3]">
              <Calendar size={18} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#14213D] dark:text-white">Upcoming Interviews & Assessments</h2>
              <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">Live video links, venue locations, and attendance acknowledgment</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate("interviews")}
            className="text-xs font-bold text-[#4F46E5] dark:text-[#6366F1] hover:underline"
          >
            All Interviews ({myInterviews.length}) ↗
          </button>
        </div>

        {myInterviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-[#F5F3FF]/50 p-6 text-center text-xs text-[#64748B] dark:border-slate-800 dark:bg-slate-800/30">
            <Calendar size={24} className="mx-auto mb-2 text-slate-300 dark:text-slate-600 opacity-60" />
            <p className="font-bold text-[#14213D] dark:text-slate-200">No Upcoming Interview Rounds</p>
            <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">When company recruiters shortlist your application, interview round links and venue instructions will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myInterviews.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-[#E5E7EB] bg-[#F5F3FF]/40 p-4 text-xs dark:border-slate-800 dark:bg-slate-800/40 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[#14213D] dark:text-white text-sm">{item.company_name}</span>
                    <span className="rounded-full bg-[#DCD5FA] px-2.5 py-0.5 text-[10px] font-bold text-[#3730A3]">
                      {item.round_name}
                    </span>
                  </div>

                  <p className="mt-1 font-semibold text-[#172033] dark:text-slate-300">{item.job_role}</p>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-[#64748B]">
                    <p className="flex items-center gap-1.5 font-medium">
                      <Calendar size={13} className="text-[#4F46E5]" />
                      <span>{item.scheduled_date}</span>
                    </p>
                    <p className="flex items-center gap-1.5 font-medium">
                      <Clock size={13} className="text-[#4F46E5]" />
                      <span>{item.scheduled_time} ({item.duration_minutes}m)</span>
                    </p>
                  </div>

                  {item.mode === "online" ? (
                    <div className="mt-3 flex items-center justify-between rounded-xl bg-[#D8EAFB] p-2.5">
                      <span className="flex items-center gap-1.5 font-bold text-[#14213D] text-[11px]">
                        <Video size={14} className="text-[#4F46E5]" /> Video Call (Google Meet)
                      </span>
                      {item.meet_link && (
                        <a
                          href={item.meet_link}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 rounded-lg bg-[#4F46E5] px-2.5 py-1 text-[11px] font-bold text-white hover:bg-indigo-700 transition shadow-sm"
                        >
                          Join Meet <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="mt-3 flex items-center gap-1.5 rounded-xl bg-slate-100 p-2.5 dark:bg-slate-800 text-[11px] text-slate-700 dark:text-slate-300 font-semibold">
                      <MapPin size={14} className="text-[#14B8A6] shrink-0" />
                      <span>Venue: <strong>{item.venue || "Campus Placement Block"}</strong></span>
                    </div>
                  )}

                  {item.instructions && (
                    <p className="mt-2 text-[10px] text-[#64748B] italic">"{item.instructions}"</p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-[#E5E7EB] dark:border-slate-800 flex items-center justify-between">
                  {item.student_acknowledgment === "acknowledged" ? (
                    <span className="flex items-center gap-1 text-[10px] font-extrabold text-[#065F46] bg-[#D9EEE4] px-2.5 py-0.5 rounded-full">
                      <CheckCircle2 size={12} /> Attendance Confirmed
                    </span>
                  ) : (
                    <button
                      onClick={() => acknowledgeInterview(item.id)}
                      className="rounded-xl bg-[#14B8A6] px-3 py-1.5 text-xs font-bold text-white hover:bg-teal-700 transition shadow-sm"
                    >
                      Confirm Attendance
                    </button>
                  )}

                  <span className="text-[10px] text-[#64748B] uppercase font-bold">
                    Status: {item.outcome}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grid: Published Offers + No-Dues Clearance Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Published Offers Card */}
        <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#14213D] lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#D9EEE4] text-[#065F46]">
                <BriefcaseBusiness size={18} />
              </div>
              <h2 className="text-base font-extrabold text-[#14213D] dark:text-white">My Placement Offers</h2>
            </div>
            <span className="rounded-full bg-[#D9EEE4] px-2.5 py-0.5 text-[10px] font-extrabold text-[#065F46]">
              {myOffers.length} Received
            </span>
          </div>

          {myOffers.length === 0 ? (
            <div className="text-center py-8">
              <BriefcaseBusiness size={30} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-xs text-[#64748B]">No offers received yet.</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Apply for open eligible drives below to participate in recruitment assessments.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {myOffers.map((off) => (
                <div
                  key={off.id}
                  className="rounded-2xl border border-emerald-200/80 bg-[#D9EEE4]/40 p-4 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-extrabold text-[#14213D] text-sm">{off.company_name}</p>
                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-extrabold text-[#065F46] uppercase border border-emerald-200">
                      {off.tier}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#065F46] font-semibold mt-1">{off.job_role}</p>
                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-emerald-200 text-[11px]">
                    <span className="font-black text-[#065F46] text-sm">
                      ₹{off.package_lpa} LPA
                    </span>
                    <span className="text-[#065F46]/70 font-mono">Ref: {off.offer_reference}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Student No-Dues Clearance Checklist */}
        <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#14213D] lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#D8EAFB] text-[#14213D]">
                  <ClipboardCheck size={18} />
                </div>
                <h2 className="text-base font-extrabold text-[#14213D] dark:text-white">
                  Departmental No-Dues Clearance Checklist
                </h2>
              </div>
              <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">
                Progress: <strong className="text-[#14213D] dark:text-white">{noDuesEval.clearedMandatory} of {noDuesEval.totalMandatory}</strong> mandatory clearances completed ({noDuesEval.overallPercentage}%)
              </p>
            </div>

            {/* Certificate Button */}
            {noDuesEval.cleared ? (
              <button
                onClick={handleDownloadCertificate}
                className="flex items-center gap-2 rounded-xl bg-[#14B8A6] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-teal-600 transition"
              >
                <FileDown size={15} /> Download No-Dues Certificate (PDF)
              </button>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-xl">
                <Clock size={14} /> Clear all departments to unlock certificate
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="h-2.5 w-full rounded-full bg-[#F5F3FF] dark:bg-slate-700 overflow-hidden mb-6 border border-slate-200 dark:border-slate-600">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                noDuesEval.cleared ? "bg-[#14B8A6]" : "bg-amber-500"
              }`}
              style={{ width: `${noDuesEval.overallPercentage}%` }}
            />
          </div>

          {/* Checklist Items with Pastel Accents */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {myClearances.map((c) => {
              const isCleared = c.status === "cleared" || c.status === "not_applicable";
              const isRejected = c.status === "rejected";
              const isPending = c.status === "pending";

              return (
                <div
                  key={c.id}
                  className={`rounded-2xl border p-3.5 transition ${
                    isCleared
                      ? "border-emerald-200/80 bg-[#D9EEE4]/40"
                      : isRejected
                      ? "border-pink-200/80 bg-[#F7DCE8]/40"
                      : "border-orange-200/80 bg-[#F8DCCF]/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[#14213D] dark:text-white flex items-center gap-1.5">
                      {isCleared ? (
                        <CheckCircle2 size={15} className="text-[#065F46]" />
                      ) : isRejected ? (
                        <AlertCircle size={15} className="text-rose-600" />
                      ) : (
                        <Clock size={15} className="text-[#9A3412]" />
                      )}
                      {c.category_name}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${
                        isCleared
                          ? "bg-white text-[#065F46] border border-emerald-200"
                          : isRejected
                          ? "bg-white text-rose-700 border border-pink-200"
                          : "bg-white text-[#9A3412] border border-orange-200"
                      }`}
                    >
                      {c.status.replace("_", " ")}
                    </span>
                  </div>

                  <p className="mt-1.5 text-[11px] text-[#64748B] dark:text-slate-300">
                    {c.remarks || "No remarks recorded."}
                  </p>

                  {c.pending_requirement && (
                    <div className="mt-2 rounded-xl bg-white/80 p-2 text-[10px] text-rose-800 font-bold border border-rose-200">
                      Required: {c.pending_requirement}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* External College Fee / Dues Portal Callout */}
          <div className="mt-5 pt-4 border-t border-[#E5E7EB] dark:border-slate-800">
            <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-[#DCD5FA]/40 via-[#D8EAFB]/30 to-white p-4 dark:border-slate-800 dark:bg-slate-800/40">
              <div className="flex items-start gap-2.5">
                <div className="rounded-xl bg-[#4F46E5] p-2 text-white shrink-0 shadow-sm">
                  <CreditCard size={15} />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-[#14213D] dark:text-white">
                    {externalDuesConfig.portal_name}
                  </p>
                  <p className="text-[11px] text-[#64748B] dark:text-slate-300 mt-0.5 leading-relaxed">
                    Have unpaid fines, tuition balance, or equipment dues? Pay online through the official university payment gateway and submit your UTR reference for instant verification.
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-end gap-2">
                <a
                  href={externalDuesConfig.portal_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-bold text-[#14213D] shadow-sm hover:bg-slate-50 transition"
                >
                  <span>Open Gateway</span>
                  <ExternalLink size={12} />
                </a>
                <button
                  onClick={() => {
                    setSelectedReceiptCatId(categories[0]?.id || "");
                    setReceiptModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-[#4F46E5] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition"
                >
                  <Receipt size={12} />
                  <span>Submit Payment Reference</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Campus Drives with Policy Validation */}
      <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#14213D]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-extrabold text-[#14213D] dark:text-white">Active Recruitment Drives</h2>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
              Live campus drives evaluated against your CGPA, backlogs, and Dream Offer status
            </p>
          </div>
          <button
            onClick={() => onNavigate("drives")}
            className="text-xs font-bold text-[#4F46E5] dark:text-[#6366F1] hover:underline"
          >
            View All Drives ↗
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {openDrivesWithEligibility.map(({ drive, eligibility, isApplied }) => {
            return (
              <div
                key={drive.id}
                className="rounded-2xl border border-[#E5E7EB] bg-[#F5F3FF]/40 p-5 dark:border-slate-800 dark:bg-slate-800/40 flex flex-col justify-between text-xs"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[#14213D] dark:text-white text-sm">{drive.company_name}</span>
                    <span className="rounded-full bg-[#D8EAFB] px-2.5 py-0.5 text-[10px] font-extrabold text-[#14213D] uppercase">
                      {drive.tier}
                    </span>
                  </div>

                  <p className="mt-1 font-bold text-[#4F46E5] dark:text-indigo-400">{drive.job_role}</p>
                  <p className="mt-1 text-[#64748B] dark:text-slate-400 text-[11px] line-clamp-2 leading-relaxed">{drive.description}</p>

                  <div className="mt-4 space-y-1 text-[11px] text-[#64748B]">
                    <p><strong className="text-[#14213D] dark:text-slate-200">Package:</strong> ₹{drive.package_lpa} LPA</p>
                    <p><strong className="text-[#14213D] dark:text-slate-200">Min CGPA:</strong> {drive.min_cgpa.toFixed(2)} (Yours: {student.cgpa.toFixed(2)})</p>
                    <p><strong className="text-[#14213D] dark:text-slate-200">Deadline:</strong> {new Date(drive.registration_deadline).toLocaleDateString()}</p>
                  </div>

                  {/* Policy Decision Explanation */}
                  <div className="mt-3 rounded-xl bg-white dark:bg-slate-900/60 p-2.5 text-[11px] border border-[#E5E7EB] dark:border-slate-800">
                    <p className="font-extrabold text-[#14213D] dark:text-slate-300 mb-0.5">Eligibility Decision:</p>
                    {eligibility.eligible ? (
                      <span className="text-[#065F46] font-bold flex items-center gap-1">
                        <CheckCircle2 size={12} /> Eligible to apply
                      </span>
                    ) : (
                      <span className="text-amber-700 font-bold block leading-tight">
                        {eligibility.reasons[0]}
                      </span>
                    )}
                  </div>
                </div>

                {/* Application CTA */}
                <div className="mt-4 pt-3 border-t border-[#E5E7EB] dark:border-slate-700">
                  {isApplied ? (
                    <span className="block w-full py-2.5 text-center font-bold text-[#065F46] bg-[#D9EEE4] rounded-xl">
                      ✓ Application Submitted
                    </span>
                  ) : (
                    <button
                      disabled={!eligibility.eligible || applyLoadingId === drive.id}
                      onClick={() => handleApply(drive.id)}
                      className="w-full rounded-xl bg-[#14213D] py-2.5 font-bold text-white shadow-sm hover:bg-[#26334A] dark:bg-[#4F46E5] dark:hover:bg-[#6366F1] transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {applyLoadingId === drive.id ? "Submitting..." : "Apply Now"}
                    </button>
                  )}

                  {applyFeedback && applyFeedback.driveId === drive.id && (
                    <p className={`mt-2 text-[10px] text-center font-semibold ${applyFeedback.success ? "text-[#065F46]" : "text-rose-600"}`}>
                      {applyFeedback.message}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Submit Fee Receipt / Transaction Reference Modal */}
      {receiptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#14213D]/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-[#14213D]">
            <button
              onClick={() => setReceiptModalOpen(false)}
              className="absolute top-5 right-5 rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4F46E5] text-white shadow-sm">
                <Receipt size={18} />
              </div>
              <div>
                <h3 className="font-extrabold text-[#14213D] dark:text-white text-base">Submit Fee Payment Proof</h3>
                <p className="text-[10px] text-[#64748B]">Recorded against your student account: {student.roll_number}</p>
              </div>
            </div>

            {receiptSuccessMsg ? (
              <div className="my-6 rounded-2xl bg-[#D9EEE4] p-4 text-center">
                <CheckCircle2 size={32} className="mx-auto text-[#065F46] mb-2" />
                <p className="text-xs font-bold text-[#065F46]">{receiptSuccessMsg}</p>
                <p className="text-[10px] text-[#065F46]/80 mt-1">The Department Officer will review your UTR and update your clearance.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReceipt} className="mt-4 space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-[#14213D] dark:text-slate-300 mb-1">
                    Clearance Department / Category *
                  </label>
                  <select
                    value={selectedReceiptCatId}
                    onChange={(e) => setSelectedReceiptCatId(e.target.value)}
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white p-2.5 outline-none font-semibold text-[#14213D] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#14213D] dark:text-slate-300 mb-1">
                    SBI Collect / Gateway Transaction Reference (DU / UTR) *
                  </label>
                  <input
                    type="text"
                    required
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    placeholder="e.g. DU8829104820 or UTR-2026-991"
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white p-2.5 outline-none font-mono font-bold text-[#14213D] focus:border-[#4F46E5] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#14213D] dark:text-slate-300 mb-1">
                      Amount Paid (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(Number(e.target.value))}
                      className="w-full rounded-xl border border-[#E5E7EB] bg-white p-2.5 outline-none font-semibold text-[#14213D] focus:border-[#4F46E5] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#14213D] dark:text-slate-300 mb-1">
                      Payment Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="w-full rounded-xl border border-[#E5E7EB] bg-white p-2.5 outline-none font-semibold text-[#14213D] focus:border-[#4F46E5] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#14213D] dark:text-slate-300 mb-1">
                    Receipt Slip Attachment (PDF / Screenshot)
                  </label>
                  <div className="rounded-xl border border-dashed border-slate-300 bg-[#F5F3FF] p-3 text-center dark:border-slate-700 dark:bg-slate-800/40">
                    <p className="text-[11px] font-semibold text-[#4F46E5]">
                      SBI_Collect_{transactionRef || "DU000000"}_eReceipt.pdf
                    </p>
                    <p className="text-[9px] text-[#64748B] mt-0.5">Attached verified digital payment voucher (240 KB)</p>
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setReceiptModalOpen(false)}
                    className="rounded-xl border border-[#E5E7EB] px-4 py-2 font-bold text-[#64748B] hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={receiptSubmitting}
                    className="rounded-xl bg-[#4F46E5] px-5 py-2 font-bold text-white hover:bg-indigo-700 transition"
                  >
                    {receiptSubmitting ? "Submitting..." : "Submit for Verification"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
