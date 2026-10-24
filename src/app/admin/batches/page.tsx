import React from "react";
import Link from "next/link";
import { Users, ArrowRight, ShieldCheck } from "lucide-react";
import { getBatches } from "@/server/services/batchService";
import { getPublishedCourses } from "@/server/services/courseService";
import { getApprovedInstructors } from "@/server/services/instructorService";
import { CreateBatchModal } from "@/components/forms/CreateBatchModal";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { BatchStatus } from "@/types";

export const metadata = {
  title: "Batch & Cohort Management — Syntaxora Admin",
  description: "Schedule, monitor capacity, and manage teaching assignments across academy cohorts.",
};

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminBatchesPage({ searchParams }: Props) {
  const resolved = await searchParams;
  const statusFilter = typeof resolved.status === "string" ? (resolved.status as BatchStatus) : undefined;
  const search = typeof resolved.q === "string" ? resolved.q : undefined;

  const [batches, courses, instructors] = await Promise.all([
    getBatches({ status: statusFilter, search }),
    getPublishedCourses(),
    getApprovedInstructors(),
  ]);

  return (
    <div className="space-y-8">
      {/* Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#142541] tracking-tight">
            Cohort Batches & Timetables
          </h2>
          <p className="text-xs text-[#5F6F84] mt-0.5">
            Group learners into structured cohorts, assign faculty, enforce seat limits, and schedule live lectures.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <CreateBatchModal courses={courses} instructors={instructors} />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <Link
          href="/admin/batches"
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            !statusFilter
              ? "bg-[#142541] text-white"
              : "bg-white border border-[#DCE4EE] text-[#5F6F84] hover:bg-[#F3F6FA]"
          }`}
        >
          All Batches ({batches.length})
        </Link>
        {["active", "upcoming", "paused", "completed", "cancelled"].map((st) => (
          <Link
            key={st}
            href={`/admin/batches?status=${st}`}
            className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition-colors ${
              statusFilter === st
                ? "bg-[#142541] text-white"
                : "bg-white border border-[#DCE4EE] text-[#5F6F84] hover:bg-[#F3F6FA]"
            }`}
          >
            {st}
          </Link>
        ))}
      </div>

      {/* Batches Table */}
      <div className="rounded-xl border border-[#DCE4EE] bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F3F6FA] border-b border-[#DCE4EE] text-[#142541] font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">Batch Name & Code</th>
                <th className="p-3.5">Curriculum Track</th>
                <th className="p-3.5">Primary Faculty</th>
                <th className="p-3.5">Enrolled / Capacity</th>
                <th className="p-3.5">Dates & Timezone</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE4EE] text-[#263449]">
              {batches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#5F6F84]">
                    No batches match the selected criteria.
                  </td>
                </tr>
              ) : (
                batches.map((batch) => {
                  const enrolled = batch.enrolled_count ?? 0;
                  const isFull = enrolled >= batch.capacity;

                  return (
                    <tr key={batch.id} className="hover:bg-[#F3F6FA]/50 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-[#142541]">{batch.name}</div>
                        <div className="text-[11px] font-mono text-[#3869AD] mt-0.5">
                          {batch.batch_code}
                        </div>
                      </td>
                      <td className="p-3.5 font-medium text-[#142541]">
                        {batch.course?.title || "Curriculum Track"}
                      </td>
                      <td className="p-3.5 text-[#5F6F84]">
                        <div className="flex items-center gap-1.5 font-medium text-[#142541]">
                          <ShieldCheck className="h-3.5 w-3.5 text-[#168B83]" />
                          <span>{batch.primary_instructor?.full_name || "Assigned Faculty"}</span>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-[#5F6F84]" />
                          <span className={`font-semibold ${isFull ? "text-amber-700 font-bold" : "text-[#142541]"}`}>
                            {enrolled} / {batch.capacity}
                          </span>
                        </div>
                        {isFull && (
                          <span className="text-[10px] text-amber-700 font-medium">Batch Full</span>
                        )}
                      </td>
                      <td className="p-3.5 text-[#5F6F84] whitespace-nowrap">
                        <div>
                          {formatDate(batch.start_at)} – {formatDate(batch.end_at)}
                        </div>
                        <div className="text-[10px] font-mono text-[#5F6F84]">
                          {batch.timezone}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <Badge
                          variant={
                            batch.status === "active"
                              ? "success"
                              : batch.status === "upcoming"
                              ? "teal"
                              : batch.status === "paused"
                              ? "warning"
                              : "secondary"
                          }
                        >
                          {batch.status}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <Link
                          href={`/admin/batches/${batch.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#E8EFF8] text-[#3869AD] hover:bg-[#3869AD] hover:text-white text-xs font-semibold transition-colors"
                        >
                          <span>Manage</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
