import React from "react";
import { getAdminAuditLogs } from "@/server/services/adminService";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";

export const metadata = {
  title: "Audit Trail & Compliance Log — Syntaxora Admin",
  description: "Cryptographically bound, immutable event log for role, attendance, and administrative mutations.",
};

export default async function AdminAuditLogsPage() {
  const logs = await getAdminAuditLogs();

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold text-[#142541] tracking-tight">
          System Audit Log
        </h2>
        <p className="text-xs text-[#5F6F84] mt-0.5">
          Immutable audit record of all administrative changes, grade releases, and guardian link transitions.
        </p>
      </div>

      <div className="rounded-xl border border-[#DCE4EE] bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F3F6FA] border-b border-[#DCE4EE] text-[#142541] font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Actor</th>
                <th className="p-3.5">Action</th>
                <th className="p-3.5">Entity Type</th>
                <th className="p-3.5">Entity ID</th>
                <th className="p-3.5">Metadata / Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE4EE] text-[#263449]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-[#F3F6FA]/50 transition-colors">
                  <td className="p-3.5 whitespace-nowrap text-[#5F6F84]">
                    {formatDateTime(log.created_at)}
                  </td>
                  <td className="p-3.5 whitespace-nowrap font-medium text-[#142541]">
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
