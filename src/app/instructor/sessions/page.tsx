import React from "react";
import Link from "next/link";
import { CheckSquare } from "lucide-react";
import { requireRole } from "@/server/services/authService";
import {
  getInstructorAssignedCourses,
  getInstructorSessions,
} from "@/server/services/instructorService";
import { CreateSessionModal } from "@/components/forms/CreateSessionModal";
import { StartLiveClassButton } from "@/components/forms/StartLiveClassButton";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Class Sessions & Schedule — Syntaxora Faculty",
  description: "Schedule, manage, and launch live interactive class sessions.",
};

export default async function InstructorSessionsPage() {
  const auth = await requireRole(["instructor", "admin"]);
  const [courses, sessions] = await Promise.all([
    getInstructorAssignedCourses(auth.userId),
    getInstructorSessions(auth.userId),
  ]);

  return (
    <div className="space-y-8">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#142541] tracking-tight">
            Live Class Sessions
          </h2>
          <p className="text-xs text-[#5F6F84] mt-0.5">
            Manage live lecture schedules, edge lab demos, and virtual classroom links.
          </p>
        </div>
        <CreateSessionModal courses={courses} />
      </div>

      {/* Sessions Table */}
      <div className="rounded-xl border border-[#DCE4EE] bg-white overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#DCE4EE] bg-[#F3F6FA] text-xs font-semibold text-[#142541] flex items-center justify-between">
          <span>Scheduled Class Sessions ({sessions.length})</span>
          <span className="text-[11px] text-[#5F6F84]">
            Synchronized with Student and Parent Portals
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#DCE4EE] text-[#142541] font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">Session Title</th>
                <th className="p-3.5">Course Track</th>
                <th className="p-3.5">Schedule</th>
                <th className="p-3.5">Provider</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE4EE] text-[#263449]">
              {sessions.map((session) => (
                <tr key={session.id} className="hover:bg-[#F3F6FA]/50 transition-colors">
                  <td className="p-3.5 font-bold text-[#142541]">
                    <div>{session.title}</div>
                    {session.description && (
                      <div className="text-[11px] font-normal text-[#5F6F84] line-clamp-1 max-w-sm mt-0.5">
                        {session.description}
                      </div>
                    )}
                  </td>
                  <td className="p-3.5 text-[#5F6F84]">
                    {session.course?.title || "Assigned Course"}
                  </td>
                  <td className="p-3.5 whitespace-nowrap">
                    <div className="font-medium text-[#142541]">
                      {new Date(session.starts_at).toLocaleDateString()}
                    </div>
                    <div className="text-[11px] text-[#5F6F84]">
                      {new Date(session.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(session.ends_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="p-3.5 capitalize font-mono text-[11px] text-[#3869AD]">
                    {session.meeting_provider.replace("_", " ")}
                  </td>
                  <td className="p-3.5">
                    <Badge variant="teal">{session.status}</Badge>
                  </td>
                  <td className="p-3.5 text-right whitespace-nowrap space-x-2">
                    <Link
                      href="/instructor/attendance"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#3869AD] hover:underline"
                    >
                      <CheckSquare className="h-3.5 w-3.5" />
                      Roster
                    </Link>
                    <StartLiveClassButton
                      sessionId={session.id}
                      status={session.status}
                      meetingUrl={session.meeting_url}
                    />
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
