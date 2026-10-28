import React from "react";
import Link from "next/link";
import {
  GraduationCap,
  Calendar,
  User,
  BookOpen,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Lock,
  Layers,
  ArrowRight,
} from "lucide-react";
import { requireRole } from "@/server/services/authService";
import { getActiveChildrenForGuardian } from "@/server/services/guardianService";
import { getStudentEnrollments, getStudentCourses } from "@/server/services/studentService";
import { ParentChildSelector } from "@/components/forms/ParentChildSelector";
import { LinkStudentModal } from "@/components/forms/LinkStudentModal";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Enrolled Courses & Cohort Batches — Syntaxora Guardian",
  description: "View your student's enrolled AI courses, cohort batch assignments, curriculum syllabus, and instructor profiles.",
};

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ParentCoursesPage({ searchParams }: Props) {
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
          <GraduationCap className="h-7 w-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-[#142541]">No Active Student Connected</h2>
          <p className="text-xs text-[#5F6F84] max-w-sm mx-auto leading-relaxed">
            Link your child using their unique student code to review enrolled curricula, cohort batches, and faculty instructor profiles.
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

  const [enrollments, courses] = await Promise.all([
    getStudentEnrollments(activeRel.student_id),
    getStudentCourses(activeRel.student_id),
  ]);

  return (
    <div className="space-y-8">
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#5F6F84] mb-1">
            <span>Parent Portal</span>
            <span>/</span>
            <span className="font-semibold text-[#142541]">Courses & Batches</span>
          </div>
          <h1 className="text-2xl font-black text-[#142541] tracking-tight">
            Curriculum & Batches: {studentName}
          </h1>
          <p className="text-xs text-[#5F6F84] mt-0.5">
            Student Code: <strong className="font-mono text-[#3869AD]">{studentCode}</strong> • Enrolled courses, assigned cohort batches, and public faculty profiles.
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
        </div>
      </div>

      {/* Enrolled Courses Cards */}
      {enrollments.length > 0 ? (
        <div className="space-y-6">
          {enrollments.map((enr) => {
            const course = courses.find((c) => c.id === enr.course_id) || enr.course;
            const batch = enr.batch;
            const instructor = batch?.primary_instructor;

            return (
              <div
                key={enr.id}
                className="rounded-3xl border border-[#DCE4EE] bg-white p-6 sm:p-7 shadow-xs space-y-6"
              >
                {/* Course Header */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-5 border-b border-[#F0F4F8]">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="teal">{enr.status.toUpperCase()}</Badge>
                      <span className="text-xs font-mono font-bold text-[#3869AD] bg-[#E8EFF8] px-2.5 py-0.5 rounded-md">
                        {batch?.batch_code || "COHORT-ASSIGNED"}
                      </span>
                      <span className="capitalize text-xs font-semibold text-[#5F6F84] bg-[#F8FAFC] px-2.5 py-0.5 rounded-md border border-[#DCE4EE]">
                        Level: {course?.level || "Beginner"}
                      </span>
                    </div>

                    <h2 className="text-xl font-black text-[#142541]">
                      {course?.title || "Enrolled AI Curriculum Track"}
                    </h2>

                    <p className="text-xs text-[#5F6F84] leading-relaxed max-w-3xl">
                      {course?.description || course?.summary || "Comprehensive curriculum in advanced computer science and artificial intelligence."}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#DCE4EE] text-xs space-y-1.5 shrink-0 min-w-[200px]">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#93A5C2]">
                      Batch Schedule
                    </div>
                    <div className="font-bold text-sm text-[#142541]">
                      {batch?.name || "Direct Admission"}
                    </div>
                    <div className="text-[11px] text-[#5F6F84]">
                      Timezone: <strong className="text-[#142541]">{batch?.timezone || "Asia/Kolkata"}</strong>
                    </div>
                    {enr.starts_at && (
                      <div className="text-[11px] text-[#5F6F84]">
                        Enrolled: {new Date(enr.starts_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Faculty Profile Card (Public info only, no private contacts) */}
                {instructor && (
                  <div className="p-4.5 rounded-2xl bg-[#F8FAFC] border border-[#DCE4EE] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3.5">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-[#168B83] to-[#3869AD] text-white flex items-center justify-center font-bold text-base shrink-0">
                        {instructor.full_name?.charAt(0) || "F"}
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#3869AD]">
                          Assigned Lead Faculty
                        </span>
                        <h4 className="font-bold text-sm text-[#142541]">
                          {instructor.full_name}
                        </h4>
                        <p className="text-[11px] text-[#5F6F84] line-clamp-1">
                          {instructor.bio || "Senior AI Educator & Curriculum Specialist"}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shrink-0">
                      Faculty Verified
                    </span>
                  </div>
                )}

                {/* Syllabus Outline */}
                {course?.modules && course.modules.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-[#142541] uppercase tracking-wider flex items-center gap-2">
                        <Layers className="h-4 w-4 text-[#3869AD]" />
                        Syllabus Modules ({course.modules.length} Modules)
                      </h3>
                      <Link
                        href={`/parent/progress?childId=${activeRel.student_id}`}
                        className="text-xs font-semibold text-[#3869AD] hover:underline"
                      >
                        View Completion Progress &rarr;
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {course.modules.map((mod, idx) => (
                        <div
                          key={mod.id}
                          className="p-3.5 rounded-xl border border-[#DCE4EE] bg-white space-y-1 hover:border-[#3869AD] transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] font-bold text-[#3869AD]">
                              MODULE {idx + 1}
                            </span>
                            <span className="text-[11px] text-[#5F6F84]">
                              {mod.lessons?.length || 0} Lessons
                            </span>
                          </div>
                          <div className="font-bold text-[#142541]">{mod.title}</div>
                          {mod.description && (
                            <p className="text-[11px] text-[#5F6F84] line-clamp-2 leading-relaxed">
                              {mod.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-[#DCE4EE] bg-white p-12 text-center space-y-3 shadow-xs">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-[#E8EFF8] text-[#3869AD] flex items-center justify-center">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-[#142541]">No Active Enrollments Found</h4>
            <p className="text-xs text-[#5F6F84] max-w-sm mx-auto leading-relaxed">
              This student does not currently hold an active course enrollment. When an application is approved and enrolled by admissions, course details will display here.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

