import React from "react";
import { requireRole } from "@/server/services/authService";
import { getAssignmentSubmissions } from "@/server/services/instructorService";
import { GradeSubmissionModal } from "@/components/forms/GradeSubmissionModal";
import { ToggleGradePublicationButton } from "@/components/forms/ToggleGradePublicationButton";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Submissions & Grading — Syntaxora Faculty",
  description: "Evaluate student code submissions, record feedback, and manage grade publication.",
};

export default async function InstructorSubmissionsPage() {
  await requireRole(["instructor", "admin"]);
  const submissions = await getAssignmentSubmissions();

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold text-[#142541] tracking-tight">
          Student Assessment Submissions & Grading
        </h2>
        <p className="text-xs text-[#5F6F84] mt-0.5">
          Review submitted deliverables, record quantitative rubrics and qualitative feedback. Grades remain draft until explicitly published.
        </p>
      </div>

      {/* Submissions Table */}
      <div className="rounded-xl border border-[#DCE4EE] bg-white overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#DCE4EE] bg-[#F3F6FA] text-xs font-semibold text-[#142541] flex items-center justify-between">
          <span>Student Submissions Roster ({submissions.length})</span>
          <span className="text-[11px] text-[#5F6F84]">
            Grades hidden from Student & Parent Portals until published
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#DCE4EE] text-[#142541] font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">Student</th>
                <th className="p-3.5">Student Code</th>
                <th className="p-3.5">Assignment</th>
                <th className="p-3.5">Submitted At</th>
                <th className="p-3.5">Score</th>
                <th className="p-3.5">Publication Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE4EE] text-[#263449]">
              {submissions.map((sub) => {
                const studentName = sub.student?.profile?.full_name || "Enrolled Learner";
                const studentCode = sub.student?.student_code || "STU-RECORD";
                const assignmentTitle = sub.assignment?.title || "Course Project";

                return (
                  <tr key={sub.id} className="hover:bg-[#F3F6FA]/50 transition-colors">
                    <td className="p-3.5 font-bold text-[#142541]">
                      {studentName}
                    </td>
                    <td className="p-3.5 font-mono text-[#3869AD]">
                      {studentCode}
                    </td>
                    <td className="p-3.5 text-[#5F6F84] max-w-xs truncate">
                      {assignmentTitle}
                    </td>
                    <td className="p-3.5 text-[#5F6F84] whitespace-nowrap">
                      {new Date(sub.submitted_at).toLocaleDateString()}
                    </td>
                    <td className="p-3.5">
                      {sub.score !== null && sub.score !== undefined ? (
                        <span className="font-bold text-[#142541]">
                          {sub.score} / {sub.assignment?.max_score || 100}
                        </span>
                      ) : (
                        <span className="text-amber-600 font-medium">Ungraded</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      {sub.is_grade_published ? (
                        <Badge variant="success">Visible to Learner & Parent</Badge>
                      ) : (
                        <Badge variant="outline">Hidden (Draft)</Badge>
                      )}
                    </td>
                    <td className="p-3.5 text-right whitespace-nowrap space-x-2">
                      <ToggleGradePublicationButton
                        submissionId={sub.id}
                        isPublished={sub.is_grade_published}
                      />
                      <GradeSubmissionModal submission={sub} />
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
