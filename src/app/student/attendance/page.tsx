import React from "react";
import { requireRole } from "@/server/services/authService";
import {
  getStudentByProfileId,
  getStudentAttendance,
} from "@/server/services/studentService";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Personal Attendance Log — Syntaxora",
  description: "Official session attendance records and participation rate.",
};

export default async function StudentAttendancePage() {
  const auth = await requireRole(["student", "admin"]);
  const student = await getStudentByProfileId(auth.userId);

  const records = student ? await getStudentAttendance(student.id) : [];

  const presentCount = records.filter((r) => r.status === "present").length;
  const lateCount = records.filter((r) => r.status === "late").length;
  const attendanceRate = records.length > 0 ? Math.round(((presentCount + lateCount) / records.length) * 100) : 100;

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold text-[#142541] tracking-tight">
          Personal Session Attendance Log
        </h2>
        <p className="text-xs text-[#5F6F84] mt-0.5">
          Audited attendance tracking for all registered lectures and virtual edge labs.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-[#DCE4EE] bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-[#5F6F84] uppercase tracking-wider">
              Attendance Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-[#142541]">{attendanceRate}%</div>
            <p className="text-[11px] text-[#5F6F84] mt-1">Official participation</p>
          </CardContent>
        </Card>

        <Card className="border-[#DCE4EE] bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-[#5F6F84] uppercase tracking-wider">
              Attended Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-emerald-600">{presentCount}</div>
            <p className="text-[11px] text-[#5F6F84] mt-1">Full attendance recorded</p>
          </CardContent>
        </Card>

        <Card className="border-[#DCE4EE] bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-[#5F6F84] uppercase tracking-wider">
              Total Logged Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-[#142541]">{records.length}</div>
            <p className="text-[11px] text-[#5F6F84] mt-1">Class sessions held</p>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Table */}
      <div className="rounded-xl border border-[#DCE4EE] bg-white overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#DCE4EE] bg-[#F3F6FA] text-xs font-semibold text-[#142541]">
          Verified Attendance History
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#DCE4EE] text-[#142541] font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Session ID</th>
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
                  <td className="p-3.5 font-mono text-[#3869AD] text-[11px]">
                    {r.class_session_id.substring(0, 16)}...
                  </td>
                  <td className="p-3.5">
                    {r.status === "present" && <Badge variant="success">Present</Badge>}
                    {r.status === "late" && <Badge variant="warning">Late</Badge>}
                    {r.status === "absent" && <Badge variant="error">Absent</Badge>}
                    {r.status === "excused" && <Badge variant="outline">Excused</Badge>}
                  </td>
                  <td className="p-3.5 text-[#5F6F84] max-w-sm truncate text-[11px]">
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
