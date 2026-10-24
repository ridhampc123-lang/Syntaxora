import React from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import {
  getEnrollments,
  getStudentsAwaitingBatchAssignment,
} from "@/server/services/enrollmentService";
import { getPublishedCourses } from "@/server/services/courseService";
import { getBatches } from "@/server/services/batchService";
import { getAdminStudents } from "@/server/services/adminService";
import { AssignStudentModal } from "@/components/forms/AssignStudentModal";
import { TransferBatchModal } from "@/components/forms/TransferBatchModal";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Enrollment & Cohort Assignment — Syntaxora Admin",
  description: "Authoritative student course enrollments, cohort assignments, and batch transfers.",
};

export default async function AdminEnrollmentsPage() {
  const [enrollments, awaitingBatch, courses, batches, students] = await Promise.all([
    getEnrollments(),
    getStudentsAwaitingBatchAssignment(),
    getPublishedCourses(),
    getBatches(),
    getAdminStudents(),
  ]);

  return (
    <div className="space-y-8">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#142541] tracking-tight">
            Student Course Enrollments
          </h2>
          <p className="text-xs text-[#5F6F84] mt-0.5">
            Student course access, live session attendance eligibility, and syllabus availability derive strictly from active enrollments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <AssignStudentModal
            students={students}
            courses={courses}
            batches={batches}
          />
        </div>
      </div>

      {/* Awaiting Batch Assignment Alert Section */}
      {awaitingBatch.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <span>Students Awaiting Batch Assignment ({awaitingBatch.length})</span>
          </div>
          <p className="text-[11px] text-amber-800">
            These learners have approved admissions or verified payments but have not yet been assigned to an active cohort. They cannot see class timetables until assigned.
          </p>

          <div className="divide-y divide-amber-200/60 bg-white/60 rounded-lg p-2 text-xs">
            {awaitingBatch.map((enr) => (
              <div key={enr.id} className="py-2 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-[#142541]">
                    {enr.student?.profile?.full_name || "Enrolled Learner"}
                  </span>
                  <span className="font-mono text-[#3869AD] ml-2">
                    ({enr.student?.student_code})
                  </span>
                  <span className="text-[#5F6F84] ml-2">
                    Course: {enr.course?.title}
                  </span>
                </div>
                <AssignStudentModal
                  students={students}
                  courses={courses}
                  batches={batches}
                  preselectedStudentId={enr.student_id}
                  preselectedCourseId={enr.course_id}
                  triggerButtonText="Assign Cohort"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Real Enrollments Table */}
      <div className="rounded-xl border border-[#DCE4EE] bg-white overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#DCE4EE] bg-[#F3F6FA] text-xs font-semibold text-[#142541] flex items-center justify-between">
          <span>Active Academy Seats ({enrollments.length})</span>
          <span className="text-[11px] text-[#5F6F84]">
            Enforces strict per-cohort attendance and lesson scope
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#DCE4EE] text-[#142541] font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">Student Code</th>
                <th className="p-3.5">Student Name</th>
                <th className="p-3.5">Course Track</th>
                <th className="p-3.5">Assigned Cohort Batch</th>
                <th className="p-3.5">Payment Status</th>
                <th className="p-3.5">Enrollment Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE4EE] text-[#263449]">
              {enrollments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#5F6F84]">
                    No enrollment records found.
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
                    <td className="p-3.5 font-medium text-[#142541]">
                      {enr.course?.title || "Enrolled Course"}
                    </td>
                    <td className="p-3.5">
                      {enr.batch ? (
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/admin/batches/${enr.batch.id}`}
                            className="font-medium text-[#3869AD] hover:underline"
                          >
                            {enr.batch.name}
                          </Link>
                          <span className="text-[10px] font-mono text-[#5F6F84]">
                            ({enr.batch.batch_code})
                          </span>
                        </div>
                      ) : (
                        <Badge variant="warning">Awaiting Batch</Badge>
                      )}
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
                      {enr.batch && (
                        <TransferBatchModal
                          enrollmentId={enr.id}
                          studentName={enr.student?.profile?.full_name || "Learner"}
                          studentCode={enr.student?.student_code || "STU-PENDING"}
                          currentBatchName={enr.batch.name}
                          courseId={enr.course_id}
                          availableBatches={batches}
                        />
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
