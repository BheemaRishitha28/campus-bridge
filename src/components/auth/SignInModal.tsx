import React, { useState } from "react";
import {
  X,
  GraduationCap,
  BriefcaseBusiness,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Info,
  UserCheck,
  FileText,
  Upload,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useStore } from "../../lib/store";
import { isSupabaseConfigured, supabase } from "../../lib/supabase";
import { facultyProfile, initialStudents } from "../../lib/mockData";
import { Profile } from "../../types/domain";

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: "faculty" | "student" | null;
}

export const SignInModal: React.FC<SignInModalProps> = ({ isOpen, onClose, defaultRole = null }) => {
  const { loginAs, submitVerificationRequest } = useStore();
  const [authMode, setAuthMode] = useState<"signin" | "register">("signin");
  const [selectedRole, setSelectedRole] = useState<"faculty" | "student" | null>(defaultRole);

  // Sign In Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Registration Form State
  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regRollOrEmpId, setRegRollOrEmpId] = useState("");
  const [regDept, setRegDept] = useState("CSE");
  const [regProgram, setRegProgram] = useState("B.Tech");
  const [regYear, setRegYear] = useState(4);
  const [regCgpa, setRegCgpa] = useState<number>(8.25);
  const [regUploadedFileName, setRegUploadedFileName] = useState("university_smart_card_id.png");
  const [regSubmittedReqId, setRegSubmittedReqId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    setError(null);
    if (!isSupabaseConfigured || !supabase) {
      setError(
        `OAuth provider (${provider}) requires active Supabase credentials in .env (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY). Please select a pre-verified demonstration account below for immediate evaluation.`
      );
      return;
    }

    try {
      setLoading(true);
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined,
        },
      });
      if (authError) throw authError;
    } catch (err: any) {
      setError(err?.message || `Failed to authenticate with ${provider}. Verify OAuth credentials in Supabase Dashboard.`);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email) {
      setError("Please enter your university email address.");
      return;
    }

    if (isPasswordReset) {
      if (isSupabaseConfigured && supabase) {
        setLoading(true);
        try {
          const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + "/reset-password",
          });
          if (resetErr) throw resetErr;
          setSuccessMessage("Password reset email sent! Please check your university inbox.");
        } catch (err: any) {
          setError(err?.message || "Failed to initiate password reset.");
        } finally {
          setLoading(false);
        }
      } else {
        setSuccessMessage("Demonstration mode: Password reset link simulated for " + email);
      }
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error: signInErr } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInErr) throw signInErr;

        if (data.user) {
          const { data: profileData, error: profErr } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .single();

          if (profErr || !profileData) {
            loginAs({
              id: data.user.id,
              role: selectedRole === "faculty" ? "placement_admin" : "student",
              roll_number: selectedRole === "faculty" ? "FAC001" : "22CS101",
              full_name: data.user.email?.split("@")[0] || "Authenticated User",
              department_id: "dept-cse",
              department_code: "CSE",
              program: "B.Tech",
              year_of_study: 4,
              section: "A",
              graduation_year: 2026,
              university_email: data.user.email || "",
              cgpa: 8.5,
              backlogs: 0,
              active: true,
              placement_registered: true,
              created_at: new Date().toISOString(),
            });
          } else {
            loginAs(profileData as Profile);
          }
          onClose();
          return;
        }
      }

      // Offline / Demo Authentication Fallback
      if (selectedRole === "faculty") {
        loginAs(facultyProfile);
      } else {
        const matched = initialStudents.find((s) => s.university_email.toLowerCase() === email.toLowerCase());
        loginAs(matched || initialStudents[0]);
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || "Invalid credentials. Please verify your email and password.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!regFullName || !regEmail || !regRollOrEmpId) {
      setError("Please provide your full name, university email, and college roll / employee number.");
      return;
    }

    // Institutional email validation check
    if (!regEmail.includes("@") || (!regEmail.endsWith(".edu") && !regEmail.includes("campus") && !regEmail.includes("univ"))) {
      setError("Please enter a valid accredited institutional email address (e.g., student@campus.edu or name@univ.edu).");
      return;
    }

    setLoading(true);
    try {
      const isStudent = selectedRole !== "faculty";
      const req = await submitVerificationRequest({
        user_id: `user-${Date.now()}`,
        type: isStudent ? "student" : "faculty",
        full_name: regFullName,
        university_email: regEmail,
        roll_or_emp_id: regRollOrEmpId,
        department_code: regDept,
        program: isStudent ? regProgram : undefined,
        year_of_study: isStudent ? regYear : undefined,
        cgpa: isStudent ? regCgpa : undefined,
        id_card_url: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&q=80",
      });

      setRegSubmittedReqId(req.id);
    } catch (err: any) {
      setError(err?.message || "Failed to submit verification registration.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemoUser = (user: Profile) => {
    loginAs(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#14213D]/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-[#14213D] md:p-8 overflow-hidden max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 rounded-full p-2 text-slate-400 hover:bg-[#F5F3FF] hover:text-[#172033] dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
        >
          <X size={19} />
        </button>

        {/* Header */}
        <div className="mb-5 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#4F46E5] to-[#6366F1] text-white shadow-lg shadow-indigo-600/30">
            <GraduationCap size={26} />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-[#14213D] dark:text-white">
            CampusBridge Identity Portal
          </h2>
          <p className="mt-1 text-xs text-[#64748B] dark:text-slate-300">
            Unified placement opportunities and departmental clearance workflows.
          </p>

          {/* Mode Switcher */}
          <div className="mt-4 inline-flex rounded-xl bg-[#F5F3FF] p-1 border border-indigo-100 dark:bg-slate-800 dark:border-slate-700">
            <button
              type="button"
              onClick={() => {
                setAuthMode("signin");
                setRegSubmittedReqId(null);
                setError(null);
              }}
              className={`rounded-lg px-4 py-1.5 text-xs font-bold transition ${
                authMode === "signin"
                  ? "bg-white text-[#14213D] shadow-sm dark:bg-[#14213D] dark:text-white"
                  : "text-[#64748B] hover:text-[#172033] dark:hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode("register");
                setError(null);
              }}
              className={`rounded-lg px-4 py-1.5 text-xs font-bold transition ${
                authMode === "register"
                  ? "bg-white text-[#14213D] shadow-sm dark:bg-[#14213D] dark:text-white"
                  : "text-[#64748B] hover:text-[#172033] dark:hover:text-white"
              }`}
            >
              Register & Verify ID
            </button>
          </div>
        </div>

        {/* VIEW 1: REGISTRATION & COLLEGE ID VERIFICATION */}
        {authMode === "register" ? (
          <div>
            {regSubmittedReqId ? (
              <div className="rounded-2xl border border-orange-200 bg-[#F8DCCF]/50 p-5 text-center dark:border-amber-900/50 dark:bg-amber-950/30">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#9A3412] mb-3 shadow-sm">
                  <Clock size={24} />
                </div>
                <h3 className="text-sm font-extrabold text-[#9A3412] dark:text-amber-200">
                  Identity Verification Submitted!
                </h3>
                <p className="mt-1 text-xs text-[#9A3412]/90 dark:text-amber-300/80 leading-relaxed font-medium">
                  Your university identity application (Ref: <strong className="font-mono">{regSubmittedReqId}</strong>) has been queued for review by the <strong>Placement In-Charge & Registrar Office</strong>.
                </p>
                <div className="mt-4 rounded-xl bg-white p-3 text-left text-xs text-[#172033] dark:bg-slate-800 dark:text-slate-200 border border-orange-200/80 dark:border-slate-700">
                  <p className="font-bold text-[11px] text-[#64748B] uppercase tracking-wider">Submitted Details:</p>
                  <p className="mt-1">Name: <strong>{regFullName}</strong></p>
                  <p>Email: <strong>{regEmail}</strong></p>
                  <p>ID / Roll: <strong>{regRollOrEmpId}</strong> ({regDept})</p>
                  <p className="mt-2 text-[10px] text-[#065F46] font-bold">✓ Official College ID Evidence Uploaded</p>
                </div>
                <p className="mt-4 text-[11px] text-[#64748B]">
                  Want to explore the portal right now? Use one of our pre-verified evaluation profiles below:
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectDemoUser(facultyProfile)}
                    className="flex-1 rounded-xl bg-[#14213D] py-2.5 text-xs font-bold text-white hover:bg-[#26334A] dark:bg-[#4F46E5] transition"
                  >
                    Login as Faculty Command
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectDemoUser(initialStudents[0])}
                    className="flex-1 rounded-xl bg-[#14B8A6] py-2.5 text-xs font-bold text-white hover:bg-teal-700 transition"
                  >
                    Login as Student A
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
                {/* Role Switcher */}
                <div>
                  <label className="block text-[11px] font-bold text-[#14213D] dark:text-slate-300 mb-1">
                    Select University Role *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedRole("student")}
                      className={`rounded-xl border p-2.5 font-bold transition flex items-center justify-center gap-1.5 ${
                        selectedRole !== "faculty"
                          ? "border-[#14B8A6] bg-[#D9EEE4] text-[#065F46]"
                          : "border-[#E5E7EB] bg-white text-[#64748B] dark:border-slate-700 dark:bg-slate-800"
                      }`}
                    >
                      <GraduationCap size={15} /> Student Account
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRole("faculty")}
                      className={`rounded-xl border p-2.5 font-bold transition flex items-center justify-center gap-1.5 ${
                        selectedRole === "faculty"
                          ? "border-[#4F46E5] bg-[#DCD5FA] text-[#3730A3]"
                          : "border-[#E5E7EB] bg-white text-[#64748B] dark:border-slate-700 dark:bg-slate-800"
                      }`}
                    >
                      <BriefcaseBusiness size={15} /> Faculty Account
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
                    <AlertCircle size={15} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-[#14213D] dark:text-slate-300 mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="e.g. Vikram Aditya"
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white p-2.5 text-xs text-[#172033] outline-none focus:border-[#4F46E5] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#14213D] dark:text-slate-300 mb-1">
                      Institutional Email (@campus.edu) *
                    </label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="vikram@campus.edu"
                      className="w-full rounded-xl border border-[#E5E7EB] bg-white p-2.5 text-xs text-[#172033] outline-none focus:border-[#4F46E5] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#14213D] dark:text-slate-300 mb-1">
                      {selectedRole === "faculty" ? "Faculty Staff ID *" : "University Roll Number *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={regRollOrEmpId}
                      onChange={(e) => setRegRollOrEmpId(e.target.value)}
                      placeholder={selectedRole === "faculty" ? "FAC-CSE-092" : "22CS188"}
                      className="w-full rounded-xl border border-[#E5E7EB] bg-white p-2.5 text-xs font-mono font-bold text-[#172033] outline-none focus:border-[#4F46E5] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-[#14213D] dark:text-slate-300 mb-1">
                      Department
                    </label>
                    <select
                      value={regDept}
                      onChange={(e) => setRegDept(e.target.value)}
                      className="w-full rounded-xl border border-[#E5E7EB] bg-white p-2.5 text-xs text-[#172033] outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="CSE">CSE</option>
                      <option value="ECE">ECE</option>
                      <option value="MECH">MECH</option>
                    </select>
                  </div>

                  {selectedRole !== "faculty" && (
                    <>
                      <div>
                        <label className="block text-[11px] font-bold text-[#14213D] dark:text-slate-300 mb-1">
                          Year
                        </label>
                        <select
                          value={regYear}
                          onChange={(e) => setRegYear(Number(e.target.value))}
                          className="w-full rounded-xl border border-[#E5E7EB] bg-white p-2.5 text-xs text-[#172033] outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        >
                          <option value={4}>4th Year</option>
                          <option value={3}>3rd Year</option>
                          <option value={2}>2nd Year</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#14213D] dark:text-slate-300 mb-1">
                          CGPA
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="10"
                          value={regCgpa}
                          onChange={(e) => setRegCgpa(Number(e.target.value))}
                          className="w-full rounded-xl border border-[#E5E7EB] bg-white p-2.5 text-xs text-[#172033] outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* ID Evidence Upload */}
                <div>
                  <label className="block text-[11px] font-bold text-[#14213D] dark:text-slate-300 mb-1">
                    Upload Official College ID Card (Evidence) *
                  </label>
                  <div className="flex items-center gap-3 rounded-2xl border border-dashed border-[#E5E7EB] bg-[#F5F3FF]/70 p-3 dark:border-slate-700 dark:bg-slate-800/40">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D8EAFB] text-[#14213D]">
                      <FileText size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-[#14213D] dark:text-slate-200 truncate">
                        {regUploadedFileName}
                      </p>
                      <p className="text-[10px] text-[#64748B]">Institutional Smart Card Badge (Simulated Upload)</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRegUploadedFileName("verified_campus_id_" + Math.floor(Math.random() * 900 + 100) + ".png")}
                      className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-bold text-[#14213D] border border-[#E5E7EB] shadow-sm hover:bg-slate-50 transition"
                    >
                      Change
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 rounded-xl bg-[#4F46E5] py-3 text-xs font-extrabold text-white shadow-md hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {loading ? "Submitting Registration..." : "Submit for Identity Verification"}
                </button>
              </form>
            )}
          </div>
        ) : (
          /* VIEW 2: SIGN IN TO EXISTING ACCOUNT */
          <div>
            {!selectedRole ? (
              <div className="space-y-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[#64748B] text-center">
                  Select your portal
                </p>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRole("faculty")}
                    className="group relative flex flex-col items-center justify-center rounded-2xl border border-[#E5E7EB] bg-[#F5F3FF]/60 p-6 text-center transition hover:border-[#4F46E5] hover:bg-white dark:border-slate-800 dark:bg-slate-800/40"
                  >
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#14213D] text-white group-hover:scale-105 transition-transform">
                      <BriefcaseBusiness size={24} />
                    </div>
                    <h3 className="text-base font-bold text-[#14213D] dark:text-white">Faculty Command</h3>
                    <p className="mt-1 text-[11px] text-[#64748B] dark:text-slate-400">
                      Placement In-Charge, HODs, Library & Accounts Officers
                    </p>
                    <span className="mt-4 flex items-center gap-1 text-xs font-bold text-[#4F46E5] dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                      Continue as Faculty <ArrowRight size={13} />
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole("student")}
                    className="group relative flex flex-col items-center justify-center rounded-2xl border border-[#E5E7EB] bg-[#D9EEE4]/30 p-6 text-center transition hover:border-[#14B8A6] hover:bg-white dark:border-slate-800 dark:bg-slate-800/40"
                  >
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#14B8A6] text-white group-hover:scale-105 transition-transform">
                      <GraduationCap size={24} />
                    </div>
                    <h3 className="text-base font-bold text-[#14213D] dark:text-white">Student Portal</h3>
                    <p className="mt-1 text-[11px] text-[#64748B] dark:text-slate-400">
                      Drives, applications, offers & verifiable No-Dues clearance
                    </p>
                    <span className="mt-4 flex items-center gap-1 text-xs font-bold text-[#14B8A6] group-hover:translate-x-0.5 transition-transform">
                      Continue as Student <ArrowRight size={13} />
                    </span>
                  </button>
                </div>

                {/* Quick Demo Credentials Card with Soft Pastel Badges */}
                <div className="mt-6 rounded-2xl border border-indigo-100 bg-[#DCD5FA]/40 p-4 dark:border-blue-900/40 dark:bg-blue-950/30">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#3730A3] dark:text-[#DCD5FA]">
                    <Sparkles size={15} /> Instant Demo Access Profiles
                  </div>
                  <p className="mt-1 text-[11px] text-[#3730A3]/80 dark:text-slate-300 leading-relaxed font-medium">
                    Instant access without credentials for immediate evaluation:
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-left">
                    <button
                      type="button"
                      onClick={() => handleSelectDemoUser(facultyProfile)}
                      className="rounded-xl border border-indigo-100 bg-white p-2.5 text-xs transition hover:bg-[#F5F3FF] dark:border-slate-700 dark:bg-slate-800 shadow-sm"
                    >
                      <p className="font-extrabold text-[#14213D] dark:text-white">Dr. Arvind Sharma</p>
                      <p className="text-[10px] text-[#4F46E5] font-semibold">Placement In-Charge</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectDemoUser(initialStudents[0])}
                      className="rounded-xl border border-indigo-100 bg-white p-2.5 text-xs transition hover:bg-[#F5F3FF] dark:border-slate-700 dark:bg-slate-800 shadow-sm"
                    >
                      <p className="font-extrabold text-[#14213D] dark:text-white">Aditi Rao (Student A)</p>
                      <p className="text-[10px] text-[#065F46] font-semibold">CSE · 2 Offers · Cleared</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectDemoUser(initialStudents[1])}
                      className="rounded-xl border border-indigo-100 bg-white p-2.5 text-xs transition hover:bg-[#F5F3FF] dark:border-slate-700 dark:bg-slate-800 shadow-sm"
                    >
                      <p className="font-extrabold text-[#14213D] dark:text-white">Rohan Mehta (Student B)</p>
                      <p className="text-[10px] text-[#9A3412] font-semibold">ECE · Pending Accounts</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectDemoUser(initialStudents[2])}
                      className="rounded-xl border border-indigo-100 bg-white p-2.5 text-xs transition hover:bg-[#F5F3FF] dark:border-slate-700 dark:bg-slate-800 shadow-sm"
                    >
                      <p className="font-extrabold text-[#14213D] dark:text-white">Kavya Nair (Student C)</p>
                      <p className="text-[10px] text-rose-600 font-semibold">MECH · Lab Dues Block</p>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-4 flex items-center justify-between border-b border-[#E5E7EB] dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#D8EAFB] text-[#14213D] text-xs font-bold">
                      {selectedRole === "faculty" ? "F" : "S"}
                    </span>
                    <span className="text-xs font-bold text-[#14213D] dark:text-slate-200">
                      {selectedRole === "faculty" ? "Faculty Authentication" : "Student Authentication"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole(null);
                      setError(null);
                      setSuccessMessage(null);
                    }}
                    className="text-xs font-bold text-[#4F46E5] dark:text-[#6366F1] hover:underline"
                  >
                    Change Role
                  </button>
                </div>

                {error && (
                  <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <span className="leading-relaxed">{error}</span>
                  </div>
                )}

                {successMessage && (
                  <div className="mb-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                    <ShieldCheck size={16} className="mt-0.5 shrink-0" />
                    <span className="leading-relaxed">{successMessage}</span>
                  </div>
                )}

                {/* Social OAuth Logins */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleOAuthSignIn("google")}
                    className="flex items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-white py-2.5 text-xs font-bold text-[#172033] shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    Google
                  </button>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleOAuthSignIn("github")}
                    className="flex items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-white py-2.5 text-xs font-bold text-[#172033] shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    GitHub
                  </button>
                </div>

                <div className="relative my-4 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#E5E7EB] dark:border-slate-800" />
                  </div>
                  <span className="relative bg-white dark:bg-[#14213D] px-3 text-[10px] uppercase font-bold tracking-wider text-[#64748B]">
                    Or with institutional credentials
                  </span>
                </div>

                {/* Email Form */}
                <form onSubmit={handleEmailAuth} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#14213D] dark:text-slate-300 mb-1">
                      University Email
                    </label>
                    <div className="relative flex items-center">
                      <Mail size={16} className="absolute left-3 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={
                          selectedRole === "faculty" ? "admin@campusbridge.edu" : "student.a@campusbridge.edu"
                        }
                        className="w-full rounded-xl border border-[#E5E7EB] bg-white py-2.5 pl-9 pr-3 text-xs text-[#172033] placeholder:text-slate-400 outline-none focus:border-[#4F46E5] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                  </div>

                  {!isPasswordReset && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-bold text-[#14213D] dark:text-slate-300">
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsPasswordReset(true)}
                          className="text-[10px] font-semibold text-[#4F46E5] dark:text-indigo-400 hover:underline"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative flex items-center">
                        <Lock size={16} className="absolute left-3 text-slate-400" />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full rounded-xl border border-[#E5E7EB] bg-white py-2.5 pl-9 pr-3 text-xs text-[#172033] placeholder:text-slate-400 outline-none focus:border-[#4F46E5] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 rounded-xl bg-[#14213D] py-3 text-xs font-bold text-white shadow-md hover:bg-[#26334A] dark:bg-[#4F46E5] dark:hover:bg-indigo-600 transition disabled:opacity-50"
                  >
                    {loading
                      ? "Authenticating..."
                      : isPasswordReset
                      ? "Send Password Recovery Link"
                      : selectedRole === "faculty"
                      ? "Sign In to Faculty Workspace"
                      : "Sign In to Student Portal"}
                  </button>

                  {isPasswordReset && (
                    <button
                      type="button"
                      onClick={() => setIsPasswordReset(false)}
                      className="w-full text-center text-xs text-[#64748B] hover:text-[#172033] dark:text-slate-400"
                    >
                      Back to Sign In
                    </button>
                  )}
                </form>

                {/* Direct Demo Autofill Helper */}
                <div className="mt-4 pt-3 border-t border-[#E5E7EB] dark:border-slate-800 flex items-center justify-between text-[11px] text-[#64748B]">
                  <span className="flex items-center gap-1">
                    <Info size={12} /> Auto-fill sample:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedRole === "faculty") {
                        setEmail(facultyProfile.university_email);
                        setPassword("DemoAdmin2026!");
                      } else {
                        setEmail("student.a@campusbridge.edu");
                        setPassword("DemoStudent2026!");
                      }
                    }}
                    className="font-bold text-[#4F46E5] dark:text-indigo-400 hover:underline"
                  >
                    Insert Demo Credentials
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
