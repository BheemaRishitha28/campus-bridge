import React, { useState, useMemo } from "react";
import {
  Layers,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Award,
  ChevronRight,
  Download,
  Calendar,
  Building2,
  ExternalLink,
  ArrowRight,
  TrendingUp,
  User,
  FileText,
  Briefcase,
  Sparkles,
} from "lucide-react";
import { useStore } from "../../lib/store";
import { Application, ApplicationStage, DriveTier } from "../../types/domain";

interface ApplicationsPipelineViewProps {
  onNavigate?: (tab: string) => void;
}

const STAGE_ORDER: ApplicationStage[] = [
  "registered",
  "eligibility_verified",
  "shortlisted",
  "assessment_completed",
  "interview_in_progress",
  "selected",
  "offer_received",
];

const STAGE_LABELS: Record<ApplicationStage, string> = {
  registered: "Application Submitted",
  eligibility_verified: "Eligibility Verified",
  shortlisted: "Resume Shortlisted",
  assessment_completed: "Assessment Cleared",
  interview_in_progress: "Interview In Progress",
  selected: "Final Round Selected",
  offer_received: "Offer Extended",
  joined: "Offer Accepted & Joined",
  rejected: "Not Selected",
  withdrawn: "Application Withdrawn",
};

export const ApplicationsPipelineView: React.FC<ApplicationsPipelineViewProps> = ({ onNavigate }) => {
  const {
    currentUser,
    applications,
    drives,
    interviews,
    offers,
    students,
    updateApplicationStage,
    issueOffer,
  } = useStore();

  const isStaff = currentUser?.role === "placement_admin" || currentUser?.role === "faculty";

  // Filter states
  const [selectedDriveId, setSelectedDriveId] = useState<string>("all");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal states for staff
  const [selectedAppForStage, setSelectedAppForStage] = useState<Application | null>(null);
  const [newStage, setNewStage] = useState<ApplicationStage>("shortlisted");
  const [stageNote, setStageNote] = useState<string>("");
  const [offerReference, setOfferReference] = useState<string>("");
  const [offerPackage, setOfferPackage] = useState<number>(10);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Student specific or staff specific filtered applications
  const visibleApplications = useMemo(() => {
    let list = applications;

    if (!isStaff && currentUser) {
      // Filter for this student only
      list = list.filter((app) => app.student_id === currentUser.id);
    }

    if (selectedDriveId !== "all") {
      list = list.filter((app) => app.drive_id === selectedDriveId);
    }

    if (stageFilter !== "all") {
      list = list.filter((app) => app.stage === stageFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (app) =>
          app.company_name.toLowerCase().includes(q) ||
          app.job_role.toLowerCase().includes(q) ||
          app.student_name.toLowerCase().includes(q) ||
          app.student_roll.toLowerCase().includes(q)
      );
    }

    return list;
  }, [applications, isStaff, currentUser, selectedDriveId, stageFilter, searchQuery]);

  // Summary counts for current scope
  const stats = useMemo(() => {
    const userApps = !isStaff && currentUser
      ? applications.filter((a) => a.student_id === currentUser.id)
      : applications;

    const total = userApps.length;
    const inProgress = userApps.filter(
      (a) =>
        a.stage === "registered" ||
        a.stage === "eligibility_verified" ||
        a.stage === "shortlisted" ||
        a.stage === "assessment_completed" ||
        a.stage === "interview_in_progress"
    ).length;
    const interviewCount = userApps.filter(
      (a) => a.stage === "interview_in_progress" || a.stage === "selected"
    ).length;
    const offersCount = userApps.filter(
      (a) => a.stage === "offer_received" || a.stage === "joined"
    ).length;
    const rejectedCount = userApps.filter((a) => a.stage === "rejected").length;

    return { total, inProgress, interviewCount, offersCount, rejectedCount };
  }, [applications, isStaff, currentUser]);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setFeedbackToast({ message, type });
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  const handleStageTransitionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppForStage) return;

    setIsUpdating(true);
    try {
      if (newStage === "offer_received") {
        // Issue official offer
        await issueOffer(selectedAppForStage.id, {
          offer_reference: offerReference || `OFFER-${selectedAppForStage.company_name.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
          package_lpa: offerPackage || selectedAppForStage.package_lpa,
          offer_date: new Date().toISOString().split("T")[0],
        });
        showToast(`Official Offer extended to ${selectedAppForStage.student_name} (${selectedAppForStage.student_roll})`);
      } else {
        await updateApplicationStage(selectedAppForStage.id, newStage, stageNote);
        showToast(`Candidate stage moved to "${STAGE_LABELS[newStage]}"`);
      }
      setSelectedAppForStage(null);
      setStageNote("");
    } catch (err: any) {
      showToast(err.message || "Failed to update stage", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "Application ID",
      "Student Name",
      "Roll Number",
      "Company",
      "Role",
      "Package LPA",
      "Tier",
      "Stage",
      "Applied Date",
      "Eligibility Note",
    ];

    const rows = visibleApplications.map((app) => [
      app.id,
      `"${app.student_name}"`,
      app.student_roll,
      `"${app.company_name}"`,
      `"${app.job_role}"`,
      app.package_lpa,
      app.tier,
      app.stage,
      app.applied_at.split("T")[0],
      `"${app.eligibility_note || ""}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `campusbridge_applications_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Exported candidate pipeline to CSV");
  };

  const getTierColor = (tier: DriveTier) => {
    switch (tier) {
      case "super_dream":
        return "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800";
      case "dream":
        return "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800";
      default:
        return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800";
    }
  };

  const getStageBadge = (stage: ApplicationStage) => {
    switch (stage) {
      case "offer_received":
      case "joined":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <Award size={13} /> {STAGE_LABELS[stage]}
          </span>
        );
      case "interview_in_progress":
      case "selected":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-2.5 py-1 text-[11px] font-bold text-purple-800 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <Clock size={13} /> {STAGE_LABELS[stage]}
          </span>
        );
      case "shortlisted":
      case "assessment_completed":
      case "eligibility_verified":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-2.5 py-1 text-[11px] font-bold text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            <CheckCircle2 size={13} /> {STAGE_LABELS[stage]}
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-2.5 py-1 text-[11px] font-bold text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <XCircle size={13} /> {STAGE_LABELS[stage]}
          </span>
        );
      case "withdrawn":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <AlertCircle size={13} /> Withdrawn
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Clock size={13} /> Application Submitted
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {feedbackToast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl p-4 shadow-2xl transition-all border ${
            feedbackToast.type === "success"
              ? "bg-emerald-600 text-white border-emerald-400"
              : "bg-rose-600 text-white border-rose-400"
          }`}
        >
          {feedbackToast.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span className="text-xs font-bold">{feedbackToast.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="rounded-3xl border border-[#E5E7EB] dark:border-slate-800 bg-gradient-to-r from-[#14213D] via-[#26334A] to-[#14213D] p-6 lg:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/20 px-3 py-1 text-[11px] font-bold text-[#DCD5FA] backdrop-blur-md mb-3 border border-indigo-500/30">
              <Layers size={13} />
              <span>{isStaff ? "Institutional Recruitment Operations" : "Candidate Career Tracker"}</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
              {isStaff ? "Applications & Recruitment Pipeline" : "My Placement Applications"}
            </h1>
            <p className="mt-1 text-xs lg:text-sm text-slate-300 max-w-2xl">
              {isStaff
                ? "Track applicants through verified eligibility, technical assessments, interviews, and offer release with transparent audit trails."
                : "Real-time visibility into your recruitment milestones, assessment schedules, interview invitations, and official offers."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isStaff ? (
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2.5 text-xs font-bold text-white transition backdrop-blur-sm"
              >
                <Download size={15} /> Export Pipeline CSV
              </button>
            ) : (
              <button
                onClick={() => onNavigate && onNavigate("drives")}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#6366F1] px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition"
              >
                <Briefcase size={15} /> Explore Campus Drives
              </button>
            )}
          </div>
        </div>

        {/* Stats Strip */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-700/60">
          <div className="rounded-2xl bg-white/5 border border-white/10 p-3 backdrop-blur-sm">
            <span className="text-[11px] font-medium text-slate-300">Total Applications</span>
            <p className="text-xl font-extrabold text-white mt-0.5">{stats.total}</p>
          </div>
          <div className="rounded-2xl bg-white/5 border border-white/10 p-3 backdrop-blur-sm">
            <span className="text-[11px] font-medium text-indigo-300">In Active Pipeline</span>
            <p className="text-xl font-extrabold text-indigo-200 mt-0.5">{stats.inProgress}</p>
          </div>
          <div className="rounded-2xl bg-white/5 border border-white/10 p-3 backdrop-blur-sm">
            <span className="text-[11px] font-medium text-purple-300">Interview Stage</span>
            <p className="text-xl font-extrabold text-purple-200 mt-0.5">{stats.interviewCount}</p>
          </div>
          <div className="rounded-2xl bg-white/5 border border-white/10 p-3 backdrop-blur-sm">
            <span className="text-[11px] font-medium text-emerald-300">Offers Extended</span>
            <p className="text-xl font-extrabold text-emerald-200 mt-0.5">{stats.offersCount}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="rounded-2xl border border-[#E5E7EB] dark:border-slate-800 bg-white dark:bg-[#14213D] p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={isStaff ? "Search by student name, roll number, or company..." : "Search by company name or role..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-[#F5F3FF]/50 dark:bg-[#26334A]/50 pl-10 pr-4 py-2 text-xs font-medium text-[#172033] dark:text-slate-100 placeholder-slate-400 focus:border-[#4F46E5] focus:outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Drive Selector */}
          <select
            value={selectedDriveId}
            onChange={(e) => setSelectedDriveId(e.target.value)}
            className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-[#26334A] px-3 py-2 text-xs font-semibold text-[#172033] dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Company Drives</option>
            {drives.map((d) => (
              <option key={d.id} value={d.id}>
                {d.company_name} - {d.job_role}
              </option>
            ))}
          </select>

          {/* Stage Selector */}
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-[#26334A] px-3 py-2 text-xs font-semibold text-[#172033] dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Stages</option>
            <option value="registered">Registered</option>
            <option value="eligibility_verified">Eligibility Verified</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="assessment_completed">Assessment Cleared</option>
            <option value="interview_in_progress">Interviewing</option>
            <option value="selected">Selected</option>
            <option value="offer_received">Offer Extended</option>
            <option value="joined">Joined</option>
            <option value="rejected">Rejected</option>
          </select>

          {(selectedDriveId !== "all" || stageFilter !== "all" || searchQuery) && (
            <button
              onClick={() => {
                setSelectedDriveId("all");
                setStageFilter("all");
                setSearchQuery("");
              }}
              className="rounded-xl bg-[#F5F3FF] dark:bg-[#26334A] px-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Main Applications Content */}
      {visibleApplications.length === 0 ? (
        <div className="rounded-3xl border border-[#E5E7EB] dark:border-slate-800 bg-white dark:bg-[#14213D] p-12 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-[#4F46E5]">
            <Layers size={28} />
          </div>
          <h3 className="mt-4 text-base font-extrabold text-[#172033] dark:text-white">
            No Applications Found
          </h3>
          <p className="mt-1 text-xs text-[#64748B] dark:text-slate-400 max-w-sm mx-auto">
            {isStaff
              ? "No applicants match the current drive or stage filter criteria."
              : "You have not submitted applications matching this criteria yet. Browse active recruitment drives to apply!"}
          </p>
          {!isStaff && (
            <button
              onClick={() => onNavigate && onNavigate("drives")}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#4F46E5] px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition"
            >
              <Briefcase size={14} /> Browse Active Drives
            </button>
          )}
        </div>
      ) : isStaff ? (
        /* STAFF PIPELINE TABLE */
        <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] dark:border-slate-800 bg-white dark:bg-[#14213D] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#E5E7EB] dark:border-slate-800 bg-[#F5F3FF]/70 dark:bg-[#26334A]/50 font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3.5">Candidate</th>
                  <th className="px-5 py-3.5">Company & Role</th>
                  <th className="px-5 py-3.5">Package & Tier</th>
                  <th className="px-5 py-3.5">Current Stage</th>
                  <th className="px-5 py-3.5">Applied Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] dark:divide-slate-800">
                {visibleApplications.map((app) => {
                  const student = students.find((s) => s.id === app.student_id);
                  const linkedOffer = offers.find((o) => o.application_id === app.id);
                  const linkedInterviews = interviews.filter(
                    (i) => i.student_id === app.student_id && i.drive_id === app.drive_id
                  );

                  return (
                    <tr
                      key={app.id}
                      className="hover:bg-[#F5F3FF]/40 dark:hover:bg-[#26334A]/30 transition"
                    >
                      {/* Candidate Column */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#4F46E5] to-[#6366F1] text-white font-extrabold text-xs shadow-sm">
                            {app.student_name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-extrabold text-[#172033] dark:text-white">
                              {app.student_name}
                            </p>
                            <p className="text-[11px] text-[#64748B] dark:text-slate-400 font-mono">
                              {app.student_roll}
                            </p>
                            {student && (
                              <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500 font-medium">
                                <span>CGPA: <strong>{student.cgpa}</strong></span>
                                <span>•</span>
                                <span>Backlogs: <strong>{student.backlogs}</strong></span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Company & Role */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Building2 size={15} className="text-[#4F46E5] shrink-0" />
                          <span className="font-extrabold text-[#172033] dark:text-white">
                            {app.company_name}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">
                          {app.job_role}
                        </p>
                      </td>

                      {/* Package & Tier */}
                      <td className="px-5 py-4">
                        <span className="font-extrabold text-[#172033] dark:text-white">
                          ₹{app.package_lpa} LPA
                        </span>
                        <div className="mt-1">
                          <span
                            className={`rounded-md border px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${getTierColor(
                              app.tier
                            )}`}
                          >
                            {app.tier.replace("_", " ")}
                          </span>
                        </div>
                      </td>

                      {/* Current Stage */}
                      <td className="px-5 py-4">
                        {getStageBadge(app.stage)}
                        {app.eligibility_note && (
                          <p className="text-[10px] text-slate-400 mt-1 max-w-xs truncate">
                            {app.eligibility_note}
                          </p>
                        )}
                        {linkedInterviews.length > 0 && (
                          <p className="text-[10px] text-purple-600 dark:text-purple-400 font-medium mt-1 flex items-center gap-1">
                            <Calendar size={11} /> {linkedInterviews.length} round(s) scheduled
                          </p>
                        )}
                      </td>

                      {/* Applied Date */}
                      <td className="px-5 py-4 text-slate-500 dark:text-slate-400 font-medium">
                        {app.applied_at.split("T")[0]}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedAppForStage(app);
                              setNewStage(app.stage);
                              setStageNote(app.eligibility_note || "");
                              setOfferPackage(app.package_lpa);
                              setOfferReference(`OFFER-${app.company_name.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#4F46E5] hover:bg-indigo-700 text-white px-3 py-1.5 text-xs font-bold shadow-sm transition"
                          >
                            <TrendingUp size={13} /> Update Stage
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* STUDENT PIPELINE CARDS */
        <div className="space-y-4">
          {visibleApplications.map((app) => {
            const linkedOffer = offers.find((o) => o.application_id === app.id);
            const linkedInterviews = interviews.filter(
              (i) => i.student_id === app.student_id && i.drive_id === app.drive_id
            );

            // Determine active step index (0 to 4)
            let currentStepIdx = 0;
            if (app.stage === "registered") currentStepIdx = 0;
            else if (app.stage === "eligibility_verified" || app.stage === "shortlisted") currentStepIdx = 1;
            else if (app.stage === "assessment_completed") currentStepIdx = 2;
            else if (app.stage === "interview_in_progress" || app.stage === "selected") currentStepIdx = 3;
            else if (app.stage === "offer_received" || app.stage === "joined") currentStepIdx = 4;

            const isRejected = app.stage === "rejected";
            const isWithdrawn = app.stage === "withdrawn";

            return (
              <div
                key={app.id}
                className="rounded-3xl border border-[#E5E7EB] dark:border-slate-800 bg-white dark:bg-[#14213D] p-6 shadow-sm hover:shadow-md transition"
              >
                {/* Top Row: Company, Role, Tier, Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] dark:border-slate-800 pb-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F5F3FF] dark:bg-[#26334A] border border-[#DCD5FA] dark:border-slate-700 text-[#4F46E5] shrink-0">
                      <Building2 size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-extrabold text-[#172033] dark:text-white">
                          {app.company_name}
                        </h3>
                        <span
                          className={`rounded-md border px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${getTierColor(
                            app.tier
                          )}`}
                        >
                          {app.tier.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[#64748B] dark:text-slate-400 mt-0.5">
                        {app.job_role} • Package: <span className="text-[#172033] dark:text-white font-bold">₹{app.package_lpa} LPA</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStageBadge(app.stage)}
                  </div>
                </div>

                {/* Progress Stepper for Student */}
                {!isRejected && !isWithdrawn && (
                  <div className="py-6 px-2">
                    <div className="relative">
                      {/* Line connector */}
                      <div className="absolute top-4 left-6 right-6 h-1 bg-[#E5E7EB] dark:bg-slate-800 -z-0">
                        <div
                          className="h-full bg-gradient-to-r from-[#4F46E5] to-[#6366F1] transition-all duration-500"
                          style={{ width: `${(currentStepIdx / 4) * 100}%` }}
                        />
                      </div>

                      {/* 5 Step Icons */}
                      <div className="relative z-10 flex justify-between">
                        {[
                          { title: "Registered", desc: "Submitted" },
                          { title: "Shortlisted", desc: "Criteria Verified" },
                          { title: "Assessment", desc: "Aptitude / Coding" },
                          { title: "Interviews", desc: "Technical & HR" },
                          { title: "Offer Extended", desc: "Final Selection" },
                        ].map((step, idx) => {
                          const isDone = idx < currentStepIdx;
                          const isCurrent = idx === currentStepIdx;

                          return (
                            <div key={idx} className="flex flex-col items-center text-center max-w-[80px]">
                              <div
                                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                                  isDone
                                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                                    : isCurrent
                                    ? "bg-[#4F46E5] text-white ring-4 ring-indigo-100 dark:ring-indigo-950 shadow-md shadow-indigo-500/30"
                                    : "bg-white dark:bg-[#26334A] border-2 border-slate-300 dark:border-slate-700 text-slate-400"
                                }`}
                              >
                                {isDone ? <CheckCircle2 size={16} /> : idx + 1}
                              </div>
                              <span
                                className={`mt-2 text-[11px] font-bold ${
                                  isCurrent
                                    ? "text-[#4F46E5] dark:text-[#6366F1]"
                                    : isDone
                                    ? "text-[#172033] dark:text-white"
                                    : "text-slate-400"
                                }`}
                              >
                                {step.title}
                              </span>
                              <span className="text-[9px] text-slate-400 hidden sm:block">
                                {step.desc}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Additional Info Cards (Interviews / Offers / Feedback) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4 border-t border-[#E5E7EB] dark:border-slate-800 text-xs">
                  {/* Feedback / Stage Note */}
                  <div className="rounded-2xl bg-[#F5F3FF]/70 dark:bg-[#26334A]/50 p-3.5 border border-[#DCD5FA]/60 dark:border-slate-700/60">
                    <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold mb-1">
                      <Sparkles size={14} />
                      <span>Placement Cell Note & Feedback</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                      {app.eligibility_note ||
                        "Your application has been received and is being processed in according with the institutional recruitment criteria."}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-2 font-mono">
                      Applied on: {app.applied_at.split("T")[0]}
                    </p>
                  </div>

                  {/* Scheduled Interviews or Offer Card */}
                  <div className="rounded-2xl bg-[#F5F3FF]/70 dark:bg-[#26334A]/50 p-3.5 border border-[#DCD5FA]/60 dark:border-slate-700/60 flex flex-col justify-between">
                    {linkedOffer ? (
                      <div>
                        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold mb-1">
                          <Award size={14} />
                          <span>Formal Offer Extended!</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                          Congratulations! Ref: <strong className="font-mono">{linkedOffer.offer_reference}</strong> • Package: <strong>₹{linkedOffer.package_lpa} LPA</strong>
                        </p>
                        <button
                          onClick={() => onNavigate && onNavigate("offers")}
                          className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[#4F46E5] dark:text-[#6366F1] hover:underline"
                        >
                          View Formal Offer Letter & Accept <ArrowRight size={13} />
                        </button>
                      </div>
                    ) : linkedInterviews.length > 0 ? (
                      <div>
                        <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400 font-bold mb-1">
                          <Calendar size={14} />
                          <span>Interview Scheduled</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                          Round: <strong>{linkedInterviews[0].round_name}</strong> on{" "}
                          <strong>{linkedInterviews[0].scheduled_date} at {linkedInterviews[0].scheduled_time}</strong> ({linkedInterviews[0].mode})
                        </p>
                        <button
                          onClick={() => onNavigate && onNavigate("interviews")}
                          className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[#4F46E5] dark:text-[#6366F1] hover:underline"
                        >
                          View Meeting Instructions & Acknowledge <ArrowRight size={13} />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold mb-1">
                          <Clock size={14} />
                          <span>Next Round Timeline</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                          Shortlisted candidates will receive interview slot notifications directly via email and in-app alerts.
                        </p>
                        <span className="text-[10px] text-slate-400 mt-2 block font-medium">
                          Status: Active in recruitment consideration
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Staff Stage Transition Modal */}
      {selectedAppForStage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl border border-[#E5E7EB] dark:border-slate-800 bg-white dark:bg-[#14213D] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-[#4F46E5]">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#172033] dark:text-white">
                    Advance Recruitment Stage
                  </h3>
                  <p className="text-xs text-[#64748B] dark:text-slate-400">
                    {selectedAppForStage.student_name} ({selectedAppForStage.student_roll})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAppForStage(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <XCircle size={18} />
              </button>
            </div>

            <form onSubmit={handleStageTransitionSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#172033] dark:text-slate-200 mb-1.5">
                  Select Target Pipeline Stage *
                </label>
                <select
                  value={newStage}
                  onChange={(e) => setNewStage(e.target.value as ApplicationStage)}
                  className="w-full rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-[#26334A] px-3.5 py-2.5 text-xs font-semibold text-[#172033] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                >
                  <option value="registered">Registered</option>
                  <option value="eligibility_verified">Eligibility Verified</option>
                  <option value="shortlisted">Resume Shortlisted</option>
                  <option value="assessment_completed">Assessment Cleared</option>
                  <option value="interview_in_progress">Interview In Progress</option>
                  <option value="selected">Final Round Selected</option>
                  <option value="offer_received">Offer Extended (Release Formal Offer)</option>
                  <option value="rejected">Not Selected (Reject Candidate)</option>
                </select>
              </div>

              {/* If Target stage is Offer Received, collect package and offer reference */}
              {newStage === "offer_received" && (
                <div className="space-y-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 p-4">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                    <Award size={15} />
                    <span>Official Offer Details</span>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-900 dark:text-emerald-200 mb-1">
                      Offer Reference Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={offerReference}
                      onChange={(e) => setOfferReference(e.target.value)}
                      placeholder="e.g. OFFER-MSFT-2026-892"
                      className="w-full rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-[#14213D] px-3 py-2 text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-900 dark:text-emerald-200 mb-1">
                      Package (LPA) *
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      required
                      value={offerPackage}
                      onChange={(e) => setOfferPackage(parseFloat(e.target.value) || 0)}
                      className="w-full rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-[#14213D] px-3 py-2 text-xs font-bold"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#172033] dark:text-slate-200 mb-1.5">
                  Evaluation Note / Feedback for Candidate
                </label>
                <textarea
                  rows={3}
                  value={stageNote}
                  onChange={(e) => setStageNote(e.target.value)}
                  placeholder="e.g. Cleared round 2 with strong DSA score. Recommended for Technical Manager interview."
                  className="w-full rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-[#F5F3FF]/40 dark:bg-[#26334A]/50 p-3 text-xs text-[#172033] dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E7EB] dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedAppForStage(null)}
                  className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="rounded-xl bg-[#4F46E5] hover:bg-indigo-700 text-white px-5 py-2 text-xs font-bold shadow-md shadow-indigo-600/30 disabled:opacity-50"
                >
                  {isUpdating ? "Updating..." : "Confirm Stage Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
