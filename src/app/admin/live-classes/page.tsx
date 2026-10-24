import React from "react";
import Link from "next/link";
import {
  Clock,
  AlertTriangle,
  Calendar,
  ShieldCheck,
} from "lucide-react";
import {
  getAllSessions,
  getUpcomingSessionAlerts,
} from "@/server/services/scheduleService";
import { StartLiveClassButton } from "@/components/forms/StartLiveClassButton";
import { RescheduleSessionModal } from "@/components/forms/RescheduleSessionModal";
import { Badge } from "@/components/ui/badge";
import { SessionStatus } from "@/types";

export const metadata = {
  title: "Live Class Control Center — Syntaxora Admin",
  description: "Monitor classes starting soon, launch meetings, and review timetable alerts.",
};

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminLiveClassesPage({ searchParams }: Props) {
  const resolved = await searchParams;
  const statusFilter = typeof resolved.status === "string" ? (resolved.status as SessionStatus) : undefined;
  const courseId = typeof resolved.courseId === "string" ? resolved.courseId : undefined;

  const [alerts, allSessions] = await Promise.all([
    getUpcomingSessionAlerts(),
    getAllSessions({ status: statusFilter, courseId }),
  ]);

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold text-[#142541] tracking-tight">
          Schedule & Live Class Control Center
        </h2>
        <p className="text-xs text-[#5F6F84] mt-0.5">
          Real-time class operations, countdown alert monitors, provider meeting integration, and schedule management.
        </p>
      </div>

      {/* 4 Real Alert Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Live Now */}
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-800 uppercase tracking-wider">
            <span>Live Classrooms Now</span>
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-emerald-900">
            {alerts.liveNow.length}
          </div>
          <div className="text-[11px] text-emerald-700">
            Active meeting rooms in session
          </div>
        </div>

        {/* Starts in 15 Min */}
        <div className="p-4 rounded-xl border border-sky-200 bg-sky-50/50 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-sky-800 uppercase tracking-wider">
            <span>Starting Soon (&le; 15m)</span>
            <Clock className="h-4 w-4 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-sky-900">
            {alerts.startsSoon15.length}
          </div>
          <div className="text-[11px] text-sky-700">
            Students eligible to enter waiting rooms
          </div>
        </div>

        {/* Overdue */}
        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-amber-800 uppercase tracking-wider">
            <span>Overdue Start (&gt; 0m)</span>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-900">
            {alerts.overdue.length}
          </div>
          <div className="text-[11px] text-amber-700">
            Start time passed but not initiated
          </div>
        </div>

        {/* Today's Total */}
        <div className="p-4 rounded-xl border border-[#DCE4EE] bg-white space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-[#5F6F84] uppercase tracking-wider">
            <span>Today&apos;s Lectures</span>
            <Calendar className="h-4 w-4 text-[#3869AD]" />
          </div>
          <div className="text-2xl font-black text-[#142541]">
            {alerts.todaySchedule.length}
          </div>
          <div className="text-[11px] text-[#5F6F84]">
            Scheduled occurrences for today
          </div>
        </div>
      </div>

      {/* Provider Warning Banner (If any) */}
      {alerts.missingProvider.length > 0 && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 space-y-2 text-xs text-amber-900 shadow-xs">
          <div className="flex items-center gap-2 font-bold">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span>Missing Meeting Provider Configuration Notice</span>
          </div>
          <p className="text-[11px] text-amber-800">
            {alerts.missingProvider.length} sessions specify Zoom or Google Meet without active API credentials in the environment. Per Syntaxora safety rules, live sessions will fall back to internal WebRTC rooms rather than displaying dead links. Configure ZOOM_API_KEY and ZOOM_API_SECRET in environment variables to enable native Zoom links.
          </p>
        </div>
      )}

      {/* Sessions Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <Link
          href="/admin/live-classes"
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            !statusFilter
              ? "bg-[#142541] text-white"
              : "bg-white border border-[#DCE4EE] text-[#5F6F84] hover:bg-[#F3F6FA]"
          }`}
        >
          All Sessions ({allSessions.length})
        </Link>
        {["scheduled", "in_progress", "completed", "cancelled"].map((st) => (
          <Link
            key={st}
            href={`/admin/live-classes?status=${st}`}
            className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition-colors ${
              statusFilter === st
                ? "bg-[#142541] text-white"
                : "bg-white border border-[#DCE4EE] text-[#5F6F84] hover:bg-[#F3F6FA]"
            }`}
          >
            {st.replace("_", " ")}
          </Link>
        ))}
      </div>

      {/* Timetable Sessions Table */}
      <div className="rounded-xl border border-[#DCE4EE] bg-white overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#DCE4EE] bg-[#F3F6FA] text-xs font-semibold text-[#142541] flex items-center justify-between">
          <span>Official Academy Timetable</span>
          <span className="text-[11px] text-[#5F6F84]">
            Timezone standard: Asia/Kolkata (IST)
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#DCE4EE] text-[#142541] font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">Session Details</th>
                <th className="p-3.5">Cohort Batch</th>
                <th className="p-3.5">Assigned Faculty</th>
                <th className="p-3.5">Date & Time</th>
                <th className="p-3.5">Provider</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE4EE] text-[#263449]">
              {allSessions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#5F6F84]">
                    No class sessions match the selected filter.
                  </td>
                </tr>
              ) : (
                allSessions.map((ses) => (
                  <tr key={ses.id} className="hover:bg-[#F3F6FA]/50 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-[#142541]">{ses.title}</div>
                      <div className="text-[11px] text-[#5F6F84]">{ses.course?.title}</div>
                    </td>
                    <td className="p-3.5">
                      {ses.batch ? (
                        <div>
                          <Link
                            href={`/admin/batches/${ses.batch.id}`}
                            className="font-semibold text-[#3869AD] hover:underline"
                          >
                            {ses.batch.name}
                          </Link>
                          <div className="text-[10px] font-mono text-[#5F6F84]">
                            {ses.batch.batch_code}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#5F6F84] italic">All cohorts</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5 font-medium text-[#142541]">
                        <ShieldCheck className="h-3.5 w-3.5 text-[#168B83]" />
                        <span>{ses.instructor?.full_name || "Faculty Assigned"}</span>
                      </div>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="font-medium text-[#142541]">
                        {new Date(ses.starts_at).toLocaleDateString()}
                      </div>
                      <div className="text-[11px] text-[#5F6F84]">
                        {new Date(ses.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(ses.ends_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="p-3.5 capitalize font-mono text-[11px] text-[#3869AD]">
                      <Badge variant="teal">{ses.meeting_provider.replace("_", " ")}</Badge>
                    </td>
                    <td className="p-3.5">
                      <Badge
                        variant={
                          ses.status === "in_progress"
                            ? "success"
                            : ses.status === "completed"
                            ? "secondary"
                            : "teal"
                        }
                      >
                        {ses.status === "in_progress" ? "LIVE NOW" : ses.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-right whitespace-nowrap space-x-2">
                      <RescheduleSessionModal
                        sessionId={ses.id}
                        sessionTitle={ses.title}
                        currentStartsAt={ses.starts_at}
                        currentEndsAt={ses.ends_at}
                      />
                      <StartLiveClassButton
                        sessionId={ses.id}
                        status={ses.status}
                        meetingUrl={ses.meeting_url}
                      />
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
