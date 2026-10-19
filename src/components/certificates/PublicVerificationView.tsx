import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  Search,
  CheckCircle2,
  XCircle,
  Building2,
  Calendar,
  GraduationCap,
  ArrowLeft,
  QrCode,
  Lock,
} from "lucide-react";
import { useStore } from "../../lib/store";
import { verifyCertificatePublic } from "../../lib/certificateUtils";
import { ThemeToggle } from "../common/ThemeToggle";

interface PublicVerificationViewProps {
  onBackToHome: () => void;
  initialToken?: string;
}

export const PublicVerificationView: React.FC<PublicVerificationViewProps> = ({
  onBackToHome,
  initialToken = "CB-2026-CS-8921-A9D",
}) => {
  const { certificates } = useStore();
  const [tokenInput, setTokenInput] = useState(initialToken);
  const [searchResult, setSearchResult] = useState<ReturnType<typeof verifyCertificatePublic> | null>(null);

  useEffect(() => {
    if (initialToken) {
      const res = verifyCertificatePublic(initialToken, certificates);
      setSearchResult(res);
    }
  }, [initialToken, certificates]);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    const res = verifyCertificatePublic(tokenInput, certificates);
    setSearchResult(res);
  };

  return (
    <div className="min-h-screen bg-[#F5F3FF] dark:bg-[#0B1220] text-[#172033] dark:text-slate-100 transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-[#E5E7EB] bg-white/85 backdrop-blur-md dark:border-slate-800 dark:bg-[#14213D]/90">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2 text-xs font-bold text-[#172033] shadow-sm transition hover:bg-[#F5F3FF] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <ArrowLeft size={15} /> Back to Homepage
          </button>

          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-[#4F46E5] dark:text-indigo-400" />
            <span className="text-sm font-extrabold tracking-tight text-[#14213D] dark:text-white">Official Certificate Registry</span>
          </div>

          <ThemeToggle />
        </div>
      </header>

      {/* Main Verification Card */}
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#4F46E5] to-[#6366F1] text-white shadow-xl shadow-indigo-600/30">
            <QrCode size={30} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#14213D] dark:text-white">
            Verify Institutional No-Dues Clearance
          </h1>
          <p className="mt-2 text-xs text-[#64748B] dark:text-slate-400 max-w-lg mx-auto">
            Scan the QR code on a student's certificate or enter their unique cryptographic verification token below to confirm institutional clearance validity.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleVerify} className="relative mb-8 flex items-center shadow-lg rounded-2xl overflow-hidden border border-[#E5E7EB] bg-white dark:border-slate-700 dark:bg-slate-800">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="e.g. CB-2026-CS-8921-A9D"
              className="w-full border-0 bg-transparent py-4 pl-12 pr-4 text-sm font-semibold text-[#172033] outline-none placeholder:text-slate-400 dark:text-white"
            />
          </div>
          <button
            type="submit"
            className="bg-[#4F46E5] px-6 py-4 text-xs font-extrabold text-white transition hover:bg-indigo-700 shadow-sm"
          >
            Verify Now
          </button>
        </form>

        {/* Quick Sample Tokens with Pastel Badges */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-2 text-xs text-[#64748B]">
          <span className="font-semibold">Sample Tokens:</span>
          <button
            type="button"
            onClick={() => {
              setTokenInput("CB-2026-CS-8921-A9D");
              setSearchResult(verifyCertificatePublic("CB-2026-CS-8921-A9D", certificates));
            }}
            className="rounded-xl bg-[#D9EEE4] px-3 py-1 text-[11px] font-extrabold text-[#065F46] hover:bg-emerald-200 transition"
          >
            Valid: CB-2026-CS-8921-A9D
          </button>
          <button
            type="button"
            onClick={() => {
              setTokenInput("CB-INVALID-0000-XXX");
              setSearchResult(verifyCertificatePublic("CB-INVALID-0000-XXX", certificates));
            }}
            className="rounded-xl bg-[#F7DCE8] px-3 py-1 text-[11px] font-extrabold text-rose-700 hover:bg-rose-200 transition"
          >
            Non-Existent Token
          </button>
        </div>

        {/* Verification Result Card */}
        {searchResult && (
          <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-[#14213D] md:p-8 animate-in fade-in duration-200">
            {searchResult.status === "valid" ? (
              <div>
                <div className="flex items-center gap-3 border-b border-[#E5E7EB] dark:border-slate-800 pb-5 mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D9EEE4] text-[#065F46]">
                    <CheckCircle2 size={26} />
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D9EEE4] px-2.5 py-0.5 text-[10px] font-extrabold text-[#065F46]">
                      <ShieldCheck size={13} /> AUTHENTIC CERTIFICATE
                    </span>
                    <h2 className="text-lg font-bold text-[#14213D] dark:text-white mt-0.5">
                      Clearance Verified by CampusBridge
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="rounded-2xl bg-[#F5F3FF]/70 border border-[#E5E7EB] dark:bg-slate-800/40 p-4">
                    <p className="text-[10px] font-bold uppercase text-[#64748B]">Student Roll Number</p>
                    <p className="mt-1 text-base font-extrabold text-[#14213D] dark:text-white">
                      {searchResult.details?.roll_number}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#F5F3FF]/70 border border-[#E5E7EB] dark:bg-slate-800/40 p-4">
                    <p className="text-[10px] font-bold uppercase text-[#64748B]">Student Name (Sanitized)</p>
                    <p className="mt-1 text-base font-extrabold text-[#14213D] dark:text-white">
                      {searchResult.details?.student_name}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#F5F3FF]/70 border border-[#E5E7EB] dark:bg-slate-800/40 p-4">
                    <p className="text-[10px] font-bold uppercase text-[#64748B]">Academic Department</p>
                    <p className="mt-1 text-sm font-extrabold text-[#14213D] dark:text-white">
                      {searchResult.details?.department_name}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#F5F3FF]/70 border border-[#E5E7EB] dark:bg-slate-800/40 p-4">
                    <p className="text-[10px] font-bold uppercase text-[#64748B]">Clearance Date</p>
                    <p className="mt-1 text-sm font-extrabold text-[#14213D] dark:text-white">
                      {searchResult.details?.clearance_date}
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-emerald-200 bg-[#D9EEE4]/50 p-4 text-xs text-[#065F46]">
                  <p className="font-extrabold flex items-center gap-1.5">
                    <CheckCircle2 size={15} /> All Mandatory Categories Satisfied:
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-[#065F46]/90 font-medium">
                    Central Library, Laboratory Equipment, Academic Department, Placement Cell, and Finance & Accounts have all recorded official zero-dues clearance for this student.
                  </p>
                </div>

                <div className="mt-6 border-t border-[#E5E7EB] dark:border-slate-800 pt-4 flex flex-wrap items-center justify-between text-[11px] text-[#64748B]">
                  <span className="flex items-center gap-1">
                    <Lock size={12} /> Student email, phone, and internal remarks protected.
                  </span>
                  <span>Issued By: {searchResult.details?.issuer}</span>
                </div>
              </div>
            ) : searchResult.status === "revoked" ? (
              <div className="text-center py-4">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F7DCE8] text-rose-700">
                  <AlertTriangle size={28} />
                </div>
                <h3 className="text-xl font-bold text-rose-600">Certificate Revoked</h3>
                <p className="mt-2 text-xs text-[#64748B] max-w-md mx-auto">
                  {searchResult.message}
                </p>
                <div className="mt-6 rounded-2xl bg-[#F7DCE8]/40 border border-pink-200 p-4 text-xs text-rose-800 max-w-sm mx-auto text-left">
                  <p><strong>Roll:</strong> {searchResult.details?.roll_number}</p>
                  <p><strong>Department:</strong> {searchResult.details?.department_name}</p>
                  <p><strong>Status:</strong> Invalidated in Registry</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F8DCCF] text-[#9A3412]">
                  <XCircle size={28} />
                </div>
                <h3 className="text-xl font-bold text-[#14213D] dark:text-white">Record Not Found</h3>
                <p className="mt-2 text-xs text-[#64748B] max-w-md mx-auto">
                  {searchResult.message}
                </p>
                <p className="mt-4 text-[11px] text-[#64748B]">
                  Please verify that you copied the complete token including all prefix and suffix characters.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
