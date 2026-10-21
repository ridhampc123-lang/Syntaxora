import React from "react";
import { Lock } from "lucide-react";
import { requireRole } from "@/server/services/authService";
import { getActiveChildrenForGuardian } from "@/server/services/guardianService";
import { getStudentSessions } from "@/server/services/studentService";
import { ParentChildSelector } from "@/components/forms/ParentChildSelector";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Child Class Schedule — Syntaxora Guardian",
  description: "Live interactive class schedule and virtual lecture sessions.",
};

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ParentSchedulePage({ searchParams }: Props) {
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
        No active verified student links found.
      </div>
    );
  }

  const studentName = activeRel.student?.profile?.full_name || "Linked Student";

  if (!activeRel.can_view_schedule) {
    return (
      <div className="space-y-6">
        <ParentChildSelector relationships={relationships} selectedChildId={activeRel.student_id} />
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-8 text-center space-y-3">
          <div className="mx-auto h-12 w-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
            <Lock className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-amber-900">Schedule Access Restricted</h3>
          <p className="text-xs text-amber-700 max-w-md mx-auto">
            Your verified guardian link for {studentName} does not currently include schedule viewing authorization.
          </p>
        </div>
      </div>
    );
  }

  const sessions = await getStudentSessions(activeRel.student_id);

  return (
    <div className="space-y-8">
      {/* Title & Child Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#142541] tracking-tight">
            Class Schedule: {studentName}
          </h2>
          <p className="text-xs text-[#5F6F84] mt-0.5">
            Upcoming live lecture sessions and edge hardware laboratory demos.
          </p>
        </div>
        <ParentChildSelector
          relationships={relationships}
          selectedChildId={activeRel.student_id}
        />
      </div>

      <div className="rounded-xl border border-[#DCE4EE] bg-white overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#DCE4EE] bg-[#F3F6FA] text-xs font-semibold text-[#142541]">
          Scheduled Sessions ({sessions.length})
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
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE4EE] text-[#263449]">
              {sessions.map((s) => (
                <tr key={s.id} className="hover:bg-[#F3F6FA]/50 transition-colors">
                  <td className="p-3.5 font-bold text-[#142541]">
                    <div>{s.title}</div>
                    {s.description && (
                      <div className="text-[11px] font-normal text-[#5F6F84] line-clamp-1 max-w-sm mt-0.5">
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
                    {s.meeting_provider.replace("_", " ")}
                  </td>
                  <td className="p-3.5">
                    <Badge variant="teal">{s.status}</Badge>
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
