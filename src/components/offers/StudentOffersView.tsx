import React, { useState } from "react";
import {
  Award,
  Building2,
  Calendar,
  CheckCircle2,
  FileDown,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Info,
} from "lucide-react";
import { useStore } from "../../lib/store";
import { Profile } from "../../types/domain";

interface StudentOffersViewProps {
  onNavigate?: (tab: string) => void;
}

export const StudentOffersView: React.FC<StudentOffersViewProps> = ({ onNavigate }) => {
  const { currentUser, offers, policy } = useStore();
  const student = currentUser as Profile;

  const [acceptedOfferIds, setAcceptedOfferIds] = useState<string[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  if (!student) return null;

  const myOffers = offers.filter((o) => o.student_id === student.id);
  const highestOffer = myOffers.reduce((max, o) => (o.package_lpa > max ? o.package_lpa : max), 0);

  const handleAcceptOffer = (offerId: string, companyName: string) => {
    setAcceptedOfferIds((prev) => [...prev, offerId]);
    setToastMsg(`Congratulations! You have formally accepted the placement offer from ${companyName}.`);
    setTimeout(() => setToastMsg(null), 5000);
  };

  const handleDownloadOfferLetter = (companyName: string, role: string, ctc: number) => {
    const content = `OFFICIAL PLACEMENT OFFER LETTER\n---------------------------------\nCandidate: ${student.full_name} (${student.roll_number})\nDepartment: ${student.department_code}\nCompany: ${companyName}\nRole: ${role}\nCompensation (CTC): INR ${ctc} LPA\nAcademic Year: 2026\nStatus: Verified Institutional Offer via CampusBridge T&P Cell\n`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${student.roll_number}_Offer_${companyName.replace(/\s+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {toastMsg && (
        <div className="flex items-center justify-between rounded-2xl bg-[#D9EEE4] p-4 text-xs font-bold text-[#065F46] border border-emerald-300 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{toastMsg}</span>
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
            <Award size={14} className="text-[#14B8A6]" />
            <span>Recruitment Achievements · Verified Selection Letters</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            My Job Offers & Selections
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-xl">
            Review formal corporate employment letters, package tiers, and University Dream Offer policy allowances.
          </p>
        </div>

        <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 p-4 text-center min-w-[130px]">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-300">Highest Package</span>
          <p className="text-2xl sm:text-3xl font-black text-amber-300 mt-0.5">
            ₹{highestOffer > 0 ? highestOffer.toFixed(1) : "0.0"} <span className="text-xs">LPA</span>
          </p>
        </div>
      </div>

      {/* Policy Limits Card */}
      <div className="rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#DCD5FA] text-[#4F46E5]">
            <TrendingUp size={20} />
          </div>
          <div>
            <h4 className="font-extrabold text-[#172033] dark:text-white">
              Institutional Dream Offer Policy
            </h4>
            <p className="text-slate-500 mt-0.5">
              Current Offers: <strong>{myOffers.length}</strong> / {policy.max_offers_allowed} Maximum Allowed · Dream Threshold: ₹{policy.dream_min_lpa} LPA · Super Dream: ₹{policy.super_dream_min_lpa} LPA
            </p>
          </div>
        </div>

        <span className="rounded-full bg-[#D9EEE4] px-3.5 py-1 text-xs font-bold text-emerald-800">
          {myOffers.length >= policy.max_offers_allowed ? "Max Offers Reached" : "Eligible for Higher Tiers"}
        </span>
      </div>

      {/* Offers Grid */}
      {myOffers.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#E5E7EB] bg-white/50 p-12 text-center text-slate-400 dark:border-slate-800 dark:bg-slate-900/30">
          <Award size={48} className="mx-auto mb-3 opacity-30 text-[#4F46E5]" />
          <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">No Offers Extended Yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            As you clear technical and HR interview rounds, official employment letters will be logged here by the Placement Cell.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {myOffers.map((offer) => {
            const isAccepted = offer.accepted || acceptedOfferIds.includes(offer.id);

            return (
              <div
                key={offer.id}
                className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between text-xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#DCD5FA] text-[#4F46E5] font-black shadow-xs">
                        <Building2 size={22} />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base text-[#14213D] dark:text-white">
                          {offer.company_name}
                        </h3>
                        <p className="text-xs font-bold text-[#4F46E5] dark:text-indigo-400">
                          {offer.job_role}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${
                        offer.tier === "super_dream"
                          ? "bg-[#DCD5FA] text-[#3730A3]"
                          : offer.tier === "dream"
                          ? "bg-[#D8EAFB] text-[#14213D]"
                          : "bg-[#D9EEE4] text-[#065F46]"
                      }`}
                    >
                      {offer.tier.replace("_", " ")}
                    </span>
                  </div>

                  {/* Compensation Pill Box */}
                  <div className="mt-4 rounded-2xl bg-[#F5F3FF]/80 p-4 border border-[#E5E7EB] dark:border-slate-800 dark:bg-slate-800/50 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-semibold">Compensation (CTC)</span>
                      <span className="font-black text-lg text-[#14213D] dark:text-white">
                        ₹{offer.package_lpa} LPA
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-500">Offer Reference</span>
                      <span className="font-mono font-bold text-[#4F46E5]">{offer.offer_reference}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-500">Offer Date</span>
                      <span className="font-semibold">{new Date(offer.offer_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-[#E5E7EB] dark:border-slate-800 flex items-center justify-between gap-3">
                  <button
                    onClick={() => handleDownloadOfferLetter(offer.company_name, offer.job_role, offer.package_lpa)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white py-2.5 font-bold text-[#14213D] shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white transition"
                  >
                    <FileDown size={14} /> Download Letter
                  </button>

                  <button
                    onClick={() => handleAcceptOffer(offer.id, offer.company_name)}
                    disabled={isAccepted}
                    className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 font-bold transition ${
                      isAccepted
                        ? "bg-[#D9EEE4] text-[#065F46] cursor-default font-extrabold"
                        : "bg-[#14B8A6] text-white hover:bg-teal-700 shadow-xs"
                    }`}
                  >
                    <CheckCircle2 size={14} /> {isAccepted ? "Accepted" : "Accept Offer"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
