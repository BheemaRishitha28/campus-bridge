import React, { useState } from "react";
import {
  FileDown,
  Download,
  Printer,
  Filter,
  BarChart3,
  Building2,
  Users,
  ClipboardCheck,
  FileSpreadsheet,
} from "lucide-react";
import { useStore } from "../../lib/store";
import { calculatePlacementAnalytics } from "../../lib/policyEngine";
import {
  exportDepartmentReport,
  exportCompanyDrivesReport,
  exportStudentPlacementReport,
  exportPendingNoDuesReport,
} from "../../lib/exportUtils";

export const ReportsView: React.FC = () => {
  const { students, applications, offers, drives, clearances } = useStore();

  const [activeReport, setActiveReport] = useState<
    "department" | "companies" | "students" | "pending_nodues"
  >("department");
  const [selectedBatch, setSelectedBatch] = useState<number>(2026);
  const [selectedDept, setSelectedDept] = useState<string>("All departments");

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

  const handleExport = (format: "xlsx" | "csv") => {
    switch (activeReport) {
      case "department":
        exportDepartmentReport(analytics.deptSummary, format);
        break;
      case "companies":
        exportCompanyDrivesReport(drives, applications, offers, format);
        break;
      case "students":
        exportStudentPlacementReport(students, offers, applications, format);
        break;
      case "pending_nodues":
        exportPendingNoDuesReport(students, clearances, format);
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#14213D] dark:text-white">
            Reports & Analytical Intelligence
          </h1>
          <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
            Export NIRF/NAAC compliant spreadsheets and institutional clearance summaries
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleExport("xlsx")}
            className="flex items-center gap-1.5 rounded-xl bg-[#14B8A6] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-teal-700 transition"
          >
            <FileSpreadsheet size={15} /> Export Excel (.xlsx)
          </button>
          <button
            onClick={() => handleExport("csv")}
            className="flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2 text-xs font-bold text-[#172033] shadow-sm hover:bg-[#F5F3FF] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition"
          >
            <Download size={14} /> Export CSV
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-xl bg-[#14213D] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#26334A] dark:bg-[#4F46E5] transition"
          >
            <Printer size={14} /> Print Summary
          </button>
        </div>
      </div>

      {/* Report Switcher Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#E5E7EB] dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveReport("department")}
          className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-extrabold transition-all ${
            activeReport === "department"
              ? "bg-[#4F46E5] text-white shadow-md shadow-indigo-600/25"
              : "bg-white text-[#64748B] border border-[#E5E7EB] hover:text-[#14213D] dark:bg-[#14213D] dark:text-slate-300"
          }`}
        >
          <BarChart3 size={15} /> Department Placements
        </button>
        <button
          onClick={() => setActiveReport("companies")}
          className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-extrabold transition-all ${
            activeReport === "companies"
              ? "bg-[#4F46E5] text-white shadow-md shadow-indigo-600/25"
              : "bg-white text-[#64748B] border border-[#E5E7EB] hover:text-[#14213D] dark:bg-[#14213D] dark:text-slate-300"
          }`}
        >
          <Building2 size={15} /> Company Recruitment Outcomes
        </button>
        <button
          onClick={() => setActiveReport("students")}
          className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-extrabold transition-all ${
            activeReport === "students"
              ? "bg-[#4F46E5] text-white shadow-md shadow-indigo-600/25"
              : "bg-white text-[#64748B] border border-[#E5E7EB] hover:text-[#14213D] dark:bg-[#14213D] dark:text-slate-300"
          }`}
        >
          <Users size={15} /> Student Placement History
        </button>
        <button
          onClick={() => setActiveReport("pending_nodues")}
          className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-extrabold transition-all ${
            activeReport === "pending_nodues"
              ? "bg-[#4F46E5] text-white shadow-md shadow-indigo-600/25"
              : "bg-white text-[#64748B] border border-[#E5E7EB] hover:text-[#14213D] dark:bg-[#14213D] dark:text-slate-300"
          }`}
        >
          <ClipboardCheck size={15} /> Pending No-Dues Roster
        </button>
      </div>

      {/* Render Active Report Table */}
      <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#14213D]">
        {activeReport === "department" && (
          <div>
            <h3 className="font-extrabold text-base text-[#14213D] dark:text-white mb-1">
              Department-Wise Placement Statistics · Batch {selectedBatch}
            </h3>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mb-5">
              Unique student placement count, multi-offer total, and placement percentage
            </p>

            <div className="overflow-x-auto rounded-2xl border border-[#E5E7EB] dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F3FF] dark:bg-slate-800 text-[#14213D] font-extrabold uppercase text-[10px]">
                  <tr>
                    <th className="p-3.5">Department Code</th>
                    <th className="p-3.5">Department Name</th>
                    <th className="p-3.5">Total Registered</th>
                    <th className="p-3.5">Unique Placed</th>
                    <th className="p-3.5">Total Offers</th>
                    <th className="p-3.5 text-right">Placement Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB] dark:divide-slate-800">
                  {analytics.deptSummary.map((d) => (
                    <tr key={d.short} className="hover:bg-[#F5F3FF]/40 dark:hover:bg-slate-800/30 transition">
                      <td className="p-3.5 font-black text-[#14213D] dark:text-white">{d.short}</td>
                      <td className="p-3.5 text-[#172033] dark:text-slate-300 font-semibold">{d.name}</td>
                      <td className="p-3.5 font-bold">{d.total}</td>
                      <td className="p-3.5 font-bold text-[#065F46]">{d.placed}</td>
                      <td className="p-3.5 font-bold text-[#3730A3]">{d.offers}</td>
                      <td className="p-3.5 text-right font-black text-[#14213D] dark:text-white text-sm">
                        <span className="rounded-full bg-[#D9EEE4] px-2.5 py-0.5 text-xs text-[#065F46]">
                          {d.rate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeReport === "companies" && (
          <div>
            <h3 className="font-extrabold text-base text-[#14213D] dark:text-white mb-1">
              Company-Wise Recruitment Outcomes
            </h3>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mb-5">
              Campus drives, applicant conversions, and offer letter distributions
            </p>

            <div className="overflow-x-auto rounded-2xl border border-[#E5E7EB] dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F3FF] dark:bg-slate-800 text-[#14213D] font-extrabold uppercase text-[10px]">
                  <tr>
                    <th className="p-3.5">Company Name</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">Package (CTC)</th>
                    <th className="p-3.5">Tier</th>
                    <th className="p-3.5">Applicants</th>
                    <th className="p-3.5">Offers Extended</th>
                    <th className="p-3.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB] dark:divide-slate-800">
                  {drives.map((d) => {
                    const apps = applications.filter((a) => a.drive_id === d.id);
                    const offs = offers.filter((o) => o.drive_id === d.id);
                    return (
                      <tr key={d.id} className="hover:bg-[#F5F3FF]/40 dark:hover:bg-slate-800/30 transition">
                        <td className="p-3.5 font-bold text-[#14213D] dark:text-white">{d.company_name}</td>
                        <td className="p-3.5 text-[#64748B] dark:text-slate-300 font-medium">{d.job_role}</td>
                        <td className="p-3.5 font-bold text-[#14213D] dark:text-white">₹{d.package_lpa} LPA</td>
                        <td className="p-3.5">
                          <span className="rounded-full bg-[#DCD5FA] px-2 py-0.5 text-[9px] font-extrabold text-[#3730A3] uppercase">
                            {d.tier.replace("_", " ")}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold">{apps.length}</td>
                        <td className="p-3.5 font-black text-[#065F46]">{offs.length}</td>
                        <td className="p-3.5 text-right">
                          <span className="rounded-full bg-[#D9EEE4] px-2.5 py-0.5 text-[10px] font-extrabold text-[#065F46] uppercase">
                            {d.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeReport === "students" && (
          <div>
            <h3 className="font-extrabold text-base text-[#14213D] dark:text-white mb-1">
              Student Placement History
            </h3>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mb-5">
              Comprehensive student placement log with qualifying offers and salary records
            </p>

            <div className="overflow-x-auto rounded-2xl border border-[#E5E7EB] dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F3FF] dark:bg-slate-800 text-[#14213D] font-extrabold uppercase text-[10px]">
                  <tr>
                    <th className="p-3.5">Roll No</th>
                    <th className="p-3.5">Student Name</th>
                    <th className="p-3.5">Dept</th>
                    <th className="p-3.5">CGPA</th>
                    <th className="p-3.5">Placement Status</th>
                    <th className="p-3.5">Offers Count</th>
                    <th className="p-3.5 text-right">Highest CTC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB] dark:divide-slate-800">
                  {students.slice(0, 15).map((st) => {
                    const stOffers = offers.filter((o) => o.student_id === st.id);
                    const highest = stOffers.reduce((max, o) => (o.package_lpa > max ? o.package_lpa : max), 0);
                    return (
                      <tr key={st.id} className="hover:bg-[#F5F3FF]/40 dark:hover:bg-slate-800/30 transition">
                        <td className="p-3.5 font-bold text-[#14213D] dark:text-white">{st.roll_number}</td>
                        <td className="p-3.5 font-medium">{st.full_name}</td>
                        <td className="p-3.5">{st.department_code}</td>
                        <td className="p-3.5 font-bold">{st.cgpa.toFixed(2)}</td>
                        <td className="p-3.5">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase ${
                              stOffers.length > 0
                                ? "bg-[#D9EEE4] text-[#065F46]"
                                : "bg-[#F5F3FF] text-[#64748B]"
                            }`}
                          >
                            {stOffers.length > 0 ? "Placed" : "Unplaced"}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-[#3730A3]">{stOffers.length}</td>
                        <td className="p-3.5 text-right font-black text-[#14213D] dark:text-white">
                          {highest > 0 ? `₹${highest} LPA` : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeReport === "pending_nodues" && (
          <div>
            <h3 className="font-extrabold text-base text-[#14213D] dark:text-white mb-1">
              Pending No-Dues Clearance Roster
            </h3>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mb-5">
              Students with pending or rejected mandatory requirements preventing certificate issuance
            </p>

            <div className="overflow-x-auto rounded-2xl border border-[#E5E7EB] dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F3FF] dark:bg-slate-800 text-[#14213D] font-extrabold uppercase text-[10px]">
                  <tr>
                    <th className="p-3.5">Roll No</th>
                    <th className="p-3.5">Student Name</th>
                    <th className="p-3.5">Dept</th>
                    <th className="p-3.5">Batch</th>
                    <th className="p-3.5">Pending Categories</th>
                    <th className="p-3.5 text-right">Contact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB] dark:divide-slate-800">
                  {students
                    .filter((st) => {
                      const stClearances = clearances.filter((c) => c.student_id === st.id);
                      return stClearances.some(
                        (c) => c.mandatory && (c.status === "pending" || c.status === "rejected")
                      );
                    })
                    .slice(0, 15)
                    .map((st) => {
                      const pendingCats = clearances
                        .filter(
                          (c) =>
                            c.student_id === st.id &&
                            c.mandatory &&
                            (c.status === "pending" || c.status === "rejected")
                        )
                        .map((c) => `${c.category_name} (${c.status})`);

                      return (
                        <tr key={st.id} className="hover:bg-[#F5F3FF]/40 dark:hover:bg-slate-800/30 transition">
                          <td className="p-3.5 font-bold text-[#14213D] dark:text-white">{st.roll_number}</td>
                          <td className="p-3.5 font-medium">{st.full_name}</td>
                          <td className="p-3.5">{st.department_code}</td>
                          <td className="p-3.5 text-[#64748B]">{st.graduation_year}</td>
                          <td className="p-3.5 font-semibold text-[#9A3412]">
                            {pendingCats.join(", ")}
                          </td>
                          <td className="p-3.5 text-right text-[#64748B]">{st.university_email}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
