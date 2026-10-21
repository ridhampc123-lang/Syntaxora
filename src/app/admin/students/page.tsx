import React from "react";
import { GraduationCap } from "lucide-react";
import { getAdminStudents } from "@/server/services/adminService";
import { CreateStudentForm } from "@/components/forms/CreateStudentForm";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "Student Roster Management — Syntaxora Admin",
  description: "Canonical student record management, code generation, and status controls.",
};

interface StudentsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminStudentsPage({ searchParams }: StudentsPageProps) {
  const resolvedParams = await searchParams;
  const search = typeof resolvedParams.q === "string" ? resolvedParams.q : "";
  const students = await getAdminStudents(search);

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#142541] tracking-tight">
            Canonical Student Directory
          </h2>
          <p className="text-xs text-[#5F6F84] mt-0.5">
            Every enrolled student possesses a single authoritative academy record and unique student code.
          </p>
        </div>
      </div>

      {/* Creation Drawer / Card */}
      <div className="rounded-xl border border-[#DCE4EE] bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-[#142541] uppercase tracking-wider flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-[#3869AD]" />
          Enroll New Student
        </h3>
        <CreateStudentForm />
      </div>

      {/* Student Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-[#5F6F84]">
          <span>
            Total Registered Students: <strong className="text-[#142541]">{students.length}</strong>
          </span>
        </div>

        <div className="rounded-xl border border-[#DCE4EE] bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F3F6FA] border-b border-[#DCE4EE] text-[#142541] font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5">Student Code</th>
                  <th className="p-3.5">Student Name</th>
                  <th className="p-3.5">Email / Account</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Emergency Contact</th>
                  <th className="p-3.5">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE4EE] text-[#263449]">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-[#F3F6FA]/50 transition-colors">
                    <td className="p-3.5 font-mono font-semibold text-[#3869AD]">
                      {student.student_code}
                    </td>
                    <td className="p-3.5 font-medium text-[#142541]">
                      {student.profile?.full_name || "Unattached Record"}
                    </td>
                    <td className="p-3.5 text-[#5F6F84]">
                      {student.profile?.email || "No profile attached"}
                    </td>
                    <td className="p-3.5">
                      <Badge
                        variant={
                          student.status === "active"
                            ? "success"
                            : student.status === "pending"
                            ? "warning"
                            : "secondary"
                        }
                      >
                        {student.status}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-[#5F6F84]">
                      {student.emergency_contact_phone || "—"}
                    </td>
                    <td className="p-3.5 text-[#5F6F84] whitespace-nowrap">
                      {formatDate(student.created_at)}
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
