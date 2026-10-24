import React from "react";
import { AlertCircle } from "lucide-react";
import { requireRole } from "@/server/services/authService";
import {
  getStudentByProfileId,
  getStudentSessions,
  getStudentEnrollments,
} from "@/server/services/studentService";
import { StudentJoinButton } from "@/components/dashboards/StudentJoinButton";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Live Classes & Virtual Labs — Syntaxora",
  description: "Schedule of upcoming live interactive lectures and edge robotics sessions.",
};

export default async function StudentClassesPage() {
  const auth = await requireRole(["student", "admin"]);
  const student = await getStudentByProfileId(auth.userId);

  const [enrollments, sessions] = await Promise.all([
    student ? getStudentEnrollments(student.id) : [],
    student ? getStudentSessions(student.id) : [],
  ]);

  const awaitingBatch = enrollments.filter((e) => !e.batch_id);

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold text-[#142541] tracking-tight">
          Live Interactive Class Sessions
        </h2>
        <p className="text-xs text-[#5F6F84] mt-0.5">
          Join your cohort for real-time instruction, pair programming, and instructor code review.
        </p>
      </div>

      {/* Awaiting Batch Assignment Notice (if applicable) */}
      {awaitingBatch.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <span>Awaiting Batch Assignment</span>
          </div>
          <p className="text-[11px] text-amber-800">
            You are actively enrolled in <strong>{awaitingBatch.map((e) => e.course?.title).join(", ")}</strong>! Academy admissions is currently finalizing your cohort batch and timetable. Your live class schedule will appear here as soon as your batch is confirmed.
          </p>
        </div>
      )}

      {/* Sessions Table */}
      <div className="rounded-xl border border-[#DCE4EE] bg-white overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#DCE4EE] bg-[#F3F6FA] text-xs font-semibold text-[#142541] flex items-center justify-between">
          <span>Active Class Schedule ({sessions.length})</span>
          <span className="text-[11px] text-[#5F6F84]">
            Timezone standard: Asia/Kolkata (IST)
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#DCE4EE] text-[#142541] font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">Session Title</th>
                <th className="p-3.5">Cohort Batch</th>
                <th className="p-3.5">Course Track</th>
                <th className="p-3.5">Date & Time</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Class Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE4EE] text-[#263449]">
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#5F6F84]">
                    No class sessions currently scheduled for your cohort.
                  </td>
                </tr>
              ) : (
                sessions.map((s) => (
                  <tr key={s.id} className="hover:bg-[#F3F6FA]/50 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-[#142541]">{s.title}</div>
                      {s.description && (
                        <div className="text-[11px] text-[#5F6F84] line-clamp-1 max-w-sm mt-0.5">
                          {s.description}
                        </div>
                      )}
                    </td>
                    <td className="p-3.5">
                      <Badge variant="outline">{s.batch?.batch_code || "COHORT"}</Badge>
                    </td>
                    <td className="p-3.5 text-[#5F6F84]">
                      {s.course?.title || "Enrolled Course"}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="font-medium text-[#142541]">
                        {new Date(s.starts_at).toLocaleDateString()}
                      </div>
                      <div className="text-[11px] text-[#5F6F84]">
                        {new Date(s.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(s.ends_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="p-3.5 capitalize font-mono text-[11px] text-[#3869AD]">
                      <Badge variant={s.status === "in_progress" ? "success" : "teal"}>
                        {s.status === "in_progress" ? "LIVE NOW" : s.status}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <StudentJoinButton
                        sessionId={s.id}
                        sessionStatus={s.status}
                        startsAt={s.starts_at}
                        endsAt={s.ends_at}
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
