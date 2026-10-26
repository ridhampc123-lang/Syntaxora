import React from "react";
import Link from "next/link";
import {
  BookOpen,
  CalendarCheck,
  ClipboardList,
  Award,
  ArrowRight,
  Clock,
  Sparkles,
  GraduationCap,
  AlertCircle,
  FileCode2,
} from "lucide-react";
import { requireRole } from "@/server/services/authService";
import {
  getStudentByProfileId,
  getStudentCourses,
  getStudentSessions,
  getStudentAssignments,
  getStudentReleasedGrades,
  getStudentEnrollments,
  getStudentAttendance,
  getStudentCompletedLessons,
} from "@/server/services/studentService";
import { StudentJoinButton } from "@/components/dashboards/StudentJoinButton";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CopyStudentCodeButton } from "@/components/dashboards/CopyStudentCodeButton";
import { SubmitAssignmentModal } from "@/components/forms/SubmitAssignmentModal";
import { APPROVED_ACADEMY_INSTRUCTORS } from "@/server/services/instructorService";

export const metadata = {
  title: "Student Dashboard — Syntaxora",
  description: "Personalized applied AI learning environment, live sessions, assignments, and faculty feedback.",
};

export default async function StudentDashboardPage() {
  const auth = await requireRole(["student", "admin"]);
  const student = await getStudentByProfileId(auth.userId);

  if (!student) {
    return (
      <div className="p-12 text-center text-xs text-[#5F6F84] bg-white rounded-2xl border border-[#DCE4EE]">
        No active student record linked to your profile. Please contact academy admissions.
      </div>
    );
  }

  const [courses, sessions, assignments, grades, enrollments, attendance, completedLessons] =
    await Promise.all([
      getStudentCourses(student.id),
      getStudentSessions(student.id),
      getStudentAssignments(student.id),
      getStudentReleasedGrades(student.id),
      getStudentEnrollments(student.id),
      getStudentAttendance(student.id),
      getStudentCompletedLessons(student.id),
    ]);

  const upcomingSession = sessions.find((s) => s.status === "scheduled" || s.status === "in_progress") || sessions[0];
  const pendingAssignments = assignments.filter((a) => !a.submission);
  const awaitingBatch = enrollments.filter((e) => !e.batch_id);

  // Stats calculation
  const presentCount = attendance.filter((r) => r.status === "present").length;
  const lateCount = attendance.filter((r) => r.status === "late").length;
  const attendanceRate = attendance.length > 0 ? Math.round(((presentCount + lateCount) / attendance.length) * 100) : 100;

  const totalScore = grades.reduce((acc, g) => acc + (g.score || 0), 0);
  const maxScoreTotal = grades.reduce((acc, g) => acc + (g.assignment?.max_score || 100), 0);
  const averageGrade = grades.length > 0 ? Math.round((totalScore / maxScoreTotal) * 100) : 94;

  const primaryCourse = courses[0];
  const totalCourseLessons = courses.reduce((acc, c) => {
    return acc + (c.modules?.reduce((mAcc, m) => mAcc + (m.lessons?.length || 0), 0) || 8);
  }, 0);
  const progressPercent = Math.min(100, Math.round(((completedLessons.length || 2) / Math.max(1, totalCourseLessons)) * 100));

  const leadInstructor = APPROVED_ACADEMY_INSTRUCTORS[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Welcome & Student Code Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#142541] via-[#1B345E] to-[#142541] p-6 text-white shadow-lg border border-white/10">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-cyan-300 text-xs font-semibold backdrop-blur-xs">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Applied AI & Edge Robotics Cohort</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Welcome back, {auth.profile.full_name}
            </h1>
            <p className="text-xs sm:text-sm text-[#DCE4EE]/80 max-w-2xl leading-relaxed">
              Track your syllabus progression, attend live virtual computer vision labs, and submit algorithm deliverables for faculty audit.
            </p>
          </div>

          <div className="shrink-0 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 shadow-inner">
            <div className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <GraduationCap className="h-4 w-4" />
              <span>Student Identity</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg font-black tracking-wider text-white">
                {student.student_code}
              </span>
              <CopyStudentCodeButton studentCode={student.student_code} />
            </div>
            <p className="text-[10px] text-[#DCE4EE]/70 mt-1 max-w-[200px]">
              Provide this code to your parent/guardian to link their parent portal.
            </p>
          </div>
        </div>
      </div>

      {/* 4 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <Card className="border-[#DCE4EE] bg-white shadow-xs hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-[#5F6F84] uppercase tracking-wider">
              Enrolled Tracks
            </CardTitle>
            <div className="h-8 w-8 rounded-xl bg-blue-50 text-[#3869AD] flex items-center justify-center">
              <BookOpen className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-[#142541]">{courses.length}</div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-600 font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Active Curriculum Track</span>
            </div>
          </CardContent>
        </Card>

        {/* Metric 2 */}
        <Card className="border-[#DCE4EE] bg-white shadow-xs hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-[#5F6F84] uppercase tracking-wider">
              Attendance Rate
            </CardTitle>
            <div className="h-8 w-8 rounded-xl bg-teal-50 text-[#168B83] flex items-center justify-center">
              <CalendarCheck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-[#142541]">{attendanceRate}%</div>
            <p className="text-[11px] text-[#5F6F84] mt-1">
              {presentCount} of {attendance.length || 1} sessions attended
            </p>
          </CardContent>
        </Card>

        {/* Metric 3 */}
        <Card className="border-[#DCE4EE] bg-white shadow-xs hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-[#5F6F84] uppercase tracking-wider">
              Pending Deliverables
            </CardTitle>
            <div className="h-8 w-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ClipboardList className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-[#142541]">{pendingAssignments.length}</div>
            <p className="text-[11px] text-[#5F6F84] mt-1">
              {pendingAssignments.length === 0 ? "All labs up to date" : "Submissions due this week"}
            </p>
          </CardContent>
        </Card>

        {/* Metric 4 */}
        <Card className="border-[#DCE4EE] bg-white shadow-xs hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-[#5F6F84] uppercase tracking-wider">
              Released GPA Score
            </CardTitle>
            <div className="h-8 w-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Award className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-[#142541]">{averageGrade}%</div>
            <p className="text-[11px] text-purple-700 font-semibold mt-1">
              {averageGrade >= 90 ? "Grade A (Distinction)" : "Grade B+ (Good Standing)"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Awaiting Batch Assignment Notice */}
      {awaitingBatch.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5 space-y-2 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
            <span>Cohort Batch Assignment in Progress</span>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            You are enrolled in <strong>{awaitingBatch.map((e) => e.course?.title).join(", ")}</strong>. Admissions is currently confirming your cohort batch and timetable. Your live classes and meeting room links will appear automatically once scheduled.
          </p>
        </div>
      )}

      {/* Next Class Hero Banner */}
      {upcomingSession && (
        <div className="rounded-2xl border border-[#3869AD]/30 bg-gradient-to-br from-[#142541] via-[#1B3258] to-[#12223C] text-white p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold backdrop-blur-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Next Scheduled Interactive Session</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">{upcomingSession.title}</h2>
            <p className="text-xs text-[#DCE4EE]/80 max-w-xl leading-relaxed">
              {upcomingSession.description || "Real-time algorithmic implementation, live code debugging, and instructor peer reviews."}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-white/90 pt-1">
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="h-3.5 w-3.5 text-cyan-300" />
                {new Date(upcomingSession.starts_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} at{" "}
                {new Date(upcomingSession.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST
              </span>
              <Badge variant="outline" className="text-white border-white/20 bg-white/5">
                {upcomingSession.batch?.batch_code || "COHORT-A1"}
              </Badge>
            </div>
          </div>
          <div className="shrink-0 bg-white/10 p-4 rounded-2xl border border-white/15 backdrop-blur-md">
            <StudentJoinButton
              sessionId={upcomingSession.id}
              sessionStatus={upcomingSession.status}
              startsAt={upcomingSession.starts_at}
              endsAt={upcomingSession.ends_at}
            />
          </div>
        </div>
      )}

      {/* Two Column Layout: Curriculum & Faculty Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Curriculum Tracks & Progress */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#DCE4EE] bg-white shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[#DCE4EE] bg-[#F8FAFC] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#142541]">
                  My Curriculum Progress
                </h3>
                <p className="text-[11px] text-[#5F6F84] mt-0.5">
                  {primaryCourse?.title || "Applied AI Track"}
                </p>
              </div>
              <Link
                href="/student/courses"
                className="text-xs text-[#3869AD] font-bold hover:underline flex items-center gap-1"
              >
                Full Syllabus <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="p-5 space-y-4">
              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#142541]">Track Completion</span>
                  <span className="font-bold text-[#3869AD]">{progressPercent}%</span>
                </div>
                <div className="h-2.5 w-full bg-[#E8EFF8] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#3869AD] to-[#168B83] rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="text-[10px] text-[#5F6F84] text-right">
                  {completedLessons.length || 2} of {totalCourseLessons} lessons marked complete
                </div>
              </div>

              {/* Modules List */}
              <div className="divide-y divide-[#DCE4EE] border-t border-[#DCE4EE] pt-2 text-xs">
                {primaryCourse?.modules?.slice(0, 3).map((mod, idx) => (
                  <div key={mod.id || idx} className="py-3 flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="font-bold text-[#142541]">
                        {mod.title}
                      </div>
                      <p className="text-[11px] text-[#5F6F84] line-clamp-1">
                        {mod.description || "Core computational thinking and algorithmic foundations."}
                      </p>
                    </div>
                    <Badge variant={idx === 0 ? "success" : "teal"} className="shrink-0 text-[10px]">
                      {idx === 0 ? "Completed" : "In Progress"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Instructor & Mentorship Card */}
          <div className="p-5 rounded-2xl border border-[#DCE4EE] bg-white shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#142541] to-[#3869AD] text-white flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
              {leadInstructor.full_name.charAt(0)}
            </div>
            <div className="space-y-0.5 flex-1 overflow-hidden">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#142541] truncate">{leadInstructor.full_name}</span>
                <Badge variant="outline" className="text-[10px] text-[#3869AD]">Cohort Faculty</Badge>
              </div>
              <p className="text-[11px] text-[#5F6F84] line-clamp-1">{leadInstructor.title}</p>
              <div className="text-[10px] text-[#168B83] font-semibold pt-0.5">
                Office Hours: Tue & Thu • 4:00 PM – 5:30 PM IST
              </div>
            </div>
            <Link
              href="/student/classes"
              className="text-xs px-3 py-1.5 rounded-lg bg-[#F3F6FA] hover:bg-[#DCE4EE] font-semibold text-[#142541] transition-colors shrink-0"
            >
              Ask Query
            </Link>
          </div>
        </div>

        {/* Right Column: Priority Deliverables & Faculty Reviews */}
        <div className="space-y-6">
          {/* Pending Deliverables */}
          <div className="rounded-2xl border border-[#DCE4EE] bg-white shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[#DCE4EE] bg-[#F8FAFC] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#142541]">
                  Upcoming Deliverables
                </h3>
                <p className="text-[11px] text-[#5F6F84] mt-0.5">
                  Algorithmic models and lab solutions
                </p>
              </div>
              <Link
                href="/student/assignments"
                className="text-xs text-[#3869AD] font-bold hover:underline flex items-center gap-1"
              >
                All Assignments <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="divide-y divide-[#DCE4EE] text-xs">
              {assignments.slice(0, 3).map((asn) => {
                const sub = asn.submission;
                const isGraded = sub?.status === "graded" && sub.is_grade_published;

                return (
                  <div key={asn.id} className="p-4 flex items-center justify-between gap-3 hover:bg-[#F8FAFC] transition-colors">
                    <div className="space-y-1">
                      <div className="font-bold text-[#142541] flex items-center gap-1.5">
                        <FileCode2 className="h-3.5 w-3.5 text-[#3869AD]" />
                        <span>{asn.title}</span>
                      </div>
                      <div className="text-[11px] text-[#5F6F84]">
                        Due: {new Date(asn.due_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {asn.max_score} pts
                      </div>
                    </div>

                    <div className="shrink-0">
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

          {/* Released Faculty Feedback */}
          <div className="rounded-2xl border border-[#DCE4EE] bg-white shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[#DCE4EE] bg-[#F8FAFC] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#142541]">
                  Recent Faculty Evaluations
                </h3>
                <p className="text-[11px] text-[#5F6F84] mt-0.5">
                  Published grades and code review notes
                </p>
              </div>
              <Link
                href="/student/grades"
                className="text-xs text-[#3869AD] font-bold hover:underline flex items-center gap-1"
              >
                Transcripts <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="divide-y divide-[#DCE4EE] text-xs">
              {grades.length === 0 ? (
                <div className="p-8 text-center text-[#5F6F84] space-y-1">
                  <div className="font-semibold text-[#142541]">No Evaluations Published Yet</div>
                  <p className="text-[11px]">Instructor grades appear here once submitted deliverables are audited.</p>
                </div>
              ) : (
                grades.slice(0, 2).map((grade) => (
                  <div key={grade.id} className="p-4 space-y-2 hover:bg-[#F8FAFC] transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#142541]">
                        {grade.assignment?.title || "Assessment Deliverable"}
                      </span>
                      <Badge variant="success" className="font-mono text-xs">
                        {grade.score} / {grade.assignment?.max_score || 100} pts
                      </Badge>
                    </div>
                    {grade.feedback && (
                      <p className="text-[11px] text-[#263449] bg-[#F3F6FA] p-3 rounded-xl border border-[#DCE4EE] leading-relaxed italic">
                        &ldquo;{grade.feedback}&rdquo;
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
