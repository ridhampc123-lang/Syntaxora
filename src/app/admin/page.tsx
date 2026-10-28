import React from "react";
import Link from "next/link";
import {
  GraduationCap,
  BookOpen,
  Users,
  ShieldCheck,
  Mail,
  ArrowRight,
  ClipboardList,
  Layers,
  Video,
  Clock,
  AlertTriangle,
  Calendar,
  AlertCircle,
  PlusCircle,
  CheckCircle2,
} from "lucide-react";
import { getAdminOverviewMetrics, getAdminAuditLogs } from "@/server/services/adminService";
import { getUpcomingSessionAlerts } from "@/server/services/scheduleService";
import { getStudentsAwaitingBatchAssignment } from "@/server/services/enrollmentService";
import { listApplications } from "@/server/services/applicationService";
import { getBatches } from "@/server/services/batchService";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, formatDate } from "@/lib/utils";

export const metadata = {
  title: "Admin Dashboard & Control Center — Syntaxora",
  description: "Administrative dashboard with authoritative academy metrics and operational class control.",
};

export default async function AdminOverviewPage() {
  const [metrics, auditLogs, sessionAlerts, awaitingBatch, { applications: pendingApps }, allBatches] =
    await Promise.all([
      getAdminOverviewMetrics(),
      getAdminAuditLogs(undefined, 6),
      getUpcomingSessionAlerts(),
      getStudentsAwaitingBatchAssignment(),
      listApplications({ status: "pending", limit: 5 }),
      getBatches(),
    ]);

  // Find batches near capacity (>= 80%)
  const capacityWarnings = allBatches.filter((b) => {
    const enrolled = b.enrolled_count ?? 0;
    return b.capacity > 0 && enrolled >= b.capacity * 0.8;
  });

  return (
    <div className="space-y-8">
      {/* Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-[#142541] tracking-tight">
              Academy <span className="text-gradient-ai">Artificial Intelligence</span> Operations Control Center
            </h2>
            <Badge variant="teal" className="text-[10px]">
              Asia/Kolkata
            </Badge>
          </div>
          <p className="text-xs text-[#5F6F84] mt-0.5">
            Authoritative aggregate data, admissions queues, cohort capacity, and live class monitoring.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/admin/applications">
            <Button variant="ai" size="sm" className="font-bold shadow-xs">
              <ClipboardList className="h-4 w-4 mr-1.5" />
              Review Applications ({metrics.pendingApplications})
            </Button>
          </Link>
          <Link href="/admin/batches">
            <Button variant="outline" size="sm">
              <Layers className="h-4 w-4 mr-1.5" />
              Schedule Cohort
            </Button>
          </Link>
          <Link href="/admin/courses">
            <Button variant="outline" size="sm">
              <BookOpen className="h-4 w-4 mr-1.5" />
              Manage Courses
            </Button>
          </Link>
        </div>
      </div>

      {/* Operational Priority Banners (if any actionable queues exist) */}
      {awaitingBatch.length > 0 && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-800 shrink-0 mt-0.5">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold text-amber-950">
                {awaitingBatch.length} Enrolled Student{awaitingBatch.length > 1 ? "s" : ""} Awaiting Cohort Assignment
              </div>
              <p className="text-amber-800 text-[11px] mt-0.5">
                These students have verified enrollments but no assigned cohort batch. They cannot see class timetables until assigned to an active cohort.
              </p>
            </div>
          </div>
          <Link href="/admin/enrollments" className="shrink-0">
            <Button variant="outline" size="sm" className="border-amber-300 text-amber-900 hover:bg-amber-100 font-bold">
              Assign to Batch &rarr;
            </Button>
          </Link>
        </div>
      )}

      {/* 8 Authoritative Real Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Pending Applications */}
        <Link href="/admin/applications" className="block transition-transform hover:-translate-y-0.5">
          <Card className={`border-[#3869AD]/30 transition-colors ${metrics.pendingApplications > 0 ? "bg-[#E8EFF8]/60 border-[#3869AD]" : "bg-white"}`}>
            <CardHeader className="p-4 pb-2 space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold uppercase text-[#3869AD]">
                <span>Applications</span>
                <ClipboardList className="h-4 w-4 text-[#3869AD]" />
              </div>
              <CardTitle className="text-2xl font-black text-[#142541]">
                {metrics.pendingApplications}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-[11px] text-[#3869AD] font-medium flex items-center justify-between">
              <span>Pending Admissions</span>
              <span className="text-[10px] font-bold">&rarr;</span>
            </CardContent>
          </Card>
        </Link>

        {/* Metric 2: Enrolled Students */}
        <Link href="/admin/students" className="block transition-transform hover:-translate-y-0.5">
          <Card className="border-[#DCE4EE] bg-white hover:border-[#3869AD] transition-colors">
            <CardHeader className="p-4 pb-2 space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold uppercase text-[#5F6F84]">
                <span>Total Students</span>
                <GraduationCap className="h-4 w-4 text-[#3869AD]" />
              </div>
              <CardTitle className="text-2xl font-black text-[#142541]">
                {metrics.totalStudents}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-[11px] text-[#5F6F84] flex items-center justify-between">
              <span>{metrics.activeStudents} active learners</span>
              <span className="text-[10px] font-mono text-[#3869AD]">&rarr;</span>
            </CardContent>
          </Card>
        </Link>

        {/* Metric 3: Active Enrollments */}
        <Link href="/admin/enrollments" className="block transition-transform hover:-translate-y-0.5">
          <Card className="border-[#DCE4EE] bg-white hover:border-[#168B83] transition-colors">
            <CardHeader className="p-4 pb-2 space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold uppercase text-[#5F6F84]">
                <span>Active Seats</span>
                <Users className="h-4 w-4 text-[#168B83]" />
              </div>
              <CardTitle className="text-2xl font-black text-[#142541]">
                {metrics.activeEnrollments}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-[11px] text-[#5F6F84] flex items-center justify-between">
              <span>Cohort enrollments</span>
              <span className="text-[10px] font-mono text-[#168B83]">&rarr;</span>
            </CardContent>
          </Card>
        </Link>

        {/* Metric 4: Cohort Batches */}
        <Link href="/admin/batches" className="block transition-transform hover:-translate-y-0.5">
          <Card className="border-[#DCE4EE] bg-white hover:border-[#3869AD] transition-colors">
            <CardHeader className="p-4 pb-2 space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold uppercase text-[#5F6F84]">
                <span>Active Batches</span>
                <Layers className="h-4 w-4 text-[#3869AD]" />
              </div>
              <CardTitle className="text-2xl font-black text-[#142541]">
                {metrics.activeBatches}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-[11px] text-[#5F6F84] flex items-center justify-between">
              <span>{metrics.totalBatches} total scheduled</span>
              <span className="text-[10px] font-mono text-[#3869AD]">&rarr;</span>
            </CardContent>
          </Card>
        </Link>

        {/* Metric 5: Live & Today's Classes */}
        <Link href="/admin/live-classes" className="block transition-transform hover:-translate-y-0.5">
          <Card className="border-[#DCE4EE] bg-white hover:border-emerald-500 transition-colors">
            <CardHeader className="p-4 pb-2 space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold uppercase text-[#5F6F84]">
                <span>Today&apos;s Lectures</span>
                <Video className="h-4 w-4 text-emerald-600" />
              </div>
              <CardTitle className="text-2xl font-black text-[#142541] flex items-center gap-2">
                <span>{sessionAlerts.todaySchedule.length}</span>
                {sessionAlerts.liveNow.length > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold animate-pulse">
                    {sessionAlerts.liveNow.length} LIVE
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-[11px] text-[#5F6F84] flex items-center justify-between">
              <span>{sessionAlerts.startsSoon15.length} starting &le; 15m</span>
              <span className="text-[10px] font-mono text-emerald-600">&rarr;</span>
            </CardContent>
          </Card>
        </Link>

        {/* Metric 6: Published Courses */}
        <Link href="/admin/courses" className="block transition-transform hover:-translate-y-0.5">
          <Card className="border-[#DCE4EE] bg-white hover:border-[#3869AD] transition-colors">
            <CardHeader className="p-4 pb-2 space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold uppercase text-[#5F6F84]">
                <span>Published Tracks</span>
                <BookOpen className="h-4 w-4 text-[#3869AD]" />
              </div>
              <CardTitle className="text-2xl font-black text-[#142541]">
                {metrics.publishedCourses}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-[11px] text-[#5F6F84] flex items-center justify-between">
              <span>{metrics.totalCourses} total created</span>
              <span className="text-[10px] font-mono text-[#3869AD]">&rarr;</span>
            </CardContent>
          </Card>
        </Link>

        {/* Metric 7: Instructors */}
        <Link href="/admin/instructors" className="block transition-transform hover:-translate-y-0.5">
          <Card className="border-[#DCE4EE] bg-white hover:border-[#168B83] transition-colors">
            <CardHeader className="p-4 pb-2 space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold uppercase text-[#5F6F84]">
                <span>Approved Faculty</span>
                <ShieldCheck className="h-4 w-4 text-[#168B83]" />
              </div>
              <CardTitle className="text-2xl font-black text-[#142541]">
                {metrics.totalInstructors}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-[11px] text-[#5F6F84] flex items-center justify-between">
              <span>Teaching instructors</span>
              <span className="text-[10px] font-mono text-[#168B83]">&rarr;</span>
            </CardContent>
          </Card>
        </Link>

        {/* Metric 8: Inquiries */}
        <Link href="/admin/enquiries" className="block transition-transform hover:-translate-y-0.5">
          <Card className="border-[#DCE4EE] bg-white hover:border-[#B45309] transition-colors">
            <CardHeader className="p-4 pb-2 space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold uppercase text-[#5F6F84]">
                <span>Inquiries</span>
                <Mail className="h-4 w-4 text-[#B45309]" />
              </div>
              <CardTitle className="text-2xl font-black text-[#142541]">
                {metrics.unreadEnquiries}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-[11px] text-[#5F6F84] flex items-center justify-between">
              <span>Unread admissions mail</span>
              <span className="text-[10px] font-mono text-[#B45309]">&rarr;</span>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Main Two-Column Operational Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Live Timetable & Capacity Alerts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Schedule Live Overview */}
          <div className="rounded-xl border border-[#DCE4EE] bg-white overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#DCE4EE] bg-[#F3F6FA] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#3869AD]" />
                <span className="text-xs font-bold text-[#142541] uppercase tracking-wider">
                  Today&apos;s Live Class Timetable ({sessionAlerts.todaySchedule.length})
                </span>
              </div>
              <Link
                href="/admin/live-classes"
                className="text-xs font-semibold text-[#3869AD] hover:underline"
              >
                Live Control Center &rarr;
              </Link>
            </div>

            {sessionAlerts.todaySchedule.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#5F6F84]">
                No class sessions scheduled for today. Regular timetables will appear based on recurring cohort schedules.
              </div>
            ) : (
              <div className="divide-y divide-[#DCE4EE]">
                {sessionAlerts.todaySchedule.map((ses) => (
                  <div key={ses.id} className="p-4 flex items-center justify-between text-xs hover:bg-[#F3F6FA]/50 transition-colors">
                    <div className="space-y-0.5">
                      <div className="font-bold text-[#142541]">{ses.title}</div>
                      <div className="text-[11px] text-[#5F6F84] flex items-center gap-2">
                        <span>Cohort: <strong>{ses.batch?.name || "Open Track"}</strong></span>
                        <span>•</span>
                        <span>Faculty: <strong>{ses.instructor?.full_name || "Faculty Assigned"}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-mono text-xs font-semibold text-[#142541]">
                          {new Date(ses.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-[10px] text-[#5F6F84]">Asia/Kolkata</div>
                      </div>

                      <Badge
                        variant={
                          ses.status === "in_progress"
                            ? "success"
                            : ses.status === "completed"
                            ? "secondary"
                            : "teal"
                        }
                      >
                        {ses.status === "in_progress" ? "LIVE NOW" : ses.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Batch Capacity Alerts (if any approaching capacity) */}
          {capacityWarnings.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-white overflow-hidden shadow-xs">
              <div className="p-4 border-b border-amber-200 bg-amber-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                    Cohort Capacity Alerts ({capacityWarnings.length})
                  </span>
                </div>
                <Link
                  href="/admin/batches"
                  className="text-xs font-semibold text-amber-800 hover:underline"
                >
                  Manage Batches &rarr;
                </Link>
              </div>

              <div className="divide-y divide-[#DCE4EE]">
                {capacityWarnings.map((batch) => {
                  const enrolled = batch.enrolled_count ?? 0;
                  const isFull = enrolled >= batch.capacity;
                  const pct = Math.min(100, Math.round((enrolled / batch.capacity) * 100));

                  return (
                    <div key={batch.id} className="p-4 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-[#142541]">{batch.name}</div>
                        <div className="text-[11px] text-[#5F6F84]">
                          {batch.course?.title} • Faculty: {batch.primary_instructor?.full_name}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className={`font-bold ${isFull ? "text-amber-700" : "text-[#142541]"}`}>
                            {enrolled} / {batch.capacity} seats ({pct}%)
                          </div>
                          <div className="text-[10px] text-[#5F6F84]">
                            {isFull ? "No seats left" : `${batch.capacity - enrolled} remaining`}
                          </div>
                        </div>

                        <Badge variant={isFull ? "error" : "warning"}>
                          {isFull ? "FULL" : "NEAR CAPACITY"}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (1 Col): Pending Admissions Reviews Queue */}
        <div className="space-y-6">
          <div className="rounded-xl border border-[#DCE4EE] bg-white overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#DCE4EE] bg-[#F3F6FA] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-[#3869AD]" />
                <span className="text-xs font-bold text-[#142541] uppercase tracking-wider">
                  Pending Admissions Review ({metrics.pendingApplications})
                </span>
              </div>
              <Link
                href="/admin/applications"
                className="text-xs font-semibold text-[#3869AD] hover:underline"
              >
                Review All &rarr;
              </Link>
            </div>

            {pendingApps.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#5F6F84] space-y-2">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 mx-auto" />
                <p>All student applications have been reviewed!</p>
              </div>
            ) : (
              <div className="divide-y divide-[#DCE4EE]">
                {pendingApps.map((app) => (
                  <div key={app.id} className="p-4 space-y-2 hover:bg-[#F3F6FA]/50 transition-colors text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#142541]">{app.full_name}</span>
                      <span className="font-mono text-[10px] text-[#3869AD] bg-[#E8EFF8] px-1.5 py-0.5 rounded">
                        {app.application_reference}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#5F6F84]">
                      {app.course_title || "General Application"}
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-[#5F6F84]">
                        {formatDate(app.created_at)}
                      </span>
                      <Link
                        href="/admin/applications"
                        className="text-[11px] font-semibold text-[#3869AD] hover:underline"
                      >
                        Review Applicant &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Audit Activity Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-[#142541]">
              Recent Audit Log Activity
            </h3>
            <p className="text-xs text-[#5F6F84]">
              Cryptographically timestamped trail of admissions decisions, cohort assignments, and security events.
            </p>
          </div>
          <Link href="/admin/audit-logs">
            <Button variant="ghost" size="sm">
              View Full Compliance Log
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="rounded-xl border border-[#DCE4EE] bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F3F6FA] border-b border-[#DCE4EE] text-[#142541] font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Actor</th>
                  <th className="p-3.5">Action</th>
                  <th className="p-3.5">Entity</th>
                  <th className="p-3.5">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE4EE] text-[#263449]">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-[#5F6F84]">
                      No audit events recorded yet.
                    </td>
                  </tr>
                ) : (
                  auditLogs.slice(0, 6).map((log) => (
                    <tr key={log.id} className="hover:bg-[#F3F6FA]/50 transition-colors">
                      <td className="p-3.5 whitespace-nowrap text-[#5F6F84]">
                        {formatDateTime(log.created_at)}
                      </td>
                      <td className="p-3.5 whitespace-nowrap font-medium text-[#142541]">
                        {log.actor_email}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <Badge variant="navy">{log.action}</Badge>
                      </td>
                      <td className="p-3.5 whitespace-nowrap font-mono text-[11px] text-[#3869AD]">
                        {log.entity_type}
                      </td>
                      <td className="p-3.5 text-[#5F6F84] truncate max-w-xs font-mono text-[11px]">
                        {JSON.stringify(log.details || {})}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
