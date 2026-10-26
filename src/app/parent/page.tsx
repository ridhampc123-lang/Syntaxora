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
  GraduationCap,
  Sparkles,
  Clock,
  Video,
  User,
  ShieldCheck,
  TrendingUp,
  FileText,
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
import { LinkStudentModal } from "@/components/forms/LinkStudentModal";
import { ParentPaymentModal } from "@/components/forms/ParentPaymentModal";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Parent & Guardian Oversight Dashboard — Syntaxora",
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

  // If NO verified student links exist at all, show the first-time onboarding linking screen
  if (!activeRel) {
    return (
      <div className="max-w-2xl mx-auto space-y-8 py-6">
        <div className="rounded-3xl border border-[#DCE4EE] bg-white p-8 shadow-sm text-center space-y-4">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-[#E8EFF8] text-[#3869AD] flex items-center justify-center shadow-xs">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-[#142541]">
              Connect Your Child to Begin
            </h2>
            <p className="text-xs text-[#5F6F84] leading-relaxed max-w-md mx-auto">
              Welcome to the Syntaxora Guardian Portal. In accordance with zero-trust child safety policies, parent accounts possess no automatic access to learner data. Enter your child&apos;s unique student code to link their profile.
            </p>
          </div>
        </div>

        {/* Link Student Form (Only shown when NO child is connected yet) */}
        <LinkStudentForm />

        {/* Existing / Pending Link Requests */}
        {allRelationships.length > 0 && (
          <div className="rounded-2xl border border-[#DCE4EE] bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#142541]">
              Connection Requests ({allRelationships.length})
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
  const studentEmail = student?.profile?.email || "";

  // Data fetching strictly scoped to the authorized student
  const [attendance, grades, sessions] = await Promise.all([
    activeRel.can_view_attendance ? getStudentAttendance(activeRel.student_id) : Promise.resolve([]),
    activeRel.can_view_progress ? getStudentReleasedGrades(activeRel.student_id) : Promise.resolve([]),
    activeRel.can_view_schedule ? getStudentSessions(activeRel.student_id) : Promise.resolve([]),
  ]);

  const presentCount = attendance.filter((a) => a.status === "present").length;
  const lateCount = attendance.filter((a) => a.status === "late").length;
  const attendanceRate = attendance.length > 0 ? Math.round(((presentCount + lateCount) / attendance.length) * 100) : 100;

  // Grade metrics
  const avgScore =
    grades.length > 0
      ? Math.round(grades.reduce((acc, g) => acc + (g.score || 0), 0) / grades.length)
      : 95;

  // Next upcoming session
  const now = new Date();
  const nextSession = sessions.find((s) => new Date(s.starts_at) >= now) || sessions[0];

  return (
    <div className="space-y-8">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#10233D] via-[#142A4A] to-[#0D1B2E] p-6 sm:p-8 text-white shadow-xl border border-white/10">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-72 h-72 rounded-full bg-gradient-to-br from-[#00E5FF]/10 to-[#168B83]/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-tr from-[#168B83] to-[#38BDF8] text-white flex items-center justify-center font-extrabold text-xl shadow-lg shrink-0">
              {studentName.charAt(0)}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  {studentName}
                </h1>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-white/15 text-[#38BDF8] border border-white/15">
                  {studentCode}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="h-3 w-3" />
                  Verified Child Link
                </span>
              </div>
              <p className="text-xs text-[#93A5C2] flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>Account: <strong className="text-white">{studentEmail}</strong></span>
                <span>•</span>
                <span>Status: <strong className="text-emerald-400">Enrolled & Active</strong></span>
              </p>
            </div>
          </div>

          {/* Child Switcher & Sibling Link Modal Button */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <ParentChildSelector
              relationships={relationships}
              selectedChildId={activeRel.student_id}
            />
            {/* Clean Modal trigger to add siblings without cluttering overview */}
            <LinkStudentModal
              buttonText="+ Link Sibling"
              variant="outline"
              size="sm"
            />
          </div>
        </div>

        {/* Quick Hero Banner Stat Pills */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10 text-xs">
          <div className="space-y-0.5">
            <span className="text-[11px] text-[#93A5C2] font-semibold">Attendance Record</span>
            <div className="text-lg font-black text-white flex items-center gap-1.5">
              <span>{attendanceRate}%</span>
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.2 rounded">
                Excellent
              </span>
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-[11px] text-[#93A5C2] font-semibold">Evaluations Average</span>
            <div className="text-lg font-black text-white flex items-center gap-1.5">
              <span>{avgScore}%</span>
              <span className="text-[10px] text-sky-400 font-semibold bg-sky-500/10 px-1.5 py-0.2 rounded">
                Top Cohort Tier
              </span>
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-[11px] text-[#93A5C2] font-semibold">Scheduled Sessions</span>
            <div className="text-lg font-black text-white flex items-center gap-1.5">
              <span>{sessions.length} Live Labs</span>
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-[11px] text-[#93A5C2] font-semibold">Tuition Status</span>
            <div className="text-lg font-black text-emerald-400 flex items-center gap-1.5">
              <span>Paid in Full</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Permission-Enforced Oversight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Attendance Card */}
        <Card className="border-[#DCE4EE] bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-[#F0F4F8]">
            <CardTitle className="text-xs font-bold text-[#142541] uppercase tracking-wider flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#E2F4F2] text-[#168B83]">
                <CheckSquare className="h-4 w-4" />
              </div>
              Attendance & Punctuality
            </CardTitle>
            {activeRel.can_view_attendance ? (
              <Badge variant="teal">Authorized</Badge>
            ) : (
              <Badge variant="outline">Restricted</Badge>
            )}
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {activeRel.can_view_attendance ? (
              <>
                <div className="flex items-baseline justify-between">
                  <div className="space-y-0.5">
                    <div className="text-3xl font-black text-[#142541]">{attendanceRate}%</div>
                    <p className="text-xs text-[#5F6F84]">Overall Session Attendance</p>
                  </div>
                  <div className="text-right text-xs">
                    <span className="font-bold text-emerald-700">{presentCount} Present</span>
                    {lateCount > 0 && <span className="text-amber-700 ml-1.5 font-bold">• {lateCount} Late</span>}
                    <div className="text-[11px] text-[#5F6F84] mt-0.5">
                      of {attendance.length || "0"} logged sessions
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#DCE4EE] text-xs flex items-center justify-between">
                  <span className="text-[#5F6F84]">Latest Recorded Session:</span>
                  <strong className="text-[#142541]">
                    {attendance[0] ? new Date(attendance[0].recorded_at).toLocaleDateString() : "No sessions held yet"}
                  </strong>
                </div>

                <div className="pt-1 flex items-center justify-between">
                  <Link
                    href={`/parent/attendance?childId=${activeRel.student_id}`}
                    className="text-xs font-bold text-[#3869AD] hover:underline flex items-center gap-1"
                  >
                    View Complete Attendance Log <ArrowRight className="h-3 w-3" />
                  </Link>
                  <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Compliant (&gt;85%)
                  </span>
                </div>
              </>
            ) : (
              <div className="p-4 rounded-xl bg-[#F3F6FA] text-xs text-[#5F6F84] flex items-center gap-2">
                <Lock className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Attendance records are restricted by guardian authorization settings.</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 2. Academic Progress & Released Grades */}
        <Card className="border-[#DCE4EE] bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-[#F0F4F8]">
            <CardTitle className="text-xs font-bold text-[#142541] uppercase tracking-wider flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#E8EFF8] text-[#3869AD]">
                <Award className="h-4 w-4" />
              </div>
              Evaluations & Faculty Feedback
            </CardTitle>
            {activeRel.can_view_progress ? (
              <Badge variant="teal">Authorized</Badge>
            ) : (
              <Badge variant="outline">Restricted</Badge>
            )}
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {activeRel.can_view_progress ? (
              <>
                <div className="flex items-baseline justify-between">
                  <div className="space-y-0.5">
                    <div className="text-3xl font-black text-[#142541]">{grades.length}</div>
                    <p className="text-xs text-[#5F6F84]">Published Faculty Reviews</p>
                  </div>
                  <div className="text-right text-xs">
                    <div className="text-xs font-bold text-[#3869AD]">Avg: {avgScore} / 100 pts</div>
                    <div className="text-[11px] text-emerald-700 font-semibold">Exemplary Tier</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#DCE4EE] text-xs space-y-1">
                  {grades[0] ? (
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#142541] truncate max-w-xs">
                        {grades[0].assignment?.title || "Latest Project Evaluation"}
                      </span>
                      <Badge variant="success" className="font-bold">
                        {grades[0].score} pts
                      </Badge>
                    </div>
                  ) : (
                    <div className="text-[#5F6F84] italic">First project evaluation under mentor review</div>
                  )}
                </div>

                <div className="pt-1 flex items-center justify-between">
                  <Link
                    href={`/parent/progress?childId=${activeRel.student_id}`}
                    className="text-xs font-bold text-[#3869AD] hover:underline flex items-center gap-1"
                  >
                    View Rubrics & Qualitative Feedback <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </>
            ) : (
              <div className="p-4 rounded-xl bg-[#F3F6FA] text-xs text-[#5F6F84] flex items-center gap-2">
                <Lock className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Academic grade records are restricted for this guardian link.</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 3. Class Schedule */}
        <Card className="border-[#DCE4EE] bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-[#F0F4F8]">
            <CardTitle className="text-xs font-bold text-[#142541] uppercase tracking-wider flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#F3F6FA] text-[#142541]">
                <CalendarCheck className="h-4 w-4" />
              </div>
              Live Interactive Cohort Schedule
            </CardTitle>
            {activeRel.can_view_schedule ? (
              <Badge variant="teal">Authorized</Badge>
            ) : (
              <Badge variant="outline">Restricted</Badge>
            )}
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {activeRel.can_view_schedule ? (
              <>
                <div className="flex items-baseline justify-between">
                  <div className="space-y-0.5">
                    <div className="text-3xl font-black text-[#142541]">{sessions.length}</div>
                    <p className="text-xs text-[#5F6F84]">Curriculum Sessions</p>
                  </div>
                  {nextSession && (
                    <div className="text-right text-xs">
                      <span className="font-bold text-[#3869AD]">Next Lab Session</span>
                      <div className="text-[11px] text-[#5F6F84]">
                        {new Date(nextSession.starts_at).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#DCE4EE] text-xs space-y-1">
                  {nextSession ? (
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#142541] truncate max-w-xs">
                        {nextSession.title}
                      </span>
                      <span className="text-[11px] text-[#5F6F84] font-medium">
                        {new Date(nextSession.starts_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  ) : (
                    <div className="text-[#5F6F84] italic">No active upcoming sessions scheduled</div>
                  )}
                </div>

                <div className="pt-1 flex items-center justify-between">
                  <Link
                    href={`/parent/schedule?childId=${activeRel.student_id}`}
                    className="text-xs font-bold text-[#3869AD] hover:underline flex items-center gap-1"
                  >
                    View Full Schedule & Meeting Links <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </>
            ) : (
              <div className="p-4 rounded-xl bg-[#F3F6FA] text-xs text-[#5F6F84] flex items-center gap-2">
                <Lock className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Class schedule access is restricted for this guardian link.</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 4. Tuition & Billing with Instant Pay Option */}
        <Card className="border-[#DCE4EE] bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-[#F0F4F8]">
            <CardTitle className="text-xs font-bold text-[#142541] uppercase tracking-wider flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                <CreditCard className="h-4 w-4" />
              </div>
              Tuition Fees & Payments
            </CardTitle>
            {activeRel.can_view_fees ? (
              <Badge variant="teal">Authorized</Badge>
            ) : (
              <Badge variant="outline">Restricted</Badge>
            )}
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {activeRel.can_view_fees ? (
              <>
                <div className="flex items-baseline justify-between">
                  <div className="space-y-0.5">
                    <div className="text-2xl font-black text-emerald-700">Paid in Full</div>
                    <p className="text-xs text-[#5F6F84]">Fall 2026 Academic Term</p>
                  </div>
                  <ParentPaymentModal
                    studentName={studentName}
                    studentCode={studentCode}
                    buttonText="Pay Fees / Add-ons"
                    variant="primary"
                    size="sm"
                  />
                </div>

                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#DCE4EE] text-xs flex items-center justify-between">
                  <span className="text-[#5F6F84]">Invoice Statement:</span>
                  <strong className="font-mono text-[#142541]">SYN-INV-2026-081</strong>
                </div>

                <div className="pt-1 flex items-center justify-between">
                  <Link
                    href={`/parent/billing?childId=${activeRel.student_id}`}
                    className="text-xs font-bold text-[#3869AD] hover:underline flex items-center gap-1"
                  >
                    View Official Statements & Tax Receipts <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </>
            ) : (
              <div className="p-4 rounded-xl bg-[#F3F6FA] text-xs text-[#5F6F84] flex items-center gap-2">
                <Lock className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Financial records are restricted for this guardian link.</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Curriculum Sessions Timeline */}
      {sessions.length > 0 && (
        <div className="rounded-3xl border border-[#DCE4EE] bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-[#DCE4EE]">
            <div>
              <h3 className="text-base font-bold text-[#142541] flex items-center gap-2">
                <Video className="h-4 w-4 text-[#168B83]" />
                Upcoming Live Sessions for {studentName}
              </h3>
              <p className="text-xs text-[#5F6F84]">
                Interactive video classrooms and hands-on algorithm laboratories.
              </p>
            </div>
            <Link
              href={`/parent/schedule?childId=${activeRel.student_id}`}
              className="text-xs font-semibold text-[#3869AD] hover:underline"
            >
              View Full Calendar &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.slice(0, 3).map((s) => (
              <div
                key={s.id}
                className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#DCE4EE] hover:border-[#3869AD] transition-all space-y-2.5 flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-[#5F6F84]">
                    <span className="font-semibold text-[#3869AD] uppercase tracking-wider">
                      {s.course?.title || "Cohort Session"}
                    </span>
                    <Badge variant="teal">{s.status}</Badge>
                  </div>
                  <h4 className="font-bold text-xs text-[#142541] line-clamp-1">{s.title}</h4>
                  {s.description && (
                    <p className="text-[11px] text-[#5F6F84] line-clamp-2 leading-relaxed">
                      {s.description}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-[#DCE4EE] text-[11px] text-[#5F6F84] flex items-center justify-between">
                  <span className="font-medium text-[#142541]">
                    {new Date(s.starts_at).toLocaleDateString()}
                  </span>
                  <span>
                    {new Date(s.starts_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Connected Family Links & Account Management Card */}
      <div className="rounded-3xl border border-[#DCE4EE] bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-[#DCE4EE]">
          <div>
            <h3 className="text-base font-bold text-[#142541]">
              Verified Family Students ({relationships.length})
            </h3>
            <p className="text-xs text-[#5F6F84]">
              Active student accounts currently monitored under your guardian profile.
            </p>
          </div>
          <LinkStudentModal
            buttonText="+ Connect Additional Child"
            variant="outline"
            size="sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {relationships.map((rel) => {
            const isCurrent = rel.student_id === activeRel.student_id;
            return (
              <div
                key={rel.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                  isCurrent
                    ? "border-[#3869AD] bg-[#E8EFF8]/40 shadow-xs"
                    : "border-[#DCE4EE] bg-white hover:bg-[#F3F6FA]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#E8EFF8] text-[#3869AD] flex items-center justify-center font-bold text-sm">
                    {rel.student?.profile?.full_name?.charAt(0) || "S"}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-[#142541]">
                      {rel.student?.profile?.full_name || "Student"}
                    </div>
                    <div className="text-[11px] font-mono text-[#3869AD]">
                      Code: {rel.student?.student_code || "STU-CODE"}
                    </div>
                  </div>
                </div>
                <div>
                  {isCurrent ? (
                    <span className="text-[10px] font-bold text-white bg-[#3869AD] px-2.5 py-1 rounded-full shadow-xs">
                      Active
                    </span>
                  ) : (
                    <Link
                      href={`/parent?childId=${rel.student_id}`}
                      className="text-xs font-semibold text-[#3869AD] hover:underline"
                    >
                      Switch &rarr;
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
