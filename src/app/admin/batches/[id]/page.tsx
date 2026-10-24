import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Layers,
  Users,
  Calendar,
  Clock,
  ArrowLeft,
} from "lucide-react";
import {
  getBatchById,
  getBatches,
  getBatchScheduleTemplates,
} from "@/server/services/batchService";
import { getEnrollments } from "@/server/services/enrollmentService";
import { getAllSessions } from "@/server/services/scheduleService";
import { getAdminStudents } from "@/server/services/adminService";
import { getPublishedCourses } from "@/server/services/courseService";
import { AssignStudentModal } from "@/components/forms/AssignStudentModal";
import { TransferBatchModal } from "@/components/forms/TransferBatchModal";
import { BatchStatusSelector } from "@/components/forms/BatchStatusSelector";
import { GenerateSessionsButton } from "@/components/forms/GenerateSessionsButton";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Cohort Batch Detail — Syntaxora Admin",
  description: "Manage cohort student roster, recurring schedule templates, and live class sessions.",
};

const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default async function AdminBatchDetailPage({ params }: Props) {
  const { id } = await params;
  const batch = await getBatchById(id);

  if (!batch) {
    notFound();
  }

  const [enrollments, templates, sessions, allCourseBatches, students, courses] =
    await Promise.all([
      getEnrollments({ batchId: id }),
      getBatchScheduleTemplates(id),
      getAllSessions({ batchId: id }),
      getBatches({ courseId: batch.course_id }),
      getAdminStudents(),
      getPublishedCourses(),
    ]);

  const enrolledCount = enrollments.filter((e) => e.status === "active").length;
  const isAtCapacity = enrolledCount >= batch.capacity;

  return (
    <div className="space-y-8">
      {/* Back Link & Header */}
      <div className="space-y-3">
        <Link
          href="/admin/batches"
          className="inline-flex items-center gap-1.5 text-xs text-[#3869AD] font-semibold hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to All Cohorts</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-[#DCE4EE] shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#3869AD] bg-[#E8EFF8] px-2 py-0.5 rounded-md">
                {batch.batch_code}
              </span>
              <h2 className="text-xl font-extrabold text-[#142541]">
                {batch.name}
              </h2>
            </div>
            <p className="text-xs text-[#5F6F84]">
              Curriculum: <strong className="text-[#142541]">{batch.course?.title}</strong> • Faculty: <strong className="text-[#142541]">{batch.primary_instructor?.full_name}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <BatchStatusSelector batchId={batch.id} currentStatus={batch.status} />
            <AssignStudentModal
              students={students}
              courses={courses}
              batches={allCourseBatches}
              preselectedBatchId={batch.id}
              preselectedCourseId={batch.course_id}
            />
          </div>
        </div>
      </div>

      {/* Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#DCE4EE] space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-[#5F6F84] uppercase">
            <span>Enrolled Students</span>
            <Users className="h-4 w-4 text-[#3869AD]" />
          </div>
          <div className={`text-2xl font-bold ${isAtCapacity ? "text-amber-700" : "text-[#142541]"}`}>
            {enrolledCount} / {batch.capacity}
          </div>
          <div className="text-[11px] text-[#5F6F84]">
            {isAtCapacity ? "Cohort at maximum capacity" : `${batch.capacity - enrolledCount} seats remaining`}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#DCE4EE] space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-[#5F6F84] uppercase">
            <span>Term Duration</span>
            <Calendar className="h-4 w-4 text-[#168B83]" />
          </div>
          <div className="text-sm font-bold text-[#142541] mt-1">
            {formatDate(batch.start_at)}
          </div>
          <div className="text-[11px] text-[#5F6F84]">
            through {formatDate(batch.end_at)}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#DCE4EE] space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-[#5F6F84] uppercase">
            <span>Timezone</span>
            <Clock className="h-4 w-4 text-[#3869AD]" />
          </div>
          <div className="text-sm font-mono font-bold text-[#142541] mt-1 truncate">
            {batch.timezone}
          </div>
          <div className="text-[11px] text-[#5F6F84]">
            Standard class interpretation
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#DCE4EE] space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-[#5F6F84] uppercase">
            <span>Status</span>
            <Layers className="h-4 w-4 text-[#142541]" />
          </div>
          <div className="mt-1">
            <Badge
              variant={
                batch.status === "active"
                  ? "success"
                  : batch.status === "upcoming"
                  ? "teal"
                  : "secondary"
              }
            >
              {batch.status.toUpperCase()}
            </Badge>
          </div>
          <div className="text-[11px] text-[#5F6F84]">
            {batch.waitlist_enabled ? `Waitlist: ${batch.waitlist_capacity} max` : "Waitlist disabled"}
          </div>
        </div>
      </div>

      {/* Student Roster Table */}
      <div className="rounded-xl border border-[#DCE4EE] bg-white overflow-hidden shadow-sm space-y-0">
        <div className="p-4 border-b border-[#DCE4EE] bg-[#F3F6FA] flex items-center justify-between text-xs font-semibold text-[#142541]">
          <span>Enrolled Students Roster ({enrollments.length})</span>
          <span className="text-[11px] text-[#5F6F84]">
            Authorized students for live sessions and syllabus assignments
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#DCE4EE] text-[#142541] font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">Student Code</th>
                <th className="p-3.5">Student Name</th>
                <th className="p-3.5">Email / Account</th>
                <th className="p-3.5">Admission Source</th>
                <th className="p-3.5">Payment</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE4EE] text-[#263449]">
              {enrollments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-[#5F6F84]">
                    No students currently assigned to this cohort. Use &ldquo;Assign Student&rdquo; above.
                  </td>
                </tr>
              ) : (
                enrollments.map((enr) => (
                  <tr key={enr.id} className="hover:bg-[#F3F6FA]/50 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-[#3869AD]">
                      {enr.student?.student_code || "—"}
                    </td>
                    <td className="p-3.5 font-medium text-[#142541]">
                      {enr.student?.profile?.full_name || "Academy Learner"}
                    </td>
                    <td className="p-3.5 text-[#5F6F84]">
                      {enr.student?.profile?.email || "No account attached"}
                    </td>
                    <td className="p-3.5 capitalize text-[#5F6F84]">
                      {enr.admission_source?.replace("_", " ") || "direct"}
                    </td>
                    <td className="p-3.5">
                      <Badge variant="teal">{enr.payment_status || "verified"}</Badge>
                    </td>
                    <td className="p-3.5">
                      <Badge variant={enr.status === "active" ? "success" : "secondary"}>
                        {enr.status}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <TransferBatchModal
                        enrollmentId={enr.id}
                        studentName={enr.student?.profile?.full_name || "Learner"}
                        studentCode={enr.student?.student_code || "STU-PENDING"}
                        currentBatchName={batch.name}
                        courseId={batch.course_id}
                        availableBatches={allCourseBatches}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Templates & Generated Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recurring Timetable Rules */}
        <div className="rounded-xl border border-[#DCE4EE] bg-white p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#142541]">Recurring Schedule Rules</h3>
              <p className="text-[11px] text-[#5F6F84]">
                Templates define weekday patterns used for session generation.
              </p>
            </div>
            <GenerateSessionsButton batchId={batch.id} />
          </div>

          {templates.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#5F6F84] border border-dashed border-[#DCE4EE] rounded-lg">
              No recurring schedule templates defined yet.
            </div>
          ) : (
            <div className="divide-y divide-[#DCE4EE]">
              {templates.map((tpl) => (
                <div key={tpl.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#142541]">
                      {WEEKDAY_NAMES[tpl.weekday]}
                    </span>
                    <span className="text-[#5F6F84] ml-2">
                      {tpl.start_time_local} – {tpl.end_time_local} ({tpl.timezone})
                    </span>
                  </div>
                  <Badge variant="outline">Recurring</Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Scheduled Sessions */}
        <div className="rounded-xl border border-[#DCE4EE] bg-white p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#142541]">Upcoming Class Sessions ({sessions.length})</h3>
              <p className="text-[11px] text-[#5F6F84]">
                Actual scheduled occurrences in student & faculty calendars.
              </p>
            </div>
            <Link
              href="/admin/live-classes"
              className="text-xs font-semibold text-[#3869AD] hover:underline"
            >
              Live Class Center &rarr;
            </Link>
          </div>

          {sessions.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#5F6F84] border border-dashed border-[#DCE4EE] rounded-lg">
              No sessions generated yet. Click &ldquo;Generate Next 30 Days&rdquo; to build class timetable.
            </div>
          ) : (
            <div className="divide-y divide-[#DCE4EE] max-h-72 overflow-y-auto">
              {sessions.slice(0, 10).map((ses) => (
                <div key={ses.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-[#142541]">{ses.title}</div>
                    <div className="text-[11px] text-[#5F6F84]">
                      {new Date(ses.starts_at).toLocaleDateString()} at{" "}
                      {new Date(ses.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={ses.status === "in_progress" ? "success" : "teal"}>
                      {ses.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
