import React, { useState } from "react";
import {
  User,
  GraduationCap,
  Mail,
  Phone,
  FileText,
  Linkedin,
  Github,
  Edit3,
  ShieldCheck,
  Clock,
  XCircle,
  CheckCircle2,
  AlertCircle,
  Upload,
  ExternalLink,
  Award,
  Layers,
  Sparkles,
} from "lucide-react";
import { useStore } from "../../lib/store";
import { Profile } from "../../types/domain";

interface StudentProfileViewProps {
  onNavigate?: (tab: string) => void;
}

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({ onNavigate }) => {
  const { currentUser, verificationRequests, submitVerificationRequest, updateStudentProfile } = useStore();
  const student = currentUser as Profile;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [phone, setPhone] = useState(student?.phone || "+91 97654 32109");
  const [bio, setBio] = useState(student?.bio || "Final year engineering student aspiring for software engineering roles.");
  const [skills, setSkills] = useState((student?.skills || ["React", "TypeScript", "Node.js", "SQL"]).join(", "));
  const [resumeUrl, setResumeUrl] = useState(student?.resume_url || "https://campusbridge.edu/resumes/my_resume.pdf");
  const [linkedinUrl, setLinkedinUrl] = useState(student?.linkedin_url || "https://linkedin.com/in/student");
  const [githubUrl, setGithubUrl] = useState(student?.github_url || "https://github.com/student");
  const [isSaving, setIsSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; success: boolean } | null>(null);

  // Re-verification upload state
  const [reverifyOpen, setReverifyOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState("smart_card_id.jpg");
  const [isReverifying, setIsReverifying] = useState(false);

  if (!student) return null;

  // Student's verification request
  const myVerification = verificationRequests.find(
    (v) => v.roll_or_emp_id.toLowerCase() === student.roll_number.toLowerCase() || v.university_email.toLowerCase() === student.university_email.toLowerCase()
  );

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateStudentProfile(student.id, {
        phone: phone.trim(),
        bio: bio.trim(),
        skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
        resume_url: resumeUrl.trim(),
        linkedin_url: linkedinUrl.trim(),
        github_url: githubUrl.trim(),
      });
      setToastMsg({ text: "Profile contact details and credentials updated successfully!", success: true });
      setIsEditModalOpen(false);
    } catch (err: any) {
      setToastMsg({ text: err.message || "Failed to update profile", success: false });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReverifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsReverifying(true);
    try {
      await submitVerificationRequest({
        user_id: student.id,
        type: "student",
        full_name: student.full_name,
        university_email: student.university_email,
        roll_or_emp_id: student.roll_number,
        department_code: student.department_code,
        program: student.program,
        year_of_study: student.year_of_study,
        cgpa: student.cgpa,
        id_card_url: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&q=80",
      });
      setToastMsg({ text: "Institutional smart card submitted for administrative verification!", success: true });
      setReverifyOpen(false);
    } catch (err: any) {
      setToastMsg({ text: err.message || "Failed to submit verification", success: false });
    } finally {
      setIsReverifying(false);
    }
  };

  const isVerified = myVerification ? myVerification.status === "approved" : true;

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
            <User size={14} className="text-[#14B8A6]" />
            <span>Student Dossier · Profile & College Credentials</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {student.full_name}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-xl">
            {student.program} · Roll No: {student.roll_number} · Department of {student.department_code}
          </p>
        </div>

        <button
          onClick={() => setIsEditModalOpen(true)}
          className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#4F46E5] to-[#6366F1] px-5 py-3 text-xs font-extrabold text-white shadow-lg shadow-indigo-600/30 hover:from-indigo-600 hover:to-indigo-700 transition"
        >
          <Edit3 size={15} /> Edit Contact & Skills
        </button>
      </div>

      {/* Two Column Layout: Identity Card + Academic Standing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Smart Card & Verification */}
        <div className="lg:col-span-1 space-y-5">
          {/* Virtual University Smart Card */}
          <div className="rounded-3xl border border-[#E5E7EB] bg-gradient-to-br from-white via-[#F5F3FF] to-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3 mb-4">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#4F46E5]">
                University Smart Card ID
              </span>
              <span className="rounded-full bg-[#DCD5FA] px-2.5 py-0.5 text-[10px] font-extrabold text-[#3730A3]">
                Class of {student.graduation_year}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#4F46E5] text-white text-xl font-black shadow-md">
                {student.full_name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#172033] dark:text-white">
                  {student.full_name}
                </h3>
                <p className="text-xs font-mono font-bold text-[#4F46E5]">
                  {student.roll_number}
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  {student.department_code} · Section {student.section}
                </p>
              </div>
            </div>

            {/* Verification Status Pill */}
            <div className="mt-5 rounded-2xl bg-white dark:bg-slate-800/80 p-3.5 border border-[#E5E7EB] dark:border-slate-700">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-500">Identity Status</span>
                {isVerified ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 bg-[#D9EEE4] px-2.5 py-0.5 rounded-full">
                    <ShieldCheck size={12} /> Institutional Verified
                  </span>
                ) : myVerification?.status === "rejected" ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-rose-700 bg-[#F7DCE8] px-2.5 py-0.5 rounded-full">
                    <XCircle size={12} /> ID Rejected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-700 bg-[#F8DCCF] px-2.5 py-0.5 rounded-full">
                    <Clock size={12} /> Verification Pending
                  </span>
                )}
              </div>
              <p className="mt-2 text-[11px] text-slate-500 leading-relaxed">
                {isVerified
                  ? "Identity verified with University Registrar. You are eligible to apply for campus placement drives and request clearances."
                  : myVerification?.status === "rejected"
                  ? `Rejected: ${myVerification.reviewer_remarks || "Invalid evidence"}. Please re-upload your official ID.`
                  : "Your college ID is currently in the Placement Cell verification queue."}
              </p>
              {!isVerified && (
                <button
                  onClick={() => setReverifyOpen(true)}
                  className="mt-3 w-full rounded-xl bg-[#14213D] py-2 text-xs font-bold text-white shadow-xs hover:bg-[#26334A] transition"
                >
                  Re-Upload ID Evidence
                </button>
              )}
            </div>
          </div>

          {/* Contact Details */}
          <div className="rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#172033] dark:text-white">
              Contact & Links
            </h3>
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <Mail size={15} className="text-[#4F46E5] shrink-0" />
                <span className="truncate">{student.university_email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={15} className="text-[#14B8A6] shrink-0" />
                <span>{student.phone || "+91 97654 32109"}</span>
              </div>
              {student.linkedin_url && (
                <div className="flex items-center gap-2">
                  <Linkedin size={15} className="text-blue-600 shrink-0" />
                  <a
                    href={student.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate hover:underline text-[#4F46E5]"
                  >
                    {student.linkedin_url}
                  </a>
                </div>
              )}
              {student.github_url && (
                <div className="flex items-center gap-2">
                  <Github size={15} className="text-slate-800 dark:text-white shrink-0" />
                  <a
                    href={student.github_url}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate hover:underline text-[#4F46E5]"
                  >
                    {student.github_url}
                  </a>
                </div>
              )}
              {student.resume_url && (
                <div className="flex items-center gap-2 pt-1">
                  <FileText size={15} className="text-emerald-600 shrink-0" />
                  <a
                    href={student.resume_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#4F46E5] hover:underline"
                  >
                    View Official Resume <ExternalLink size={11} />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Academic Standing & Skills */}
        <div className="lg:col-span-2 space-y-6">
          {/* Academic Standing Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-3xl border border-[#E5E7EB] bg-[#D8EAFB]/70 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Cumulative GPA</span>
              <p className="mt-2 text-2xl font-black text-[#14213D] dark:text-white">
                {student.cgpa.toFixed(2)}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">Scale: 10.0</p>
            </div>

            <div className="rounded-3xl border border-[#E5E7EB] bg-[#F7DCE8]/70 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Active Backlogs</span>
              <p className="mt-2 text-2xl font-black text-rose-700 dark:text-rose-400">
                {student.backlogs}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {student.backlogs === 0 ? "Eligible for all drives" : "May restrict core drives"}
              </p>
            </div>

            <div className="rounded-3xl border border-[#E5E7EB] bg-[#DCD5FA]/70 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Year & Section</span>
              <p className="mt-2 text-2xl font-black text-[#14213D] dark:text-white">
                Yr {student.year_of_study} - {student.section}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">Graduation 2026</p>
            </div>

            <div className="rounded-3xl border border-[#E5E7EB] bg-[#D9EEE4]/70 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Placement Reg.</span>
              <p className="mt-2 text-2xl font-black text-emerald-800 dark:text-emerald-400">
                {student.placement_registered ? "Active" : "Inactive"}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">Campus T&P Cell</p>
            </div>
          </div>

          {/* Professional Bio */}
          <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-extrabold text-[#172033] dark:text-white mb-2">
              Candidate Statement & Summary
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {student.bio || "No summary added yet. Click 'Edit Contact & Skills' above to describe your technical passions, projects, and career interests."}
            </p>
          </div>

          {/* Technical Skills */}
          <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-extrabold text-[#172033] dark:text-white mb-3">
              Verified Technical Competencies
            </h3>
            <div className="flex flex-wrap gap-2">
              {(student.skills || ["React", "TypeScript", "Node.js", "SQL"]).map((skill, i) => (
                <span
                  key={i}
                  className="rounded-xl bg-[#F5F3FF] border border-indigo-200/60 px-3 py-1.5 text-xs font-bold text-[#4F46E5] dark:bg-slate-800 dark:border-slate-700 dark:text-indigo-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#14213D]/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-[#14213D] max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-extrabold text-[#14213D] dark:text-white mb-1">
              Edit Candidate Profile
            </h3>
            <p className="text-xs text-[#64748B] mb-4">
              Update your contact details, bio, and portfolio links. Academic scores (CGPA & Backlogs) are governed by registrar records.
            </p>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#14213D] dark:text-slate-200 mb-1">
                  Mobile / Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-[#E5E7EB] p-2.5 outline-none focus:border-[#4F46E5] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div>
                <label className="block font-bold text-[#14213D] dark:text-slate-200 mb-1">
                  Professional Bio / Summary
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full rounded-xl border border-[#E5E7EB] p-2.5 outline-none focus:border-[#4F46E5] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  placeholder="Share a short summary of your background, achievements, and career focus..."
                />
              </div>

              <div>
                <label className="block font-bold text-[#14213D] dark:text-slate-200 mb-1">
                  Technical Skills (Comma separated)
                </label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="w-full rounded-xl border border-[#E5E7EB] p-2.5 outline-none focus:border-[#4F46E5] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  placeholder="React, TypeScript, Python, SQL, Docker"
                />
              </div>

              <div>
                <label className="block font-bold text-[#14213D] dark:text-slate-200 mb-1">
                  Resume URL / Portfolio Link
                </label>
                <input
                  type="url"
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                  className="w-full rounded-xl border border-[#E5E7EB] p-2.5 outline-none focus:border-[#4F46E5] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  placeholder="https://campusbridge.edu/resumes/my_resume.pdf"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#14213D] dark:text-slate-200 mb-1">
                    LinkedIn Profile
                  </label>
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    className="w-full rounded-xl border border-[#E5E7EB] p-2.5 outline-none focus:border-[#4F46E5] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#14213D] dark:text-slate-200 mb-1">
                    GitHub Profile
                  </label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="w-full rounded-xl border border-[#E5E7EB] p-2.5 outline-none focus:border-[#4F46E5] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    placeholder="https://github.com/username"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5E7EB] dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-xl bg-[#4F46E5] px-5 py-2 font-bold text-white shadow-sm hover:bg-indigo-700 transition"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Re-verify ID Evidence Modal */}
      {reverifyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#14213D]/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-[#14213D]">
            <h3 className="text-lg font-extrabold text-[#14213D] dark:text-white mb-1">
              Submit Official ID Card Evidence
            </h3>
            <p className="text-xs text-[#64748B] mb-4">
              Upload a clear photo of your college smart ID card or institutional enrollment slip for administrative clearance.
            </p>

            <form onSubmit={handleReverifySubmit} className="space-y-4 text-xs">
              <div className="rounded-2xl border-2 border-dashed border-[#4F46E5]/40 bg-[#F5F3FF] p-6 text-center dark:bg-slate-800/40">
                <Upload size={24} className="mx-auto text-[#4F46E5] mb-2" />
                <p className="font-bold text-[#14213D] dark:text-white">{uploadedFile}</p>
                <p className="text-[10px] text-slate-500 mt-1">PNG, JPG or PDF up to 5MB</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReverifyOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isReverifying}
                  className="rounded-xl bg-[#14B8A6] px-5 py-2 font-bold text-white shadow-sm hover:bg-teal-700 transition"
                >
                  {isReverifying ? "Submitting..." : "Submit Evidence"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
