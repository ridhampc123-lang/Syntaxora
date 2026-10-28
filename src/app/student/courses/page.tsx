import React from "react";
import Link from "next/link";
import {
  BookOpen,
  CalendarCheck,
  Award,
  Video,
  FileCode,
  ExternalLink,
  GitBranch,
  Clock,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { requireRole } from "@/server/services/authService";
import {
  getStudentByProfileId,
  getStudentCourses,
  getStudentCompletedLessons,
} from "@/server/services/studentService";
import { Badge } from "@/components/ui/badge";
import { LessonCompleteButton } from "@/components/dashboards/LessonCompleteButton";

export const metadata = {
  title: "My Enrolled Tracks — Syntaxora",
  description: "Official curriculum tracks, weekly learning modules, lab exercises, and coding repositories.",
};

export default async function StudentCoursesPage() {
  const auth = await requireRole(["student", "admin"]);
  const student = await getStudentByProfileId(auth.userId);

  const [courses, completedLessonIds] = student
    ? await Promise.all([
        getStudentCourses(student.id),
        getStudentCompletedLessons(student.id),
      ])
    : [[], []];

  const completedSet = new Set(completedLessonIds);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#142541]/5 text-[#3869AD] text-xs font-bold mb-2">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Academic Curriculum</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142541] tracking-tight">
            Enrolled Curriculum Tracks
          </h1>
          <p className="text-xs sm:text-sm text-[#5F6F84] mt-1 max-w-2xl">
            Access your cohort syllabus, weekly laboratory challenges, sensor data pipelines, and verify module completion.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/student/classes"
            className="px-4 py-2 rounded-xl bg-[#142541] hover:bg-[#1E375F] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <CalendarCheck className="h-3.5 w-3.5 text-cyan-300" />
            <span>Live Class Schedule</span>
          </Link>
        </div>
      </div>

      {/* Empty State */}
      {courses.length === 0 ? (
        <div className="rounded-2xl border border-[#DCE4EE] bg-white p-12 text-center space-y-4 shadow-sm">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 text-[#3869AD] flex items-center justify-center mx-auto">
            <BookOpen className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#142541]">No Enrolled Curriculum Tracks</h3>
            <p className="text-xs text-[#5F6F84] max-w-md mx-auto leading-relaxed">
              You are not currently enrolled in any academic courses. Once your admission application is processed, your assigned syllabus will appear here.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/courses"
              className="px-4 py-2 rounded-xl bg-[#142541] hover:bg-[#1E375F] text-white text-xs font-semibold transition-colors"
            >
              Browse Course Catalog
            </Link>
            <Link
              href="/apply"
              className="px-4 py-2 rounded-xl bg-[#F3F6FA] hover:bg-[#DCE4EE] text-[#142541] text-xs font-semibold transition-colors"
            >
              Admissions Portal
            </Link>
          </div>
        </div>
      ) : (
        courses.map((course) => {
          const totalLessons =
            course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;
          const completedInThisCourse =
            course.modules?.reduce((acc, m) => {
              return acc + (m.lessons?.filter((l) => completedSet.has(l.id)).length || 0);
            }, 0) || 0;
          const progressPercent =
            totalLessons > 0
              ? Math.min(100, Math.round((completedInThisCourse / totalLessons) * 100))
              : 0;

          return (
            <div
              key={course.id}
              className="rounded-2xl border border-[#DCE4EE] bg-white shadow-sm overflow-hidden space-y-6"
            >
              {/* Course Header Banner */}
              <div className="p-6 bg-gradient-to-r from-[#142541] to-[#1E375F] text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 text-[11px] font-bold border border-cyan-400/30 uppercase tracking-wider">
                      {course.audience_group?.replace("_", " ")}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white text-[11px] font-semibold border border-white/20 capitalize">
                      {course.level} Level
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold border border-emerald-500/30 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Verified Cohort
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    {course.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#DCE4EE]/85 max-w-2xl leading-relaxed">
                    {course.description}
                  </p>
                </div>

                <div className="shrink-0 flex flex-col gap-3">
                  <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/15 text-right space-y-1">
                    <div className="text-xs font-bold text-white flex items-center justify-end gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-cyan-300" />
                      <span>Duration: {course.duration_weeks} Weeks</span>
                    </div>
                    <div className="text-[11px] text-cyan-200">
                      Mode: {course.delivery_mode?.replace("_", " ")}
                    </div>
                    <div className="text-[10px] text-emerald-300 font-semibold pt-1 flex items-center justify-end gap-1">
                      <Award className="h-3 w-3" />
                      <span>Verified Certificate Track</span>
                    </div>
                  </div>

                  <Link
                    href={`/student/courses/${course.id}`}
                    className="w-full text-center px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#0E1B31] text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <span>Launch Course Classroom</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {/* Course Progress & Resources Row */}
              <div className="px-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#DCE4EE] md:col-span-2 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#142541] flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-[#3869AD]" />
                      <span>Curriculum Mastery Progress</span>
                    </span>
                    <span className="font-extrabold text-[#3869AD] font-mono text-sm">
                      {progressPercent}% Complete
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-[#E2E8F0] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#3869AD] via-[#2A528A] to-[#168B83] rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-[#5F6F84]">
                    {completedInThisCourse} of {totalLessons} modules and lab milestones completed
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#DCE4EE] flex flex-col justify-between space-y-2">
                  <div className="text-xs font-bold text-[#142541] flex items-center gap-1.5">
                    <GitBranch className="h-3.5 w-3.5 text-[#142541]" />
                    <span>Student Code Repositories</span>
                  </div>
                  <p className="text-[11px] text-[#5F6F84]">
                    Access cohort templates, OpenCV Jupyter notebooks, and dataset pipelines.
                  </p>
                  <Link
                    href="/student/resources"
                    className="text-xs font-semibold text-[#3869AD] hover:underline inline-flex items-center gap-1"
                  >
                    <span>View Course Resources</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>

              {/* Curriculum Modules & Lessons */}
              <div className="px-6 pb-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#142541] flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 text-[#3869AD]" />
                    <span>Curriculum Modules & Edge Lab Exercises</span>
                  </h3>
                  <Link
                    href={`/student/courses/${course.id}`}
                    className="text-xs font-bold text-[#3869AD] hover:underline flex items-center gap-1"
                  >
                    Interactive Player <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                <div className="space-y-4">
                  {course.modules?.map((mod, modIdx) => (
                    <div
                      key={mod.id || modIdx}
                      className="rounded-xl border border-[#DCE4EE] bg-white overflow-hidden shadow-2xs"
                    >
                      <div className="p-4 bg-[#F8FAFC] border-b border-[#DCE4EE] flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs text-[#142541]">
                              Module {modIdx + 1}: {mod.title}
                            </span>
                          </div>
                          {mod.description && (
                            <p className="text-[11px] text-[#5F6F84]">{mod.description}</p>
                          )}
                        </div>
                        <Badge variant="teal" className="text-[10px]">
                          {mod.lessons?.length || 0} Lessons
                        </Badge>
                      </div>

                      <div className="divide-y divide-[#DCE4EE] text-xs">
                        {mod.lessons && mod.lessons.length > 0 ? (
                          mod.lessons.map((lesson) => {
                            const isDone = completedSet.has(lesson.id);
                            return (
                              <div
                                key={lesson.id}
                                className="p-3.5 flex items-center justify-between gap-3 hover:bg-[#F8FAFC]/70 transition-colors"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="mt-0.5 h-6 w-6 rounded-lg bg-blue-50 text-[#3869AD] flex items-center justify-center shrink-0">
                                    {lesson.lesson_type === "lab" ? (
                                      <FileCode className="h-3.5 w-3.5" />
                                    ) : (
                                      <Video className="h-3.5 w-3.5" />
                                    )}
                                  </div>
                                  <div className="space-y-0.5">
                                    <div className="font-bold text-[#142541] flex items-center gap-2">
                                      <Link
                                        href={`/student/courses/${course.id}?lesson=${lesson.id}`}
                                        className="hover:text-[#3869AD] transition-colors"
                                      >
                                        {lesson.title}
                                      </Link>
                                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-md bg-[#DCE4EE]/50 text-[#5F6F84]">
                                        {lesson.lesson_type}
                                      </span>
                                    </div>
                                    {lesson.description && (
                                      <p className="text-[11px] text-[#5F6F84]">
                                        {lesson.description}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="shrink-0 flex items-center gap-2">
                                  <LessonCompleteButton
                                    lessonId={lesson.id}
                                    initialCompleted={isDone}
                                  />
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="p-4 text-center text-[11px] text-[#5F6F84]">
                            Module contents are actively synced with your cohort schedule.
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
