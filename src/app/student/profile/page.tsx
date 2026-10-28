import React from "react";
import Link from "next/link";
import {
  User,
  GraduationCap,
  Calendar,
  Mail,
  Users,
  Info,
  Lock,
} from "lucide-react";
import { GuardianStudentRelationship } from "@/types";
import { requireRole } from "@/server/services/authService";
import {
  getStudentByProfileId,
  getStudentEnrollments,
  getStudentGuardians,
} from "@/server/services/studentService";
import { CopyStudentCodeButton } from "@/components/dashboards/CopyStudentCodeButton";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Student Profile & Academic Identity — Syntaxora",
  description: "Official student verification record, unique student code, linked guardians, and cohort enrollments.",
};

export default async function StudentProfilePage() {
  const auth = await requireRole(["student", "admin"]);
  const student = await getStudentByProfileId(auth.userId);

  if (!student) {
    return (
      <div className="p-12 text-center text-xs text-[#5F6F84] bg-white rounded-2xl border border-[#DCE4EE]">
        No active student record linked to your profile.
      </div>
    );
  }

  const [enrollments, guardians] = await Promise.all([
    getStudentEnrollments(student.id),
    getStudentGuardians(student.id),
  ]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#142541]/5 text-[#3869AD] text-xs font-bold mb-2">
            <User className="h-3.5 w-3.5" />
            <span>Academic Identity</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142541] tracking-tight">
            Student Profile & Verification Record
          </h1>
          <p className="text-xs sm:text-sm text-[#5F6F84] mt-1 max-w-2xl">
            Official academic registration, unique student linking code, enrolled cohorts, and verified guardian relationships.
          </p>
        </div>
      </div>

      {/* Hero Identity Banner */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-[#142541] via-[#1A3157] to-[#142541] text-white p-6 sm:p-8 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-br from-[#3869AD] via-[#245291] to-[#168B83] text-white flex items-center justify-center font-black text-2xl sm:text-3xl shadow-md border border-white/20 shrink-0">
              {auth.profile.full_name?.charAt(0) || "S"}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active Student
                </span>
                <span className="text-[11px] text-cyan-300 font-mono">
                  Admitted {new Date(student.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">{auth.profile.full_name}</h2>
              <div className="flex items-center gap-1.5 text-xs text-[#DCE4EE]/80">
                <Mail className="h-3.5 w-3.5 text-cyan-300" />
                <span>{auth.email}</span>
              </div>
            </div>
          </div>

          {/* Student Code Box */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 space-y-2 shrink-0">
            <div className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
              <GraduationCap className="h-4 w-4" />
              <span>Unique Student Code</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-2xl font-black tracking-widest text-white">
                {student.student_code}
              </span>
              <CopyStudentCodeButton studentCode={student.student_code} />
            </div>
            <p className="text-[10px] text-[#DCE4EE]/70 max-w-[220px] leading-relaxed">
              Canonical identifier for parental link verification and institutional transcripts.
            </p>
          </div>
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Enrolled Tracks & Cohorts */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#DCE4EE] bg-white shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[#DCE4EE] bg-[#F8FAFC] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#142541]">
                  Enrolled Tracks & Cohort Batches ({enrollments.length})
                </h3>
                <p className="text-[11px] text-[#5F6F84] mt-0.5">
                  Academic tracks currently assigned to your student identity
                </p>
              </div>
              <Link
                href="/student/courses"
                className="text-xs text-[#3869AD] font-bold hover:underline"
              >
                View Syllabus
              </Link>
            </div>

            <div className="divide-y divide-[#DCE4EE] text-xs">
              {enrollments.length === 0 ? (
                <div className="p-8 text-center text-[#5F6F84] space-y-1">
                  <div className="font-semibold text-[#142541]">No Enrollments Provisioned</div>
                  <p className="text-[11px]">Admissions is confirming your cohort track.</p>
                </div>
              ) : (
                enrollments.map((e) => (
                  <div key={e.id} className="p-4 space-y-2 hover:bg-[#F8FAFC] transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-[#142541] text-sm">
                        {e.course?.title || "Applied AI Track"}
                      </div>
                      <Badge variant="teal" className="text-[10px] font-mono">
                        {e.batch?.batch_code || "COHORT-A1"}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#5F6F84]">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-[#3869AD]" />
                        <span>Enrolled: {new Date(e.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </span>
                      <span>•</span>
                      <span className="capitalize text-emerald-700 font-semibold">
                        Status: {e.status}
                      </span>
                      {e.batch?.name && (
                        <>
                          <span>•</span>
                          <span>Batch: {e.batch.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Security & Access Notice */}
          <div className="rounded-2xl border border-[#DCE4EE] bg-[#F8FAFC] p-5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#142541]">
              <Lock className="h-4 w-4 text-[#3869AD]" />
              <span>Identity & Privacy Boundary</span>
            </div>
            <p className="text-xs text-[#5F6F84] leading-relaxed">
              Your student code is an enrollment reference token. It cannot be used to log in, alter your password, or modify academic evaluations. Only authorized guardians verified by academy administration are permitted to review your attendance and progress summaries.
            </p>
          </div>
        </div>

        {/* Right Column: Linked Guardians & Parent Access */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#DCE4EE] bg-white shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[#DCE4EE] bg-[#F8FAFC] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#142541]">
                  Linked Guardian Portals ({guardians.length})
                </h3>
                <p className="text-[11px] text-[#5F6F84] mt-0.5">
                  Verified parents and authorized guardians connected to your account
                </p>
              </div>
              <Users className="h-4 w-4 text-[#5F6F84]" />
            </div>

            <div className="divide-y divide-[#DCE4EE] text-xs">
              {guardians.length === 0 ? (
                <div className="p-8 text-center text-[#5F6F84] space-y-2">
                  <div className="h-10 w-10 rounded-full bg-[#E8EFF8] text-[#3869AD] flex items-center justify-center mx-auto">
                    <Users className="h-5 w-5" />
                  </div>
                  <div className="font-bold text-sm text-[#142541]">No Guardians Linked Yet</div>
                  <p className="text-xs max-w-sm mx-auto">
                    Provide your unique Student Code <strong className="font-mono text-[#3869AD]">{student.student_code}</strong> to your parent or guardian. They can link their account from the Syntaxora Parent Portal.
                  </p>
                </div>
              ) : (
                guardians.map((rel: GuardianStudentRelationship) => (
                  <div key={rel.id} className="p-4 space-y-2 hover:bg-[#F8FAFC] transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-[#142541]">
                        {rel.guardian?.full_name || "Linked Parent"}
                      </div>
                      <Badge
                        variant={rel.status === "active" ? "success" : "outline"}
                        className="text-[10px]"
                      >
                        {rel.status === "active" ? "Verified Active" : "Pending Verification"}
                      </Badge>
                    </div>

                    <div className="text-[11px] text-[#5F6F84]">
                      {rel.guardian?.email || "parent@syntaxora.com"} • Relationship:{" "}
                      <span className="capitalize">{rel.relationship_type?.replace("_", " ")}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-[#5F6F84] font-semibold">Access:</span>
                      {rel.can_view_attendance && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-medium border border-emerald-200">
                          Attendance
                        </span>
                      )}
                      {rel.can_view_progress && (
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#3869AD] text-[10px] font-medium border border-blue-200">
                          Progress
                        </span>
                      )}
                      {rel.can_view_schedule && (
                        <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-medium border border-purple-200">
                          Schedule
                        </span>
                      )}
                      {rel.can_view_fees && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-medium border border-amber-200">
                          Billing
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* How To Link Guide */}
          <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#142541]">
              <Info className="h-4 w-4 text-[#3869AD]" />
              <span>How Parent Portal Linking Works</span>
            </div>
            <ol className="text-xs text-[#263449] space-y-1.5 list-decimal pl-4 leading-relaxed">
              <li>Give your parent or legal guardian your Student Code: <strong className="font-mono text-[#3869AD]">{student.student_code}</strong>.</li>
              <li>Your parent signs in to their Syntaxora account at <Link href="/login" className="underline font-semibold">syntaxora.com/login</Link>.</li>
              <li>They click &ldquo;+ Link Sibling or Student&rdquo; and submit your code.</li>
              <li>Admissions performs identity verification and confirms the relationship.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
