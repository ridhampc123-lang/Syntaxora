import React from "react";
import { requireRole } from "@/server/services/authService";
import {
  getStudentByProfileId,
  getStudentAssignments,
} from "@/server/services/studentService";
import { SubmitAssignmentModal } from "@/components/forms/SubmitAssignmentModal";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Assignments & Labs — Syntaxora",
  description: "View project requirements, upload solutions, and inspect feedback.",
};

export default async function StudentAssignmentsPage() {
  const auth = await requireRole(["student", "admin"]);
  const student = await getStudentByProfileId(auth.userId);

  const assignments = student ? await getStudentAssignments(student.id) : [];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold text-[#142541] tracking-tight">
          Assignments & Project Deliverables
        </h2>
        <p className="text-xs text-[#5F6F84] mt-0.5">
          Submit your algorithmic models, code repositories, and laboratory deliverables for instructor evaluation.
        </p>
      </div>

      <div className="rounded-xl border border-[#DCE4EE] bg-white overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#DCE4EE] bg-[#F3F6FA] text-xs font-semibold text-[#142541] flex items-center justify-between">
          <span>Active Course Deliverables ({assignments.length})</span>
          <span className="text-[11px] text-[#5F6F84]">
            Evaluations appear in Released Grades after faculty review
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#DCE4EE] text-[#142541] font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">Assignment</th>
                <th className="p-3.5">Course</th>
                <th className="p-3.5">Deadline</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Submission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE4EE] text-[#263449]">
              {assignments.map((asn) => {
                const sub = asn.submission;
                const isGraded = sub?.status === "graded" && sub.is_grade_published;

                return (
                  <tr key={asn.id} className="hover:bg-[#F3F6FA]/50 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-[#142541]">{asn.title}</div>
                      <div className="text-[11px] text-[#5F6F84] line-clamp-1 max-w-sm mt-0.5">
                        {asn.description}
                      </div>
                    </td>
                    <td className="p-3.5 text-[#5F6F84]">
                      {asn.course?.title || "Enrolled Track"}
                    </td>
                    <td className="p-3.5 whitespace-nowrap text-[#5F6F84]">
                      {new Date(asn.due_at).toLocaleDateString()}
                    </td>
                    <td className="p-3.5">
                      {isGraded ? (
                        <Badge variant="success">Graded ({sub.score}/{asn.max_score})</Badge>
                      ) : sub ? (
                        <Badge variant="teal">Submitted (In Review)</Badge>
                      ) : (
                        <Badge variant="warning">Pending Submission</Badge>
                      )}
                    </td>
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <SubmitAssignmentModal
                        assignmentId={asn.id}
                        assignmentTitle={asn.title}
                        maxScore={asn.max_score}
                        existingContent={sub?.content}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
