import React from "react";
import {
  CalendarCheck,
  AlertCircle,
  Video,
  Clock,
  MapPin,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { requireRole } from "@/server/services/authService";
import {
  getStudentByProfileId,
  getStudentSessions,
  getStudentEnrollments,
} from "@/server/services/studentService";
import { StudentJoinButton } from "@/components/dashboards/StudentJoinButton";
import { Badge } from "@/components/ui/badge";
import { ClassCalendarButton } from "@/components/dashboards/ClassCalendarButton";

export const metadata = {
  title: "Live Classes & Virtual Labs — Syntaxora",
  description: "Schedule of upcoming live interactive lectures and computer vision lab sessions.",
};

export default async function StudentClassesPage() {
  const auth = await requireRole(["student", "admin"]);
  const student = await getStudentByProfileId(auth.userId);

  const [enrollments, sessions] = await Promise.all([
    student ? getStudentEnrollments(student.id) : [],
    student ? getStudentSessions(student.id) : [],
  ]);

  const awaitingBatch = enrollments.filter((e) => !e.batch_id);
  const activeSession = sessions.find((s) => s.status === "in_progress");
  const nextSession = sessions.find((s) => s.status === "scheduled");

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#142541]/5 text-[#3869AD] text-xs font-bold mb-2">
            <CalendarCheck className="h-3.5 w-3.5" />
            <span>Interactive Timetable</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142541] tracking-tight">
            Live Classes & Virtual Labs
          </h1>
          <p className="text-xs sm:text-sm text-[#5F6F84] mt-1 max-w-2xl">
            Join your cohort for real-time algorithmic instruction, pair programming, and direct instructor code review.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-mono py-1 px-3 bg-white border-[#DCE4EE]">
            Timezone: Asia/Kolkata (IST)
          </Badge>
        </div>
      </div>

      {/* Awaiting Batch Assignment Notice (if applicable) */}
      {awaitingBatch.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5 space-y-2 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
            <span>Awaiting Cohort Timetable Confirmation</span>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            You are enrolled in <strong>{awaitingBatch.map((e) => e.course?.title).join(", ")}</strong>. Admissions is currently confirming your cohort batch and timetable. Your live classes and meeting room links will appear automatically once scheduled.
          </p>
        </div>
      )}

      {/* Live Spotlight Hero Banner (If a session is active or next up) */}
      {(() => {
        const featuredSession = activeSession || nextSession;
        if (!featuredSession) return null;
        return (
          <div className="rounded-2xl border border-[#3869AD]/30 bg-gradient-to-r from-[#142541] via-[#1B3560] to-[#142541] text-white p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                {activeSession ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold animate-pulse">
                    <span className="h-2 w-2 rounded-full bg-rose-400" />
                    CLASSROOM IN SESSION NOW
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    UPCOMING SESSION
                  </span>
                )}
                <span className="text-xs text-cyan-300 font-mono">
                  {featuredSession.title}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {featuredSession.title}
              </h2>

              <p className="text-xs text-[#DCE4EE]/80 max-w-xl leading-relaxed">
                {featuredSession.description || "Interactive computer vision and Python lab with live code debugging."}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-white/90 pt-1">
                <span className="flex items-center gap-1.5 font-medium">
                  <Clock className="h-3.5 w-3.5 text-cyan-300" />
                  {new Date(featuredSession.starts_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} •{" "}
                  {new Date(featuredSession.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(featuredSession.ends_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST
                </span>
                <span className="flex items-center gap-1.5 text-emerald-300 font-medium">
                  <MapPin className="h-3.5 w-3.5" />
                  Syntaxora WebRTC Lab
                </span>
              </div>
            </div>

            <div className="shrink-0 flex flex-col gap-2 bg-white/10 p-4 rounded-2xl border border-white/15 backdrop-blur-md">
              <StudentJoinButton
                sessionId={featuredSession.id}
                sessionStatus={featuredSession.status}
                startsAt={featuredSession.starts_at}
                endsAt={featuredSession.ends_at}
              />
              <ClassCalendarButton
                title={featuredSession.title}
                description={featuredSession.description || ""}
                startsAt={featuredSession.starts_at}
                endsAt={featuredSession.ends_at}
              />
            </div>
          </div>
        );
      })()}

      {/* Sessions Table */}
      <div className="rounded-2xl border border-[#DCE4EE] bg-white overflow-hidden shadow-sm">
        <div className="p-5 border-b border-[#DCE4EE] bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#142541]">
              Cohort Timetable & Laboratory Schedule ({sessions.length})
            </h3>
            <p className="text-[11px] text-[#5F6F84] mt-0.5">
              Sessions unlock 15 minutes before scheduled start time
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Full Attendance Recorded Automatically</span>
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#DCE4EE] bg-[#F8FAFC]/50 text-[#142541] font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-4">Session & Topic</th>
                <th className="p-4">Cohort Batch</th>
                <th className="p-4">Course Track</th>
                <th className="p-4">Scheduled Time</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE4EE] text-[#263449]">
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-[#5F6F84]">
                    <div className="max-w-sm mx-auto space-y-2">
                      <div className="h-10 w-10 rounded-full bg-[#E8EFF8] text-[#3869AD] flex items-center justify-center mx-auto">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div className="font-bold text-sm text-[#142541]">No Sessions Scheduled</div>
                      <p className="text-xs">
                        Class sessions for your batch will be published by faculty mentors prior to cohort commencement.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                sessions.map((s) => (
                  <tr key={s.id} className="hover:bg-[#F8FAFC]/80 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-sm text-[#142541] flex items-center gap-2">
                        <Video className="h-4 w-4 text-[#3869AD] shrink-0" />
                        <span>{s.title}</span>
                      </div>
                      {s.description && (
                        <div className="text-[11px] text-[#5F6F84] line-clamp-1 max-w-sm mt-0.5 pl-6">
                          {s.description}
                        </div>
                      )}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {s.batch?.batch_code || "COHORT-A1"}
                      </Badge>
                    </td>
                    <td className="p-4 text-[#5F6F84]">
                      {s.course?.title || "Applied AI Track"}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="font-bold text-[#142541]">
                        {new Date(s.starts_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', weekday: 'short' })}
                      </div>
                      <div className="text-[11px] text-[#5F6F84]">
                        {new Date(s.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(s.ends_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <Badge
                        variant={
                          s.status === "in_progress"
                            ? "success"
                            : s.status === "completed"
                            ? "outline"
                            : "teal"
                        }
                        className="text-[11px] font-bold"
                      >
                        {s.status === "in_progress" ? "LIVE NOW" : s.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2 justify-end">
                        <ClassCalendarButton
                          title={s.title}
                          description={s.description || ""}
                          startsAt={s.starts_at}
                          endsAt={s.ends_at}
                        />
                        <StudentJoinButton
                          sessionId={s.id}
                          sessionStatus={s.status}
                          startsAt={s.starts_at}
                          endsAt={s.ends_at}
                        />
                      </div>
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
