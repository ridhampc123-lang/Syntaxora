import React from "react";
import Link from "next/link";
import { FileText, ArrowLeft, Search, ShieldCheck } from "lucide-react";
import { getAdminAuditLogs } from "@/server/services/adminService";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";

export const metadata = {
  title: "Audit Trail & Compliance Log — Syntaxora Admin",
  description: "Cryptographically bound, immutable event log for role, attendance, and administrative mutations.",
};

interface AuditLogsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminAuditLogsPage({ searchParams }: AuditLogsPageProps) {
  const resolved = await searchParams;
  const entityFilter = typeof resolved.entity === "string" ? resolved.entity : undefined;
  const search = typeof resolved.q === "string" ? resolved.q.toLowerCase().trim() : "";

  const allLogs = await getAdminAuditLogs(entityFilter, 100);

  let filtered = allLogs;
  if (search) {
    filtered = filtered.filter(
      (l) =>
        (l.actor_email && l.actor_email.toLowerCase().includes(search)) ||
        l.action.toLowerCase().includes(search) ||
        l.entity_type.toLowerCase().includes(search) ||
        (l.entity_id && l.entity_id.toLowerCase().includes(search)) ||
        (l.details && JSON.stringify(l.details).toLowerCase().includes(search))
    );
  }

  const entityTypes = [
    { id: "all", label: "All Events" },
    { id: "STUDENT", label: "Students" },
    { id: "STUDENT_APPLICATION", label: "Applications" },
    { id: "COURSE", label: "Courses" },
    { id: "BATCH", label: "Batches" },
    { id: "ENROLLMENT", label: "Enrollments" },
    { id: "ATTENDANCE", label: "Attendance" },
    { id: "PAYMENT", label: "Payments" },
  ];

  return (
    <div className="space-y-8">
      {/* Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#5F6F84] mb-1">
            <Link href="/admin" className="hover:text-[#3869AD] flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" />
              <span>Admin Overview</span>
            </Link>
            <span>/</span>
            <span className="font-semibold text-[#142541]">Compliance Log</span>
          </div>

          <h2 className="text-2xl font-black text-[#142541] tracking-tight">
            Cryptographic Audit Trail
          </h2>
          <p className="text-xs text-[#5F6F84] mt-0.5">
            Immutable audit record of all administrative changes, grade releases, and guardian link transitions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Immutable Ledger</span>
          </div>
        </div>
      </div>

      {/* Entity Type Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#F3F6FA] border border-[#DCE4EE] text-xs">
        {entityTypes.map((tab) => {
          const isSelected = (!entityFilter && tab.id === "all") || entityFilter === tab.id;
          return (
            <Link
              key={tab.id}
              href={tab.id === "all" ? "/admin/audit-logs" : `/admin/audit-logs?entity=${tab.id}`}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                isSelected
                  ? "bg-white text-[#142541] shadow-xs"
                  : "text-[#5F6F84] hover:text-[#142541]"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Audit Logs Table */}
      <div className="rounded-xl border border-[#DCE4EE] bg-white overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#DCE4EE] bg-[#F3F6FA] text-xs font-semibold text-[#142541] flex items-center justify-between">
          <span>Audit Log Entries ({filtered.length})</span>
          <span className="text-[11px] text-[#5F6F84]">
            Enforced by PostgreSQL Write-Once Ledger
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#DCE4EE] text-[#142541] font-semibold uppercase tracking-wider text-[11px] bg-[#F3F6FA]/50">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Actor Profile</th>
                <th className="p-3.5">Action Executed</th>
                <th className="p-3.5">Entity Type</th>
                <th className="p-3.5">Entity Identifier</th>
                <th className="p-3.5">Audit Metadata / Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE4EE] text-[#263449]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-[#5F6F84]">
                    <FileText className="h-8 w-8 text-[#5F6F84]/40 mx-auto mb-2" />
                    <p className="font-semibold text-sm text-[#142541]">No Audit Events Found</p>
                    <p className="text-xs text-[#5F6F84] mt-0.5">
                      Administrative mutations and security events are logged here automatically.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F3F6FA]/50 transition-colors">
                    <td className="p-3.5 whitespace-nowrap text-[#5F6F84] font-mono text-[11px]">
                      {formatDateTime(log.created_at)}
                    </td>
                    <td className="p-3.5 whitespace-nowrap font-bold text-[#142541]">
                      {log.actor_email}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <Badge variant="navy">{log.action}</Badge>
                    </td>
                    <td className="p-3.5 whitespace-nowrap font-mono text-[11px] text-[#5F6F84]">
                      {log.entity_type}
                    </td>
                    <td className="p-3.5 whitespace-nowrap font-mono text-[11px] text-[#3869AD]">
                      {log.entity_id ? log.entity_id.substring(0, 13) + "..." : "—"}
                    </td>
                    <td className="p-3.5 text-[#5F6F84] font-mono text-[11px] max-w-sm truncate">
                      {JSON.stringify(log.details || {})}
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
}
