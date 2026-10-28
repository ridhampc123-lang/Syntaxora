import React from "react";
import Link from "next/link";
import {
  Bell,
  CalendarCheck,
  ClipboardList,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Check,
} from "lucide-react";
import { requireRole } from "@/server/services/authService";
import { getStudentNotifications } from "@/server/services/studentService";
import { markNotificationAsReadAction } from "@/server/actions/student";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Notification Center — Syntaxora",
  description: "Official real-time updates for classes, faculty feedback, and cohort announcements.",
};

export default async function StudentNotificationsPage() {
  const auth = await requireRole(["student", "admin"]);
  const notifications = await getStudentNotifications(auth.userId);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#142541]/5 text-[#3869AD] text-xs font-bold mb-2">
            <Bell className="h-3.5 w-3.5" />
            <span>Notification Feed</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142541] tracking-tight">
            Notifications & Announcements
          </h1>
          <p className="text-xs sm:text-sm text-[#5F6F84] mt-1 max-w-2xl">
            Live updates on scheduled computer vision lab meetings, assignment review audits, and cohort announcements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant={unreadCount > 0 ? "teal" : "outline"}
            className="text-xs font-semibold py-1 px-3"
          >
            {unreadCount > 0 ? `${unreadCount} Unread Updates` : "All Caught Up"}
          </Badge>
        </div>
      </div>

      {/* Notifications List */}
      <div className="rounded-2xl border border-[#DCE4EE] bg-white overflow-hidden shadow-sm">
        <div className="p-5 border-b border-[#DCE4EE] bg-[#F8FAFC] flex items-center justify-between">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#142541]">
            Recent Updates ({notifications.length})
          </h3>
          <span className="text-[11px] text-[#5F6F84]">
            Filtered strictly to your authenticated student record
          </span>
        </div>

        <div className="divide-y divide-[#DCE4EE] text-xs">
          {notifications.length === 0 ? (
            <div className="p-12 text-center text-[#5F6F84] space-y-2">
              <div className="h-10 w-10 rounded-full bg-[#E8EFF8] text-[#3869AD] flex items-center justify-center mx-auto">
                <Bell className="h-5 w-5" />
              </div>
              <div className="font-bold text-sm text-[#142541]">No Notifications Yet</div>
              <p className="text-xs max-w-sm mx-auto">
                When instructors publish evaluations, change session timings, or issue cohort announcements, they will appear here.
              </p>
            </div>
          ) : (
            notifications.map((notif) => {
              const isUnread = !notif.is_read;

              return (
                <div
                  key={notif.id}
                  className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                    isUnread ? "bg-blue-50/40" : "hover:bg-[#F8FAFC]"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        notif.type === "class"
                          ? "bg-teal-50 text-[#168B83]"
                          : notif.type === "assignment"
                          ? "bg-amber-50 text-amber-600"
                          : notif.type === "success"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-blue-50 text-[#3869AD]"
                      }`}
                    >
                      {notif.type === "class" ? (
                        <CalendarCheck className="h-4 w-4" />
                      ) : notif.type === "assignment" ? (
                        <ClipboardList className="h-4 w-4" />
                      ) : notif.type === "success" ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#142541]">{notif.title}</span>
                        {isUnread && (
                          <span className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
                        )}
                      </div>
                      <p className="text-xs text-[#5F6F84] leading-relaxed max-w-xl">
                        {notif.message}
                      </p>
                      <div className="text-[10px] text-[#5F6F84] pt-0.5">
                        {new Date(notif.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {notif.action_url && (
                      <Link
                        href={notif.action_url}
                        className="px-3 py-1.5 rounded-lg bg-[#F3F6FA] hover:bg-[#DCE4EE] text-[#142541] font-semibold text-xs flex items-center gap-1 transition-colors"
                      >
                        <span>Open</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    )}

                    {isUnread && (
                      <form
                        action={async (formData: FormData): Promise<void> => {
                          "use server";
                          await markNotificationAsReadAction(formData);
                        }}
                      >
                        <input type="hidden" name="notificationId" value={notif.id} />
                        <button
                          type="submit"
                          className="px-3 py-1.5 rounded-lg bg-white border border-[#DCE4EE] hover:bg-[#F3F6FA] text-[#5F6F84] hover:text-[#142541] text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Check className="h-3 w-3" />
                          <span>Mark Read</span>
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
