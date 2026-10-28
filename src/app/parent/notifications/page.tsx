import React from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldCheck,
  CalendarCheck,
  ArrowRight,
} from "lucide-react";
import { requireRole } from "@/server/services/authService";
import {
  getActiveChildrenForGuardian,
  getGuardianNotifications,
} from "@/server/services/guardianService";
import { ParentChildSelector } from "@/components/forms/ParentChildSelector";
import { LinkStudentModal } from "@/components/forms/LinkStudentModal";
import { NotificationItemRow } from "@/components/dashboards/NotificationItemRow";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Guardian Notifications & Announcements — Syntaxora",
  description: "Official notifications, timetable alerts, academic updates, and relationship verification notices.",
};

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ParentNotificationsPage({ searchParams }: Props) {
  const auth = await requireRole(["parent", "admin"]);
  const [relationships, notifications] = await Promise.all([
    getActiveChildrenForGuardian(auth.userId),
    getGuardianNotifications(auth.userId),
  ]);

  const resolvedParams = await searchParams;
  const requestedChildId = typeof resolvedParams.childId === "string" ? resolvedParams.childId : undefined;
  const activeRel =
    relationships.find((r) => r.student_id === requestedChildId) ||
    relationships[0];

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-8">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#5F6F84] mb-1">
            <span>Parent Portal</span>
            <span>/</span>
            <span className="font-semibold text-[#142541]">Notifications & Announcements</span>
          </div>
          <h1 className="text-2xl font-black text-[#142541] tracking-tight">
            Notifications Center
          </h1>
          <p className="text-xs text-[#5F6F84] mt-0.5">
            Verified academic alerts, schedule changes, relationship approvals, and academy announcements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeRel && (
            <ParentChildSelector
              relationships={relationships}
              selectedChildId={activeRel.student_id}
            />
          )}
          <LinkStudentModal
            buttonText="+ Link Sibling"
            variant="outline"
            size="sm"
          />
        </div>
      </div>

      {/* Summary Banner */}
      <div className="rounded-3xl border border-[#DCE4EE] bg-white p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-[#E8EFF8] text-[#3869AD] flex items-center justify-center font-bold text-base shrink-0">
            <Bell className="h-6 w-6" />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-[#142541]">
              Guardian Message Stream
            </h3>
            <p className="text-xs text-[#5F6F84]">
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""} awaiting review.`
                : "All notifications have been reviewed."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Badge variant={unreadCount > 0 ? "teal" : "outline"}>
            {unreadCount} Unread
          </Badge>
          <span className="text-[#5F6F84]">of {notifications.length} Total</span>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <NotificationItemRow key={notif.id} notification={notif} />
          ))
        ) : (
          <div className="rounded-3xl border border-[#DCE4EE] bg-white p-12 text-center space-y-3 shadow-xs">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-[#E8EFF8] text-[#3869AD] flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-[#142541]">No Notifications at this Time</h4>
              <p className="text-xs text-[#5F6F84] max-w-sm mx-auto leading-relaxed">
                Important updates regarding attendance, project submissions, and relationship verifications will appear here.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

