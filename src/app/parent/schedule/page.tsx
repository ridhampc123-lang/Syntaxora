import React from "react";
import Link from "next/link";
import {
  Lock,
  CalendarCheck,
  Video,
  Clock,
  User,
  CreditCard,
  Sparkles,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";
import { requireRole } from "@/server/services/authService";
import { getActiveChildrenForGuardian } from "@/server/services/guardianService";
import { getStudentSessions, getStudentEnrollments } from "@/server/services/studentService";
import { ParentChildSelector } from "@/components/forms/ParentChildSelector";
import { ParentPaymentModal } from "@/components/forms/ParentPaymentModal";
import { LinkStudentModal } from "@/components/forms/LinkStudentModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Child Class Schedule & Timetable — Syntaxora Guardian",
  description: "Live interactive class timetable, laboratory schedule, and tuition details for your student.",
};

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ParentSchedulePage({ searchParams }: Props) {
  const auth = await requireRole(["parent", "admin"]);
  const relationships = await getActiveChildrenForGuardian(auth.userId);

  const resolvedParams = await searchParams;
  const requestedChildId = typeof resolvedParams.childId === "string" ? resolvedParams.childId : undefined;
  const activeRel =
    relationships.find((r) => r.student_id === requestedChildId) ||
    relationships[0];

  if (!activeRel) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4 bg-white rounded-3xl border border-[#DCE4EE] p-8 shadow-xs">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-[#E8EFF8] text-[#168B83] flex items-center justify-center">
          <CalendarCheck className="h-7 w-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-[#142541]">No Active Student Connected</h2>
          <p className="text-xs text-[#5F6F84] max-w-sm mx-auto leading-relaxed">
            Link your child using their unique student code to access their interactive class schedule and laboratory timetable.
          </p>
        </div>
        <div className="pt-2 flex justify-center">
          <LinkStudentModal buttonText="Link Your Child Now" variant="primary" size="md" />
        </div>
      </div>
    );
  }

  const studentName = activeRel.student?.profile?.full_name || "Linked Student";
  const studentCode = activeRel.student?.student_code || "STU-CODE";

  if (!activeRel.can_view_schedule) {
    return (
      <div className="space-y-6">
        <ParentChildSelector relationships={relationships} selectedChildId={activeRel.student_id} />
        <div className="rounded-3xl border border-amber-200 bg-amber-50/50 p-12 text-center space-y-4">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <Lock className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-amber-900">Schedule Access Restricted</h3>
            <p className="text-xs text-amber-700 max-w-md mx-auto leading-relaxed">
              Your verified guardian link for <strong>{studentName}</strong> does not currently include schedule viewing authorization.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Real scheduled sessions scoped to student's enrolled courses and assigned batches
  const [sessions, enrollments] = await Promise.all([
    getStudentSessions(activeRel.student_id),
    getStudentEnrollments(activeRel.student_id),
  ]);

  const courseTrack = enrollments[0]?.course?.title || "Enrolled AI Program";
  const batchName = enrollments[0]?.batch?.name || "Assigned Cohort Batch";

  const now = new Date();
  const upcomingSessions = sessions.filter((s) => new Date(s.starts_at) >= now);
  const pastSessions = sessions.filter((s) => new Date(s.starts_at) < now);

  return (
    <div className="space-y-8">
      {/* Title & Child Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#5F6F84] mb-1">
            <span>Parent Portal</span>
            <span>/</span>
            <span className="font-semibold text-[#142541]">Cohort Timetable & Live Labs</span>
          </div>
          <h1 className="text-2xl font-black text-[#142541] tracking-tight">
            Schedule & Live Labs: {studentName}
          </h1>
          <p className="text-xs text-[#5F6F84] mt-0.5">
            Student Code: <strong className="font-mono text-[#3869AD]">{studentCode}</strong> • Track: {courseTrack} • Batch: {batchName}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ParentChildSelector
            relationships={relationships}
            selectedChildId={activeRel.student_id}
          />
          <LinkStudentModal
            buttonText="+ Link Sibling"
            variant="outline"
            size="sm"
          />
          {activeRel.can_view_fees && (
            <ParentPaymentModal
              studentName={studentName}
              studentCode={studentCode}
              studentId={activeRel.student_id}
              courseId={enrollments[0]?.course?.id}
              courseTitle={courseTrack}
              buttonText="Tuition Fees"
              variant="primary"
              size="sm"
            />
          )}
        </div>
      </div>

      {/* Classroom Security & Privacy Notice */}
      <div className="rounded-2xl border border-[#3869AD]/20 bg-[#E8EFF8]/40 p-4.5 text-xs text-[#3869AD] flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-[#3869AD] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-[#142541] block">Virtual Classroom Zero-Trust Protocol</strong>
          <p className="leading-relaxed text-[#263449] text-[11px]">
            In compliance with educational child protection policies, live video meeting join links and audio credentials belong strictly to the authenticated student account. Guardians monitor session timings, attendance punctuality, and topics without entering breakout laboratory rooms.
          </p>
        </div>
      </div>

      {/* Upcoming Class Sessions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#E2F4F2] text-[#168B83]">
              <CalendarCheck className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#142541]">
                Upcoming Scheduled Sessions ({upcomingSessions.length})
              </h3>
              <p className="text-[11px] text-[#5F6F84]">
                All sessions broadcast live with interactive two-way code sharing. Timings in <strong>Asia/Kolkata (IST)</strong>.
              </p>
            </div>
          </div>
        </div>

        {upcomingSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingSessions.map((s, idx) => {
              const startDate = new Date(s.starts_at);
              const endDate = new Date(s.ends_at);
              const isToday = startDate.toDateString() === now.toDateString();

              return (
                <div
                  key={s.id}
                  className={`p-5 rounded-3xl border transition-all space-y-4 flex flex-col justify-between ${
                    isToday
                      ? "border-[#168B83] bg-gradient-to-br from-white to-[#E2F4F2]/30 shadow-md ring-2 ring-[#168B83]/20"
                      : "border-[#DCE4EE] bg-white shadow-xs hover:shadow-sm"
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] font-bold text-[#3869AD] bg-[#E8EFF8] px-2 py-0.5 rounded">
                        UPCOMING LAB #{idx + 1}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {isToday && (
                          <span className="animate-pulse bg-emerald-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                            TODAY
                          </span>
                        )}
                        <Badge variant="teal">{s.status.toUpperCase()}</Badge>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-[#142541] leading-snug">{s.title}</h4>
                      {s.description && (
                        <p className="text-xs text-[#5F6F84] mt-1 leading-relaxed line-clamp-2">
                          {s.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-[#DCE4EE]">
                    <div className="grid grid-cols-2 gap-2 text-xs text-[#5F6F84]">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold uppercase text-[#93A5C2]">Class Date</span>
                        <div className="font-bold text-[#142541]">
                          {startDate.toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold uppercase text-[#93A5C2]">Time Window (IST)</span>
                        <div className="font-bold text-[#142541]">
                          {startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} – {endDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-xs">
                      <div className="flex items-center gap-1.5 text-[11px] text-[#5F6F84]">
                        <Video className="h-3.5 w-3.5 text-[#3869AD]" />
                        <span className="capitalize font-semibold text-[#142541]">
                          {s.meeting_provider?.replace("_", " ") || "Live Virtual"} Classroom
                        </span>
                      </div>

                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Attendance Monitored
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-[#DCE4EE] bg-white p-12 text-center space-y-3 shadow-xs">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-[#E8EFF8] text-[#3869AD] flex items-center justify-center">
              <CalendarCheck className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-[#142541]">No Upcoming Live Sessions</h4>
              <p className="text-xs text-[#5F6F84] max-w-sm mx-auto leading-relaxed">
                There are no future live classroom sessions scheduled for this student&apos;s active batch at this time.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Completed / Past Sessions Log */}
      {pastSessions.length > 0 && (
        <div className="rounded-3xl border border-[#DCE4EE] bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F8]">
            <div>
              <h3 className="text-sm font-bold text-[#142541]">
                Completed Sessions ({pastSessions.length})
              </h3>
              <p className="text-xs text-[#5F6F84]">
                Past live classes and laboratory demonstrations completed by the cohort.
              </p>
            </div>
            <Link
              href={`/parent/attendance?childId=${activeRel.student_id}`}
              className="text-xs font-semibold text-[#3869AD] hover:underline"
            >
              Verify Attendance Log &rarr;
            </Link>
          </div>

          <div className="divide-y divide-[#F0F4F8]">
            {pastSessions.slice(0, 5).map((s) => (
              <div key={s.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <h5 className="font-bold text-[#142541]">{s.title}</h5>
                  <div className="text-[11px] text-[#5F6F84]">
                    {new Date(s.starts_at).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })} at {new Date(s.starts_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                <Badge variant="outline">COMPLETED</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help & Support Notice */}
      <div className="rounded-2xl border border-[#DCE4EE] bg-[#F8FAFC] p-4 text-xs text-[#5F6F84] flex items-start gap-3">
        <HelpCircle className="h-5 w-5 text-[#3869AD] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-[#142541] block">Need Assistance with Schedules?</strong>
          <p className="leading-relaxed">
            Parents can submit an absence excuse or request assistance with class timings via the <strong>Guardian Support</strong> section or by emailing <strong className="text-[#142541]">support@syntaxora.com</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
