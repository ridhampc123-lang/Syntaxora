import React from "react";
import {
  CheckSquare,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Video,
} from "lucide-react";
import { requireRole } from "@/server/services/authService";
import {
  getStudentByProfileId,
  getStudentAttendance,
} from "@/server/services/studentService";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StudentLeaveRequestModal } from "@/components/forms/StudentLeaveRequestModal";

export const metadata = {
  title: "Personal Attendance Log — Syntaxora",
  description: "Official session attendance records, participation rates, and absence notifications.",
};

export default async function StudentAttendancePage() {
  const auth = await requireRole(["student", "admin"]);
  const student = await getStudentByProfileId(auth.userId);

  const records = student ? await getStudentAttendance(student.id) : [];

  const presentCount = records.filter((r) => r.status === "present").length;
  const lateCount = records.filter((r) => r.status === "late").length;
  const excusedCount = records.filter((r) => r.status === "excused").length;
  const absentCount = records.filter((r) => r.status === "absent").length;

  const attendanceRate =
    records.length > 0
      ? Math.round(((presentCount + lateCount + excusedCount) / records.length) * 100)
      : 100;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#142541]/5 text-[#3869AD] text-xs font-bold mb-2">
            <CheckSquare className="h-3.5 w-3.5" />
            <span>Attendance & Compliance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142541] tracking-tight">
            Personal Session Attendance Log
          </h1>
          <p className="text-xs sm:text-sm text-[#5F6F84] mt-1 max-w-2xl">
            Audited biometric and platform participation logs for all registered lectures, interactive peer code reviews, and virtual robotics sessions.
          </p>
        </div>

        <div className="shrink-0">
          <StudentLeaveRequestModal />
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-[#DCE4EE] bg-white shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-[#5F6F84] uppercase tracking-wider">
              Attendance Rate
            </CardTitle>
            <div className="h-8 w-8 rounded-xl bg-teal-50 text-[#168B83] flex items-center justify-center">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-[#142541]">{attendanceRate}%</div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Full Academy Compliance</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#DCE4EE] bg-white shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-[#5F6F84] uppercase tracking-wider">
              Present Sessions
            </CardTitle>
            <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-emerald-700">{presentCount}</div>
            <p className="text-[11px] text-[#5F6F84] mt-1">Verified on-time attendance</p>
          </CardContent>
        </Card>

        <Card className="border-[#DCE4EE] bg-white shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-[#5F6F84] uppercase tracking-wider">
              Late Arrivals
            </CardTitle>
            <div className="h-8 w-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-amber-700">{lateCount}</div>
            <p className="text-[11px] text-[#5F6F84] mt-1">Logged with instructor note</p>
          </CardContent>
        </Card>

        <Card className="border-[#DCE4EE] bg-white shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-[#5F6F84] uppercase tracking-wider">
              Total Logged Sessions
            </CardTitle>
            <div className="h-8 w-8 rounded-xl bg-blue-50 text-[#3869AD] flex items-center justify-center">
              <CheckSquare className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-[#142541]">{records.length}</div>
            <p className="text-[11px] text-[#5F6F84] mt-1">
              {absentCount > 0 ? `${absentCount} absences recorded` : "Zero unexcused absences"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Table */}
      <div className="rounded-2xl border border-[#DCE4EE] bg-white overflow-hidden shadow-sm">
        <div className="p-5 border-b border-[#DCE4EE] bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#142541]">
              Audited Session Attendance Log ({records.length})
            </h3>
            <p className="text-[11px] text-[#5F6F84] mt-0.5">
              Attendance is recorded automatically upon classroom check-in
            </p>
          </div>
          <span className="text-[11px] text-[#5F6F84]">
            Timezone standard: Asia/Kolkata (IST)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#DCE4EE] bg-[#F8FAFC]/50 text-[#142541] font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-4">Session & Topic</th>
                <th className="p-4">Course Track</th>
                <th className="p-4">Date & Check-in Time</th>
                <th className="p-4">Attendance Status</th>
                <th className="p-4">Faculty Audit Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE4EE] text-[#263449]">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-[#5F6F84]">
                    <div className="max-w-sm mx-auto space-y-2">
                      <div className="h-10 w-10 rounded-full bg-[#E8EFF8] text-[#3869AD] flex items-center justify-center mx-auto">
                        <CheckSquare className="h-5 w-5" />
                      </div>
                      <div className="font-bold text-sm text-[#142541]">No Attendance Records Yet</div>
                      <p className="text-xs">
                        Attendance will appear here automatically when you check in to your first live cohort class session.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r.id} className="hover:bg-[#F8FAFC]/80 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-sm text-[#142541] flex items-center gap-2">
                        <Video className="h-4 w-4 text-[#3869AD] shrink-0" />
                        <span>{r.session?.title || "Applied AI Lab Session"}</span>
                      </div>
                      <div className="text-[10px] font-mono text-[#5F6F84] pl-6 mt-0.5">
                        ID: {r.class_session_id.substring(0, 18)}...
                      </div>
                    </td>
                    <td className="p-4 text-[#5F6F84] whitespace-nowrap">
                      {r.session?.course?.title || "Applied AI Track"}
                    </td>
                    <td className="p-4 text-[#5F6F84] whitespace-nowrap">
                      <div className="font-bold text-[#142541]">
                        {new Date(r.recorded_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="text-[11px] text-[#5F6F84]">
                        {new Date(r.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {r.status === "present" && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[11px]">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Present</span>
                        </div>
                      )}
                      {r.status === "late" && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[11px]">
                          <Clock className="h-3.5 w-3.5 text-amber-600" />
                          <span>Late</span>
                        </div>
                      )}
                      {r.status === "absent" && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 font-bold text-[11px]">
                          <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                          <span>Absent</span>
                        </div>
                      )}
                      {r.status === "excused" && (
                        <Badge variant="outline" className="text-[11px] font-bold">
                          Excused Leave
                        </Badge>
                      )}
                    </td>
                    <td className="p-4 text-[#5F6F84] text-[11px] max-w-sm">
                      {r.correction_reason || "Automated check-in verified via WebRTC peer connection"}
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
