import React, { useState } from "react";
import {
  Users,
  Search,
  Filter,
  Plus,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit2,
  Trash2,
  X,
  FileCheck2,
  AlertTriangle,
} from "lucide-react";
import { useStore } from "../../lib/store";
import { Profile, ImportSummary } from "../../types/domain";
import { parseAndValidateStudentFile, downloadSampleTemplate } from "../../lib/importParser";
import { exportStudentPlacementReport } from "../../lib/exportUtils";

interface StudentManagementViewProps {
  isImportOpen?: boolean;
  onCloseImport?: () => void;
  isAddOpen?: boolean;
  onCloseAdd?: () => void;
}

export const StudentManagementView: React.FC<StudentManagementViewProps> = ({
  isImportOpen = false,
  onCloseImport,
  isAddOpen = false,
  onCloseAdd,
}) => {
  const {
    students,
    offers,
    applications,
    currentUser,
    addStudent,
    updateStudent,
    importStudents,
  } = useStore();

  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("ALL");
  const [filterBatch, setFilterBatch] = useState("ALL");
  const [filterPlacement, setFilterPlacement] = useState("ALL");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Selected student for detail/edit
  const [selectedStudent, setSelectedStudent] = useState<Profile | null>(null);

  // Add Student Form State
  const [showAddModal, setShowAddModal] = useState(isAddOpen);
  const [addForm, setAddForm] = useState({
    roll_number: "",
    full_name: "",
    department_code: "CSE",
    program: "B.Tech Computer Science",
    year_of_study: 4,
    section: "A",
    graduation_year: 2026,
    university_email: "",
    cgpa: 7.5,
    backlogs: 0,
    placement_registered: true,
  });
  const [addError, setAddError] = useState<string | null>(null);

  // 10-Step Import Modal State
  const [showImportModal, setShowImportModal] = useState(isImportOpen);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);
  const [importStep, setImportStep] = useState<"upload" | "preview" | "confirmed">("upload");
  const [importLoading, setImportLoading] = useState(false);
  const [importSuccessCount, setImportSuccessCount] = useState<number | null>(null);

  // Sync props if changed
  React.useEffect(() => {
    setShowAddModal(isAddOpen);
  }, [isAddOpen]);

  React.useEffect(() => {
    setShowImportModal(isImportOpen);
  }, [isImportOpen]);

  // Authorization check
  const isAdmin = currentUser?.role === "placement_admin";

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.roll_number.toLowerCase().includes(search.toLowerCase()) ||
      s.university_email.toLowerCase().includes(search.toLowerCase());

    const matchesDept = filterDept === "ALL" || s.department_code === filterDept;
    const matchesBatch = filterBatch === "ALL" || s.graduation_year.toString() === filterBatch;

    const studentOffers = offers.filter((o) => o.student_id === s.id);
    const matchesPlacement =
      filterPlacement === "ALL" ||
      (filterPlacement === "PLACED" && studentOffers.length > 0) ||
      (filterPlacement === "UNPLACED" && studentOffers.length === 0);

    return matchesSearch && matchesDept && matchesBatch && matchesPlacement;
  });

  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const paginatedStudents = filteredStudents.slice((page - 1) * pageSize, page * pageSize);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    if (!addForm.roll_number || !addForm.full_name || !addForm.university_email) {
      setAddError("Please fill in all required fields (Roll No, Name, Email).");
      return;
    }
    try {
      await addStudent({
        ...addForm,
        department_id: `dept-${addForm.department_code.toLowerCase()}`,
      });
      setShowAddModal(false);
      if (onCloseAdd) onCloseAdd();
      setAddForm({
        roll_number: "",
        full_name: "",
        department_code: "CSE",
        program: "B.Tech Computer Science",
        year_of_study: 4,
        section: "A",
        graduation_year: 2026,
        university_email: "",
        cgpa: 7.5,
        backlogs: 0,
        placement_registered: true,
      });
    } catch (err: any) {
      setAddError(err?.message || "Failed to add student.");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFile(file);
    setImportLoading(true);
    try {
      const summary = await parseAndValidateStudentFile(file, students);
      setImportSummary(summary);
      setImportStep("preview");
    } catch (err) {
      console.error(err);
    } finally {
      setImportLoading(false);
    }
  };

  const handleCommitImport = async () => {
    if (!importSummary || importSummary.preview_data.length === 0) return;
    setImportLoading(true);
    try {
      const res = await importStudents(importSummary.preview_data);
      setImportSuccessCount(res.count);
      setImportStep("confirmed");
    } catch (err) {
      console.error("Import commit failed", err);
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#14213D] dark:text-white">
            Student Management & Directory
          </h1>
          <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
            Verified academic cohorts, placement eligibility, and demographic records
          </p>
        </div>

        {isAdmin && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setShowImportModal(true);
                setImportStep("upload");
                setImportSummary(null);
                setImportSuccessCount(null);
              }}
              className="flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2 text-xs font-bold text-[#172033] shadow-sm hover:border-[#14B8A6] hover:text-[#14B8A6] dark:border-slate-700 dark:bg-[#14213D] dark:text-slate-200 transition"
            >
              <FileSpreadsheet size={15} className="text-[#14B8A6]" /> Bulk Ingestion
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-[#4F46E5] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition"
            >
              <Plus size={15} /> Add Student
            </button>
            <button
              onClick={() => exportStudentPlacementReport(students, offers, applications, "xlsx")}
              className="flex items-center gap-1.5 rounded-xl bg-[#14213D] px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#26334A] dark:bg-[#6366F1] transition"
              title="Export to Excel"
            >
              <Download size={14} /> Export XLSX
            </button>
          </div>
        )}
      </div>

      {/* Filters & Search Bar */}
      <div className="rounded-3xl border border-[#E5E7EB] bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#14213D]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Search Input */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, roll, email..."
              className="w-full rounded-xl border border-[#E5E7EB] bg-[#F5F3FF]/60 py-2 pl-9 pr-3 text-[#172033] outline-none focus:border-[#4F46E5] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          {/* Department Filter */}
          <select
            value={filterDept}
            onChange={(e) => {
              setFilterDept(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-[#E5E7EB] bg-[#F5F3FF]/60 py-2 px-3 font-semibold text-[#172033] outline-none focus:border-[#4F46E5] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="ALL">All Departments</option>
            <option value="CSE">Computer Science (CSE)</option>
            <option value="ECE">Electronics (ECE)</option>
            <option value="MECH">Mechanical (MECH)</option>
          </select>

          {/* Batch Filter */}
          <select
            value={filterBatch}
            onChange={(e) => {
              setFilterBatch(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-[#E5E7EB] bg-[#F5F3FF]/60 py-2 px-3 font-semibold text-[#172033] outline-none focus:border-[#4F46E5] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="ALL">All Batches</option>
            <option value="2026">Batch 2026</option>
            <option value="2025">Batch 2025</option>
            <option value="2027">Batch 2027</option>
          </select>

          {/* Placement Status Filter */}
          <select
            value={filterPlacement}
            onChange={(e) => {
              setFilterPlacement(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-[#E5E7EB] bg-[#F5F3FF]/60 py-2 px-3 font-semibold text-[#172033] outline-none focus:border-[#4F46E5] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="ALL">All Placement Statuses</option>
            <option value="PLACED">Placed Only</option>
            <option value="UNPLACED">Unplaced Only</option>
          </select>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="rounded-3xl border border-[#E5E7EB] bg-white shadow-sm dark:border-slate-800 dark:bg-[#14213D] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F3FF] dark:bg-slate-800/60 border-b border-[#E5E7EB] dark:border-slate-800 text-[10px] font-black uppercase tracking-wider text-[#14213D] dark:text-[#DCD5FA]">
              <tr>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Dept / Program</th>
                <th className="py-3.5 px-4">Batch</th>
                <th className="py-3.5 px-4">CGPA</th>
                <th className="py-3.5 px-4">Backlogs</th>
                <th className="py-3.5 px-4">Placement Status</th>
                <th className="py-3.5 px-4">Offers</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] dark:divide-slate-800">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-[#64748B]">
                    No students match the selected search criteria.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((st) => {
                  const studentOffers = offers.filter((o) => o.student_id === st.id);
                  const isPlaced = studentOffers.length > 0;
                  return (
                    <tr key={st.id} className="hover:bg-[#F5F3FF]/40 dark:hover:bg-slate-800/30 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#D8EAFB] text-[#14213D] font-black text-xs shadow-sm">
                            {st.full_name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-[#14213D] dark:text-white">{st.full_name}</p>
                            <p className="text-[10px] text-[#64748B]">{st.roll_number} · {st.university_email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#172033] dark:text-slate-300">
                        {st.department_code} <span className="text-[#64748B] font-normal">({st.section})</span>
                      </td>
                      <td className="py-3.5 px-4 text-[#64748B] dark:text-slate-300">{st.graduation_year}</td>
                      <td className="py-3.5 px-4 font-black text-[#14213D] dark:text-white">{st.cgpa.toFixed(2)}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                            st.backlogs === 0
                              ? "bg-[#D9EEE4] text-[#065F46]"
                              : "bg-[#F7DCE8] text-rose-700"
                          }`}
                        >
                          {st.backlogs} {st.backlogs === 1 ? "backlog" : "backlogs"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                            isPlaced
                              ? "bg-[#D9EEE4] text-[#065F46]"
                              : "bg-[#F5F3FF] text-[#64748B]"
                          }`}
                        >
                          {isPlaced ? "Placed" : "Unplaced"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold">
                        {studentOffers.length > 0 ? (
                          <span className="rounded-full bg-[#DCD5FA] text-[#3730A3] px-2.5 py-0.5 text-[10px] font-extrabold inline-block">
                            {studentOffers.length} ({studentOffers.map((o) => `${o.package_lpa}L`).join(", ")})
                          </span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedStudent(st)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-[#F5F3FF] hover:text-[#4F46E5] dark:hover:bg-slate-800 transition"
                          title="View Profile"
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-[#E5E7EB] dark:border-slate-800 px-4 py-3 bg-[#F5F3FF]/40 dark:bg-slate-800/30 text-xs text-[#64748B]">
          <span>
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filteredStudents.length)} of {filteredStudents.length} students
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="rounded-lg border border-[#E5E7EB] p-1.5 text-slate-600 hover:bg-white disabled:opacity-30 dark:border-slate-700 dark:text-slate-300"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="px-2 font-bold">{page} of {totalPages}</span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="rounded-lg border border-[#E5E7EB] p-1.5 text-slate-600 hover:bg-white disabled:opacity-30 dark:border-slate-700 dark:text-slate-300"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal: View Student Profile Drawer */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#14213D]/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-[#14213D]">
            <button
              onClick={() => setSelectedStudent(null)}
              className="absolute top-5 right-5 rounded-full p-2 text-slate-400 hover:bg-[#F5F3FF] dark:hover:bg-slate-800"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 border-b border-[#E5E7EB] dark:border-slate-800 pb-4 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#4F46E5] text-white font-black text-lg shadow-sm">
                {selectedStudent.full_name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#14213D] dark:text-white">{selectedStudent.full_name}</h3>
                <p className="text-xs text-[#64748B]">{selectedStudent.roll_number} · {selectedStudent.department_code}</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[#64748B]">Email</span>
                <span className="font-semibold text-[#172033] dark:text-slate-200">{selectedStudent.university_email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[#64748B]">Program</span>
                <span className="font-semibold text-[#172033] dark:text-slate-200">{selectedStudent.program}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[#64748B]">Year / Section</span>
                <span className="font-semibold text-[#172033] dark:text-slate-200">Year {selectedStudent.year_of_study} (Sec {selectedStudent.section})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[#64748B]">CGPA</span>
                <span className="font-black text-[#065F46] bg-[#D9EEE4] px-2 py-0.5 rounded-md">{selectedStudent.cgpa.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[#64748B]">Active Backlogs</span>
                <span className="font-semibold text-[#172033] dark:text-slate-200">{selectedStudent.backlogs}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[#64748B]">Placement Registered</span>
                <span className="font-semibold text-[#172033] dark:text-slate-200">{selectedStudent.placement_registered ? "Yes" : "No"}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedStudent(null)}
              className="w-full mt-6 rounded-xl bg-[#14213D] py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#26334A] dark:bg-[#4F46E5] transition"
            >
              Close Profile
            </button>
          </div>
        </div>
      )}

      {/* Modal: Add Student */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#14213D]/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-[#14213D] md:p-8">
            <button
              onClick={() => {
                setShowAddModal(false);
                if (onCloseAdd) onCloseAdd();
              }}
              className="absolute top-5 right-5 rounded-full p-2 text-slate-400 hover:bg-[#F5F3FF] dark:hover:bg-slate-800"
            >
              <X size={18} />
            </button>

            <h2 className="text-xl font-extrabold text-[#14213D] dark:text-white mb-1">
              Add New Student Record
            </h2>
            <p className="text-xs text-[#64748B] mb-5">
              Enrolls student into academic registry and initializes zero-dues clearance tracking.
            </p>

            {addError && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
                <AlertCircle size={15} /> {addError}
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#14213D] dark:text-slate-300 mb-1">
                    Roll Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={addForm.roll_number}
                    onChange={(e) => setAddForm({ ...addForm, roll_number: e.target.value })}
                    placeholder="e.g. 22CS115"
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white p-2.5 outline-none focus:border-[#4F46E5] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#14213D] dark:text-slate-300 mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={addForm.full_name}
                    onChange={(e) => setAddForm({ ...addForm, full_name: e.target.value })}
                    placeholder="e.g. Manisha Sharma"
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white p-2.5 outline-none focus:border-[#4F46E5] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#14213D] dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <select
                    value={addForm.department_code}
                    onChange={(e) => setAddForm({ ...addForm, department_code: e.target.value })}
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white p-2.5 outline-none focus:border-[#4F46E5] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="CSE">Computer Science (CSE)</option>
                    <option value="ECE">Electronics (ECE)</option>
                    <option value="MECH">Mechanical (MECH)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#14213D] dark:text-slate-300 mb-1">
                    Graduation Year
                  </label>
                  <input
                    type="number"
                    value={addForm.graduation_year}
                    onChange={(e) => setAddForm({ ...addForm, graduation_year: parseInt(e.target.value, 10) })}
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white p-2.5 outline-none focus:border-[#4F46E5] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#14213D] dark:text-slate-300 mb-1">
                  University Email *
                </label>
                <input
                  type="email"
                  required
                  value={addForm.university_email}
                  onChange={(e) => setAddForm({ ...addForm, university_email: e.target.value })}
                  placeholder="e.g. manisha.s@campusbridge.edu"
                  className="w-full rounded-xl border border-[#E5E7EB] bg-white p-2.5 outline-none focus:border-[#4F46E5] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#14213D] dark:text-slate-300 mb-1">
                    CGPA (0.00 - 10.00)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={addForm.cgpa}
                    onChange={(e) => setAddForm({ ...addForm, cgpa: parseFloat(e.target.value) })}
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white p-2.5 outline-none focus:border-[#4F46E5] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#14213D] dark:text-slate-300 mb-1">
                    Active Backlogs
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={addForm.backlogs}
                    onChange={(e) => setAddForm({ ...addForm, backlogs: parseInt(e.target.value, 10) })}
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white p-2.5 outline-none focus:border-[#4F46E5] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-[#E5E7EB] px-4 py-2.5 font-bold text-[#64748B] hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#4F46E5] px-5 py-2.5 font-bold text-white shadow-sm hover:bg-indigo-700 transition"
                >
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 10-Step Mandatory Bulk Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#14213D]/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-[#14213D] md:p-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowImportModal(false);
                if (onCloseImport) onCloseImport();
              }}
              className="absolute top-5 right-5 rounded-full p-2 text-slate-400 hover:bg-[#F5F3FF] dark:hover:bg-slate-800"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#D9EEE4] text-[#065F46]">
                <FileSpreadsheet size={16} />
              </span>
              <h2 className="text-xl font-extrabold text-[#14213D] dark:text-white">
                10-Step Bulk Student Ingestion
              </h2>
            </div>
            <p className="text-xs text-[#64748B] mb-6">
              Compliant ingestion workflow: Template → Parse → Column Check → Format Validation → Duplicate Detection → Preview → Confirmation.
            </p>

            {/* Step 1: Upload and Template */}
            {importStep === "upload" && (
              <div className="space-y-5 text-xs">
                {/* Download Sample Template */}
                <div className="flex items-center justify-between rounded-2xl border border-indigo-100 bg-[#D8EAFB]/40 p-4">
                  <div>
                    <p className="font-extrabold text-[#14213D]">Download Official CSV/XLSX Template</p>
                    <p className="text-[11px] text-[#64748B] mt-0.5">
                      Includes required headers: roll_number, full_name, department_code, cgpa, backlogs, etc.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => downloadSampleTemplate("xlsx")}
                      className="rounded-xl bg-[#4F46E5] px-3 py-1.5 font-bold text-white shadow-sm hover:bg-indigo-700 transition"
                    >
                      Template (.XLSX)
                    </button>
                    <button
                      onClick={() => downloadSampleTemplate("csv")}
                      className="rounded-xl border border-indigo-200 bg-white px-3 py-1.5 font-bold text-[#4F46E5] shadow-sm hover:bg-[#F5F3FF] transition"
                    >
                      CSV
                    </button>
                  </div>
                </div>

                {/* File Upload Drop Area */}
                <label className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#E5E7EB] bg-[#F5F3FF]/40 p-8 text-center cursor-pointer hover:border-[#4F46E5] transition">
                  <FileSpreadsheet size={36} className="text-[#4F46E5] mb-2 opacity-70" />
                  <p className="font-bold text-[#14213D] dark:text-slate-300 text-sm">
                    {importLoading ? "Parsing file and validating rows..." : "Click or drag student XLSX/CSV file here"}
                  </p>
                  <p className="text-[11px] text-[#64748B] mt-1">Supports Microsoft Excel (.xlsx) and CSV formats</p>
                  <input
                    type="file"
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {/* Step 2: Validation Preview */}
            {importStep === "preview" && importSummary && (
              <div className="space-y-4 text-xs">
                {/* Status KPI summary with Pastel Cards */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="rounded-xl bg-[#F5F3FF] p-3 border border-[#E5E7EB]">
                    <p className="text-[10px] text-[#64748B] uppercase font-bold">Total Rows</p>
                    <p className="text-lg font-black text-[#14213D] dark:text-white mt-0.5">{importSummary.total_rows}</p>
                  </div>
                  <div className="rounded-xl bg-[#D9EEE4] p-3 border border-emerald-200">
                    <p className="text-[10px] text-[#065F46] uppercase font-bold">Valid</p>
                    <p className="text-lg font-black text-[#065F46] mt-0.5">{importSummary.valid_rows}</p>
                  </div>
                  <div className="rounded-xl bg-[#F8DCCF] p-3 border border-orange-200">
                    <p className="text-[10px] text-[#9A3412] uppercase font-bold">Duplicates</p>
                    <p className="text-lg font-black text-[#9A3412] mt-0.5">{importSummary.duplicate_rows}</p>
                  </div>
                  <div className="rounded-xl bg-[#F7DCE8] p-3 border border-pink-200">
                    <p className="text-[10px] text-rose-700 uppercase font-bold">Invalid</p>
                    <p className="text-lg font-black text-rose-700 mt-0.5">{importSummary.invalid_rows}</p>
                  </div>
                </div>

                {/* Specific Errors List */}
                {importSummary.errors.length > 0 && (
                  <div className="rounded-2xl border border-rose-200 bg-[#F7DCE8]/40 p-4">
                    <p className="font-bold text-rose-800 flex items-center gap-1.5 mb-2">
                      <AlertCircle size={15} /> Identified Ingestion Issues ({importSummary.errors.length}):
                    </p>
                    <div className="max-h-36 overflow-y-auto space-y-1.5 text-[11px] text-rose-700">
                      {importSummary.errors.map((err, i) => (
                        <p key={i}>
                          • Row {err.row_number}: {err.message}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Valid Data Preview Table */}
                <div>
                  <p className="font-bold text-[#14213D] dark:text-slate-200 mb-2">
                    Valid Records Staged for Import ({importSummary.preview_data.length}):
                  </p>
                  <div className="max-h-44 overflow-y-auto rounded-xl border border-[#E5E7EB]">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-[#F5F3FF] text-[#14213D] font-bold">
                        <tr>
                          <th className="p-2">Roll</th>
                          <th className="p-2">Name</th>
                          <th className="p-2">Dept</th>
                          <th className="p-2">CGPA</th>
                          <th className="p-2">Backlogs</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E7EB]">
                        {importSummary.preview_data.map((r, i) => (
                          <tr key={i}>
                            <td className="p-2 font-bold">{r.roll_number}</td>
                            <td className="p-2">{r.full_name}</td>
                            <td className="p-2">{r.department_code}</td>
                            <td className="p-2 font-bold text-[#065F46]">{r.cgpa?.toFixed(2)}</td>
                            <td className="p-2">{r.backlogs}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 flex items-center justify-between border-t border-[#E5E7EB]">
                  <button
                    onClick={() => setImportStep("upload")}
                    className="font-bold text-[#64748B] hover:text-[#172033]"
                  >
                    ← Select different file
                  </button>
                  <button
                    disabled={importSummary.preview_data.length === 0 || importLoading}
                    onClick={handleCommitImport}
                    className="rounded-xl bg-[#14B8A6] px-6 py-2.5 font-bold text-white shadow-sm hover:bg-teal-600 disabled:opacity-40 transition"
                  >
                    {importLoading ? "Committing..." : `Confirm & Commit ${importSummary.preview_data.length} Valid Records`}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation Summary */}
            {importStep === "confirmed" && (
              <div className="text-center py-6 space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D9EEE4] text-[#065F46]">
                  <CheckCircle2 size={30} />
                </div>
                <h3 className="text-xl font-bold text-[#14213D] dark:text-white">Batch Import Successfully Committed</h3>
                <p className="text-xs text-[#64748B] max-w-md mx-auto">
                  {importSuccessCount} student profiles have been added to the database. Initial clearance checklist rows have been generated and audit event logged.
                </p>
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    if (onCloseImport) onCloseImport();
                  }}
                  className="rounded-xl bg-[#14213D] px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#26334A] dark:bg-[#4F46E5]"
                >
                  Return to Student Directory
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
