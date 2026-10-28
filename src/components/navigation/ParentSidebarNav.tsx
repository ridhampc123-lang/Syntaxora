"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  CheckSquare,
  Award,
  CreditCard,
  GraduationCap,
  BookOpen,
  FileText,
  Bell,
  HelpCircle,
} from "lucide-react";

export function ParentSidebarNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentChildId = searchParams.get("childId");

  const navLinks = [
    { href: "/parent", label: "Overview", icon: LayoutDashboard },
    { href: "/parent/attendance", label: "Attendance Record", icon: CheckSquare },
    { href: "/parent/progress", label: "Learning Progress & Grades", icon: Award },
    { href: "/parent/courses", label: "Courses & Batches", icon: GraduationCap },
    { href: "/parent/schedule", label: "Timetable & Schedule", icon: CalendarCheck },
    { href: "/parent/assignments", label: "Assignments & Work", icon: BookOpen },
    { href: "/parent/billing", label: "Tuition & Invoices", icon: CreditCard },
    { href: "/parent/reports", label: "Reports & Transcripts", icon: FileText },
    { href: "/parent/notifications", label: "Notifications & Alerts", icon: Bell },
    { href: "/parent/support", label: "Guardian Support & Help", icon: HelpCircle },
  ];

  return (
    <nav className="flex-1 px-3 py-2 space-y-1">
      {navLinks.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/parent"
            ? pathname === "/parent"
            : pathname.startsWith(item.href);

        // Preserve current selected child across tabs
        const href = currentChildId
          ? `${item.href}?childId=${encodeURIComponent(currentChildId)}`
          : item.href;

        return (
          <Link
            key={item.href}
            href={href}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              isActive
                ? "bg-gradient-to-r from-[#168B83] to-[#147972] text-white shadow-md font-bold"
                : "text-[#DCE4EE] hover:text-white hover:bg-white/10"
            }`}
          >
            <Icon
              className={`h-4 w-4 shrink-0 ${
                isActive ? "text-white" : "text-[#168B83]"
              }`}
            />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
