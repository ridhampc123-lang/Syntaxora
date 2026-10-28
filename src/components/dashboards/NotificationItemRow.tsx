"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { Bell, Check, ExternalLink, Info, AlertTriangle, CheckCircle2 } from "lucide-react";
import { markNotificationReadAction } from "@/server/actions/guardian";
import { GuardianNotification } from "@/server/services/guardianService";
import { Badge } from "@/components/ui/badge";

interface Props {
  notification: GuardianNotification;
}

export function NotificationItemRow({ notification }: Props) {
  const [isRead, setIsRead] = useState(notification.is_read);
  const [isPending, startTransition] = useTransition();

  const handleMarkRead = () => {
    if (isRead) return;
    setIsRead(true);
    startTransition(async () => {
      await markNotificationReadAction(notification.id);
    });
  };

  return (
    <div
      className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
        isRead
          ? "border-[#DCE4EE] bg-white opacity-90"
          : "border-[#3869AD]/40 bg-[#E8EFF8]/30 shadow-xs"
      }`}
    >
      <div className="flex items-start gap-3.5">
        <div
          className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
            notification.type === "alert"
              ? "bg-rose-100 text-rose-700"
              : notification.type === "warning"
              ? "bg-amber-100 text-amber-700"
              : "bg-[#E8EFF8] text-[#3869AD]"
          }`}
        >
          {notification.type === "alert" || notification.type === "warning" ? (
            <AlertTriangle className="h-5 w-5" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
        </div>

        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-bold text-sm text-[#142541]">{notification.title}</h4>
            {!isRead && <Badge variant="teal">NEW</Badge>}
          </div>

          <p className="text-xs text-[#5F6F84] leading-relaxed">{notification.message}</p>

          <span className="text-[10px] text-[#93A5C2] block pt-1">
            {new Date(notification.created_at).toLocaleString([], {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:self-center shrink-0">
        {notification.action_url && (
          <Link
            href={notification.action_url}
            className="text-xs font-semibold text-[#3869AD] hover:underline flex items-center gap-1"
          >
            Open <ExternalLink className="h-3 w-3" />
          </Link>
        )}

        {!isRead && (
          <button
            type="button"
            onClick={handleMarkRead}
            disabled={isPending}
            className="text-xs font-semibold text-[#5F6F84] hover:text-[#142541] flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#DCE4EE] bg-white hover:bg-[#F8FAFC] transition-colors cursor-pointer"
          >
            <Check className="h-3.5 w-3.5" />
            <span>Mark Read</span>
          </button>
        )}
      </div>
    </div>
  );
}

