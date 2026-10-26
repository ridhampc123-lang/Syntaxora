import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BookOpen,
  ArrowLeft,
  Layers,
  Users,
  ExternalLink,
} from "lucide-react";
import { getCourseById } from "@/server/services/courseService";
import { getBatches } from "@/server/services/batchService";
import { getEnrollments } from "@/server/services/enrollmentService";
import { getApprovedInstructors } from "@/server/services/instructorService";
import { CoursePublishButton } from "@/components/forms/CoursePublishButton";
import { CreateBatchModal } from "@/components/forms/CreateBatchModal";
import { AdminCourseModulesManager } from "@/components/dashboards/admin/AdminCourseModulesManager";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Course Curriculum Detail — Syntaxora Admin",
  description: "Manage curriculum modules, syllabus lessons, cohort batches, and pricing.",
};

export default async function AdminCourseDetailPage({ params }: Props) {
  const { id } = await params;
  const course = await getCourseById(id);

  if (!course) {
    notFound();
  }

  const [batches, enrollments, instructors] = await Promise.all([
    getBatches({ courseId: course.id }),
    getEnrollments({ courseId: course.id }),
    getApprovedInstructors(),
  ]);

  const activeBatches = batches.filter((b) => b.status === "active");
  const upcomingBatches = batches.filter((b) => b.status === "upcoming");
  const activeSeats = enrollments.filter((e) => e.status === "active").length;

  return (
    <div className="space-y-8">
      {/* Back Link & Header */}
      <div className="space-y-3">
        <Link
          href="/admin/courses"
          className="inline-flex items-center gap-1.5 text-xs text-[#3869AD] font-semibold hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Course Catalog</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-[#DCE4EE] shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-[#142541]">
                {course.title}
              </h2>
              <Link
                href={`/courses/${course.slug}`}
                target="_blank"
                className="text-[#3869AD] hover:text-[#142541]"
                title="View public page"
              >
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
            <p className="text-xs text-[#5F6F84]">
              Track: <strong className="text-[#142541] capitalize">{course.audience_group.replace("_", " ")}</strong> • Level: <strong className="text-[#142541] capitalize">{course.level}</strong> • Delivery: <strong className="text-[#142541] capitalize">{course.delivery_mode.replace("_", " ")}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <CreateBatchModal
              courses={[course]}
              instructors={instructors}
              preselectedCourseId={course.id}
            />
            <CoursePublishButton
              courseId={course.id}
              currentStatus={course.status}
            />
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#DCE4EE] space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-[#5F6F84] uppercase">
            <span>Enrolled Students</span>
            <Users className="h-4 w-4 text-[#3869AD]" />
          </div>
          <div className="text-2xl font-bold text-[#142541]">
            {activeSeats}
          </div>
          <div className="text-[11px] text-[#5F6F84]">
            Real database active enrollments
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#DCE4EE] space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-[#5F6F84] uppercase">
            <span>Active Batches</span>
            <Layers className="h-4 w-4 text-[#168B83]" />
          </div>
          <div className="text-2xl font-bold text-[#142541]">
            {activeBatches.length}
          </div>
          <div className="text-[11px] text-[#5F6F84]">
            {upcomingBatches.length} upcoming cohorts
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#DCE4EE] space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-[#5F6F84] uppercase">
            <span>Tuition / Fee</span>
            <span className="text-xs font-bold text-[#168B83]">INR (₹)</span>
          </div>
          <div className="text-2xl font-bold text-[#142541]">
            {course.price_in_cents > 0 ? formatCurrency(course.price_in_cents, course.currency) : "Free"}
          </div>
          <div className="text-[11px] text-[#5F6F84]">
            {course.duration_weeks} weeks curriculum
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#DCE4EE] space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-[#5F6F84] uppercase">
            <span>Catalog Status</span>
            <BookOpen className="h-4 w-4 text-[#142541]" />
          </div>
          <div className="mt-1">
            <Badge variant={course.status === "published" ? "success" : "secondary"}>
              {course.status.toUpperCase()}
            </Badge>
          </div>
          <div className="text-[11px] text-[#5F6F84]">
            {course.status === "published" ? "Visible on public website" : "Draft / Unlisted"}
          </div>
        </div>
      </div>

      {/* Cohort Batches for this Course */}
      <div className="rounded-xl border border-[#DCE4EE] bg-white overflow-hidden shadow-sm space-y-0">
        <div className="p-4 border-b border-[#DCE4EE] bg-[#F3F6FA] flex items-center justify-between text-xs font-semibold text-[#142541]">
          <span>Associated Cohort Batches ({batches.length})</span>
          <Link
            href="/admin/batches"
            className="text-[11px] text-[#3869AD] font-semibold hover:underline"
          >
            Manage All Cohorts &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#DCE4EE] text-[#142541] font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">Batch Name & Code</th>
                <th className="p-3.5">Primary Faculty</th>
                <th className="p-3.5">Seats Enrolled</th>
                <th className="p-3.5">Schedule Dates</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE4EE] text-[#263449]">
              {batches.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-[#5F6F84]">
                    No cohort batches created for this course yet. Use &ldquo;Create Batch&rdquo; to schedule.
                  </td>
                </tr>
              ) : (
                batches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-[#F3F6FA]/50 transition-colors">
                    <td className="p-3.5 font-bold text-[#142541]">
                      <div>{batch.name}</div>
                      <div className="text-[11px] font-mono text-[#3869AD]">{batch.batch_code}</div>
                    </td>
                    <td className="p-3.5 text-[#5F6F84]">
                      {batch.primary_instructor?.full_name || "Assigned Faculty"}
                    </td>
                    <td className="p-3.5 font-semibold text-[#142541]">
                      {batch.enrolled_count ?? 0} / {batch.capacity}
                    </td>
                    <td className="p-3.5 text-[#5F6F84] whitespace-nowrap">
                      {formatDate(batch.start_at)} – {formatDate(batch.end_at)}
                    </td>
                    <td className="p-3.5">
                      <Badge variant={batch.status === "active" ? "success" : "teal"}>
                        {batch.status}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <Link
                        href={`/admin/batches/${batch.id}`}
                        className="text-xs font-semibold text-[#3869AD] hover:underline"
                      >
                        Open Batch &rarr;
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dynamic Curriculum Topics & Syllabus Manager */}
      <AdminCourseModulesManager course={course} />
    </div>
  );
}
