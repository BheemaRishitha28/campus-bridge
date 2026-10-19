import React, { useState } from "react";
import {
  Users,
  GraduationCap,
  BriefcaseBusiness,
  ClipboardCheck,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
  FileDown,
  Layers,
  CheckCircle2,
  Calendar,
  Building2,
  Clock,
  Sparkles,
  ShieldAlert,
} from "lucide-react";
import { useStore } from "../../lib/store";
import { calculatePlacementAnalytics, getAtRiskStudents } from "../../lib/policyEngine";
import { Profile } from "../../types/domain";

interface FacultyDashboardProps {
  onNavigate: (section: string) => void;
  onOpenImport: () => void;
  onOpenAddStudent: () => void;
  onOpenCreateDrive: () => void;
}

export const FacultyDashboard: React.FC<FacultyDashboardProps> = ({
  onNavigate,
  onOpenImport,
  onOpenAddStudent,
  onOpenCreateDrive,
}) => {
  const {
    students,
    applications,
    offers,
    drives,
    clearances,
    auditLogs,
    currentUser,
  } = useStore();

  const [selectedBatch, setSelectedBatch] = useState<number>(2026);
  const [selectedDept, setSelectedDept] = useState<string>("All departments");

  // Calculate live analytics
  const analytics = calculatePlacementAnalytics(
    students,
    applications,
    offers,
    drives,
    clearances,
    {
      department: selectedDept,
      batch: selectedBatch,
    }
  );

  // Calculate rule-based At-Risk cohort
  const atRiskCohort = getAtRiskStudents(students, clearances, applications, offers);

  // Filter recent audit activity
  const recentActivities = auditLogs.slice(0, 6);

  // Active drives with upcoming deadlines
  const activeDrivesList = drives
    .filter((d) => d.status === "open" || d.status === "in_progress")
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Header Banner & Global Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-[#D8EAFB] px-3 py-1 text-[11px] font-bold text-[#14213D] dark:border-indigo-900/60 dark:bg-[#14213D] dark:text-[#DCD5FA] mb-2">
            <span className="h-2 w-2 rounded-full bg-[#14B8A6] animate-pulse" />
            Live University Placement Season · Active Intelligence
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#14213D] dark:text-white">
            Placement & Clearance Command Center
          </h1>
          <p className="mt-1 text-xs text-[#64748B] dark:text-slate-400">
            Welcome back, {currentUser?.full_name || "Placement In-Charge"}. Computed live from institutional database records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Batch Selector */}
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(parseInt(e.target.value, 10))}
            className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-bold text-[#172033] shadow-sm outline-none focus:border-[#4F46E5] dark:border-slate-700 dark:bg-[#14213D] dark:text-slate-200"
          >
            <option value={2026}>Batch 2026 (Graduating)</option>
            <option value={2025}>Batch 2025 (Previous)</option>
            <option value={2027}>Batch 2027 (Pre-final)</option>
          </select>

          {/* Department Selector */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-bold text-[#172033] shadow-sm outline-none focus:border-[#4F46E5] dark:border-slate-700 dark:bg-[#14213D] dark:text-slate-200"
          >
            <option value="All departments">All Departments</option>
            <option value="CSE">Computer Science (CSE)</option>
            <option value="ECE">Electronics (ECE)</option>
            <option value="MECH">Mechanical (MECH)</option>
          </select>

          {/* Quick Action Button */}
          <button
            onClick={() => onNavigate("reports")}
            className="flex items-center gap-1.5 rounded-xl bg-[#14213D] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#26334A] dark:bg-[#6366F1] dark:hover:bg-[#4F46E5]"
          >
            <FileDown size={14} /> Reports & Exports
          </button>
        </div>
      </div>

      {/* Quick Action Pills */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          onClick={onOpenCreateDrive}
          className="flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2 text-xs font-bold text-[#172033] shadow-sm hover:border-[#4F46E5] hover:text-[#4F46E5] dark:border-slate-700 dark:bg-[#14213D] dark:text-slate-300 dark:hover:border-indigo-400 transition"
        >
          <PlusCircle size={15} className="text-[#4F46E5]" /> Create Company Drive
        </button>
        <button
          onClick={onOpenAddStudent}
          className="flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2 text-xs font-bold text-[#172033] shadow-sm hover:border-[#6366F1] hover:text-[#6366F1] dark:border-slate-700 dark:bg-[#14213D] dark:text-slate-300 dark:hover:border-indigo-400 transition"
        >
          <Users size={15} className="text-[#6366F1]" /> Add Student
        </button>
        <button
          onClick={onOpenImport}
          className="flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2 text-xs font-bold text-[#172033] shadow-sm hover:border-[#14B8A6] hover:text-[#14B8A6] dark:border-slate-700 dark:bg-[#14213D] dark:text-slate-300 dark:hover:border-teal-400 transition"
        >
          <Layers size={15} className="text-[#14B8A6]" /> Bulk Ingestion (CSV/XLSX)
        </button>
        <button
          onClick={() => onNavigate("nodues")}
          className="flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2 text-xs font-bold text-[#172033] shadow-sm hover:border-amber-500 hover:text-amber-600 dark:border-slate-700 dark:bg-[#14213D] dark:text-slate-300 dark:hover:border-amber-400 transition"
        >
          <ClipboardCheck size={15} className="text-amber-600" /> Review Clearances
        </button>
      </div>

      {/* 4 PRIMARY PASTEL KPI CARDS (Calm Blue, Soft Green, Lavender, Pastel Peach) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Calm Blue (#D8EAFB) - Total Registered & Eligible */}
        <div className="rounded-3xl border border-blue-200/80 bg-[#D8EAFB] p-5 text-[#14213D] shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#14213D] shadow-sm">
              <Users size={19} />
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/70 px-2.5 py-1 rounded-full text-[#14213D]">
              Cohort Batch {selectedBatch}
            </span>
          </div>
          <p className="mt-4 text-xs font-extrabold uppercase tracking-wider opacity-75">Total Registered</p>
          <p className="text-3xl font-black mt-0.5">{analytics.totalRegistered}</p>
          <div className="mt-2.5 flex items-center justify-between text-[11px] font-bold border-t border-blue-300/40 pt-2">
            <span>Eligible Cohort:</span>
            <span className="bg-white/80 px-2 py-0.5 rounded-md font-extrabold">{analytics.eligibleCount} Students</span>
          </div>
        </div>

        {/* Card 2: Soft Green (#D9EEE4) - Unique Students Placed (CRITICAL DISTINCTION) */}
        <div className="rounded-3xl border border-emerald-200/80 bg-[#D9EEE4] p-5 text-[#065F46] shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#065F46] shadow-sm">
              <GraduationCap size={19} />
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/80 px-2.5 py-1 rounded-full text-[#065F46]">
              {analytics.placementRate}% Rate
            </span>
          </div>
          <p className="mt-4 text-xs font-extrabold uppercase tracking-wider opacity-85">Unique Placed (Distinct)</p>
          <p className="text-3xl font-black mt-0.5">{analytics.uniquePlacedCount}</p>
          <div className="mt-2.5 flex items-center justify-between text-[11px] font-bold border-t border-emerald-300/40 pt-2">
            <span>Individuals Placed:</span>
            <span className="bg-white/80 px-2 py-0.5 rounded-md font-extrabold">{analytics.uniquePlacedCount} of {analytics.eligibleCount}</span>
          </div>
        </div>

        {/* Card 3: Lavender (#DCD5FA) - Total Offers Extended */}
        <div className="rounded-3xl border border-indigo-200/80 bg-[#DCD5FA] p-5 text-[#3730A3] shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#3730A3] shadow-sm">
              <BriefcaseBusiness size={19} />
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/70 px-2.5 py-1 rounded-full text-[#3730A3]">
              Multi-Offers
            </span>
          </div>
          <p className="mt-4 text-xs font-extrabold uppercase tracking-wider opacity-85">Total Offers Extended</p>
          <p className="text-3xl font-black mt-0.5">{analytics.totalOffersCount}</p>
          <div className="mt-2.5 flex items-center justify-between text-[11px] font-bold border-t border-indigo-300/40 pt-2">
            <span>Offers / Placed Ratio:</span>
            <span className="bg-white/80 px-2 py-0.5 rounded-md font-extrabold">
              {analytics.uniquePlacedCount > 0 ? (analytics.totalOffersCount / analytics.uniquePlacedCount).toFixed(2) : "0"}x
            </span>
          </div>
        </div>

        {/* Card 4: Pastel Peach (#F8DCCF) - Pending No-Dues Clearances */}
        <div className="rounded-3xl border border-orange-200/80 bg-[#F8DCCF] p-5 text-[#9A3412] shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#9A3412] shadow-sm">
              <ClipboardCheck size={19} />
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/80 px-2.5 py-1 rounded-full text-[#9A3412]">
              Action Required
            </span>
          </div>
          <p className="mt-4 text-xs font-extrabold uppercase tracking-wider opacity-85">Pending No-Dues</p>
          <p className="text-3xl font-black mt-0.5">{analytics.pendingNoDuesStudentsCount}</p>
          <div className="mt-2.5 flex items-center justify-between text-[11px] font-bold border-t border-orange-300/40 pt-2">
            <span>Awaiting Approvals:</span>
            <span className="bg-white/80 px-2 py-0.5 rounded-md font-extrabold">6 Departments</span>
          </div>
        </div>
      </div>

      {/* SECONDARY 4 KPI CARDS (White Cards with Refined Badges) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* 5. Participating Candidates */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#14213D]">
          <div className="flex items-center justify-between">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#D8EAFB] text-[#14213D]">
              <TrendingUp size={16} />
            </span>
            <span className="text-[10px] font-bold text-[#4F46E5]">Applied ≥ 1</span>
          </div>
          <p className="mt-3 text-xs font-semibold text-[#64748B] dark:text-slate-400">Participating in Drives</p>
          <p className="text-xl font-extrabold text-[#14213D] dark:text-white mt-0.5">{analytics.participatingCount}</p>
        </div>

        {/* 6. Students Not Yet Placed */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#14213D]">
          <div className="flex items-center justify-between">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#DCD5FA] text-[#3730A3]">
              <Clock size={16} />
            </span>
            <span className="text-[10px] font-bold text-amber-600">Active Search</span>
          </div>
          <p className="mt-3 text-xs font-semibold text-[#64748B] dark:text-slate-400">Not Yet Placed</p>
          <p className="text-xl font-extrabold text-[#14213D] dark:text-white mt-0.5">{analytics.unplacedCount}</p>
        </div>

        {/* 7. Active Recruitment Drives */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#14213D]">
          <div className="flex items-center justify-between">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#D9EEE4] text-[#065F46]">
              <Building2 size={16} />
            </span>
            <span className="text-[10px] font-bold text-[#14B8A6]">Open Drives</span>
          </div>
          <p className="mt-3 text-xs font-semibold text-[#64748B] dark:text-slate-400">Active Campus Drives</p>
          <p className="text-xl font-extrabold text-[#14213D] dark:text-white mt-0.5">{analytics.activeDrivesCount}</p>
        </div>

        {/* 8. At-Risk Cohort Count */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#14213D]">
          <div className="flex items-center justify-between">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F8DCCF] text-[#9A3412]">
              <AlertTriangle size={16} />
            </span>
            <span className="text-[10px] font-bold text-rose-600">Needs Guidance</span>
          </div>
          <p className="mt-3 text-xs font-semibold text-[#64748B] dark:text-slate-400">At-Risk Students</p>
          <p className="text-xl font-extrabold text-[#14213D] dark:text-white mt-0.5">{atRiskCohort.length}</p>
        </div>
      </div>

      {/* Main Grid: Department Placement Analytics + Recruitment Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Placement Breakdown */}
        <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#14213D] lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-extrabold text-[#14213D] dark:text-white">
                Department-wise Placement Percentages
              </h2>
              <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
                Unique placed students vs total cohort size · Batch {selectedBatch}
              </p>
            </div>
            <button
              onClick={() => onNavigate("reports")}
              className="text-xs font-bold text-[#4F46E5] dark:text-[#6366F1] hover:underline"
            >
              Full Report ↗
            </button>
          </div>

          <div className="space-y-5">
            {analytics.deptSummary.map((dept) => (
              <div key={dept.short} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-extrabold text-[#172033] dark:text-slate-200">{dept.name} ({dept.short})</span>
                    <span className="text-[#64748B] dark:text-slate-400 ml-2">
                      {dept.placed} of {dept.total} placed · {dept.offers} total offers
                    </span>
                  </div>
                  <span className="font-black text-[#14213D] dark:text-white text-sm">{dept.rate}%</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-[#F5F3FF] dark:bg-slate-700 overflow-hidden border border-slate-200 dark:border-slate-600">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      dept.short === "CSE" ? "bg-[#4F46E5]" : dept.short === "ECE" ? "bg-[#14B8A6]" : "bg-[#6366F1]"
                    }`}
                    style={{ width: `${dept.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Package Highlights Grid */}
          <div className="mt-8 grid grid-cols-3 gap-4 border-t border-[#E5E7EB] dark:border-slate-800 pt-6">
            <div className="rounded-2xl bg-[#D8EAFB]/40 p-4 border border-blue-100">
              <p className="text-[10px] font-bold uppercase text-[#64748B]">Highest Package</p>
              <p className="mt-1 text-xl font-black text-[#14213D] dark:text-white">
                ₹{analytics.highestPackage.toFixed(1)} LPA
              </p>
              <p className="text-[10px] text-[#4F46E5] font-bold mt-0.5">Super Dream Tier</p>
            </div>
            <div className="rounded-2xl bg-[#D9EEE4]/40 p-4 border border-emerald-100">
              <p className="text-[10px] font-bold uppercase text-[#64748B]">Average Package</p>
              <p className="mt-1 text-xl font-black text-[#065F46] dark:text-emerald-400">
                ₹{analytics.averagePackage.toFixed(1)} LPA
              </p>
              <p className="text-[10px] text-[#065F46] font-bold mt-0.5">Across All Selections</p>
            </div>
            <div className="rounded-2xl bg-[#DCD5FA]/40 p-4 border border-indigo-100">
              <p className="text-[10px] font-bold uppercase text-[#64748B]">Active Companies</p>
              <p className="mt-1 text-xl font-black text-[#3730A3] dark:text-indigo-300">
                {drives.length}
              </p>
              <p className="text-[10px] text-[#3730A3] font-bold mt-0.5">Campus Partners</p>
            </div>
          </div>
        </div>

        {/* Recruitment Funnel Widget */}
        <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#14213D]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-extrabold text-[#14213D] dark:text-white">Recruitment Funnel</h2>
            <span className="text-[11px] font-bold text-[#64748B]">Conversion Rate</span>
          </div>

          <div className="space-y-3">
            {[
              { label: "1. Registered", count: applications.length, color: "bg-[#4F46E5]" },
              {
                label: "2. Shortlisted",
                count: applications.filter((a) =>
                  ["shortlisted", "assessment_completed", "interview_in_progress", "selected", "offer_received", "joined"].includes(a.stage)
                ).length,
                color: "bg-[#6366F1]",
              },
              {
                label: "3. Assessment Cleared",
                count: applications.filter((a) =>
                  ["assessment_completed", "interview_in_progress", "selected", "offer_received", "joined"].includes(a.stage)
                ).length,
                color: "bg-[#14B8A6]",
              },
              {
                label: "4. Interviewed",
                count: applications.filter((a) =>
                  ["interview_in_progress", "selected", "offer_received", "joined"].includes(a.stage)
                ).length,
                color: "bg-amber-500",
              },
              {
                label: "5. Selected / Offers",
                count: offers.length,
                color: "bg-emerald-600",
              },
            ].map((stage) => {
              const maxCount = Math.max(applications.length, 1);
              const pct = Math.round((stage.count / maxCount) * 100);
              return (
                <div key={stage.label}>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-[#64748B] dark:text-slate-300">{stage.label}</span>
                    <span className="font-bold text-[#14213D] dark:text-white">{stage.count} ({pct}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#F5F3FF] dark:bg-slate-700 overflow-hidden border border-slate-200 dark:border-slate-600">
                    <div className={`h-full rounded-full ${stage.color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <p className="mt-6 text-[10px] text-[#64748B] dark:text-slate-400 text-center">
            Tracks candidate qualification progression from application to accepted offer.
          </p>
        </div>
      </div>

      {/* Operational Panels: At-Risk Widget + Upcoming Deadlines + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* At-Risk Widget */}
        <div className="rounded-3xl border-2 border-amber-300/70 bg-white p-6 shadow-sm dark:border-amber-500/40 dark:bg-[#14213D] lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F8DCCF] text-[#9A3412]">
                <AlertTriangle size={17} />
              </div>
              <h2 className="text-base font-extrabold text-[#14213D] dark:text-white">At-Risk Students</h2>
            </div>
            <span className="rounded-full bg-[#F8DCCF] px-2.5 py-0.5 text-[10px] font-bold text-[#9A3412]">
              {atRiskCohort.length} flagged
            </span>
          </div>
          <p className="text-[11px] text-[#64748B] dark:text-slate-400 mb-4 leading-relaxed">
            Transparent rule: Final-year unplaced students with ≥2 pending/rejected mandatory clearances or 0 drive applications.
          </p>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {atRiskCohort.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No students currently flagged as at-risk.</p>
            ) : (
              atRiskCohort.map((item) => (
                <div
                  key={item.student.id}
                  className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-3.5 dark:border-amber-900/40 dark:bg-amber-950/20 text-xs"
                >
                  <div className="flex items-center justify-between font-bold text-[#14213D] dark:text-white">
                    <span>{item.student.full_name}</span>
                    <span className="text-[10px] text-amber-700 dark:text-amber-300">{item.student.roll_number} · {item.student.department_code}</span>
                  </div>
                  <div className="mt-1.5 space-y-1">
                    {item.reasons.map((r, i) => (
                      <p key={i} className="text-[11px] text-amber-900 dark:text-amber-300/90 leading-tight">
                        • {r}
                      </p>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Recruitment Deadlines */}
        <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#14213D] lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-extrabold text-[#14213D] dark:text-white">Upcoming Deadlines</h2>
            <button
              onClick={() => onNavigate("drives")}
              className="text-xs font-bold text-[#4F46E5] dark:text-[#6366F1] hover:underline"
            >
              All Drives ↗
            </button>
          </div>

          <div className="space-y-3">
            {activeDrivesList.map((drive) => {
              const deadlineDate = new Date(drive.registration_deadline);
              const isPast = new Date() > deadlineDate;
              return (
                <div
                  key={drive.id}
                  className="flex items-center justify-between rounded-2xl border border-[#E5E7EB] bg-[#F5F3FF]/50 p-3.5 dark:border-slate-800 dark:bg-slate-800/40 text-xs"
                >
                  <div>
                    <p className="font-bold text-[#14213D] dark:text-white">{drive.company_name}</p>
                    <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">{drive.job_role} · ₹{drive.package_lpa} LPA</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-bold ${
                        isPast
                          ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                          : "bg-[#D8EAFB] text-[#14213D]"
                      }`}
                    >
                      {isPast ? "Closed" : deadlineDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                    <p className="text-[10px] text-[#64748B] dark:text-slate-400 mt-0.5 uppercase tracking-wider">{drive.tier}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Audit & System Activity */}
        <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#14213D] lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-extrabold text-[#14213D] dark:text-white">Recent System Activity</h2>
            <button
              onClick={() => onNavigate("audit")}
              className="text-xs font-bold text-[#4F46E5] dark:text-[#6366F1] hover:underline"
            >
              Audit Trail ↗
            </button>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {recentActivities.map((act) => (
              <div
                key={act.id}
                className="rounded-2xl border border-[#E5E7EB] bg-[#F5F3FF]/50 p-3 dark:border-slate-800 dark:bg-slate-800/40 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#14213D] dark:text-slate-200">{act.actor_name}</span>
                  <span className="text-[10px] text-[#64748B]">{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-1 leading-snug">{act.details}</p>
                <span className="mt-1.5 inline-block text-[9px] font-bold uppercase tracking-wider text-[#4F46E5] dark:text-[#6366F1]">
                  {act.action.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
