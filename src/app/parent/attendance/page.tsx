import React from "react";
import { Lock } from "lucide-react";
import { requireRole } from "@/server/services/authService";
import { getActiveChildrenForGuardian } from "@/server/services/guardianService";
import { getStudentAttendance } from "@/server/services/studentService";
import { ParentChildSelector } from "@/components/forms/ParentChildSelector";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Child Attendance Record — Syntaxora Guardian",
  description: "Official session attendance records for your enrolled student.",
};

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ParentAttendancePage({ searchParams }: Props) {
  const auth = await requireRole(["parent", "admin"]);
  const relationships = await getActiveChildrenForGuardian(auth.userId);

  const resolvedParams = await searchParams;
  const requestedChildId = typeof resolvedParams.childId === "string" ? resolvedParams.childId : undefined;
  const activeRel =
    relationships.find((r) => r.student_id === requestedChildId) ||
    relationships[0];

  if (!activeRel) {
    return (
      <div className="p-8 text-center text-xs text-[#5F6F84]">
        No active verified student links. Please contact academy administration.
      </div>
    );
  }

  const studentName = activeRel.student?.profile?.full_name || "Linked Student";

  if (!activeRel.can_view_attendance) {
    return (
      <div className="space-y-6">
        <ParentChildSelector relationships={relationships} selectedChildId={activeRel.student_id} />
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-8 text-center space-y-3">
          <div className="mx-auto h-12 w-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
            <Lock className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-amber-900">Attendance Access Restricted</h3>
          <p className="text-xs text-amber-700 max-w-md mx-auto">
            Your verified guardian link for {studentName} does not currently include attendance viewing authorization.
          </p>
        </div>
      </div>
    );
  }

  const records = await getStudentAttendance(activeRel.student_id);

  return (
    <div className="space-y-8">
      {/* Title & Child Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#142541] tracking-tight">
            Attendance Log: {studentName}
          </h2>
          <p className="text-xs text-[#5F6F84] mt-0.5">
            Verified session participation log backed by audited instructor records.
          </p>
        </div>
        <ParentChildSelector
          relationships={relationships}
          selectedChildId={activeRel.student_id}
        />
      </div>

      <div className="rounded-xl border border-[#DCE4EE] bg-white overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#DCE4EE] bg-[#F3F6FA] text-xs font-semibold text-[#142541]">
          Official Class Attendance History ({records.length} Sessions)
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#DCE4EE] text-[#142541] font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">Session Date</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Audit Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE4EE] text-[#263449]">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-[#F3F6FA]/50 transition-colors">
                  <td className="p-3.5 text-[#5F6F84] whitespace-nowrap">
                    {new Date(r.recorded_at).toLocaleDateString()} at{" "}
                    {new Date(r.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="p-3.5">
                    {r.status === "present" && <Badge variant="success">Present</Badge>}
                    {r.status === "late" && <Badge variant="warning">Late</Badge>}
                    {r.status === "absent" && <Badge variant="error">Absent</Badge>}
                    {r.status === "excused" && <Badge variant="outline">Excused</Badge>}
                  </td>
                  <td className="p-3.5 text-[#5F6F84] text-[11px]">
                    {r.correction_reason || "—"}
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
