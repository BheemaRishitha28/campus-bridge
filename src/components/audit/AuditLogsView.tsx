import React, { useState } from "react";
import { ShieldCheck, Search, Filter, Clock, FileCheck2, UserCheck, AlertTriangle } from "lucide-react";
import { useStore } from "../../lib/store";

export const AuditLogsView: React.FC = () => {
  const { auditLogs } = useStore();
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("ALL");

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.actor_name.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase());

    const matchesAction = filterAction === "ALL" || log.target_type === filterAction;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#14213D] dark:text-white">
            System Audit Trail & Security Ledger
          </h1>
          <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
            Immutable, chronological record of placement, clearance, certificate, and administrative actions
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-[#D9EEE4] px-4 py-2 text-xs font-bold text-[#065F46]">
          <ShieldCheck size={16} className="text-[#065F46]" />
          <span>Tamper-evident append-only ledger</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="rounded-3xl border border-[#E5E7EB] bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#14213D]">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search logs by actor, action, or details..."
              className="w-full rounded-xl border border-[#E5E7EB] bg-[#F5F3FF]/60 py-2 pl-9 pr-3 text-[#172033] outline-none focus:border-[#4F46E5] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="rounded-xl border border-[#E5E7EB] bg-[#F5F3FF]/60 py-2 px-3 font-semibold text-[#172033] outline-none focus:border-[#4F46E5] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="ALL">All Event Target Types</option>
            <option value="clearance">Clearance Decisions</option>
            <option value="certificate">Certificates Issued/Revoked</option>
            <option value="offer">Placement Offers</option>
            <option value="application">Application Transitions</option>
            <option value="drive">Drive Management</option>
            <option value="student">Student Enrolment</option>
            <option value="import">Batch Imports</option>
            <option value="policy">Policy Updates</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-3xl border border-[#E5E7EB] bg-white shadow-sm dark:border-slate-800 dark:bg-[#14213D] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F3FF] dark:bg-slate-800 text-[#14213D] font-extrabold uppercase text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Actor</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Target Type</th>
                <th className="py-3.5 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] dark:divide-slate-800">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-[#64748B]">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F5F3FF]/40 dark:hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#64748B] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-[#14213D] dark:text-white">{log.actor_name}</span>
                      <span className="block text-[10px] text-[#64748B] capitalize">{log.actor_role.replace("_", " ")}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="rounded-full bg-[#D8EAFB] px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#14213D]">
                        {log.action.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 uppercase text-[10px] font-bold text-[#64748B]">
                      {log.target_type}
                    </td>
                    <td className="py-3.5 px-4 text-[#172033] dark:text-slate-300 max-w-md">
                      {log.details}
                      {log.old_value && log.new_value && (
                        <span className="block text-[10px] text-[#64748B] mt-0.5">
                          Transition: <strong className="text-slate-700 dark:text-slate-300">{log.old_value}</strong> → <strong className="text-[#4F46E5]">{log.new_value}</strong>
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
