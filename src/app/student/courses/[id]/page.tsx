import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CheckCircle2,
  Circle,
  Video,
  FileCode,
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
  Clock,
  Download,
  FileText,
} from "lucide-react";
import { requireRole } from "@/server/services/authService";
import {
  getStudentByProfileId,
  getStudentCourseById,
  getStudentCompletedLessons,
  getStudentAssignments,
  getStudentSessions,
  getStudentResources,
} from "@/server/services/studentService";
import { LessonCompleteButton } from "@/components/dashboards/LessonCompleteButton";
import { Badge } from "@/components/ui/badge";
import { StudentJoinButton } from "@/components/dashboards/StudentJoinButton";
import { SubmitAssignmentModal } from "@/components/forms/SubmitAssignmentModal";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return {
    title: `Course Classroom — Syntaxora`,
    description: `Official curriculum classroom and interactive lesson viewer for course ${resolvedParams.id}`,
  };
}

export default async function StudentCourseDetailPage({ params, searchParams }: PageProps) {
  const auth = await requireRole(["student", "admin"]);
  const student = await getStudentByProfileId(auth.userId);

  if (!student) {
    return (
      <div className="p-12 text-center text-xs text-[#5F6F84] bg-white rounded-2xl border border-[#DCE4EE]">
        No active student record linked to your profile. Please contact admissions.
      </div>
    );
  }

  const { id: courseId } = await params;
  const resolvedSearchParams = await searchParams;
  const requestedLessonId =
    typeof resolvedSearchParams.lesson === "string" ? resolvedSearchParams.lesson : undefined;

  // STRICT SERVER AUTHORIZATION: Verify student holds active or completed enrollment in this course
  const enrollmentData = await getStudentCourseById(student.id, courseId);

  if (!enrollmentData) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white rounded-3xl border border-[#DCE4EE] shadow-sm text-center space-y-4">
        <div className="h-14 w-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold text-[#142541]">Course Access Restricted</h2>
        <p className="text-xs text-[#5F6F84] leading-relaxed max-w-md mx-auto">
          You do not have an active enrollment record for this course track. Enrollment access is provisioned upon approved course admission and batch allocation.
        </p>
        <div className="pt-2">
          <Link
            href="/student/courses"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#142541] hover:bg-[#1E375F] text-white text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to My Enrolled Tracks</span>
          </Link>
        </div>
      </div>
    );
  }

  const { course, enrollment } = enrollmentData;

  const [completedLessonIds, allAssignments, allSessions, allResources] = await Promise.all([
    getStudentCompletedLessons(student.id),
    getStudentAssignments(student.id),
    getStudentSessions(student.id),
    getStudentResources(student.id),
  ]);

  const completedSet = new Set(completedLessonIds);

  // Flatten all lessons in order
  const allLessons = (course.modules || []).flatMap((m) =>
    (m.lessons || []).map((l) => ({ ...l, moduleTitle: m.title }))
  );

  if (allLessons.length === 0) {
    return notFound();
  }

  // Determine current active lesson
  const currentLesson =
    allLessons.find((l) => l.id === requestedLessonId) ||
    allLessons.find((l) => !completedSet.has(l.id)) ||
    allLessons[0];

  const currentIndex = allLessons.findIndex((l) => l.id === currentLesson.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
  const isCurrentLessonDone = completedSet.has(currentLesson.id);

  // Scoped data
  const courseAssignments = allAssignments.filter((a) => a.course_id === course.id);
  const courseSessions = allSessions.filter((s) => s.course_id === course.id);
  const courseResources = allResources.filter((r) => r.course_id === course.id);

  const totalCourseLessons = allLessons.length;
  const completedInCourse = allLessons.filter((l) => completedSet.has(l.id)).length;
  const progressPercent =
    totalCourseLessons > 0 ? Math.round((completedInCourse / totalCourseLessons) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#5F6F84] mb-1">
            <Link href="/student" className="hover:text-[#142541]">
              Dashboard
            </Link>
            <span>/</span>
            <Link href="/student/courses" className="hover:text-[#142541]">
              Enrolled Tracks
            </Link>
            <span>/</span>
            <span className="font-semibold text-[#142541] truncate max-w-xs">{course.title}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142541] tracking-tight">
            {course.title}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white px-3.5 py-1.5 rounded-xl border border-[#DCE4EE] text-right">
            <div className="text-[10px] text-[#5F6F84] font-bold uppercase tracking-wider">
              Course Progress
            </div>
            <div className="text-sm font-black text-[#3869AD] font-mono">
              {progressPercent}% Complete
            </div>
          </div>
          <Link
            href="/student/courses"
            className="px-3.5 py-2 rounded-xl bg-[#F3F6FA] hover:bg-[#DCE4EE] text-[#142541] text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>All Tracks</span>
          </Link>
        </div>
      </div>

      {/* Main Classroom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Lesson Player & Learning Material */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Lesson Card */}
          <div className="rounded-2xl border border-[#DCE4EE] bg-white overflow-hidden shadow-sm">
            {/* Lesson Video Container or Interactive Media Container */}
            <div className="aspect-video w-full bg-[#0E1B31] relative flex items-center justify-center overflow-hidden border-b border-[#DCE4EE]">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
              
              <div className="relative z-10 text-center space-y-3 px-6">
                <div className="h-16 w-16 rounded-2xl bg-white/10 text-white backdrop-blur-md border border-white/20 flex items-center justify-center mx-auto shadow-lg">
                  {currentLesson.lesson_type === "lab" ? (
                    <FileCode className="h-8 w-8 text-cyan-300" />
                  ) : (
                    <Video className="h-8 w-8 text-cyan-300" />
                  )}
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-cyan-300 text-xs font-semibold backdrop-blur-xs">
                    <span>{currentLesson.moduleTitle}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-white mt-1">
                    {currentLesson.title}
                  </h3>
                </div>
                <div className="text-xs text-[#DCE4EE]/70 font-mono">
                  Lesson Type: {currentLesson.lesson_type.toUpperCase()} • Cohort Guided Syllabus
                </div>
              </div>
            </div>

            {/* Lesson Control Header */}
            <div className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DCE4EE]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#5F6F84] uppercase tracking-wider">
                      Lesson {currentIndex + 1} of {totalCourseLessons}
                    </span>
                    <Badge variant="teal" className="text-[10px] uppercase font-mono">
                      {currentLesson.lesson_type}
                    </Badge>
                  </div>
                  <h2 className="text-xl font-extrabold text-[#142541]">{currentLesson.title}</h2>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <LessonCompleteButton
                    lessonId={currentLesson.id}
                    initialCompleted={isCurrentLessonDone}
                  />
                </div>
              </div>

              {/* Lesson Instructions & Notes */}
              <div className="space-y-3 text-xs leading-relaxed text-[#263449]">
                <div className="font-bold text-[#142541] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-[#3869AD]" />
                  <span>Curriculum Overview & Practical Objectives</span>
                </div>
                <p className="bg-[#F8FAFC] p-4 rounded-xl border border-[#DCE4EE] text-[#5F6F84]">
                  {currentLesson.description ||
                    "In this session, students explore core algorithmic design patterns, analyze input pipelines, and implement verifiable machine learning workflows using modern Python libraries."}
                </p>
                {currentLesson.content && (
                  <div className="prose prose-sm max-w-none text-xs text-[#263449] p-4 bg-white rounded-xl border border-[#DCE4EE]">
                    {currentLesson.content}
                  </div>
                )}
              </div>

              {/* Prev / Next Navigation Bar */}
              <div className="pt-4 border-t border-[#DCE4EE] flex items-center justify-between gap-4">
                {prevLesson ? (
                  <Link
                    href={`/student/courses/${course.id}?lesson=${prevLesson.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F3F6FA] hover:bg-[#DCE4EE] text-[#142541] text-xs font-semibold transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Previous: {prevLesson.title.substring(0, 24)}...</span>
                  </Link>
                ) : (
                  <div />
                )}

                {nextLesson && (
                  <Link
                    href={`/student/courses/${course.id}?lesson=${nextLesson.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#142541] hover:bg-[#1E375F] text-white text-xs font-semibold transition-colors shadow-xs"
                  >
                    <span>Next: {nextLesson.title.substring(0, 24)}...</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Course Deliverables & Assignments for this Course */}
          {courseAssignments.length > 0 && (
            <div className="rounded-2xl border border-[#DCE4EE] bg-white overflow-hidden shadow-sm">
              <div className="p-5 border-b border-[#DCE4EE] bg-[#F8FAFC] flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-[#142541]">
                    Track Deliverables ({courseAssignments.length})
                  </h3>
                  <p className="text-[11px] text-[#5F6F84] mt-0.5">
                    Lab exercises and projects assigned for this course track
                  </p>
                </div>
                <Link
                  href="/student/assignments"
                  className="text-xs text-[#3869AD] font-bold hover:underline"
                >
                  View All
                </Link>
              </div>

              <div className="divide-y divide-[#DCE4EE] text-xs">
                {courseAssignments.map((asn) => {
                  const sub = asn.submission;
                  const isGraded = sub?.status === "graded" && sub.is_grade_published;

                  return (
                    <div key={asn.id} className="p-4 flex items-center justify-between gap-3">
                      <div>
                        <div className="font-bold text-[#142541]">{asn.title}</div>
                        <div className="text-[11px] text-[#5F6F84]">
                          Due: {new Date(asn.due_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {asn.max_score} pts
                        </div>
                      </div>
                      <div>
                        {isGraded ? (
                          <Badge variant="success">Graded ({sub.score}/{asn.max_score})</Badge>
                        ) : sub ? (
                          <Badge variant="teal">Submitted (In Review)</Badge>
                        ) : (
                          <SubmitAssignmentModal
                            assignmentId={asn.id}
                            assignmentTitle={asn.title}
                            maxScore={asn.max_score}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Syllabus Outline & Resources */}
        <div className="space-y-6">
          {/* Syllabus Outline Card */}
          <div className="rounded-2xl border border-[#DCE4EE] bg-white overflow-hidden shadow-sm">
            <div className="p-5 border-b border-[#DCE4EE] bg-[#F8FAFC] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#142541]">
                  Course Curriculum
                </h3>
                <p className="text-[11px] text-[#5F6F84] mt-0.5">
                  {completedInCourse} of {totalCourseLessons} lessons completed
                </p>
              </div>
              <span className="font-mono text-xs font-bold text-[#3869AD]">
                {progressPercent}%
              </span>
            </div>

            <div className="p-3 space-y-4 max-h-[600px] overflow-y-auto">
              {course.modules?.map((mod, modIdx) => (
                <div
                  key={mod.id || modIdx}
                  className="rounded-xl border border-[#DCE4EE] bg-[#F8FAFC]/50 overflow-hidden"
                >
                  <div className="p-3 bg-white border-b border-[#DCE4EE]">
                    <div className="text-xs font-bold text-[#142541]">
                      Module {modIdx + 1}: {mod.title}
                    </div>
                  </div>

                  <div className="divide-y divide-[#DCE4EE]/70 text-xs">
                    {mod.lessons?.map((lesson) => {
                      const isDone = completedSet.has(lesson.id);
                      const isCurrent = lesson.id === currentLesson.id;

                      return (
                        <Link
                          key={lesson.id}
                          href={`/student/courses/${course.id}?lesson=${lesson.id}`}
                          className={`flex items-center justify-between p-3 transition-colors ${
                            isCurrent
                              ? "bg-blue-50/80 font-bold text-[#3869AD] border-l-4 border-l-[#3869AD]"
                              : "hover:bg-white text-[#263449]"
                          }`}
                        >
                          <div className="flex items-center gap-2 overflow-hidden pr-2">
                            {isDone ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                            ) : (
                              <Circle className="h-4 w-4 text-[#5F6F84]/50 shrink-0" />
                            )}
                            <span className="truncate">{lesson.title}</span>
                          </div>
                          <Badge variant="outline" className="text-[9px] uppercase font-mono shrink-0">
                            {lesson.lesson_type}
                          </Badge>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Downloadable Course Materials */}
          {courseResources.length > 0 && (
            <div className="rounded-2xl border border-[#DCE4EE] bg-white overflow-hidden shadow-sm">
              <div className="p-5 border-b border-[#DCE4EE] bg-[#F8FAFC]">
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#142541]">
                  Downloadable Materials
                </h3>
                <p className="text-[11px] text-[#5F6F84] mt-0.5">
                  Verified code repositories, worksheets & datasets
                </p>
              </div>

              <div className="divide-y divide-[#DCE4EE] text-xs">
                {courseResources.map((res) => (
                  <div key={res.id} className="p-4 flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="font-bold text-[#142541]">{res.title}</div>
                      <div className="text-[10px] text-[#5F6F84]">
                        {res.file_type.toUpperCase()} • {res.file_size || "Direct Download"}
                      </div>
                    </div>
                    <a
                      href={res.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-[#F3F6FA] hover:bg-[#DCE4EE] text-[#142541] font-semibold text-[11px] flex items-center gap-1 transition-colors"
                    >
                      <Download className="h-3 w-3" />
                      <span>Fetch</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Live Sessions for this Course */}
          {courseSessions.length > 0 && (
            <div className="rounded-2xl border border-[#DCE4EE] bg-white overflow-hidden shadow-sm">
              <div className="p-5 border-b border-[#DCE4EE] bg-[#F8FAFC]">
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#142541]">
                  Live Class Schedule
                </h3>
                <p className="text-[11px] text-[#5F6F84] mt-0.5">
                  Upcoming interactive virtual lab meetings
                </p>
              </div>

              <div className="divide-y divide-[#DCE4EE] text-xs">
                {courseSessions.slice(0, 2).map((s) => (
                  <div key={s.id} className="p-4 space-y-2">
                    <div className="font-bold text-[#142541]">{s.title}</div>
                    <div className="text-[11px] text-[#5F6F84] flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-[#3869AD]" />
                      <span>
                        {new Date(s.starts_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} at{" "}
                        {new Date(s.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="pt-1">
                      <StudentJoinButton
                        sessionId={s.id}
                        sessionStatus={s.status}
                        startsAt={s.starts_at}
                        endsAt={s.ends_at}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
