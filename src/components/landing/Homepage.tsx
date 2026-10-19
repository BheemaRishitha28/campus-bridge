import React, { useState } from "react";
import {
  GraduationCap,
  BriefcaseBusiness,
  ClipboardCheck,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  QrCode,
  Users,
  FileCheck2,
  Building2,
  Layers,
  Sparkles,
  BarChart3,
  ExternalLink,
  CheckCircle2,
  Clock,
  Lock,
  ArrowUpRight,
  FileDown,
  Award,
} from "lucide-react";
import { ThemeToggle } from "../common/ThemeToggle";
import { SignInModal } from "../auth/SignInModal";

interface HomepageProps {
  onOpenSignIn: (role?: "faculty" | "student") => void;
  onOpenPublicVerification: () => void;
}

export const Homepage: React.FC<HomepageProps> = ({ onOpenSignIn, onOpenPublicVerification }) => {
  const [signInRole, setSignInRole] = useState<"faculty" | "student" | null>(null);
  const [isSignInOpen, setIsSignInOpen] = useState(false);

  const openAuth = (role?: "faculty" | "student") => {
    setSignInRole(role || null);
    setIsSignInOpen(true);
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#F5F3FF] text-[#172033] dark:bg-[#0B1220] dark:text-slate-100 transition-colors duration-300">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-[#E5E7EB] bg-white/85 backdrop-blur-md dark:border-slate-800 dark:bg-[#14213D]/90">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#4F46E5] to-[#6366F1] text-white shadow-lg shadow-indigo-600/30">
              <GraduationCap size={24} />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-[#14213D] dark:text-white">
                Campus<span className="text-[#6366F1]">Bridge</span>
              </span>
              <p className="text-[10px] font-bold tracking-widest text-[#64748B] dark:text-[#DCD5FA] uppercase">
                PLACEMENT & NO-DUES OS
              </p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-bold text-[#64748B] dark:text-slate-300">
            <button onClick={() => scrollTo("hero")} className="hover:text-[#4F46E5] dark:hover:text-[#6366F1] transition">
              Home
            </button>
            <button onClick={() => scrollTo("features")} className="hover:text-[#4F46E5] dark:hover:text-[#6366F1] transition">
              Features
            </button>
            <button onClick={() => scrollTo("workflow")} className="hover:text-[#4F46E5] dark:hover:text-[#6366F1] transition">
              Workflow
            </button>
            <button onClick={() => scrollTo("analytics")} className="hover:text-[#4F46E5] dark:hover:text-[#6366F1] transition">
              Placement Analytics
            </button>
            <button onClick={() => scrollTo("nodues")} className="hover:text-[#4F46E5] dark:hover:text-[#6366F1] transition">
              No-Dues Pipeline
            </button>
            <button
              onClick={onOpenPublicVerification}
              className="flex items-center gap-1.5 rounded-full bg-[#D8EAFB] dark:bg-indigo-950/60 px-3 py-1 text-[#14213D] dark:text-[#D8EAFB] font-bold hover:bg-[#C2E0FB] transition"
            >
              <QrCode size={13} className="text-[#4F46E5]" /> Verify Certificate
            </button>
          </nav>

          {/* Header Controls */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => openAuth()}
              className="flex items-center gap-2 rounded-2xl bg-[#14213D] px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-[#26334A] dark:bg-[#6366F1] dark:hover:bg-[#4F46E5]"
            >
              Sign In <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section: Vibrant Peach-Pink-Lavender Pastel Mesh */}
      <section
        id="hero"
        className="relative overflow-hidden pt-14 pb-20 md:pt-24 md:pb-32 bg-gradient-to-b from-[#F8DCCF]/45 via-[#F7DCE8]/35 to-[#F5F3FF] dark:from-[#14213D]/60 dark:via-[#0B1220] dark:to-[#0B1220]"
      >
        {/* Subtle Decorative Glow Orbs */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-[#F8DCCF]/60 via-[#F7DCE8]/50 to-[#DCD5FA]/60 blur-3xl rounded-full opacity-70" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-white/80 backdrop-blur-sm px-4 py-1.5 text-xs font-bold text-[#4F46E5] shadow-sm dark:border-indigo-900/60 dark:bg-[#14213D]/80 dark:text-[#DCD5FA] mb-6">
              <span className="flex h-2 w-2 rounded-full bg-[#14B8A6] animate-pulse" />
              Next-Gen Campus Placement & Departmental Clearance OS
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#14213D] dark:text-white leading-[1.12]">
              One Campus. <br />
              <span className="bg-gradient-to-r from-[#4F46E5] via-[#6366F1] to-[#14B8A6] bg-clip-text text-transparent">
                One Connected Placement Journey.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-base sm:text-lg leading-relaxed text-[#64748B] dark:text-slate-300 max-w-2xl mx-auto font-medium">
              CampusBridge unites university recruitment drives, live cohort analytics, and multi-department clearance
              workflows into one intelligent, transparent SaaS platform. Zero paper trails, strict student privacy, and instant QR-verifiable certificates.
            </p>

            {/* Distinct High-Contrast CTAs */}
            <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
              {/* Student Portal Button */}
              <button
                onClick={() => openAuth("student")}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-2xl bg-[#14B8A6] px-7 py-4 text-sm font-extrabold text-white shadow-xl shadow-teal-500/25 transition-all hover:bg-[#0D9488] hover:shadow-teal-500/40"
              >
                <GraduationCap size={20} /> Student Portal Access
              </button>

              {/* Faculty / Admin Button */}
              <button
                onClick={() => openAuth("faculty")}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-2xl bg-[#14213D] px-7 py-4 text-sm font-extrabold text-white shadow-xl shadow-slate-900/20 transition-all hover:bg-[#26334A] dark:bg-[#4F46E5] dark:hover:bg-[#6366F1]"
              >
                <BriefcaseBusiness size={20} /> Faculty / Admin Command
              </button>

              {/* Verify Certificate Button */}
              <button
                onClick={onOpenPublicVerification}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl border border-[#E5E7EB] bg-white px-6 py-4 text-sm font-bold text-[#14213D] shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-[#14213D] dark:text-white dark:hover:bg-slate-800"
              >
                <QrCode size={19} className="text-[#6366F1]" /> Verify Certificate QR
              </button>
            </div>

            {/* Demo Data Disclaimer Label */}
            <p className="mt-5 text-[11px] font-semibold text-[#64748B] dark:text-slate-400">
              ✦ Pre-loaded with synthetic demonstration data across CSE, ECE, & MECH batches. Connect Supabase for production database operations.
            </p>
          </div>

          {/* Interactive Live-Looking Dashboard Preview with 4 Pastel Cards */}
          <div className="mt-14 relative mx-auto max-w-5xl rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-[#14213D] sm:p-7 lg:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5E7EB] dark:border-slate-800 pb-5">
              <div className="flex items-center gap-3">
                <span className="flex h-3 w-3 rounded-full bg-[#14B8A6] animate-pulse" />
                <span className="text-xs font-black uppercase tracking-wider text-[#14213D] dark:text-[#DCD5FA]">
                  CampusBridge Live Intelligence Dashboard · Demonstration Data
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="rounded-xl bg-[#F5F3FF] dark:bg-slate-800 px-3 py-1 text-[#14213D] dark:text-white">
                  Batch 2026
                </span>
                <span className="rounded-xl bg-[#D9EEE4] px-3 py-1 text-[#065F46] font-bold">
                  Recruitment Season Active
                </span>
              </div>
            </div>

            {/* 4 Distinct Soft Pastel Cards (Calm Blue, Soft Green, Lavender, Pastel Peach) */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {/* Card 1: Calm Blue (#D8EAFB) */}
              <div className="rounded-2xl border border-blue-200/70 bg-[#D8EAFB] p-4 text-[#14213D]">
                <p className="text-[11px] font-extrabold uppercase tracking-wider opacity-75">Registered Cohort</p>
                <p className="mt-1 text-2xl font-black">1,248</p>
                <p className="text-[10px] font-bold text-[#065F46] mt-1 bg-white/70 px-2 py-0.5 rounded-full inline-block">
                  92.4% Eligible
                </p>
              </div>

              {/* Card 2: Soft Green (#D9EEE4) */}
              <div className="rounded-2xl border border-emerald-200/70 bg-[#D9EEE4] p-4 text-[#065F46]">
                <p className="text-[11px] font-extrabold uppercase tracking-wider opacity-75">Unique Placed</p>
                <p className="mt-1 text-2xl font-black">684</p>
                <p className="text-[10px] font-bold mt-1 bg-white/70 px-2 py-0.5 rounded-full inline-block">
                  54.8% Placement Rate
                </p>
              </div>

              {/* Card 3: Lavender (#DCD5FA) */}
              <div className="rounded-2xl border border-indigo-200/70 bg-[#DCD5FA] p-4 text-[#3730A3]">
                <p className="text-[11px] font-extrabold uppercase tracking-wider opacity-75">Total Offers</p>
                <p className="mt-1 text-2xl font-black">731</p>
                <p className="text-[10px] font-bold mt-1 bg-white/70 px-2 py-0.5 rounded-full inline-block">
                  Includes Multi-Offers
                </p>
              </div>

              {/* Card 4: Pastel Peach (#F8DCCF) */}
              <div className="rounded-2xl border border-orange-200/70 bg-[#F8DCCF] p-4 text-[#9A3412]">
                <p className="text-[11px] font-extrabold uppercase tracking-wider opacity-75">Pending No-Dues</p>
                <p className="mt-1 text-2xl font-black">176</p>
                <p className="text-[10px] font-bold mt-1 bg-white/70 px-2 py-0.5 rounded-full inline-block">
                  Across 6 Departments
                </p>
              </div>
            </div>

            {/* Department Placement Progress Bars Preview */}
            <div className="mt-6 rounded-2xl border border-[#E5E7EB] bg-[#F5F3FF]/70 p-5 dark:border-slate-800 dark:bg-slate-800/40">
              <div className="flex items-center justify-between text-xs font-bold mb-3">
                <span className="text-[#14213D] dark:text-slate-200">Department Placement Distribution</span>
                <span className="text-[#4F46E5] dark:text-[#DCD5FA]">Highest: ₹18.0 LPA · Avg: ₹8.4 LPA</span>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-[#64748B] dark:text-slate-400 mb-1">
                    <span>Computer Science & Engineering (CSE)</span>
                    <span className="font-bold text-[#14213D] dark:text-white">68.1% (286 / 420)</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-white dark:bg-slate-700 overflow-hidden border border-slate-200 dark:border-slate-600">
                    <div className="h-full rounded-full bg-[#4F46E5]" style={{ width: "68.1%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-[#64748B] dark:text-slate-400 mb-1">
                    <span>Electronics & Communication (ECE)</span>
                    <span className="font-bold text-[#14213D] dark:text-white">55.9% (218 / 390)</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-white dark:bg-slate-700 overflow-hidden border border-slate-200 dark:border-slate-600">
                    <div className="h-full rounded-full bg-[#14B8A6]" style={{ width: "55.9%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-[#64748B] dark:text-slate-400 mb-1">
                    <span>Mechanical Engineering (MECH)</span>
                    <span className="font-bold text-[#14213D] dark:text-white">41.1% (180 / 438)</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-white dark:bg-slate-700 overflow-hidden border border-slate-200 dark:border-slate-600">
                    <div className="h-full rounded-full bg-[#6366F1]" style={{ width: "41.1%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features Section with Pastel Cards */}
      <section id="features" className="py-20 bg-white dark:bg-[#14213D]/50 border-y border-[#E5E7EB] dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#4F46E5] dark:text-[#6366F1]">
              Architected for Enterprise Universities
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#14213D] dark:text-white sm:text-4xl">
              Engineered for Precision Campus Operations
            </h2>
            <p className="mt-3 text-sm text-[#64748B] dark:text-slate-400">
              Every workflow—from corporate recruitment drives to cross-departmental clearance—in one synchronized system.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1: Dream Offer Policy Engine (Lavender Accent) */}
            <div className="rounded-3xl border border-indigo-100 bg-[#DCD5FA]/35 p-7 dark:border-slate-800 dark:bg-slate-800/40">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#4F46E5] shadow-sm dark:bg-indigo-950 dark:text-[#DCD5FA]">
                <BriefcaseBusiness size={24} />
              </div>
              <h3 className="text-lg font-bold text-[#14213D] dark:text-white">Dream Offer Policy Engine</h3>
              <p className="mt-2 text-xs leading-relaxed text-[#64748B] dark:text-slate-300">
                Automated multi-tier eligibility rules (Regular, Dream, Super Dream). Restricts lower-tier applications once a qualifying offer is secured while unlocking premium packages.
              </p>
            </div>

            {/* Feature 2: Multi-Department No-Dues Queues (Pastel Peach Accent) */}
            <div className="rounded-3xl border border-orange-100 bg-[#F8DCCF]/45 p-7 dark:border-slate-800 dark:bg-slate-800/40">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#9A3412] shadow-sm dark:bg-orange-950 dark:text-[#F8DCCF]">
                <ClipboardCheck size={24} />
              </div>
              <h3 className="text-lg font-bold text-[#14213D] dark:text-white">Configurable No-Dues Queues</h3>
              <p className="mt-2 text-xs leading-relaxed text-[#64748B] dark:text-slate-300">
                Departmental queues for Library, Labs, Accounts, HOD, and Hostel. Critical institutional rule: 100% mandatory clearance required before certificate generation.
              </p>
            </div>

            {/* Feature 3: Tamper-Evident QR Certificates (Soft Green Accent) */}
            <div className="rounded-3xl border border-emerald-100 bg-[#D9EEE4]/50 p-7 dark:border-slate-800 dark:bg-slate-800/40">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#065F46] shadow-sm dark:bg-emerald-950 dark:text-[#D9EEE4]">
                <QrCode size={24} />
              </div>
              <h3 className="text-lg font-bold text-[#14213D] dark:text-white">Instant QR Verifiable Certificates</h3>
              <p className="mt-2 text-xs leading-relaxed text-[#64748B] dark:text-slate-300">
                Generates tamper-evident digital certificates with QR validation. Public verification returns sanitized validity without exposing private remarks or student contact info.
              </p>
            </div>

            {/* Feature 4: Placement vs Offer Separation (Calm Blue Accent) */}
            <div className="rounded-3xl border border-blue-100 bg-[#D8EAFB]/50 p-7 dark:border-slate-800 dark:bg-slate-800/40">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#14213D] shadow-sm dark:bg-blue-950 dark:text-[#D8EAFB]">
                <BarChart3 size={24} />
              </div>
              <h3 className="text-lg font-bold text-[#14213D] dark:text-white">Accurate Placement Intelligence</h3>
              <p className="mt-2 text-xs leading-relaxed text-[#64748B] dark:text-slate-300">
                Strict separation between Unique Students Placed and Total Offers. Department-wise conversion rates, salary packages, and recruitment funnel progression.
              </p>
            </div>

            {/* Feature 5: Privacy & RLS (Soft Pink Accent) */}
            <div className="rounded-3xl border border-pink-100 bg-[#F7DCE8]/50 p-7 dark:border-slate-800 dark:bg-slate-800/40">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-pink-700 shadow-sm dark:bg-pink-950 dark:text-[#F7DCE8]">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-lg font-bold text-[#14213D] dark:text-white">Strict Student Privacy & RLS</h3>
              <p className="mt-2 text-xs leading-relaxed text-[#64748B] dark:text-slate-300">
                Student A can never access Student B's applications, offers, or private clearance remarks. Database-level Row-Level Security policies and immutable audit trails.
              </p>
            </div>

            {/* Feature 6: Bulk Ingestion Engine */}
            <div className="rounded-3xl border border-teal-100 bg-teal-50/60 p-7 dark:border-slate-800 dark:bg-slate-800/40">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#14B8A6] shadow-sm dark:bg-teal-950 dark:text-[#14B8A6]">
                <Layers size={24} />
              </div>
              <h3 className="text-lg font-bold text-[#14213D] dark:text-white">10-Step Bulk Data Ingestion</h3>
              <p className="mt-2 text-xs leading-relaxed text-[#64748B] dark:text-slate-300">
                Downloadable CSV/XLSX templates, schema verification, in-memory duplicate detection against DB records, and transaction-safe batch confirmation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Placement & Clearance Workflow */}
      <section id="workflow" className="py-20 bg-[#F5F3FF] dark:bg-[#0B1220]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#4F46E5] dark:text-[#6366F1]">
              End-to-End Orchestration
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#14213D] dark:text-white sm:text-4xl">
              The 5-Stage Campus Lifecycle
            </h2>
            <p className="mt-3 text-sm text-[#64748B] dark:text-slate-400">
              How students, recruiters, and faculty move through verified recruitment and automated clearance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              {
                step: "01",
                title: "Student Onboarding",
                desc: "Roster ingestion, ID card verification, and automatic Dream policy enrollment.",
                color: "bg-[#D8EAFB] text-[#14213D]",
              },
              {
                step: "02",
                title: "Drive Publishing",
                desc: "Companies publish drives with CGPA, backlog, and department eligibility rules.",
                color: "bg-[#DCD5FA] text-[#3730A3]",
              },
              {
                step: "03",
                title: "Interviews & Offers",
                desc: "Live interview scheduling with Google Meet links, attendance ack, and offer logging.",
                color: "bg-[#D9EEE4] text-[#065F46]",
              },
              {
                step: "04",
                title: "No-Dues Clearance",
                desc: "Department queues verify book returns, lab components, and fee receipts.",
                color: "bg-[#F8DCCF] text-[#9A3412]",
              },
              {
                step: "05",
                title: "QR Certificate",
                desc: "Cryptographic certificate generated with public verification registry.",
                color: "bg-[#F7DCE8] text-pink-900",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#14213D] flex flex-col justify-between"
              >
                <div>
                  <span className={`inline-block rounded-xl px-2.5 py-1 text-xs font-black ${item.color}`}>
                    Stage {item.step}
                  </span>
                  <h4 className="mt-4 text-base font-bold text-[#14213D] dark:text-white">{item.title}</h4>
                  <p className="mt-2 text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dual Experience Walkthrough (Student vs Faculty) */}
      <section id="howitworks" className="py-20 bg-white dark:bg-[#14213D]/40 border-t border-[#E5E7EB] dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#4F46E5] dark:text-[#6366F1]">
              Dual Experience
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#14213D] dark:text-white sm:text-4xl">
              Tailored for Every Campus Stakeholder
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Student Experience */}
            <div className="rounded-3xl border border-[#E5E7EB] bg-[#F5F3FF] p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#14B8A6] text-white shadow-md">
                  <GraduationCap size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#14213D] dark:text-white">The Student Experience</h3>
                  <p className="text-xs text-[#64748B] dark:text-slate-400">Autonomous, transparent, and private</p>
                </div>
              </div>
              <ul className="space-y-4 text-xs text-[#64748B] dark:text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="h-5 w-5 rounded-full bg-[#14B8A6]/20 text-[#0D9488] flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5">1</span>
                  <span><strong>Eligibility Evaluation:</strong> Instant feedback on why a drive is open or locked based on CGPA, backlogs, and Dream Offer rules.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="h-5 w-5 rounded-full bg-[#14B8A6]/20 text-[#0D9488] flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5">2</span>
                  <span><strong>1-Click Applications:</strong> Submit applications directly to campus recruitment drives before deadlines.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="h-5 w-5 rounded-full bg-[#14B8A6]/20 text-[#0D9488] flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5">3</span>
                  <span><strong>Interview Scheduling:</strong> Google Meet links, physical venue locations, and attendance acknowledgment in one card.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="h-5 w-5 rounded-full bg-[#14B8A6]/20 text-[#0D9488] flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5">4</span>
                  <span><strong>Department No-Dues Checklist:</strong> Transparent checklist showing Library, Accounts, and Lab statuses with explicit remarks.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="h-5 w-5 rounded-full bg-[#14B8A6]/20 text-[#0D9488] flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5">5</span>
                  <span><strong>Verifiable PDF Certificate:</strong> One-click download of the official clearance certificate once 100% cleared.</span>
                </li>
              </ul>
              <button
                onClick={() => openAuth("student")}
                className="mt-8 flex items-center gap-2 text-xs font-bold text-[#14B8A6] hover:underline"
              >
                Access Student Portal Demo <ArrowRight size={14} />
              </button>
            </div>

            {/* Faculty Experience */}
            <div className="rounded-3xl border border-[#E5E7EB] bg-white p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#14213D] text-white shadow-md dark:bg-[#4F46E5]">
                  <BriefcaseBusiness size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#14213D] dark:text-white">The Faculty & Admin Command</h3>
                  <p className="text-xs text-[#64748B] dark:text-slate-400">Institutional control for placement officers & HODs</p>
                </div>
              </div>
              <ul className="space-y-4 text-xs text-[#64748B] dark:text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="h-5 w-5 rounded-full bg-[#14213D]/10 dark:bg-white/10 text-[#14213D] dark:text-white flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5">1</span>
                  <span><strong>Recruitment Drive Publishing:</strong> Create company drives, configure CGPA filters, stages, and salary tiers.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="h-5 w-5 rounded-full bg-[#14213D]/10 dark:bg-white/10 text-[#14213D] dark:text-white flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5">2</span>
                  <span><strong>Pipeline Management:</strong> Transition applicant cohorts through Shortlist, Assessment, Interview, and Offer rollout.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="h-5 w-5 rounded-full bg-[#14213D]/10 dark:bg-white/10 text-[#14213D] dark:text-white flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5">3</span>
                  <span><strong>Clearance Queues:</strong> Approve or reject clearances with actionable feedback per department.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="h-5 w-5 rounded-full bg-[#14213D]/10 dark:bg-white/10 text-[#14213D] dark:text-white flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5">4</span>
                  <span><strong>Rule-Based At-Risk Widget:</strong> Immediately detects unplaced final-year students with blocked mandatory clearances.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="h-5 w-5 rounded-full bg-[#14213D]/10 dark:bg-white/10 text-[#14213D] dark:text-white flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5">5</span>
                  <span><strong>One-Click CSV/Excel Exports:</strong> Generate NIRF/NAAC-ready placement summaries and clearance compliance reports.</span>
                </li>
              </ul>
              <button
                onClick={() => openAuth("faculty")}
                className="mt-8 flex items-center gap-2 text-xs font-bold text-[#4F46E5] dark:text-[#6366F1] hover:underline"
              >
                Access Faculty Command Demo <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* No-Dues Workflow Showcase */}
      <section id="nodues" className="py-20 bg-[#14213D] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#14B8A6]">
              Zero Paper Clearance
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
              The Departmental No-Dues Pipeline
            </h2>
            <p className="mt-3 text-sm text-slate-300">
              Clearances across 6 distinct departments synchronized into one cryptographic seal.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
            {[
              { code: "LIB", name: "Central Library", desc: "Book returns & dues", status: "Cleared" },
              { code: "LAB", name: "Laboratories", desc: "Component verification", status: "Cleared" },
              { code: "DEPT", name: "Academic Dept", desc: "Thesis & seminar credits", status: "Cleared" },
              { code: "T&P", name: "Placement Cell", desc: "Offer confirmation", status: "Cleared" },
              { code: "ACC", name: "Accounts Office", desc: "Tuition reconciliation", status: "Cleared" },
              { code: "HST", name: "Hostel & Mess", desc: "Room vacation / N.A.", status: "Verified" },
            ].map((cat, i) => (
              <div key={cat.code} className="rounded-2xl border border-[#26334A] bg-[#26334A]/60 p-4 backdrop-blur-sm">
                <span className="inline-block text-xs font-black text-[#14B8A6] mb-2">{`0${i + 1}`}</span>
                <h4 className="text-sm font-bold text-white">{cat.name}</h4>
                <p className="text-[10px] text-slate-300 mt-1">{cat.desc}</p>
                <span className="mt-3 inline-block rounded-full bg-[#14B8A6]/20 px-2 py-0.5 text-[9px] font-bold text-[#14B8A6]">
                  {cat.status}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-3xl border border-[#14B8A6]/40 bg-[#14B8A6]/10 p-6 text-center max-w-2xl mx-auto">
            <p className="text-xs font-bold text-[#14B8A6] uppercase tracking-widest">
              Institutional Security Guarantee
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-200">
              “Overall clearance is granted <strong className="text-white">only when 100% of mandatory categories</strong> are Cleared or Not Applicable. A single pending or rejected category halts certificate generation.”
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E5E7EB] dark:border-slate-800 bg-white dark:bg-[#14213D] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4F46E5] text-white shadow-md">
                <GraduationCap size={20} />
              </div>
              <div>
                <span className="text-base font-extrabold tracking-tight text-[#14213D] dark:text-white">
                  Campus<span className="text-[#6366F1]">Bridge</span>
                </span>
                <p className="text-[10px] text-[#64748B] dark:text-slate-400">University Placement & Department No-Dues Intelligence Platform</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs text-[#64748B] dark:text-slate-300 font-semibold">
              <button onClick={() => scrollTo("hero")} className="hover:text-[#4F46E5]">Home</button>
              <button onClick={() => scrollTo("features")} className="hover:text-[#4F46E5]">Features</button>
              <button onClick={() => scrollTo("workflow")} className="hover:text-[#4F46E5]">Workflow</button>
              <button onClick={() => scrollTo("nodues")} className="hover:text-[#4F46E5]">No-Dues</button>
              <button onClick={onOpenPublicVerification} className="hover:text-[#4F46E5]">Public Verification</button>
              <button onClick={() => openAuth()} className="hover:text-[#4F46E5]">Sign In</button>
            </div>

            <p className="text-[11px] text-[#64748B] dark:text-slate-400">
              © {new Date().getFullYear()} CampusBridge. Open-Source University Technology.
            </p>
          </div>
        </div>
      </footer>

      {/* Sign In Modal */}
      <SignInModal
        isOpen={isSignInOpen}
        onClose={() => setIsSignInOpen(false)}
        defaultRole={signInRole}
      />
    </div>
  );
};
