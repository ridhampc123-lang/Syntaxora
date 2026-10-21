import React from "react";
import { Award, CheckCircle2 } from "lucide-react";
import { requireRole } from "@/server/services/authService";
import {
  getStudentByProfileId,
  getStudentReleasedGrades,
} from "@/server/services/studentService";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Released Grades & Feedback — Syntaxora",
  description: "Official evaluation rubrics, numerical scores, and instructor feedback.",
};

export default async function StudentGradesPage() {
  const auth = await requireRole(["student", "admin"]);
  const student = await getStudentByProfileId(auth.userId);

  const grades = student ? await getStudentReleasedGrades(student.id) : [];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold text-[#142541] tracking-tight">
          Officially Released Grades & Faculty Rubrics
        </h2>
        <p className="text-xs text-[#5F6F84] mt-0.5">
          Only evaluations that have been explicitly approved and published by faculty mentors appear here.
        </p>
      </div>

      {grades.length === 0 ? (
        <div className="rounded-xl border border-[#DCE4EE] bg-white p-12 text-center space-y-3">
          <div className="mx-auto h-12 w-12 rounded-full bg-[#E8EFF8] text-[#3869AD] flex items-center justify-center">
            <Award className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-[#142541]">No Published Evaluations Yet</h3>
          <p className="text-xs text-[#5F6F84] max-w-sm mx-auto">
            Your instructor will grade your submitted deliverables and release the evaluation reports here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {grades.map((grade) => (
            <div
              key={grade.id}
              className="rounded-2xl border border-[#DCE4EE] bg-white p-6 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#DCE4EE]">
                <div>
                  <h3 className="font-bold text-base text-[#142541]">
                    {grade.assignment?.title || "Assessment Deliverable"}
                  </h3>
                  <div className="text-[11px] text-[#5F6F84] mt-0.5">
                    Evaluated on: {grade.graded_at ? new Date(grade.graded_at).toLocaleDateString() : "Recently"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="success" className="text-xs font-bold px-3 py-1">
                    Score: {grade.score} / {grade.assignment?.max_score || 100} pts
                  </Badge>
                  <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Published
                  </span>
                </div>
              </div>

              {grade.feedback && (
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-[#142541]">Instructor Feedback:</div>
                  <div className="text-xs text-[#263449] bg-[#F3F6FA] p-3.5 rounded-xl border border-[#DCE4EE] leading-relaxed italic">
                    &ldquo;{grade.feedback}&rdquo;
                  </div>
                </div>
              )}

              <div className="pt-2 text-[11px] text-[#5F6F84] flex items-center justify-between">
                <span>Submitted Code Solution:</span>
                <span className="font-mono text-[#3869AD] truncate max-w-md">
                  {grade.content}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
