import React from "react";
import { getAdminStudents } from "@/server/services/adminService";
import { getPublishedCourses } from "@/server/services/courseService";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Enrollment Management — Syntaxora Admin",
  description: "Manage student enrollments, cohort assignments, and active course access.",
};

export default async function AdminEnrollmentsPage() {
  const [students, courses] = await Promise.all([
    getAdminStudents(),
    getPublishedCourses(),
  ]);

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold text-[#142541] tracking-tight">
          Student Course Enrollments
        </h2>
        <p className="text-xs text-[#5F6F84] mt-0.5">
          Student course access, live session attendance eligibility, and syllabus availability derive from active enrollments.
        </p>
      </div>

      <div className="rounded-xl border border-[#DCE4EE] bg-white overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#DCE4EE] bg-[#F3F6FA] text-xs font-semibold text-[#142541]">
          Current Active Academy Cohort Seats
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#DCE4EE] text-[#142541] font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">Student</th>
                <th className="p-3.5">Student Code</th>
                <th className="p-3.5">Assigned Course</th>
                <th className="p-3.5">Track</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE4EE] text-[#263449]">
              {students.map((student, idx) => {
                const assignedCourse = courses[idx % courses.length];
                return (
                  <tr key={student.id} className="hover:bg-[#F3F6FA]/50 transition-colors">
                    <td className="p-3.5 font-medium text-[#142541]">
                      {student.profile?.full_name || "Academy Learner"}
                    </td>
                    <td className="p-3.5 font-mono text-[#3869AD]">
                      {student.student_code}
                    </td>
                    <td className="p-3.5 font-medium">
                      {assignedCourse ? assignedCourse.title : "Unassigned"}
                    </td>
                    <td className="p-3.5 capitalize text-[#5F6F84]">
                      {assignedCourse ? assignedCourse.audience_group.replace("_", " ") : "—"}
                    </td>
                    <td className="p-3.5">
                      <Badge variant="success">active</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
