import React, { useState } from "react";
import {
  GraduationCap,
  BriefcaseBusiness,
  ClipboardCheck,
  FileDown,
  ShieldCheck,
  QrCode,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Layers,
  Settings,
  Calendar,
  UserCheck,
  Award,
  User,
  RefreshCw,
  Database,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useStore } from "../../lib/store";
import { demoPersonas } from "../../lib/mockData";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationDropdown } from "./NotificationDropdown";

interface AppLayoutProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ activeTab, onNavigate, children }) => {
  const {
    currentUser,
    logout,
    loginAs,
    verificationRequests,
    isSupabaseConnected,
    backendStatusMessage,
    resetToDemoData,
    offers,
    interviews,
    applications,
  } = useStore();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [personaDropdownOpen, setPersonaDropdownOpen] = useState(false);
  const [showResetNotice, setShowResetNotice] = useState(false);

  const isAdmin = currentUser?.role === "placement_admin";
  const isFaculty = currentUser?.role === "faculty";
  const isStaff = isAdmin || isFaculty;
  const isStudent = currentUser?.role === "student";

  // Badges calculation
  const pendingVerificationsCount = verificationRequests.filter((r) => r.status === "pending").length;
  const studentActiveAppsCount = isStudent
    ? applications.filter((a) => a.student_id === currentUser?.id).length
    : 0;
  const studentOffersCount = isStudent
    ? offers.filter((o) => o.student_id === currentUser?.id).length
    : 0;
  const studentInterviewsCount = isStudent
    ? interviews.filter((i) => i.student_id === currentUser?.id && (i.outcome === "pending" || i.outcome === "rescheduled")).length
    : 0;

  // Role-specific navigation items
  const navItems = isStaff
    ? [
        { id: "overview", label: "Dashboard Overview", icon: Layers },
        { id: "students", label: "Student Roster", icon: GraduationCap },
        { id: "drives", label: "Recruitment Drives", icon: BriefcaseBusiness },
        { id: "applications", label: "Candidate Pipeline", icon: Layers },
        { id: "interviews", label: "Interview Rounds", icon: Calendar },
        { id: "nodues", label: "Clearance Review", icon: ClipboardCheck },
        { id: "verifications", label: "ID Verifications", icon: UserCheck, badge: pendingVerificationsCount },
        { id: "reports", label: "Reports & Exports", icon: FileDown },
        { id: "audit", label: "Audit Logs", icon: ShieldCheck },
        { id: "verify", label: "Certificate Registry", icon: QrCode },
        { id: "settings", label: "Settings & Policy", icon: Settings },
      ]
    : [
        { id: "overview", label: "Dashboard Overview", icon: Layers },
        { id: "profile", label: "My Profile & Smart ID", icon: UserCheck },
        { id: "drives", label: "Campus Drives", icon: BriefcaseBusiness },
        { id: "applications", label: "My Applications", icon: Layers, badge: studentActiveAppsCount },
        { id: "interviews", label: "Interview Schedule", icon: Calendar, badge: studentInterviewsCount },
        { id: "nodues", label: "Department Clearance", icon: ClipboardCheck },
        { id: "offers", label: "Job Offers", icon: Award, badge: studentOffersCount },
        { id: "verify", label: "Certificate Registry", icon: QrCode },
        { id: "settings", label: "Account Settings", icon: Settings },
      ];

  const handleResetData = () => {
    resetToDemoData();
    setShowResetNotice(true);
    setTimeout(() => setShowResetNotice(false), 4000);
  };

  return (
    <div className="min-h-screen bg-[#F5F3FF] dark:bg-[#0B1220] text-[#172033] dark:text-slate-100 transition-colors duration-300">
      {/* Toast Notice */}
      {showResetNotice && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-[#4F46E5] text-white p-4 shadow-2xl border border-indigo-400 animate-in fade-in duration-200">
          <CheckCircle2 size={18} />
          <span className="text-xs font-bold">Portal restored to clean seed demonstration data!</span>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-[#14213D]/70 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Left Sidebar: Premium Midnight Navy (#14213D) + Slate Charcoal (#26334A) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[#26334A] bg-[#14213D] text-white transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-20 items-center justify-between border-b border-[#26334A] px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#4F46E5] to-[#6366F1] text-white shadow-lg shadow-indigo-600/30">
              <GraduationCap size={22} />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-white">
                Campus<span className="text-[#6366F1]">Bridge</span>
              </span>
              <p className="text-[9px] font-bold tracking-widest text-[#DCD5FA] uppercase">
                {isAdmin ? "ADMIN COMMAND" : isFaculty ? "FACULTY PORTAL" : "STUDENT OS"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-[#26334A] hover:text-white lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-5">
          <p className="px-3 pb-2.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            {isStaff ? "Institutional Workspace" : "Student Career Hub"}
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-left text-xs font-bold transition-all ${
                    isActive
                      ? "bg-[#6366F1] text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/30 translate-x-1"
                      : "text-slate-300 hover:bg-[#26334A] hover:text-white"
                  }`}
                >
                  <Icon
                    size={17}
                    className={isActive ? "text-white" : "text-slate-400"}
                  />
                  <div className="flex flex-1 items-center justify-between">
                    <span>{item.label}</span>
                    {Boolean(item.badge && item.badge > 0) && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                          isActive
                            ? "bg-white text-[#4F46E5]"
                            : "bg-[#14B8A6] text-white"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer User Info */}
        <div className="border-t border-[#26334A] p-4 bg-[#14213D]">
          <div className="flex items-center gap-3 rounded-2xl bg-[#26334A]/80 border border-[#26334A] p-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#4F46E5] text-white font-extrabold text-xs shadow-sm">
              {currentUser?.full_name?.substring(0, 2).toUpperCase() || "CB"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-white">
                {currentUser?.full_name || "User"}
              </p>
              <p className="truncate text-[10px] text-[#DCD5FA] capitalize font-medium">
                {currentUser?.role.replace("_", " ") || "Guest"}
              </p>
            </div>
            <button
              onClick={logout}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-[#14213D] hover:text-rose-400 transition"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col lg:pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-[#E5E7EB] bg-white/85 backdrop-blur-md dark:border-slate-800 dark:bg-[#14213D]/90 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl border border-[#E5E7EB] p-2 text-[#172033] dark:border-slate-700 dark:text-slate-300 lg:hidden"
            >
              <Menu size={18} />
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B] dark:text-slate-400">
              <span className="font-extrabold text-[#14213D] dark:text-white">CampusBridge</span>
              <span>/</span>
              <span className="capitalize font-bold text-[#4F46E5] dark:text-[#6366F1]">{activeTab}</span>
            </div>
          </div>

          {/* Top-Right Controls */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Backend Persistence Status Pill */}
            <div
              className={`hidden md:flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold border transition ${
                isSupabaseConnected
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                  : "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800"
              }`}
              title={backendStatusMessage}
            >
              <Database size={13} className={isSupabaseConnected ? "text-emerald-600" : "text-indigo-600"} />
              <span>{isSupabaseConnected ? "Cloud PostgreSQL" : "Local Persisted"}</span>
            </div>

            {/* QUICK PERSONA SWITCHER FOR JUDGES & EVALUATORS */}
            <div className="relative">
              <button
                onClick={() => setPersonaDropdownOpen(!personaDropdownOpen)}
                className="flex items-center gap-1.5 rounded-2xl border border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100/90 dark:border-indigo-800 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/70 px-3 py-1.5 text-xs font-bold text-[#4F46E5] dark:text-[#6366F1] shadow-sm transition"
              >
                <Sparkles size={14} />
                <span className="hidden sm:inline">Switch Persona:</span>
                <span className="font-extrabold truncate max-w-[110px] sm:max-w-[140px]">
                  {currentUser?.full_name?.split(" ")[0]}
                </span>
                <ChevronDown size={13} />
              </button>

              {personaDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl border border-[#E5E7EB] bg-white p-3 shadow-2xl dark:border-slate-800 dark:bg-[#14213D] z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-[#E5E7EB] dark:border-[#26334A] mb-2">
                    <p className="font-extrabold text-[#172033] dark:text-white flex items-center gap-2">
                      <Sparkles size={14} className="text-[#4F46E5]" />
                      Quick Evaluator Persona Switcher
                    </p>
                    <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">
                      Instantly jump into any persona to test end-to-end multi-role workflows.
                    </p>
                  </div>

                  <div className="space-y-1 max-h-80 overflow-y-auto">
                    {demoPersonas.map((persona, idx) => {
                      const isCurrent = currentUser?.id === persona.profile.id;
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            loginAs(persona.profile as any);
                            setPersonaDropdownOpen(false);
                            onNavigate("overview");
                          }}
                          className={`flex w-full items-start gap-3 rounded-2xl p-2.5 text-left transition ${
                            isCurrent
                              ? "bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800"
                              : "hover:bg-[#F5F3FF] dark:hover:bg-[#26334A]"
                          }`}
                        >
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-black text-white ${
                              persona.profile.role === "placement_admin"
                                ? "bg-amber-600"
                                : persona.profile.role === "faculty"
                                ? "bg-teal-600"
                                : "bg-[#4F46E5]"
                            }`}
                          >
                            {persona.profile.role === "placement_admin"
                              ? "AD"
                              : persona.profile.role === "faculty"
                              ? "FA"
                              : "ST"}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-bold text-[#172033] dark:text-white truncate">
                                {persona.label}
                              </p>
                              {isCurrent && (
                                <span className="rounded-full bg-indigo-600 px-1.5 py-0.2 text-[9px] font-extrabold text-white">
                                  ACTIVE
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                              {persona.roleDesc}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="border-t border-[#E5E7EB] dark:border-[#26334A] mt-2 pt-2 px-1 flex items-center justify-between">
                    <button
                      onClick={() => {
                        handleResetData();
                        setPersonaDropdownOpen(false);
                      }}
                      className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                    >
                      <RefreshCw size={12} /> Reset to Demo State
                    </button>
                    <span className="text-[10px] text-slate-400">CampusBridge 2026</span>
                  </div>
                </div>
              )}
            </div>

            {/* Notifications */}
            <NotificationDropdown onNavigate={onNavigate} />

            {/* Light / Dark Mode Toggle */}
            <ThemeToggle />

            {/* User Avatar Menu */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 rounded-2xl border border-[#E5E7EB] bg-white p-1.5 pr-3 shadow-sm hover:bg-[#F5F3FF] dark:border-slate-700 dark:bg-[#26334A] dark:hover:bg-slate-700 transition"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-tr from-[#4F46E5] to-[#6366F1] text-white font-black text-[11px] shadow-sm">
                  {currentUser?.full_name?.substring(0, 2).toUpperCase() || "U"}
                </div>
                <div className="hidden sm:block text-left text-xs">
                  <p className="font-bold text-[#172033] dark:text-white leading-none">
                    {currentUser?.full_name?.split(" ")[0]}
                  </p>
                  <p className="text-[10px] text-[#64748B] dark:text-slate-400 leading-none mt-0.5 capitalize">
                    {currentUser?.role === "placement_admin"
                      ? "Admin"
                      : currentUser?.role === "faculty"
                      ? "Faculty"
                      : "Student"}
                  </p>
                </div>
                <ChevronDown size={14} className="text-[#64748B] dark:text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-[#E5E7EB] bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-[#14213D] z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-[#E5E7EB] dark:border-[#26334A] mb-1">
                    <p className="font-bold text-[#172033] dark:text-white truncate">{currentUser?.full_name}</p>
                    <p className="text-[10px] text-[#64748B] dark:text-slate-400 truncate">{currentUser?.university_email}</p>
                  </div>
                  {isStudent && (
                    <button
                      onClick={() => {
                        onNavigate("profile");
                        setUserDropdownOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[#172033] hover:bg-[#F5F3FF] dark:text-slate-200 dark:hover:bg-[#26334A]"
                    >
                      <User size={14} /> My Profile & Smart ID
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onNavigate("settings");
                      setUserDropdownOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[#172033] hover:bg-[#F5F3FF] dark:text-slate-200 dark:hover:bg-[#26334A]"
                  >
                    <Settings size={14} /> Account Settings
                  </button>
                  <button
                    onClick={() => {
                      onNavigate("verify");
                      setUserDropdownOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[#172033] hover:bg-[#F5F3FF] dark:text-slate-200 dark:hover:bg-[#26334A]"
                  >
                    <QrCode size={14} /> Verify Certificates
                  </button>
                  <div className="border-t border-[#E5E7EB] dark:border-[#26334A] my-1" />
                  <button
                    onClick={() => {
                      logout();
                      setUserDropdownOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
