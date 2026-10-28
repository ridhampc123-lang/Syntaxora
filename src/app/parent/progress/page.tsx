import React from "react";
import {
  Lock,
  Award,
  CheckCircle2,
  Sparkles,
  BookOpen,
  FileText,
  Star,
  Download,
  ShieldCheck,
  TrendingUp,
  HelpCircle,
} from "lucide-react";
import { requireRole } from "@/server/services/authService";
import { getActiveChildrenForGuardian } from "@/server/services/guardianService";
import {
  getStudentReleasedGrades,
  getStudentCourses,
  getStudentCompletedLessons,
} from "@/server/services/studentService";
import { ParentChildSelector } from "@/components/forms/ParentChildSelector";
import { LinkStudentModal } from "@/components/forms/LinkStudentModal";
import { PrintButton } from "@/components/ui/PrintButton";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Child Academic Evaluations & Grades — Syntaxora Guardian",
  description: "Officially released project grades, algorithmic rubrics, and faculty feedback for your student.",
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
      <div className="max-w-xl mx-auto py-12 text-center space-y-4 bg-white rounded-3xl border border-[#DCE4EE] p-8 shadow-xs">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-[#E8EFF8] text-[#3869AD] flex items-center justify-center">
          <Award className="h-7 w-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-[#142541]">No Active Student Connected</h2>
          <p className="text-xs text-[#5F6F84] max-w-sm mx-auto leading-relaxed">
            Link your child using their unique student code to unlock authenticated academic rubrics, evaluation scores, and faculty feedback.
          </p>
        </div>
        <div className="pt-2 flex justify-center">
          <LinkStudentModal buttonText="Link Your Child Now" variant="primary" size="md" />
        </div>
      </div>
    );
  }

  const studentName = activeRel.student?.profile?.full_name || "Linked Student";
  const studentCode = activeRel.student?.student_code || "STU-CODE";

  if (!activeRel.can_view_progress) {
    return (
      <div className="space-y-6">
        <ParentChildSelector relationships={relationships} selectedChildId={activeRel.student_id} />
        <div className="rounded-3xl border border-amber-200 bg-amber-50/50 p-12 text-center space-y-4">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <Lock className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-amber-900">Academic Progress Restricted</h3>
            <p className="text-xs text-amber-700 max-w-md mx-auto leading-relaxed">
              Your verified guardian link for <strong>{studentName}</strong> does not currently include academic evaluations viewing authorization.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Real released grades only (strictly is_grade_published === true)
  const [grades, courses, completedLessonIds] = await Promise.all([
    getStudentReleasedGrades(activeRel.student_id),
    getStudentCourses(activeRel.student_id),
    getStudentCompletedLessons(activeRel.student_id),
  ]);

  const totalLessons = courses.reduce(
    (acc, c) => acc + (c.modules?.reduce((macc, m) => macc + (m.lessons?.length || 0), 0) || 0),
    0
  );
  const completedLessonsCount = completedLessonIds.length;
  const progressPercent = totalLessons > 0 ? Math.round((completedLessonsCount / totalLessons) * 100) : 0;

  const avgScore =
    grades.length > 0
      ? Math.round(grades.reduce((acc, g) => acc + (g.score || 0), 0) / grades.length)
      : null;

  return (
    <div className="space-y-8">
      {/* Title & Child Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#5F6F84] mb-1">
            <span>Parent Portal</span>
            <span>/</span>
            <span className="font-semibold text-[#142541]">Learning Progress & Grades</span>
          </div>
          <h1 className="text-2xl font-black text-[#142541] tracking-tight">
            Academic Performance: {studentName}
          </h1>
          <p className="text-xs text-[#5F6F84] mt-0.5">
            Student Code: <strong className="font-mono text-[#3869AD]">{studentCode}</strong> • Official faculty rubrics and released evaluation scores.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ParentChildSelector
            relationships={relationships}
            selectedChildId={activeRel.student_id}
          />
          <LinkStudentModal
            buttonText="+ Link Sibling"
            variant="outline"
            size="sm"
          />
          <PrintButton
            label="Print Report Card"
            icon="printer"
            variant="outline"
            size="sm"
          />
        </div>
      </div>

      {/* Top Academic Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Published Average Score */}
        <div className="p-5 rounded-2xl bg-white border border-[#DCE4EE] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#5F6F84] text-xs font-semibold">
            <span>Faculty Evaluations Average</span>
            <Award className="h-4 w-4 text-[#3869AD]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#142541]">
            {avgScore !== null ? `${avgScore} / 100` : "—"}
          </div>
          <p className="text-[11px] text-[#5F6F84]">
            {avgScore !== null ? "Average of published project reviews" : "No evaluations published yet"}
          </p>
        </div>

        {/* Published Reviews Count */}
        <div className="p-5 rounded-2xl bg-white border border-[#DCE4EE] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#5F6F84] text-xs font-semibold">
            <span>Released Grades</span>
            <FileText className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700">
            {grades.length}
          </div>
          <p className="text-[11px] text-[#5F6F84]">
            Evaluations finalized and published
          </p>
        </div>

        {/* Syllabus Lessons Completed */}
        <div className="p-5 rounded-2xl bg-white border border-[#DCE4EE] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#5F6F84] text-xs font-semibold">
            <span>Curriculum Progress</span>
            <TrendingUp className="h-4 w-4 text-sky-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-sky-700">
            {progressPercent}%
          </div>
          <p className="text-[11px] text-[#5F6F84]">
            {completedLessonsCount} of {totalLessons} curriculum units
          </p>
        </div>

        {/* Enrolled Courses */}
        <div className="p-5 rounded-2xl bg-white border border-[#DCE4EE] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#5F6F84] text-xs font-semibold">
            <span>Enrolled Programs</span>
            <BookOpen className="h-4 w-4 text-[#168B83]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#142541]">
            {courses.length}
          </div>
          <p className="text-[11px] text-[#5F6F84]">
            Active accredited courses
          </p>
        </div>
      </div>

      {/* Curriculum Module Progress Bar */}
      {courses.length > 0 && (
        <div className="rounded-3xl border border-[#DCE4EE] bg-white p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F0F4F8]">
            <div>
              <h3 className="text-sm font-bold text-[#142541]">
                Syllabus Unit Completion Tracking
              </h3>
              <p className="text-xs text-[#5F6F84]">
                Completed laboratory notebooks and coding lecture completions verified on learner account.
              </p>
            </div>
            <span className="text-xs font-bold text-[#168B83]">
              {completedLessonsCount} of {totalLessons} Units Completed ({progressPercent}%)
            </span>
          </div>

          <div className="w-full bg-[#E8EFF8] h-3 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#168B83] to-[#3869AD] h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(progressPercent, totalLessons > 0 ? 5 : 0))}%` }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {courses.map((course) => (
              <div key={course.id} className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#DCE4EE] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#142541] truncate max-w-xs">{course.title}</span>
                  <Badge variant="teal">{course.level.toUpperCase()}</Badge>
                </div>
                <div className="text-[11px] text-[#5F6F84]">
                  Modules: {course.modules?.length || 0} • Duration: {course.duration_weeks} Weeks
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Released Project Evaluations & Qualitative Faculty Feedback */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#142541] flex items-center gap-2">
              <Award className="h-5 w-5 text-[#3869AD]" />
              Officially Released Evaluations ({grades.length})
            </h3>
            <p className="text-xs text-[#5F6F84]">
              Grades published by faculty instructors with written qualitative rubrics.
            </p>
          </div>
        </div>

        {grades.length > 0 ? (
          <div className="space-y-4">
            {grades.map((grade) => {
              const maxScore = grade.assignment?.max_score || 100;
              const pct = Math.round(((grade.score || 0) / maxScore) * 100);

              return (
                <div
                  key={grade.id}
                  className="rounded-3xl border border-[#DCE4EE] bg-white p-6 shadow-xs space-y-4 hover:shadow-sm transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-[#F0F4F8]">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="success">RELEASED REVIEW</Badge>
                        <span className="text-[11px] text-[#5F6F84]">
                          Graded on {grade.graded_at ? new Date(grade.graded_at).toLocaleDateString() : "Recent"}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-[#142541]">
                        {grade.assignment?.title || "Course Project Assessment"}
                      </h4>
                      <p className="text-xs text-[#5F6F84]">
                        Submitted {grade.submitted_at ? new Date(grade.submitted_at).toLocaleDateString() : "Online"}
                      </p>
                    </div>

                    <div className="text-right sm:text-right">
                      <div className="text-3xl font-black text-[#142541]">
                        {grade.score}{" "}
                        <span className="text-xs font-semibold text-[#5F6F84]">
                          / {maxScore} pts
                        </span>
                      </div>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-0.5">
                        {pct >= 90 ? "Exemplary (A+)" : pct >= 80 ? "Proficient (A)" : "Competent (B)"}
                      </span>
                    </div>
                  </div>

                  {/* Qualitative Faculty Review */}
                  {grade.feedback && (
                    <div className="rounded-2xl border border-[#3869AD]/20 bg-[#E8EFF8]/40 p-4 space-y-1 text-xs">
                      <span className="font-bold text-[#3869AD] block uppercase tracking-wider text-[10px]">
                        Instructor Qualitative Feedback & Rubric Notes
                      </span>
                      <p className="text-[#142541] leading-relaxed italic">
                        &ldquo;{grade.feedback}&rdquo;
                      </p>
                    </div>
                  )}

                  {/* Student Code / Repository Solution Link */}
                  {grade.content && (
                    <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#DCE4EE] text-xs space-y-1">
                      <span className="text-[10px] font-bold uppercase text-[#5F6F84]">
                        Student Project Submission Reference
                      </span>
                      <p className="font-mono text-[11px] text-[#142541] break-all">
                        {grade.content}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-[#DCE4EE] bg-white p-12 text-center space-y-3 shadow-xs">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-[#E8EFF8] text-[#3869AD] flex items-center justify-center">
              <Award className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-[#142541]">No Evaluations Published Yet</h4>
              <p className="text-xs text-[#5F6F84] max-w-sm mx-auto leading-relaxed">
                As coursework and coding assessments are submitted by your student and evaluated by instructors, released grades and qualitative feedback will appear here.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Policy Notice */}
      <div className="rounded-2xl border border-[#DCE4EE] bg-[#F8FAFC] p-4.5 text-xs text-[#5F6F84] flex items-start gap-3">
        <HelpCircle className="h-5 w-5 text-[#3869AD] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-[#142541] block">Grade Release Policy</strong>
          <p className="leading-relaxed">
            In accordance with Syntaxora educational standards, evaluation scores are held in draft state during initial marking and only become visible to learners and guardians after faculty review and moderation. Parents cannot edit or alter academic evaluations.
          </p>
        </div>
      </div>
    </div>
  );
}
