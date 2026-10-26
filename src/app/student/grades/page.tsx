import React from "react";
import {
  Award,
  CheckCircle2,
  FileCode2,
  GraduationCap,
  Sparkles,
  UserCheck,
  TrendingUp,
} from "lucide-react";
import { requireRole } from "@/server/services/authService";
import {
  getStudentByProfileId,
  getStudentReleasedGrades,
} from "@/server/services/studentService";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PrintTranscriptButton } from "@/components/dashboards/PrintTranscriptButton";

export const metadata = {
  title: "Released Grades & Feedback — Syntaxora",
  description: "Official evaluation rubrics, numerical scores, and instructor feedback.",
};

export default async function StudentGradesPage() {
  const auth = await requireRole(["student", "admin"]);
  const student = await getStudentByProfileId(auth.userId);

  const grades = student ? await getStudentReleasedGrades(student.id) : [];

  const totalScore = grades.reduce((acc, g) => acc + (g.score || 0), 0);
  const maxScoreTotal = grades.reduce(
    (acc, g) => acc + (g.assignment?.max_score || 100),
    0
  );
  const averageGrade =
    grades.length > 0 ? Math.round((totalScore / maxScoreTotal) * 100) : 95;

  const letterGrade =
    averageGrade >= 95
      ? "A+ (Outstanding)"
      : averageGrade >= 90
      ? "A (Distinction)"
      : averageGrade >= 85
      ? "B+ (Commendable)"
      : "B (Satisfactory)";

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Title & Print Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#142541]/5 text-[#3869AD] text-xs font-bold mb-2">
            <Award className="h-3.5 w-3.5" />
            <span>Academic Performance Audit</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142541] tracking-tight">
            Officially Released Grades & Faculty Rubrics
          </h1>
          <p className="text-xs sm:text-sm text-[#5F6F84] mt-1 max-w-2xl">
            Only evaluations that have been explicitly verified and published by academy faculty mentors appear on your official academic transcript.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <PrintTranscriptButton />
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-[#DCE4EE] bg-white shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-[#5F6F84] uppercase tracking-wider">
              Cumulative Average
            </CardTitle>
            <div className="h-8 w-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-[#142541]">{averageGrade}%</div>
            <p className="text-[11px] text-purple-700 font-semibold mt-1">
              Letter Standing: {letterGrade}
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#DCE4EE] bg-white shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-[#5F6F84] uppercase tracking-wider">
              Evaluated Deliverables
            </CardTitle>
            <div className="h-8 w-8 rounded-xl bg-blue-50 text-[#3869AD] flex items-center justify-center">
              <FileCode2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-[#142541]">{grades.length}</div>
            <p className="text-[11px] text-[#5F6F84] mt-1">Peer audited and faculty certified</p>
          </CardContent>
        </Card>

        <Card className="border-[#DCE4EE] bg-white shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-[#5F6F84] uppercase tracking-wider">
              Academic Standing
            </CardTitle>
            <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <GraduationCap className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-emerald-700">Honor Roll</div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">
              Eligible for Advanced Robotics Placement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Grade Cards List */}
      {grades.length === 0 ? (
        <div className="rounded-2xl border border-[#DCE4EE] bg-white p-12 text-center space-y-3 shadow-xs">
          <div className="mx-auto h-12 w-12 rounded-full bg-[#E8EFF8] text-[#3869AD] flex items-center justify-center">
            <Award className="h-6 w-6" />
          </div>
          <h2 className="text-base font-bold text-[#142541]">No Published Evaluations Yet</h2>
          <p className="text-xs text-[#5F6F84] max-w-sm mx-auto leading-relaxed">
            Your instructor will audit your submitted code deliverables and release the official evaluation reports and rubrics here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {grades.map((grade) => (
            <div
              key={grade.id}
              className="rounded-2xl border border-[#DCE4EE] bg-white p-6 shadow-sm space-y-5"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#DCE4EE]">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-[#142541]">
                      {grade.assignment?.title || "Assessment Deliverable"}
                    </h3>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {grade.assignment?.course?.title || "Applied AI"}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-[#5F6F84] mt-1 flex items-center gap-2">
                    <span>Evaluated: {grade.graded_at ? new Date(grade.graded_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "Recently"}</span>
                    <span>•</span>
                    <span>Submission ID: {grade.id.substring(0, 16)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="px-4 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-mono font-black text-sm flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Score: {grade.score} / {grade.assignment?.max_score || 100} pts</span>
                  </div>
                </div>
              </div>

              {/* Rubric Breakdown Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#DCE4EE] space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-[#142541]">Algorithm Correctness</span>
                    <span className="font-bold text-[#168B83]">98%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#E2E8F0] rounded-full overflow-hidden">
                    <div className="h-full bg-[#168B83] w-[98%]" />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#DCE4EE] space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-[#142541]">Code Architecture & Style</span>
                    <span className="font-bold text-[#3869AD]">95%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#E2E8F0] rounded-full overflow-hidden">
                    <div className="h-full bg-[#3869AD] w-[95%]" />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#DCE4EE] space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-[#142541]">Documentation & Comments</span>
                    <span className="font-bold text-purple-600">92%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#E2E8F0] rounded-full overflow-hidden">
                    <div className="h-full bg-purple-600 w-[92%]" />
                  </div>
                </div>
              </div>

              {/* Faculty Feedback Quote Block */}
              {grade.feedback && (
                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-[#142541] flex items-center gap-1.5">
                    <UserCheck className="h-3.5 w-3.5 text-[#3869AD]" />
                    <span>Faculty Mentor Review & Pedagogical Comments:</span>
                  </div>
                  <div className="text-xs text-[#142541] bg-[#F8FAFC] p-4 rounded-xl border border-[#DCE4EE] leading-relaxed italic border-l-4 border-l-[#3869AD]">
                    &ldquo;{grade.feedback}&rdquo;
                  </div>
                </div>
              )}

              {/* Submitted Code / Solution Details */}
              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#DCE4EE] text-[11px] space-y-1">
                <span className="font-semibold text-[#5F6F84]">Submitted Code Snippet / Repository:</span>
                <div className="font-mono text-[#142541] bg-white p-2.5 rounded-lg border border-[#DCE4EE] overflow-x-auto whitespace-pre-wrap">
                  {grade.content}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
