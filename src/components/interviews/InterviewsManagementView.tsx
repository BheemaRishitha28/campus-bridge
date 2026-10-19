import React, { useState } from "react";
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  User,
  BriefcaseBusiness,
  Building2,
  Copy,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Filter,
} from "lucide-react";
import { useStore } from "../../lib/store";
import { Interview, InterviewOutcome, InterviewMode } from "../../types/domain";

export const InterviewsManagementView: React.FC = () => {
  const {
    currentUser,
    interviews,
    drives,
    applications,
    scheduleInterview,
    updateInterviewOutcome,
    acknowledgeInterview,
    requestInterviewReschedule,
  } = useStore();

  const isAdmin = currentUser?.role === "placement_admin";

  // Filter state
  const [filterDrive, setFilterDrive] = useState<string>("all");
  const [filterMode, setFilterMode] = useState<string>("all");
  const [filterOutcome, setFilterOutcome] = useState<string>("all");

  // Modals state
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);

  // Scheduling form state
  const [selectedAppId, setSelectedAppId] = useState("");
  const [roundNumber, setRoundNumber] = useState(1);
  const [roundName, setRoundName] = useState("Round 1: Technical & DSA");
  const [scheduledDate, setScheduledDate] = useState("2026-10-25");
  const [scheduledTime, setScheduledTime] = useState("11:00");
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [mode, setMode] = useState<InterviewMode>("online");
  const [meetLink, setMeetLink] = useState("https://meet.google.com/abc-defg-hij");
  const [venue, setVenue] = useState("Placement Boardroom 101");
  const [interviewerName, setInterviewerName] = useState("Technical Hiring Panel");
  const [instructions, setInstructions] = useState("Join 5 minutes prior with camera enabled and college ID card.");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Outcome/Feedback form state
  const [outcome, setOutcome] = useState<InterviewOutcome>("cleared");
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState<number>(85);

  // Reschedule request form state
  const [rescheduleReason, setRescheduleReason] = useState("");

  // Copy link feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter interviews: If student, show only their interviews
  const visibleInterviews = interviews.filter((item) => {
    if (!isAdmin && item.student_id !== currentUser?.id) return false;
    if (filterDrive !== "all" && item.drive_id !== filterDrive) return false;
    if (filterMode !== "all" && item.mode !== filterMode) return false;
    if (filterOutcome !== "all" && item.outcome !== filterOutcome) return false;
    return true;
  });

  const handleCopyLink = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenScheduleModal = () => {
    if (applications.length > 0) {
      setSelectedAppId(applications[0].id);
    }
    setScheduleModalOpen(true);
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppId) {
      alert("Please select a student applicant.");
      return;
    }
    const app = applications.find((a) => a.id === selectedAppId);
    if (!app) return;

    setIsSubmitting(true);
    try {
      await scheduleInterview({
        application_id: app.id,
        drive_id: app.drive_id,
        company_name: app.company_name,
        job_role: app.job_role,
        student_id: app.student_id,
        student_name: app.student_name,
        student_roll: app.student_roll,
        round_number: Number(roundNumber),
        round_name: roundName,
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        duration_minutes: Number(durationMinutes),
        mode,
        meet_link: mode === "online" ? meetLink : undefined,
        venue: mode === "offline" ? venue : undefined,
        interviewer_name: interviewerName,
        instructions,
      });
      setScheduleModalOpen(false);
    } catch (err: any) {
      alert(err.message || "Failed to schedule interview.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenFeedback = (item: Interview) => {
    setSelectedInterview(item);
    setOutcome(item.outcome === "pending" ? "cleared" : item.outcome);
    setFeedback(item.feedback || "");
    setScore(item.score || 85);
    setFeedbackModalOpen(true);
  };

  const handleSaveFeedback = async () => {
    if (!selectedInterview) return;
    setIsSubmitting(true);
    try {
      await updateInterviewOutcome(selectedInterview.id, outcome, feedback, score);
      setFeedbackModalOpen(false);
      setSelectedInterview(null);
    } catch (err: any) {
      alert(err.message || "Failed to update interview outcome.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenReschedule = (item: Interview) => {
    setSelectedInterview(item);
    setRescheduleReason("Clash with University End-Semester Laboratory Examination.");
    setRescheduleModalOpen(true);
  };

  const handleConfirmReschedule = async () => {
    if (!selectedInterview) return;
    setIsSubmitting(true);
    try {
      await requestInterviewReschedule(selectedInterview.id, rescheduleReason);
      setRescheduleModalOpen(false);
      setSelectedInterview(null);
    } catch (err: any) {
      alert(err.message || "Failed to request reschedule.");
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
            <Calendar size={14} className="text-tealAccent" />
            <span>Recruitment Operations · Real-Time Video & Venue</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {isAdmin ? "Recruitment Interview Management" : "My Scheduled Interviews"}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-xl">
            {isAdmin
              ? "Schedule multi-stage technical rounds, manage live video links, record evaluation feedback, and track candidate acknowledgments."
              : "Review your upcoming technical and HR interview rounds, verify venue or Google Meet links, and acknowledge your attendance."}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenScheduleModal}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 px-5 py-3 text-xs font-extrabold text-white shadow-lg shadow-teal-500/25 hover:from-teal-600 hover:to-emerald-700 transition"
          >
            <Plus size={16} /> Schedule Interview Round
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-cbBorder bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400">
            <Filter size={14} /> Filter:
          </div>
          {isAdmin && (
            <select
              value={filterDrive}
              onChange={(e) => setFilterDrive(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs text-slate-800 outline-none focus:border-deepIndigo dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="all">All Company Drives</option>
              {drives.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.company_name} - {d.job_role}
                </option>
              ))}
            </select>
          )}

          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs text-slate-800 outline-none focus:border-deepIndigo dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="all">All Modes (Online & Offline)</option>
            <option value="online">Online (Video Meet)</option>
            <option value="offline">Offline (Campus Venue)</option>
          </select>

          <select
            value={filterOutcome}
            onChange={(e) => setFilterOutcome(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs text-slate-800 outline-none focus:border-deepIndigo dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="all">All Outcomes</option>
            <option value="pending">Pending</option>
            <option value="cleared">Cleared</option>
            <option value="rejected">Rejected</option>
            <option value="rescheduled">Rescheduled</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Showing <span className="font-bold text-slate-800 dark:text-slate-200">{visibleInterviews.length}</span> scheduled rounds
        </div>
      </div>

      {/* Interviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visibleInterviews.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 rounded-3xl border border-dashed border-cbBorder bg-white/50 dark:border-slate-800 dark:bg-slate-900/30">
            <Calendar size={40} className="mx-auto mb-3 opacity-30 text-deepIndigo" />
            <h3 className="font-bold text-slate-700 dark:text-slate-300">No Interview Rounds Scheduled</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {isAdmin
                ? "Click 'Schedule Interview Round' above to assign technical interview slots to shortlisted students."
                : "You do not have any upcoming interview rounds scheduled right now. Check back as drives progress."}
            </p>
          </div>
        ) : (
          visibleInterviews.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-3xl border border-cbBorder bg-white p-5 shadow-sm hover:shadow-md transition dark:border-slate-800 dark:bg-slate-900"
            >
              <div>
                {/* Header: Company & Round */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lavender/60 text-deepIndigo font-black dark:bg-slate-800 dark:text-indigo-400 shadow-sm">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                        {item.company_name}
                      </h3>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {item.job_role}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {item.outcome === "pending" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-calmBlue px-2.5 py-1 text-[10px] font-bold text-blue-900 dark:bg-blue-950 dark:text-blue-300">
                        <Clock size={11} /> Round Scheduled
                      </span>
                    )}
                    {item.outcome === "cleared" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-softGreen px-2.5 py-1 text-[10px] font-bold text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
                        <CheckCircle2 size={11} /> Cleared ({item.score || 90}%)
                      </span>
                    )}
                    {item.outcome === "rejected" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-softPink px-2.5 py-1 text-[10px] font-bold text-rose-900 dark:bg-rose-950 dark:text-rose-300">
                        <XCircle size={11} /> Not Selected
                      </span>
                    )}
                    {item.outcome === "rescheduled" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-pastelPeach px-2.5 py-1 text-[10px] font-bold text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                        <AlertCircle size={11} /> Rescheduled
                      </span>
                    )}
                  </div>
                </div>

                {/* Candidate & Round Pill */}
                <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/60 text-xs">
                  <div className="flex items-center gap-2">
                    <User size={15} className="text-slate-400" />
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{item.student_name}</p>
                      <p className="text-[10px] text-slate-400">{item.student_roll}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="rounded-lg bg-white px-2 py-1 text-[10px] font-bold text-deepIndigo shadow-xs dark:bg-slate-700 dark:text-indigo-300">
                      {item.round_name}
                    </span>
                  </div>
                </div>

                {/* Schedule Info */}
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Calendar size={15} className="text-deepIndigo" />
                    <span className="font-medium">
                      {new Date(item.scheduled_date).toLocaleDateString("en-IN", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Clock size={15} className="text-deepIndigo" />
                    <span className="font-medium">
                      {item.scheduled_time} ({item.duration_minutes} mins)
                    </span>
                  </div>
                </div>

                {/* Mode & Venue / Link */}
                <div className="mt-3 rounded-2xl border border-slate-100 bg-white p-3 text-xs dark:border-slate-800 dark:bg-slate-800/30">
                  {item.mode === "online" ? (
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Video size={16} className="text-blue-600 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 dark:text-slate-200">Online Video Call</p>
                          <p className="text-[11px] text-slate-400 truncate">{item.meet_link || "Google Meet Link"}</p>
                        </div>
                      </div>

                      {item.meet_link && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleCopyLink(item.meet_link!, item.id)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                            title="Copy Meet Link"
                          >
                            <Copy size={13} className={copiedId === item.id ? "text-emerald-500" : ""} />
                          </button>
                          <a
                            href={item.meet_link}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 rounded-xl bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 transition"
                          >
                            Join <ExternalLink size={11} />
                          </a>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-emerald-600 shrink-0" />
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">Campus Boardroom / Offline</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.venue || "Placement Cell"}</p>
                      </div>
                    </div>
                  )}

                  {item.interviewer_name && (
                    <p className="mt-2 text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-1.5">
                      Interviewer: <span className="font-semibold text-slate-700 dark:text-slate-300">{item.interviewer_name}</span>
                    </p>
                  )}
                </div>

                {/* Instructions */}
                {item.instructions && (
                  <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 italic">
                    "{item.instructions}"
                  </p>
                )}

                {/* Interviewer Feedback if present */}
                {item.feedback && (
                  <div className="mt-3 rounded-2xl bg-lavender/30 p-3 text-xs dark:bg-slate-800/80">
                    <p className="font-bold text-deepIndigo dark:text-indigo-300 flex items-center gap-1">
                      <MessageSquare size={13} /> Evaluator Notes:
                    </p>
                    <p className="mt-1 text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                      {item.feedback}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                {/* Student acknowledgment state */}
                <div className="text-[11px]">
                  {item.student_acknowledgment === "acknowledged" ? (
                    <span className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 size={13} /> Student Confirmed Attendance
                    </span>
                  ) : item.student_acknowledgment === "reschedule_requested" ? (
                    <span className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                      <AlertCircle size={13} /> Reschedule Requested
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock size={13} /> Awaiting Confirmation
                    </span>
                  )}
                </div>

                {/* Actions per role */}
                <div className="flex items-center gap-2">
                  {isAdmin ? (
                    <button
                      onClick={() => handleOpenFeedback(item)}
                      className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800 dark:bg-deepIndigo dark:hover:bg-indigo-600 transition"
                    >
                      Record Feedback & Score
                    </button>
                  ) : (
                    <>
                      {item.student_acknowledgment === "pending" && (
                        <>
                          <button
                            onClick={() => acknowledgeInterview(item.id)}
                            className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
                          >
                            Confirm Attendance
                          </button>
                          <button
                            onClick={() => handleOpenReschedule(item)}
                            className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition"
                          >
                            Reschedule
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Schedule Modal (Faculty/Admin) */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-cbBorder bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Schedule Candidate Interview Round
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Notify candidate via university push notification with video link and preparation requirements.
            </p>

            <form onSubmit={handleSaveSchedule} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Candidate Application
                </label>
                <select
                  value={selectedAppId}
                  onChange={(e) => setSelectedAppId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-deepIndigo dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {applications.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.student_name} ({app.student_roll}) — {app.company_name} ({app.job_role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Round Number
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={roundNumber}
                    onChange={(e) => setRoundNumber(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-deepIndigo dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Round Title
                  </label>
                  <input
                    type="text"
                    value={roundName}
                    onChange={(e) => setRoundName(e.target.value)}
                    placeholder="e.g. Technical Round 1"
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-deepIndigo dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-deepIndigo dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-deepIndigo dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Duration (mins)
                  </label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-deepIndigo dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Interview Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMode("online")}
                    className={`rounded-xl border p-2.5 font-bold transition text-center ${
                      mode === "online"
                        ? "border-deepIndigo bg-deepIndigo/10 text-deepIndigo dark:text-indigo-300"
                        : "border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800"
                    }`}
                  >
                    Online Video Meet
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("offline")}
                    className={`rounded-xl border p-2.5 font-bold transition text-center ${
                      mode === "offline"
                        ? "border-deepIndigo bg-deepIndigo/10 text-deepIndigo dark:text-indigo-300"
                        : "border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800"
                    }`}
                  >
                    Campus Boardroom
                  </button>
                </div>
              </div>

              {mode === "online" ? (
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Video Meeting URL (Google Meet / MS Teams / Zoom)
                  </label>
                  <input
                    type="url"
                    value={meetLink}
                    onChange={(e) => setMeetLink(e.target.value)}
                    placeholder="https://meet.google.com/..."
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-deepIndigo dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              ) : (
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Campus Venue & Room
                  </label>
                  <input
                    type="text"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="Boardroom A-201, T&P Building"
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-deepIndigo dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Interviewer / Panel Name
                </label>
                <input
                  type="text"
                  value={interviewerName}
                  onChange={(e) => setInterviewerName(e.target.value)}
                  placeholder="e.g. Lead SDE Panel"
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-deepIndigo dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Preparation Instructions for Student
                </label>
                <textarea
                  rows={2}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-800 outline-none focus:border-deepIndigo dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setScheduleModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-deepIndigo px-5 py-2 font-bold text-white hover:bg-indigo-600 transition"
                >
                  {isSubmitting ? "Dispatching..." : "Confirm & Notify Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Feedback & Score Modal (Faculty) */}
      {feedbackModalOpen && selectedInterview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-cbBorder bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Evaluation & Outcome
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {selectedInterview.student_name} ({selectedInterview.student_roll}) — {selectedInterview.company_name}
            </p>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Interview Round Outcome
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setOutcome("cleared")}
                    className={`rounded-xl border p-2 font-bold transition text-center ${
                      outcome === "cleared"
                        ? "border-emerald-600 bg-emerald-50 text-emerald-800 dark:border-emerald-500 dark:bg-emerald-950/60 dark:text-emerald-300"
                        : "border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400"
                    }`}
                  >
                    Cleared
                  </button>
                  <button
                    type="button"
                    onClick={() => setOutcome("rejected")}
                    className={`rounded-xl border p-2 font-bold transition text-center ${
                      outcome === "rejected"
                        ? "border-rose-600 bg-rose-50 text-rose-800 dark:border-rose-500 dark:bg-rose-950/60 dark:text-rose-300"
                        : "border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400"
                    }`}
                  >
                    Rejected
                  </button>
                  <button
                    type="button"
                    onClick={() => setOutcome("absent")}
                    className={`rounded-xl border p-2 font-bold transition text-center ${
                      outcome === "absent"
                        ? "border-amber-600 bg-amber-50 text-amber-800 dark:border-amber-500 dark:bg-amber-950/60 dark:text-amber-300"
                        : "border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400"
                    }`}
                  >
                    Candidate Absent
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Technical Score (out of 100)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={score}
                  onChange={(e) => setScore(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-deepIndigo dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Interviewer Feedback Notes
                </label>
                <textarea
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Record strengths, DSA problem solving approach, communication, and recommendation..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-deepIndigo dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFeedbackModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSaveFeedback}
                  className="rounded-xl bg-slate-900 px-5 py-2 font-bold text-white hover:bg-slate-800 dark:bg-deepIndigo dark:hover:bg-indigo-600 transition"
                >
                  {isSubmitting ? "Saving..." : "Save Outcome"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal (Student) */}
      {rescheduleModalOpen && selectedInterview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-cbBorder bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Request Interview Slot Reschedule
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Submit your genuine reason to the Placement Cell. Slots will be adjusted subject to recruiter availability.
            </p>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Rescheduling
                </label>
                <textarea
                  rows={3}
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  placeholder="Specify examination schedule, emergency, or overlapping university drive..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 outline-none focus:border-deepIndigo dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRescheduleModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirmReschedule}
                  className="rounded-xl bg-amber-600 px-5 py-2 font-bold text-white hover:bg-amber-700 transition"
                >
                  {isSubmitting ? "Submitting..." : "Submit Reschedule Request"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
