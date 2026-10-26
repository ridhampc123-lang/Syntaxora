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
} from "lucide-react";

interface Props {
  pendingAssignmentsCount?: number;
  upcomingSessionsCount?: number;
}

export function StudentSidebarNav({
  pendingAssignmentsCount = 0,
  upcomingSessionsCount = 0,
}: Props) {
  const pathname = usePathname();

  const navLinks = [
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
  ];

  return (
    <nav className="flex-1 px-3 py-3 space-y-1.5" aria-label="Student Navigation">
      {navLinks.map((item) => {
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
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                  item.badgeColor || "bg-white/10 text-white border-white/20"
                }`}
              >
                {item.badge}
              </span>
            )}

            {isActive && (
              <span
                className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-5 bg-cyan-400 rounded-l-full shadow-xs"
                aria-hidden="true"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
