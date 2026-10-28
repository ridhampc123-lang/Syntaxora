"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  CalendarCheck,
  ClipboardList,
  Award,
  CheckSquare,
  FolderDown,
  CreditCard,
  Bell,
  User,
  HelpCircle,
} from "lucide-react";

interface Props {
  pendingAssignmentsCount?: number;
  upcomingSessionsCount?: number;
  unreadNotificationsCount?: number;
}

export function StudentSidebarNav({
  pendingAssignmentsCount = 0,
  upcomingSessionsCount = 0,
  unreadNotificationsCount = 0,
}: Props) {
  const pathname = usePathname();

  const primaryLinks = [
    {
      href: "/student",
      label: "Dashboard",
      icon: LayoutDashboard,
      badge: null,
      exact: true,
    },
    {
      href: "/student/courses",
      label: "Enrolled Tracks",
      icon: BookOpen,
      badge: null,
      exact: false,
    },
    {
      href: "/student/classes",
      label: "Live Classes",
      icon: CalendarCheck,
      badge: upcomingSessionsCount > 0 ? `${upcomingSessionsCount} live` : null,
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      exact: false,
    },
    {
      href: "/student/assignments",
      label: "Assignments & Labs",
      icon: ClipboardList,
      badge: pendingAssignmentsCount > 0 ? `${pendingAssignmentsCount} due` : null,
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      exact: false,
    },
    {
      href: "/student/grades",
      label: "Released Grades",
      icon: Award,
      badge: null,
      exact: false,
    },
    {
      href: "/student/attendance",
      label: "Attendance Log",
      icon: CheckSquare,
      badge: null,
      exact: false,
    },
    {
      href: "/student/resources",
      label: "Course Resources",
      icon: FolderDown,
      badge: null,
      exact: false,
    },
  ];

  const secondaryLinks = [
    {
      href: "/student/notifications",
      label: "Notifications",
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? `${unreadNotificationsCount} new` : null,
      badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
      exact: false,
    },
    {
      href: "/student/billing",
      label: "Tuition & Invoices",
      icon: CreditCard,
      badge: null,
      exact: false,
    },
    {
      href: "/student/profile",
      label: "Student Profile",
      icon: User,
      badge: null,
      exact: false,
    },
    {
      href: "/student/support",
      label: "Help & Support",
      icon: HelpCircle,
      badge: null,
      exact: false,
    },
  ];

  const renderLink = (item: (typeof primaryLinks)[0]) => {
    const Icon = item.icon;
    const isActive = item.exact
      ? pathname === item.href
      : pathname.startsWith(item.href);

    return (
      <Link
        key={item.href}
        href={item.href}
        className={`group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
          isActive
            ? "bg-gradient-to-r from-[#3869AD] to-[#254A82] text-white shadow-md shadow-[#142541]/40 border border-white/15"
            : "text-[#DCE4EE]/75 hover:text-white hover:bg-white/[0.08]"
        }`}
      >
        <div className="flex items-center gap-3">
          <Icon
            className={`h-4 w-4 transition-transform group-hover:scale-110 ${
              isActive ? "text-cyan-300" : "text-[#7B9CC7] group-hover:text-white"
            }`}
          />
          <span className="tracking-tight">{item.label}</span>
        </div>

        {item.badge && (
          <span
            className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
              item.badgeColor || "bg-white/10 text-white border-white/20"
            }`}
          >
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <nav className="flex-1 px-3 py-3 space-y-4" aria-label="Student Navigation">
      <div className="space-y-1">
        <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-white/40">
          Learning
        </div>
        {primaryLinks.map(renderLink)}
      </div>

      <div className="space-y-1 pt-2 border-t border-white/10">
        <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-white/40">
          Account & Desk
        </div>
        {secondaryLinks.map(renderLink)}
      </div>
    </nav>
  );
}
