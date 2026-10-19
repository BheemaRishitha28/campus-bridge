import React, { useState } from "react";
import {
  Settings,
  Shield,
  Sliders,
  Database,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Save,
} from "lucide-react";
import { useStore } from "../../lib/store";
import { isSupabaseConfigured } from "../../lib/supabase";

export const SettingsView: React.FC = () => {
  const { policy, currentUser, updatePolicy, resetToDemoData } = useStore();

  const [policyForm, setPolicyForm] = useState({
    regular_max_lpa: policy.regular_max_lpa,
    dream_min_lpa: policy.dream_min_lpa,
    dream_max_lpa: policy.dream_max_lpa,
    super_dream_min_lpa: policy.super_dream_min_lpa,
    max_offers_allowed: policy.max_offers_allowed,
    allow_dream_after_regular: policy.allow_dream_after_regular,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const isAdmin = currentUser?.role === "placement_admin";

  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updatePolicy(policyForm);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#14213D] dark:text-white">
          Platform Configuration & Placement Policies
        </h1>
        <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
          Tune institutional Dream Offer thresholds, clearance rules, and external backend connectivity
        </p>
      </div>

      {/* User Identity Card */}
      <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#14213D]">
        <h2 className="text-base font-extrabold text-[#14213D] dark:text-white mb-4 flex items-center gap-2">
          <Shield size={18} className="text-[#4F46E5]" />
          Active Account & Role Verification
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="rounded-2xl bg-[#F5F3FF]/70 border border-[#E5E7EB] dark:bg-slate-800/40 p-3.5">
            <span className="text-[10px] text-[#64748B] font-bold uppercase">Name</span>
            <p className="font-bold text-[#14213D] dark:text-white mt-0.5">{currentUser?.full_name}</p>
          </div>
          <div className="rounded-2xl bg-[#DCD5FA]/40 border border-indigo-100 p-3.5">
            <span className="text-[10px] text-[#3730A3] font-bold uppercase">Verified Role</span>
            <p className="font-extrabold text-[#3730A3] mt-0.5 capitalize">
              {currentUser?.role.replace("_", " ")}
            </p>
          </div>
          <div className="rounded-2xl bg-[#F5F3FF]/70 border border-[#E5E7EB] dark:bg-slate-800/40 p-3.5">
            <span className="text-[10px] text-[#64748B] font-bold uppercase">Email</span>
            <p className="font-bold text-[#14213D] dark:text-white mt-0.5">{currentUser?.university_email}</p>
          </div>
        </div>
      </div>

      {/* Configurable Placement Policy Engine */}
      {isAdmin ? (
        <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#14213D]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-extrabold text-[#14213D] dark:text-white flex items-center gap-2">
                <Sliders size={18} className="text-[#4F46E5]" />
                Dream Offer & Tier Engine Settings
              </h2>
              <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
                Rules enforced across student drive eligibility and application submissions
              </p>
            </div>
            {savedSuccess && (
              <span className="rounded-full bg-[#D9EEE4] px-3 py-1 text-xs font-bold text-[#065F46] flex items-center gap-1">
                <CheckCircle2 size={13} /> Policy Saved!
              </span>
            )}
          </div>

          <form onSubmit={handleSavePolicy} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[#14213D] dark:text-slate-300 mb-1">
                  Regular Tier Maximum Package (LPA)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={policyForm.regular_max_lpa}
                  onChange={(e) => setPolicyForm({ ...policyForm, regular_max_lpa: parseFloat(e.target.value) })}
                  className="w-full rounded-xl border border-[#E5E7EB] bg-[#F5F3FF]/60 p-2.5 font-bold outline-none focus:border-[#4F46E5] text-[#14213D] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <span className="text-[10px] text-[#64748B]">Drives below this package are treated as Regular.</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#14213D] dark:text-slate-300 mb-1">
                  Dream Tier Minimum Package (LPA)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={policyForm.dream_min_lpa}
                  onChange={(e) => setPolicyForm({ ...policyForm, dream_min_lpa: parseFloat(e.target.value) })}
                  className="w-full rounded-xl border border-[#E5E7EB] bg-[#F5F3FF]/60 p-2.5 font-bold outline-none focus:border-[#4F46E5] text-[#14213D] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <span className="text-[10px] text-[#64748B]">Qualifies as a Dream offer (unlocks upgrade).</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#14213D] dark:text-slate-300 mb-1">
                  Super Dream Tier Minimum Package (LPA)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={policyForm.super_dream_min_lpa}
                  onChange={(e) => setPolicyForm({ ...policyForm, super_dream_min_lpa: parseFloat(e.target.value) })}
                  className="w-full rounded-xl border border-[#E5E7EB] bg-[#F5F3FF]/60 p-2.5 font-bold outline-none focus:border-[#4F46E5] text-[#14213D] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <span className="text-[10px] text-[#64748B]">Pinnacle tier. Students with Super Dream offers are locked.</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#14213D] dark:text-slate-300 mb-1">
                  Maximum Qualifying Offers per Student
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={policyForm.max_offers_allowed}
                  onChange={(e) => setPolicyForm({ ...policyForm, max_offers_allowed: parseInt(e.target.value, 10) })}
                  className="w-full rounded-xl border border-[#E5E7EB] bg-[#F5F3FF]/60 p-2.5 font-bold outline-none focus:border-[#4F46E5] text-[#14213D] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <span className="text-[10px] text-[#64748B]">Total offers a candidate can hold simultaneously.</span>
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-[#14213D] dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={policyForm.allow_dream_after_regular}
                  onChange={(e) => setPolicyForm({ ...policyForm, allow_dream_after_regular: e.target.checked })}
                  className="rounded h-4 w-4 text-[#4F46E5] focus:ring-[#4F46E5]"
                />
                <span>Allow Dream & Super Dream applications after securing a Regular offer</span>
              </label>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-xl bg-[#4F46E5] px-5 py-2.5 font-bold text-white shadow-sm hover:bg-indigo-700 transition"
              >
                <Save size={15} /> Save Placement Policy
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {/* Backend & Supabase Status Panel */}
      <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#14213D]">
        <h2 className="text-base font-extrabold text-[#14213D] dark:text-white mb-2 flex items-center gap-2">
          <Database size={18} className="text-[#14B8A6]" />
          Backend Connection & Cloud Persistence
        </h2>

        {isSupabaseConfigured ? (
          <div className="rounded-2xl border border-emerald-200 bg-[#D9EEE4] p-4 text-xs text-[#065F46]">
            <p className="font-extrabold flex items-center gap-1.5">
              <CheckCircle2 size={16} /> Supabase PostgreSQL & Auth Active
            </p>
            <p className="mt-1 text-[11px] leading-relaxed">
              Environment variables <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> are detected. Production queries, RLS policies, and OAuth endpoints are active.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-indigo-100 bg-[#D8EAFB]/50 p-4 text-xs text-[#14213D]">
            <p className="font-extrabold flex items-center gap-1.5 text-[#14213D]">
              <Sparkles size={16} className="text-[#4F46E5]" /> Autonomous Dual-Mode Active (Local State + Mock Engine)
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-[#64748B]">
              Running in offline zero-configuration evaluation mode. All student changes, drive creations, clearance approvals, and certificate tokens are reactive and persistently stored in your browser's local state.
            </p>
            <p className="mt-2 text-[10px] text-[#64748B] font-mono">
              To connect a live Supabase project, populate <code>.env</code> with your project URL and publishable anon key.
            </p>
          </div>
        )}

        {/* Reset State Action */}
        <div className="mt-6 pt-4 border-t border-[#E5E7EB] dark:border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#14213D] dark:text-white">Reset Local Demonstration Data</p>
            <p className="text-[11px] text-[#64748B]">Reverts all records back to pristine initial demonstration fixtures.</p>
          </div>
          <button
            onClick={() => {
              if (confirm("Reset local demonstration data back to default?")) {
                resetToDemoData();
              }
            }}
            className="flex items-center gap-1.5 rounded-xl border border-rose-200 px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition"
          >
            <RotateCcw size={14} /> Reset Data
          </button>
        </div>
      </div>
    </div>
  );
};
