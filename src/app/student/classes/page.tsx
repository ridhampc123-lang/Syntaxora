import React from "react";
import { ExternalLink } from "lucide-react";
import { requireRole } from "@/server/services/authService";
import {
  getStudentByProfileId,
  getStudentSessions,
} from "@/server/services/studentService";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Live Classes & Virtual Labs — Syntaxora",
  description: "Schedule of upcoming live interactive lectures and edge robotics sessions.",
};

export default async function StudentClassesPage() {
  const auth = await requireRole(["student", "admin"]);
  const student = await getStudentByProfileId(auth.userId);

  const sessions = student ? await getStudentSessions(student.id) : [];

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

      <div className="rounded-xl border border-[#DCE4EE] bg-white overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#DCE4EE] bg-[#F3F6FA] text-xs font-semibold text-[#142541] flex items-center justify-between">
          <span>Active Class Schedule ({sessions.length})</span>
          <span className="text-[11px] text-[#5F6F84]">
            Meeting links activate during designated session times
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#DCE4EE] text-[#142541] font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">Session Title</th>
                <th className="p-3.5">Course Track</th>
                <th className="p-3.5">Date & Time</th>
                <th className="p-3.5">Provider</th>
                <th className="p-3.5 text-right">Class Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE4EE] text-[#263449]">
              {sessions.map((s) => (
                <tr key={s.id} className="hover:bg-[#F3F6FA]/50 transition-colors">
                  <td className="p-3.5">
                    <div className="font-bold text-[#142541]">{s.title}</div>
                    {s.description && (
                      <div className="text-[11px] text-[#5F6F84] line-clamp-1 max-w-sm mt-0.5">
                        {s.description}
                      </div>
                    )}
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
                    <Badge variant="teal">{s.meeting_provider.replace("_", " ")}</Badge>
                  </td>
                  <td className="p-3.5 text-right whitespace-nowrap">
                    {s.meeting_url ? (
                      <a
                        href={s.meeting_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#168B83] hover:bg-[#126f69] text-white text-[11px] font-semibold shadow-xs transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Enter Classroom
                      </a>
                    ) : (
                      <span className="text-[11px] text-[#5F6F84] italic">
                        Link available at session start
                      </span>
                    )}
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
