import React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  CheckSquare,
  Award,
  CalendarCheck,
  CreditCard,
  Lock,
  ArrowRight,
} from "lucide-react";
import { requireRole } from "@/server/services/authService";
import {
  getActiveChildrenForGuardian,
  getAllRelationshipsForGuardian,
} from "@/server/services/guardianService";
import {
  getStudentAttendance,
  getStudentReleasedGrades,
  getStudentSessions,
} from "@/server/services/studentService";
import { ParentChildSelector } from "@/components/forms/ParentChildSelector";
import { LinkStudentForm } from "@/components/forms/LinkStudentForm";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Parent & Guardian Dashboard — Syntaxora",
  description: "Monitor your child's live class attendance, released grades, schedule, and tuition.",
};

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ParentDashboardPage({ searchParams }: Props) {
  const auth = await requireRole(["parent", "admin"]);
  const [relationships, allRelationships] = await Promise.all([
    getActiveChildrenForGuardian(auth.userId),
    getAllRelationshipsForGuardian(auth.userId),
  ]);

  const resolvedParams = await searchParams;
  const requestedChildId = typeof resolvedParams.childId === "string" ? resolvedParams.childId : undefined;

  // Resolve active relationship strictly from authorized list (prevents URL parameter tampering)
  const activeRel =
    relationships.find((r) => r.student_id === requestedChildId) ||
    relationships[0];

  if (!activeRel) {
    return (
      <div className="max-w-2xl mx-auto space-y-8 py-6">
        <div className="rounded-2xl border border-[#DCE4EE] bg-white p-8 shadow-sm text-center space-y-4">
          <div className="mx-auto h-12 w-12 rounded-full bg-[#E8EFF8] text-[#3869AD] flex items-center justify-center">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-[#142541]">
            No Verified Student Links Active
          </h2>
          <p className="text-xs text-[#5F6F84] leading-relaxed max-w-md mx-auto">
            In accordance with Syntaxora security policies, parent accounts possess no automatic access to student records. Please connect your child using their unique student code below, or contact academy admissions.
          </p>
        </div>

        {/* Link Student Form */}
        <LinkStudentForm />

        {/* Existing / Pending Link Requests */}
        {allRelationships.length > 0 && (
          <div className="rounded-2xl border border-[#DCE4EE] bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#142541]">
              Your Connection Requests ({allRelationships.length})
            </h3>
            <div className="divide-y divide-[#DCE4EE]">
              {allRelationships.map((rel) => (
                <div key={rel.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-[#142541]">
                      {rel.student?.profile?.full_name || "Enrolled Student"}
                    </div>
                    <div className="text-[11px] text-[#5F6F84] font-mono">
                      Code: {rel.student?.student_code || "STU-PENDING"} • Requested {new Date(rel.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge
                    variant={
                      rel.status === "active"
                        ? "success"
                        : rel.status === "rejected"
                        ? "error"
                        : rel.status === "pending"
                        ? "warning"
                        : "outline"
                    }
                  >
                    {rel.status.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  const student = activeRel.student;
  const studentName = student?.profile?.full_name || "Linked Student";
  const studentCode = student?.student_code || "STU-CODE";

  // Data fetching strictly scoped to the authorized student
  const [attendance, grades, sessions] = await Promise.all([
    activeRel.can_view_attendance ? getStudentAttendance(activeRel.student_id) : Promise.resolve([]),
    activeRel.can_view_progress ? getStudentReleasedGrades(activeRel.student_id) : Promise.resolve([]),
    activeRel.can_view_schedule ? getStudentSessions(activeRel.student_id) : Promise.resolve([]),
  ]);

  const presentCount = attendance.filter((a) => a.status === "present").length;
  const attendanceRate = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 100;

  return (
    <div className="space-y-8">
      {/* Title & Child Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#142541] tracking-tight">
            Learner Progress: {studentName}
          </h2>
          <p className="text-xs text-[#5F6F84] mt-0.5">
            Student Code: <strong className="font-mono text-[#3869AD]">{studentCode}</strong> • Authorized Guardian Relationship
          </p>
        </div>
        <ParentChildSelector
          relationships={relationships}
          selectedChildId={activeRel.student_id}
        />
      </div>

      {/* Permission-Enforced Four Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Attendance Card */}
        <Card className="border-[#DCE4EE] bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-[#5F6F84] uppercase tracking-wider flex items-center gap-1.5">
              <CheckSquare className="h-4 w-4 text-[#168B83]" />
              Session Attendance Record
            </CardTitle>
            {activeRel.can_view_attendance ? (
              <Badge variant="teal">Authorized</Badge>
            ) : (
              <Badge variant="outline">Restricted</Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {activeRel.can_view_attendance ? (
              <>
                <div className="flex items-baseline justify-between">
                  <div className="text-3xl font-black text-[#142541]">{attendanceRate}%</div>
                  <div className="text-xs text-[#5F6F84]">
                    {presentCount} of {attendance.length} sessions attended
                  </div>
                </div>
                <div className="pt-2 border-t border-[#DCE4EE] flex items-center justify-between text-xs">
                  <span className="text-[#5F6F84]">Last Recorded Session:</span>
                  <strong className="text-[#142541]">
                    {attendance[0] ? new Date(attendance[0].recorded_at).toLocaleDateString() : "No sessions held"}
                  </strong>
                </div>
                <div className="pt-1">
                  <Link
                    href={`/parent/attendance?childId=${activeRel.student_id}`}
                    className="text-xs font-semibold text-[#3869AD] hover:underline flex items-center gap-1"
                  >
                    View Full Attendance Log <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </>
            ) : (
              <div className="p-4 rounded-xl bg-[#F3F6FA] text-xs text-[#5F6F84] flex items-center gap-2">
                <Lock className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Attendance records are restricted for this authorized guardian link.</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Learning Progress & Released Grades */}
        <Card className="border-[#DCE4EE] bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-[#5F6F84] uppercase tracking-wider flex items-center gap-1.5">
              <Award className="h-4 w-4 text-[#3869AD]" />
              Released Grades & Rubrics
            </CardTitle>
            {activeRel.can_view_progress ? (
              <Badge variant="teal">Authorized</Badge>
            ) : (
              <Badge variant="outline">Restricted</Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {activeRel.can_view_progress ? (
              <>
                <div className="flex items-baseline justify-between">
                  <div className="text-3xl font-black text-[#142541]">{grades.length}</div>
                  <div className="text-xs text-[#5F6F84]">Published faculty reviews</div>
                </div>
                <div className="pt-2 border-t border-[#DCE4EE] text-xs space-y-1">
                  {grades[0] ? (
                    <div className="flex items-center justify-between">
                      <span className="text-[#5F6F84] truncate max-w-xs">
                        {grades[0].assignment?.title || "Latest Project"}
                      </span>
                      <Badge variant="success">Score: {grades[0].score} pts</Badge>
                    </div>
                  ) : (
                    <span className="text-[#5F6F84]">No published evaluations yet</span>
                  )}
                </div>
                <div className="pt-1">
                  <Link
                    href={`/parent/progress?childId=${activeRel.student_id}`}
                    className="text-xs font-semibold text-[#3869AD] hover:underline flex items-center gap-1"
                  >
                    View All Grades & Feedback <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </>
            ) : (
              <div className="p-4 rounded-xl bg-[#F3F6FA] text-xs text-[#5F6F84] flex items-center gap-2">
                <Lock className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Academic grade records are restricted for this authorized guardian link.</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Class Schedule */}
        <Card className="border-[#DCE4EE] bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-[#5F6F84] uppercase tracking-wider flex items-center gap-1.5">
              <CalendarCheck className="h-4 w-4 text-[#142541]" />
              Cohort Class Schedule
            </CardTitle>
            {activeRel.can_view_schedule ? (
              <Badge variant="teal">Authorized</Badge>
            ) : (
              <Badge variant="outline">Restricted</Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {activeRel.can_view_schedule ? (
              <>
                <div className="flex items-baseline justify-between">
                  <div className="text-3xl font-black text-[#142541]">{sessions.length}</div>
                  <div className="text-xs text-[#5F6F84]">Scheduled class sessions</div>
                </div>
                <div className="pt-2 border-t border-[#DCE4EE] text-xs">
                  {sessions[0] ? (
                    <div className="flex items-center justify-between">
                      <span className="text-[#5F6F84] truncate max-w-xs">{sessions[0].title}</span>
                      <strong className="text-[#142541]">
                        {new Date(sessions[0].starts_at).toLocaleDateString()}
                      </strong>
                    </div>
                  ) : (
                    <span className="text-[#5F6F84]">No upcoming sessions</span>
                  )}
                </div>
                <div className="pt-1">
                  <Link
                    href={`/parent/schedule?childId=${activeRel.student_id}`}
                    className="text-xs font-semibold text-[#3869AD] hover:underline flex items-center gap-1"
                  >
                    View Full Calendar <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </>
            ) : (
              <div className="p-4 rounded-xl bg-[#F3F6FA] text-xs text-[#5F6F84] flex items-center gap-2">
                <Lock className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Class schedule access is restricted for this authorized guardian link.</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tuition & Invoices */}
        <Card className="border-[#DCE4EE] bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-[#5F6F84] uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="h-4 w-4 text-emerald-600" />
              Tuition & Billing Status
            </CardTitle>
            {activeRel.can_view_fees ? (
              <Badge variant="teal">Authorized</Badge>
            ) : (
              <Badge variant="outline">Restricted</Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {activeRel.can_view_fees ? (
              <>
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-black text-emerald-600">Paid in Full</div>
                  <div className="text-xs text-[#5F6F84]">Fall 2026 Cohort</div>
                </div>
                <div className="pt-2 border-t border-[#DCE4EE] flex items-center justify-between text-xs">
                  <span className="text-[#5F6F84]">Tuition Statement:</span>
                  <strong className="text-[#142541]">SYN-INV-2026-081</strong>
                </div>
                <div className="pt-1">
                  <Link
                    href={`/parent/billing?childId=${activeRel.student_id}`}
                    className="text-xs font-semibold text-[#3869AD] hover:underline flex items-center gap-1"
                  >
                    View Invoice Details <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </>
            ) : (
              <div className="p-4 rounded-xl bg-[#F3F6FA] text-xs text-[#5F6F84] flex items-center gap-2">
                <Lock className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Financial and fee viewing permissions are not authorized for this guardian link.</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Connect Additional Student & Link Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
        <LinkStudentForm />

        <div className="rounded-2xl border border-[#DCE4EE] bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#142541]">
              Family Links & Requests ({allRelationships.length})
            </h3>
            <span className="text-[11px] text-[#5F6F84]">Authoritative RLS Boundaries</span>
          </div>

          <div className="divide-y divide-[#DCE4EE]">
            {allRelationships.map((rel) => (
              <div key={rel.id} className="py-3 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="font-semibold text-[#142541]">
                    {rel.student?.profile?.full_name || "Enrolled Student"}
                  </div>
                  <div className="text-[11px] text-[#5F6F84] font-mono">
                    Code: <span className="text-[#3869AD] font-bold">{rel.student?.student_code || "STU-CODE"}</span>
                  </div>
                  <div className="text-[10px] text-[#5F6F84]">
                    Type: <span className="capitalize">{rel.relationship_type.replace("_", " ")}</span> • Method: {rel.verification_method || "Pending"}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge
                    variant={
                      rel.status === "active"
                        ? "success"
                        : rel.status === "rejected"
                        ? "error"
                        : rel.status === "pending"
                        ? "warning"
                        : "outline"
                    }
                  >
                    {rel.status.toUpperCase()}
                  </Badge>
                  {rel.status === "active" && (
                    <span className="text-[10px] text-[#168B83] font-semibold">Active Monitoring</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
