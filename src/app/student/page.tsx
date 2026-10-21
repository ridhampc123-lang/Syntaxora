import React from "react";
import Link from "next/link";
import {
  BookOpen,
  CalendarCheck,
  ClipboardList,
  Award,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { requireRole } from "@/server/services/authService";
import {
  getStudentByProfileId,
  getStudentCourses,
  getStudentSessions,
  getStudentAssignments,
  getStudentReleasedGrades,
} from "@/server/services/studentService";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Student Dashboard — Syntaxora",
  description: "Your personalized learning dashboard, live class schedule, assignments, and grades.",
};

export default async function StudentDashboardPage() {
  const auth = await requireRole(["student", "admin"]);
  const student = await getStudentByProfileId(auth.userId);

  if (!student) {
    return (
      <div className="p-8 text-center text-xs text-[#5F6F84]">
        No active student record linked. Please contact academy admissions.
      </div>
    );
  }

  const [courses, sessions, assignments, grades] = await Promise.all([
    getStudentCourses(student.id),
    getStudentSessions(student.id),
    getStudentAssignments(student.id),
    getStudentReleasedGrades(student.id),
  ]);

  const upcomingSession = sessions[0];
  const pendingAssignments = assignments.filter((a) => !a.submission);

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold text-[#142541] tracking-tight">
          Welcome back, {auth.profile.full_name}
        </h2>
        <p className="text-xs text-[#5F6F84] mt-0.5">
          Student ID: <span className="font-mono text-[#3869AD] font-bold">{student.student_code}</span> — Your applied artificial intelligence workspace.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-[#DCE4EE] bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-[#5F6F84] uppercase tracking-wider">
              Enrolled Tracks
            </CardTitle>
            <BookOpen className="h-4 w-4 text-[#3869AD]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-[#142541]">{courses.length}</div>
            <p className="text-[11px] text-[#5F6F84] mt-1">Active curriculum tracks</p>
          </CardContent>
        </Card>

        <Card className="border-[#DCE4EE] bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-[#5F6F84] uppercase tracking-wider">
              Upcoming Classes
            </CardTitle>
            <CalendarCheck className="h-4 w-4 text-[#168B83]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-[#142541]">{sessions.length}</div>
            <p className="text-[11px] text-[#5F6F84] mt-1">Live online sessions</p>
          </CardContent>
        </Card>

        <Card className="border-[#DCE4EE] bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-[#5F6F84] uppercase tracking-wider">
              Pending Deliverables
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-[#142541]">{pendingAssignments.length}</div>
            <p className="text-[11px] text-[#5F6F84] mt-1">Assignments to submit</p>
          </CardContent>
        </Card>

        <Card className="border-[#DCE4EE] bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-[#5F6F84] uppercase tracking-wider">
              Released Evaluations
            </CardTitle>
            <Award className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-[#142541]">{grades.length}</div>
            <p className="text-[11px] text-[#5F6F84] mt-1">Published faculty reviews</p>
          </CardContent>
        </Card>
      </div>

      {/* Next Class Hero Banner */}
      {upcomingSession && (
        <div className="rounded-2xl border border-[#3869AD]/30 bg-gradient-to-br from-[#142541] to-[#1f3760] text-white p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 text-emerald-300 text-[11px] font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Next Scheduled Session
            </div>
            <h3 className="text-xl font-black tracking-tight">{upcomingSession.title}</h3>
            <p className="text-xs text-[#DCE4EE]/80 max-w-xl">
              {upcomingSession.description || "Interactive computer vision and robotics lab with live code debugging."}
            </p>
            <div className="text-xs text-white/90 pt-1">
              Time: <strong>{new Date(upcomingSession.starts_at).toLocaleString()}</strong>
            </div>
          </div>
          <div className="shrink-0">
            {upcomingSession.meeting_url ? (
              <a
                href={upcomingSession.meeting_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#168B83] hover:bg-[#126f69] text-white font-bold text-xs shadow-lg transition-all"
              >
                <ExternalLink className="h-4 w-4" />
                Join Live Classroom
              </a>
            ) : (
              <span className="text-xs text-[#DCE4EE]/60">Link active at session start</span>
            )}
          </div>
        </div>
      )}

      {/* Two Column Layout: Enrolled Courses & Recent Grades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Enrolled Courses */}
        <div className="rounded-xl border border-[#DCE4EE] bg-white shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[#DCE4EE] bg-[#F3F6FA] flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#142541]">
              My Curriculum Tracks
            </h3>
            <Link
              href="/student/courses"
              className="text-xs text-[#3869AD] font-semibold hover:underline flex items-center gap-1"
            >
              View Syllabus <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-[#DCE4EE] text-xs">
            {courses.map((c) => (
              <div key={c.id} className="p-4 flex items-center justify-between hover:bg-[#F3F6FA]/50 transition-colors">
                <div className="space-y-1">
                  <div className="font-bold text-[#142541]">{c.title}</div>
                  <div className="text-[11px] text-[#5F6F84]">
                    {c.duration_weeks} Weeks • {c.delivery_mode.replace("_", " ")}
                  </div>
                </div>
                <Badge variant="teal">Active Cohort</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Released Evaluations */}
        <div className="rounded-xl border border-[#DCE4EE] bg-white shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[#DCE4EE] bg-[#F3F6FA] flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#142541]">
              Published Faculty Feedback
            </h3>
            <Link
              href="/student/grades"
              className="text-xs text-[#3869AD] font-semibold hover:underline flex items-center gap-1"
            >
              All Grades <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-[#DCE4EE] text-xs">
            {grades.length === 0 ? (
              <div className="p-6 text-center text-[#5F6F84]">
                No evaluations published yet. Grades appear here once reviewed by your instructor.
              </div>
            ) : (
              grades.map((grade) => (
                <div key={grade.id} className="p-4 space-y-2 hover:bg-[#F3F6FA]/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#142541]">
                      {grade.assignment?.title || "Assessment Deliverable"}
                    </span>
                    <Badge variant="success">
                      {grade.score} / {grade.assignment?.max_score || 100} pts
                    </Badge>
                  </div>
                  {grade.feedback && (
                    <p className="text-[11px] text-[#5F6F84] italic bg-[#F3F6FA] p-2.5 rounded-lg border border-[#DCE4EE]">
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
  );
}
