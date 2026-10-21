import React from "react";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { requireRole } from "@/server/services/authService";
import {
  getInstructorAssignedCourses,
  getInstructorAssignments,
} from "@/server/services/instructorService";
import { CreateAssignmentModal } from "@/components/forms/CreateAssignmentModal";

export const metadata = {
  title: "Assignments & Projects — Syntaxora Faculty",
  description: "Create, publish, and evaluate course projects and hands-on lab assignments.",
};

export default async function InstructorAssignmentsPage() {
  const auth = await requireRole(["instructor", "admin"]);
  const [courses, assignments] = await Promise.all([
    getInstructorAssignedCourses(auth.userId),
    getInstructorAssignments(auth.userId),
  ]);

  return (
    <div className="space-y-8">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#142541] tracking-tight">
            Curriculum Assignments & Labs
          </h2>
          <p className="text-xs text-[#5F6F84] mt-0.5">
            Construct hands-on programming challenges, projects, and assessment milestones.
          </p>
        </div>
        <CreateAssignmentModal courses={courses} />
      </div>

      {/* Assignments Table */}
      <div className="rounded-xl border border-[#DCE4EE] bg-white overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#DCE4EE] bg-[#F3F6FA] text-xs font-semibold text-[#142541] flex items-center justify-between">
          <span>Active Course Assignments ({assignments.length})</span>
          <span className="text-[11px] text-[#5F6F84]">
            Enforces strict submission ownership and authorized grading boundaries
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#DCE4EE] text-[#142541] font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">Assignment Title</th>
                <th className="p-3.5">Course Track</th>
                <th className="p-3.5">Deadline</th>
                <th className="p-3.5">Max Score</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE4EE] text-[#263449]">
              {assignments.map((asn) => (
                <tr key={asn.id} className="hover:bg-[#F3F6FA]/50 transition-colors">
                  <td className="p-3.5 font-bold text-[#142541]">
                    <div>{asn.title}</div>
                    <div className="text-[11px] font-normal text-[#5F6F84] line-clamp-1 max-w-sm mt-0.5">
                      {asn.description}
                    </div>
                  </td>
                  <td className="p-3.5 text-[#5F6F84]">
                    {asn.course?.title || "Assigned Course Track"}
                  </td>
                  <td className="p-3.5 text-[#5F6F84] whitespace-nowrap">
                    {new Date(asn.due_at).toLocaleDateString()} at{" "}
                    {new Date(asn.due_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="p-3.5 font-mono text-[#3869AD] font-semibold">
                    {asn.max_score} pts
                  </td>
                  <td className="p-3.5 text-right whitespace-nowrap">
                    <Link
                      href="/instructor/submissions"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#3869AD] hover:underline"
                    >
                      <GraduationCap className="h-3.5 w-3.5" />
                      View Submissions
                    </Link>
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
