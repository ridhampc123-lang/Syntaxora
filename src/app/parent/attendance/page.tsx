import React from "react";
import {
  Lock,
  CheckCircle2,
  Clock,
  XCircle,
  ShieldCheck,
  AlertTriangle,
  Download,
  Calendar,
  CheckSquare,
  HelpCircle,
} from "lucide-react";
import { requireRole } from "@/server/services/authService";
import { getActiveChildrenForGuardian } from "@/server/services/guardianService";
import { getStudentAttendance } from "@/server/services/studentService";
import { ParentChildSelector } from "@/components/forms/ParentChildSelector";
import { ParentLeaveRequestModal } from "@/components/forms/ParentLeaveRequestModal";
import { LinkStudentModal } from "@/components/forms/LinkStudentModal";
import { PrintButton } from "@/components/ui/PrintButton";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Child Attendance Record & Punctuality Audit — Syntaxora Guardian",
  description: "Official session attendance records and faculty punctuality audits for your enrolled student.",
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
      <div className="max-w-xl mx-auto py-12 text-center space-y-4 bg-white rounded-3xl border border-[#DCE4EE] p-8 shadow-xs">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-[#E8EFF8] text-[#3869AD] flex items-center justify-center">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-[#142541]">No Active Student Connected</h2>
          <p className="text-xs text-[#5F6F84] max-w-sm mx-auto leading-relaxed">
            Link your child using their unique student code to unlock authenticated session attendance logs and punctuality records.
          </p>
        </div>
        <div className="pt-2 flex justify-center">
          <LinkStudentModal buttonText="Link Your Child Now" variant="primary" size="md" />
        </div>
      </div>
    );
  }

  const studentName = activeRel.student?.profile?.full_name || "Linked Student";
  const studentCode = activeRel.student?.student_code || "STU-CODE";

  if (!activeRel.can_view_attendance) {
    return (
      <div className="space-y-6">
        <ParentChildSelector relationships={relationships} selectedChildId={activeRel.student_id} />
        <div className="rounded-3xl border border-amber-200 bg-amber-50/50 p-12 text-center space-y-4">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <Lock className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-amber-900">Attendance Access Restricted</h3>
            <p className="text-xs text-amber-700 max-w-md mx-auto leading-relaxed">
              Your verified guardian link for <strong>{studentName}</strong> does not currently include attendance viewing authorization. Please contact academy administration to update permissions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Fetch real database records only (no fake sample sessions)
  const records = await getStudentAttendance(activeRel.student_id);

  const totalSessions = records.length;
  const presentCount = records.filter((r) => r.status === "present").length;
  const lateCount = records.filter((r) => r.status === "late").length;
  const excusedCount = records.filter((r) => r.status === "excused").length;
  const absentCount = records.filter((r) => r.status === "absent").length;
  const attendanceRate =
    totalSessions > 0 ? Math.round(((presentCount + lateCount) / totalSessions) * 100) : null;

  return (
    <div className="space-y-8">
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#5F6F84] mb-1">
            <span>Parent Portal</span>
            <span>/</span>
            <span className="font-semibold text-[#142541]">Attendance Record</span>
          </div>
          <h1 className="text-2xl font-black text-[#142541] tracking-tight">
            Attendance Record: {studentName}
          </h1>
          <p className="text-xs text-[#5F6F84] mt-0.5">
            Student Code: <strong className="font-mono text-[#3869AD]">{studentCode}</strong> • Official faculty roll call records and verified attendance logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ParentChildSelector
            relationships={relationships}
            selectedChildId={activeRel.student_id}
          />
          <LinkStudentModal
            buttonText="+ Link Sibling"
            variant="outline"
            size="sm"
          />
          <PrintButton
            label="Print Attendance Audit"
            icon="printer"
            variant="outline"
            size="sm"
          />
          <ParentLeaveRequestModal
            studentName={studentName}
            studentCode={studentCode}
            studentId={activeRel.student_id}
          />
        </div>
      </div>

      {/* 4 Stat Overview Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance Rate */}
        <div className="p-5 rounded-2xl bg-white border border-[#DCE4EE] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#5F6F84] text-xs font-semibold">
            <span>Overall Attendance</span>
            <CheckSquare className="h-4 w-4 text-[#168B83]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#142541]">
            {attendanceRate !== null ? `${attendanceRate}%` : "—"}
          </div>
          <p className="text-[11px] text-[#5F6F84]">
            {attendanceRate !== null
              ? attendanceRate >= 85
                ? "Academic compliance threshold met (≥85%)"
                : "Below recommended threshold (85%)"
              : "No sessions recorded yet"}
          </p>
        </div>

        {/* Present Sessions */}
        <div className="p-5 rounded-2xl bg-white border border-[#DCE4EE] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#5F6F84] text-xs font-semibold">
            <span>On-Time Sessions</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700">
            {presentCount}
          </div>
          <p className="text-[11px] text-[#5F6F84]">
            Punctual live lab attendances
          </p>
        </div>

        {/* Late / Excused */}
        <div className="p-5 rounded-2xl bg-white border border-[#DCE4EE] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#5F6F84] text-xs font-semibold">
            <span>Late / Excused</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-700">
            {lateCount + excusedCount}
          </div>
          <p className="text-[11px] text-[#5F6F84]">
            {lateCount} late • {excusedCount} excused notices
          </p>
        </div>

        {/* Unexcused Absences */}
        <div className="p-5 rounded-2xl bg-white border border-[#DCE4EE] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#5F6F84] text-xs font-semibold">
            <span>Unexcused Absences</span>
            <XCircle className="h-4 w-4 text-rose-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-700">
            {absentCount}
          </div>
          <p className="text-[11px] text-[#5F6F84]">
            Sessions missed without prior notice
          </p>
        </div>
      </div>

      {/* Real Attendance Records Log Table */}
      <div className="rounded-3xl border border-[#DCE4EE] bg-white overflow-hidden shadow-xs">
        <div className="p-5 border-b border-[#DCE4EE] bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#142541]">
              Live Class Attendance Log ({records.length} Sessions)
            </h3>
            <p className="text-xs text-[#5F6F84]">
              Recorded and verified by faculty instructors during live interactive cohorts.
            </p>
          </div>
          <span className="text-[11px] text-[#5F6F84] font-medium bg-white px-2.5 py-1 rounded-lg border border-[#DCE4EE]">
            Timezone: Asia/Kolkata (IST)
          </span>
        </div>

        {records.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#DCE4EE] text-[#5F6F84] font-semibold uppercase tracking-wider text-[11px] bg-[#F8FAFC]">
                <tr>
                  <th className="p-4">Session Date & Time</th>
                  <th className="p-4">Curriculum Topic</th>
                  <th className="p-4">Cohort Batch</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Instructor Audit Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F4F8] text-[#142541]">
                {records.map((r) => {
                  const recordDate = new Date(r.recorded_at);
                  const sessionTitle = r.session?.title || "Live Cohort Lecture";
                  const courseTitle = r.session?.course?.title || "Enrolled AI Program";
                  const batchName = r.session?.batch?.name || "Cohort Batch";

                  return (
                    <tr key={r.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="p-4 whitespace-nowrap">
                        <div className="font-bold text-[#142541]">
                          {recordDate.toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                        <div className="text-[11px] text-[#5F6F84]">
                          {recordDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-[#142541]">{sessionTitle}</div>
                        <div className="text-[11px] text-[#5F6F84]">{courseTitle}</div>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span className="font-mono text-xs text-[#3869AD] font-semibold">
                          {batchName}
                        </span>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        {r.status === "present" && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                            <CheckCircle2 className="h-3 w-3" /> Present
                          </span>
                        )}
                        {r.status === "late" && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                            <Clock className="h-3 w-3" /> Late Arrival
                          </span>
                        )}
                        {r.status === "excused" && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-800 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-md">
                            <CheckSquare className="h-3 w-3" /> Excused (Notice)
                          </span>
                        )}
                        {r.status === "absent" && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                            <XCircle className="h-3 w-3" /> Absent
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-[#5F6F84] text-[11px] max-w-xs">
                        {r.correction_reason || "Marked on time by session instructor"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center space-y-3">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-[#E8EFF8] text-[#3869AD] flex items-center justify-center">
              <CheckSquare className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-[#142541]">No Attendance Records Logged Yet</h4>
              <p className="text-xs text-[#5F6F84] max-w-sm mx-auto leading-relaxed">
                Official attendance records appear here as live class sessions are conducted and marked by the assigned faculty.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Attendance Calculation Notice */}
      <div className="rounded-2xl border border-[#DCE4EE] bg-[#F8FAFC] p-4.5 text-xs text-[#5F6F84] flex items-start gap-3">
        <HelpCircle className="h-5 w-5 text-[#3869AD] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-[#142541] block">Attendance Calculation Policy</strong>
          <p className="leading-relaxed">
            Overall attendance is computed as <code>(Present + Late) / Total Recorded Sessions &times; 100</code>. Syntaxora requires an 85% attendance rate for cohort graduation and certificate of completion eligibility. If you notice a discrepancy, submit a review request via the <strong>Submit Absence Notice / Leave Request</strong> button above or contact <strong className="text-[#142541]">support@syntaxora.com</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
