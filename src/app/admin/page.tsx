import React from "react";
import Link from "next/link";
import {
  GraduationCap,
  BookOpen,
  Users,
  ShieldCheck,
  Mail,
  ArrowRight,
  PlusCircle,
} from "lucide-react";
import { getAdminOverviewMetrics, getAdminAuditLogs } from "@/server/services/adminService";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";

export const metadata = {
  title: "Admin Overview — Syntaxora",
  description: "Administrative dashboard with verified academy metrics and activity log.",
};

export default async function AdminOverviewPage() {
  const [metrics, auditLogs] = await Promise.all([
    getAdminOverviewMetrics(),
    getAdminAuditLogs(),
  ]);

  return (
    <div className="space-y-8">
      {/* Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#142541] tracking-tight">
            Academy Control Center
          </h2>
          <p className="text-xs text-[#5F6F84] mt-0.5">
            Real-time aggregate data, course management, and permission controls.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/students">
            <Button variant="primary" size="sm">
              <PlusCircle className="h-4 w-4 mr-1.5" />
              Manage Students
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

      {/* 5 Real Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-[#DCE4EE] bg-white">
          <CardHeader className="p-4 pb-2 space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold uppercase text-[#5F6F84]">
              <span>Students</span>
              <GraduationCap className="h-4 w-4 text-[#3869AD]" />
            </div>
            <CardTitle className="text-2xl font-bold text-[#142541]">
              {metrics.totalStudents}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-[11px] text-[#5F6F84]">
            Enrolled Academy Learners
          </CardContent>
        </Card>

        <Card className="border-[#DCE4EE] bg-white">
          <CardHeader className="p-4 pb-2 space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold uppercase text-[#5F6F84]">
              <span>Active Enrollments</span>
              <Users className="h-4 w-4 text-[#168B83]" />
            </div>
            <CardTitle className="text-2xl font-bold text-[#142541]">
              {metrics.activeEnrollments}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-[11px] text-[#5F6F84]">
            Live Cohort Seats
          </CardContent>
        </Card>

        <Card className="border-[#DCE4EE] bg-white">
          <CardHeader className="p-4 pb-2 space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold uppercase text-[#5F6F84]">
              <span>Published Courses</span>
              <BookOpen className="h-4 w-4 text-[#3869AD]" />
            </div>
            <CardTitle className="text-2xl font-bold text-[#142541]">
              {metrics.publishedCourses}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-[11px] text-[#5F6F84]">
            Live Curriculum Tracks
          </CardContent>
        </Card>

        <Card className="border-[#DCE4EE] bg-white">
          <CardHeader className="p-4 pb-2 space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold uppercase text-[#5F6F84]">
              <span>Instructors</span>
              <ShieldCheck className="h-4 w-4 text-[#168B83]" />
            </div>
            <CardTitle className="text-2xl font-bold text-[#142541]">
              {metrics.totalInstructors}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-[11px] text-[#5F6F84]">
            Approved Academy Faculty
          </CardContent>
        </Card>

        <Card className="border-[#DCE4EE] bg-white">
          <CardHeader className="p-4 pb-2 space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold uppercase text-[#5F6F84]">
              <span>Unread Enquiries</span>
              <Mail className="h-4 w-4 text-[#B45309]" />
            </div>
            <CardTitle className="text-2xl font-bold text-[#142541]">
              {metrics.unreadEnquiries}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-[11px] text-[#5F6F84]">
            Pending Admissions Follow-up
          </CardContent>
        </Card>
      </div>

      {/* Recent Audit Activity Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-[#142541]">
              Recent Audit Events
            </h3>
            <p className="text-xs text-[#5F6F84]">
              Immutable log of administrative, course, and security mutations.
            </p>
          </div>
          <Link href="/admin/audit-logs">
            <Button variant="ghost" size="sm">
              View Full Log
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="rounded-xl border border-[#DCE4EE] bg-white overflow-hidden shadow-sm">
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
                {auditLogs.slice(0, 5).map((log) => (
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
                    <td className="p-3.5 whitespace-nowrap font-mono text-[11px]">
                      {log.entity_type}
                    </td>
                    <td className="p-3.5 text-[#5F6F84] truncate max-w-xs">
                      {JSON.stringify(log.details || {})}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
