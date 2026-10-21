import React from "react";
import { Lock, Award, CheckCircle2 } from "lucide-react";
import { requireRole } from "@/server/services/authService";
import { getActiveChildrenForGuardian } from "@/server/services/guardianService";
import { getStudentReleasedGrades } from "@/server/services/studentService";
import { ParentChildSelector } from "@/components/forms/ParentChildSelector";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Child Academic Progress & Grades — Syntaxora Guardian",
  description: "Officially released project grades, algorithmic rubrics, and faculty feedback.",
};

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ParentProgressPage({ searchParams }: Props) {
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

  if (!activeRel.can_view_progress) {
    return (
      <div className="space-y-6">
        <ParentChildSelector relationships={relationships} selectedChildId={activeRel.student_id} />
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-8 text-center space-y-3">
          <div className="mx-auto h-12 w-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
            <Lock className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-amber-900">Academic Progress Access Restricted</h3>
          <p className="text-xs text-amber-700 max-w-md mx-auto">
            Your verified guardian link for {studentName} does not currently include academic progress and grade viewing authorization.
          </p>
        </div>
      </div>
    );
  }

  const grades = await getStudentReleasedGrades(activeRel.student_id);

  return (
    <div className="space-y-8">
      {/* Title & Child Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#142541] tracking-tight">
            Academic Evaluations: {studentName}
          </h2>
          <p className="text-xs text-[#5F6F84] mt-0.5">
            Verified faculty reviews and numerical rubric scores officially released to guardians.
          </p>
        </div>
        <ParentChildSelector
          relationships={relationships}
          selectedChildId={activeRel.student_id}
        />
      </div>

      {grades.length === 0 ? (
        <div className="rounded-xl border border-[#DCE4EE] bg-white p-12 text-center space-y-3">
          <div className="mx-auto h-12 w-12 rounded-full bg-[#E8EFF8] text-[#3869AD] flex items-center justify-center">
            <Award className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-[#142541]">No Evaluations Published Yet</h3>
          <p className="text-xs text-[#5F6F84] max-w-sm mx-auto">
            Grades and qualitative feedback will appear here once reviewed and published by your student&apos;s faculty mentor.
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
                    {grade.assignment?.title || "Assessment Project"}
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
                    <CheckCircle2 className="h-3.5 w-3.5" /> Approved Release
                  </span>
                </div>
              </div>

              {grade.feedback && (
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-[#142541]">Faculty Mentor Assessment:</div>
                  <div className="text-xs text-[#263449] bg-[#F3F6FA] p-3.5 rounded-xl border border-[#DCE4EE] leading-relaxed italic">
                    &ldquo;{grade.feedback}&rdquo;
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
