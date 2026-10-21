import React from "react";
import Link from "next/link";
import {
  BookOpen,
  CalendarCheck,
  GraduationCap,
  Users,
  ArrowRight,
  PlusCircle,
} from "lucide-react";
import { requireRole } from "@/server/services/authService";
import {
  getInstructorAssignedCourses,
  getInstructorSessions,
  getAssignmentSubmissions,
} from "@/server/services/instructorService";
import { getAdminStudents } from "@/server/services/adminService";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Faculty Dashboard — Syntaxora",
  description: "Instructor teaching workload, scheduled class sessions, and assessment grading.",
};

export default async function InstructorDashboardPage() {
  const auth = await requireRole(["instructor", "admin"]);
  const [courses, sessions, submissions, students] = await Promise.all([
    getInstructorAssignedCourses(auth.userId),
    getInstructorSessions(auth.userId),
    getAssignmentSubmissions(),
    getAdminStudents(),
  ]);

  const pendingGradingCount = submissions.filter((s) => s.status !== "graded").length;

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#142541] tracking-tight">
            Welcome back, {auth.profile.full_name}
          </h2>
          <p className="text-xs text-[#5F6F84] mt-0.5">
            Teaching overview for your active cohorts and assigned curriculum modules.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/instructor/sessions">
            <Button className="bg-[#142541] hover:bg-[#1f3760] text-white text-xs flex items-center gap-1.5 shadow-sm">
              <PlusCircle className="h-4 w-4" />
              Schedule Class Session
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-[#DCE4EE] bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-[#5F6F84] uppercase tracking-wider">
              Assigned Courses
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
              Upcoming Sessions
            </CardTitle>
            <CalendarCheck className="h-4 w-4 text-[#168B83]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-[#142541]">{sessions.length}</div>
            <p className="text-[11px] text-[#5F6F84] mt-1">Live classes scheduled</p>
          </CardContent>
        </Card>

        <Card className="border-[#DCE4EE] bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-[#5F6F84] uppercase tracking-wider">
              Ungraded Submissions
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-[#142541]">{pendingGradingCount}</div>
            <p className="text-[11px] text-[#5F6F84] mt-1">Awaiting instructor evaluation</p>
          </CardContent>
        </Card>

        <Card className="border-[#DCE4EE] bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-[#5F6F84] uppercase tracking-wider">
              Enrolled Learners
            </CardTitle>
            <Users className="h-4 w-4 text-[#142541]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-[#142541]">{students.length}</div>
            <p className="text-[11px] text-[#5F6F84] mt-1">Cohort capacity</p>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout: Upcoming Sessions & Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sessions Widget */}
        <div className="rounded-xl border border-[#DCE4EE] bg-white shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[#DCE4EE] bg-[#F3F6FA] flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#142541]">
              Upcoming Class Sessions
            </h3>
            <Link
              href="/instructor/sessions"
              className="text-xs text-[#3869AD] font-semibold hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-[#DCE4EE] text-xs">
            {sessions.map((s) => (
              <div key={s.id} className="p-4 flex items-center justify-between hover:bg-[#F3F6FA]/50 transition-colors">
                <div className="space-y-1">
                  <div className="font-bold text-[#142541]">{s.title}</div>
                  <div className="text-[11px] text-[#5F6F84]">
                    {new Date(s.starts_at).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="teal">{s.status}</Badge>
                  <Link
                    href="/instructor/attendance"
                    className="text-xs text-[#3869AD] hover:underline font-semibold"
                  >
                    Attendance
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submissions Widget */}
        <div className="rounded-xl border border-[#DCE4EE] bg-white shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[#DCE4EE] bg-[#F3F6FA] flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#142541]">
              Recent Student Submissions
            </h3>
            <Link
              href="/instructor/submissions"
              className="text-xs text-[#3869AD] font-semibold hover:underline flex items-center gap-1"
            >
              Grade Roster <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-[#DCE4EE] text-xs">
            {submissions.map((sub) => (
              <div key={sub.id} className="p-4 flex items-center justify-between hover:bg-[#F3F6FA]/50 transition-colors">
                <div className="space-y-1">
                  <div className="font-bold text-[#142541]">
                    {sub.student?.profile?.full_name || "Enrolled Student"}
                  </div>
                  <div className="text-[11px] text-[#5F6F84]">
                    {sub.assignment?.title || "Course Project"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {sub.status === "graded" ? (
                    <Badge variant="success">Graded ({sub.score}/100)</Badge>
                  ) : (
                    <Badge variant="warning">Needs Grading</Badge>
                  )}
                  <Link
                    href="/instructor/submissions"
                    className="text-xs text-[#3869AD] hover:underline font-semibold"
                  >
                    Review
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
