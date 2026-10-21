import React from "react";
import { requireRole } from "@/server/services/authService";
import {
  getInstructorSessions,
  IN_MEMORY_ATTENDANCE,
} from "@/server/services/instructorService";
import { getAdminStudents } from "@/server/services/adminService";
import { RecordAttendanceRoster } from "@/components/forms/RecordAttendanceRoster";

export const metadata = {
  title: "Session Attendance Roster — Syntaxora Faculty",
  description: "Record and manage official student attendance with audited correction logs.",
};

export default async function InstructorAttendancePage() {
  const auth = await requireRole(["instructor", "admin"]);
  const [sessions, students] = await Promise.all([
    getInstructorSessions(auth.userId),
    getAdminStudents(),
  ]);

  const activeSession = sessions[0];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold text-[#142541] tracking-tight">
          Session Attendance Roster
        </h2>
        <p className="text-xs text-[#5F6F84] mt-0.5">
          Mark official session attendance. Every post-session correction mandates an audited justification reason.
        </p>
      </div>

      {activeSession ? (
        <RecordAttendanceRoster
          sessionId={activeSession.id}
          sessionTitle={activeSession.title}
          students={students}
          initialRecords={IN_MEMORY_ATTENDANCE}
        />
      ) : (
        <div className="rounded-xl border border-[#DCE4EE] bg-white p-12 text-center text-xs text-[#5F6F84]">
          No active class sessions found. Please schedule a class session first.
        </div>
      )}
    </div>
  );
}
