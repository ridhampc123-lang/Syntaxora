import React from "react";
import Link from "next/link";
import { CalendarCheck, Search, Filter, AlertCircle, ArrowLeft, CheckCircle2, Clock, XCircle } from "lucide-react";
import { getAdminAttendanceRecords } from "@/server/services/adminService";
import { getAllSessions } from "@/server/services/scheduleService";
import { AttendanceCorrectionModal } from "@/components/forms/AttendanceCorrectionModal";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "Attendance & Correction Audits — Syntaxora Admin",
  description: "Official session attendance records with immutable correction audit workflows.",
};

interface AttendancePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminAttendancePage({ searchParams }: AttendancePageProps) {
  const resolved = await searchParams;
  const statusFilter = typeof resolved.status === "string" ? resolved.status : undefined;
  const sessionId = typeof resolved.sessionId === "string" ? resolved.sessionId : undefined;
  const search = typeof resolved.q === "string" ? resolved.q : undefined;

  const [attendanceRecords, sessions] = await Promise.all([
    getAdminAttendanceRecords({ status: statusFilter, sessionId, search }),
    getAllSessions(),
  ]);

  const counts = {
    all: attendanceRecords.length,
    present: attendanceRecords.filter((r) => r.status === "present").length,
    late: attendanceRecords.filter((r) => r.status === "late").length,
    absent: attendanceRecords.filter((r) => r.status === "absent").length,
    excused: attendanceRecords.filter((r) => r.status === "excused").length,
  };

  return (
    <div className="space-y-8">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#5F6F84] mb-1">
            <Link href="/admin" className="hover:text-[#3869AD] flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" />
              <span>Admin Overview</span>
            </Link>
            <span>/</span>
            <span className="font-semibold text-[#142541]">Attendance Records</span>
          </div>

          <h2 className="text-2xl font-black text-[#142541] tracking-tight">
            Live Session Attendance Roster
          </h2>
          <p className="text-xs text-[#5F6F84] mt-0.5">
            Verified session attendance records. Corrections require a mandatory justification and are logged to the immutable compliance audit trail.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/live-classes">
            <button className="px-3 py-1.5 rounded-lg border border-[#DCE4EE] bg-white text-xs font-semibold text-[#142541] hover:bg-[#F3F6FA] transition-colors">
              Live Class Center &rarr;
            </button>
          </Link>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-[#DCE4EE] bg-white space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-[#5F6F84] uppercase">
            <span>Present</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{counts.present}</div>
          <div className="text-[11px] text-[#5F6F84]">On-time attendances</div>
        </div>

        <div className="p-4 rounded-xl border border-[#DCE4EE] bg-white space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-[#5F6F84] uppercase">
            <span>Late Arrivals</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700">{counts.late}</div>
          <div className="text-[11px] text-[#5F6F84]">Joined post start-window</div>
        </div>

        <div className="p-4 rounded-xl border border-[#DCE4EE] bg-white space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-[#5F6F84] uppercase">
            <span>Absent</span>
            <XCircle className="h-4 w-4 text-red-600" />
          </div>
          <div className="text-2xl font-black text-red-700">{counts.absent}</div>
          <div className="text-[11px] text-[#5F6F84]">Unverified absences</div>
        </div>

        <div className="p-4 rounded-xl border border-[#DCE4EE] bg-white space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-[#5F6F84] uppercase">
            <span>Excused</span>
            <CalendarCheck className="h-4 w-4 text-[#3869AD]" />
          </div>
          <div className="text-2xl font-black text-[#3869AD]">{counts.excused}</div>
          <div className="text-[11px] text-[#5F6F84]">Guardian verified leave</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Link
          href="/admin/attendance"
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            !statusFilter
              ? "bg-[#142541] text-white"
              : "bg-white border border-[#DCE4EE] text-[#5F6F84] hover:bg-[#F3F6FA]"
          }`}
        >
          All Records ({counts.all})
        </Link>
        {["present", "late", "absent", "excused"].map((st) => (
          <Link
            key={st}
            href={`/admin/attendance?status=${st}`}
            className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition-colors ${
              statusFilter === st
                ? "bg-[#142541] text-white"
                : "bg-white border border-[#DCE4EE] text-[#5F6F84] hover:bg-[#F3F6FA]"
            }`}
          >
            {st} ({counts[st as keyof typeof counts]})
          </Link>
        ))}
      </div>

      {/* Records Table */}
      <div className="rounded-xl border border-[#DCE4EE] bg-white overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#DCE4EE] bg-[#F3F6FA] text-xs font-semibold text-[#142541] flex items-center justify-between">
          <span>Official Attendance Ledger ({attendanceRecords.length})</span>
          <span className="text-[11px] text-[#5F6F84]">
            Enforced by PostgreSQL Row Level Security (RLS) & Audit Triggers
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#DCE4EE] text-[#142541] font-semibold uppercase tracking-wider text-[11px] bg-[#F3F6FA]/50">
              <tr>
                <th className="p-3.5">Student Code</th>
                <th className="p-3.5">Student Name</th>
                <th className="p-3.5">Class Session</th>
                <th className="p-3.5">Session Date</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Audit Correction Reason</th>
                <th className="p-3.5 text-right">Audited Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE4EE] text-[#263449]">
              {attendanceRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-[#5F6F84]">
                    <CalendarCheck className="h-8 w-8 text-[#5F6F84]/40 mx-auto mb-2" />
                    <p className="font-semibold text-sm text-[#142541]">No Attendance Records Found</p>
                    <p className="text-xs text-[#5F6F84] mt-0.5">
                      Session attendance is recorded when live classes are conducted or completed by assigned faculty.
                    </p>
                  </td>
                </tr>
              ) : (
                attendanceRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-[#F3F6FA]/50 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-[#3869AD] whitespace-nowrap">
                      {record.student_code}
                    </td>
                    <td className="p-3.5 font-bold text-[#142541]">
                      {record.student_name}
                    </td>
                    <td className="p-3.5 text-[#142541]">
                      <div className="font-medium">{record.session_title}</div>
                      {record.course_title && (
                        <div className="text-[10px] text-[#5F6F84]">{record.course_title}</div>
                      )}
                    </td>
                    <td className="p-3.5 text-[#5F6F84] whitespace-nowrap">
                      {formatDate(record.session_date)}
                    </td>
                    <td className="p-3.5">
                      <Badge
                        variant={
                          record.status === "present"
                            ? "success"
                            : record.status === "late"
                            ? "warning"
                            : record.status === "excused"
                            ? "teal"
                            : "error"
                        }
                      >
                        {record.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-[#5F6F84] italic max-w-xs truncate">
                      {record.correction_reason || "Initial faculty record"}
                    </td>
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <AttendanceCorrectionModal
                        attendanceId={record.id}
                        studentName={record.student_name}
                        currentStatus={record.status}
                      />
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
