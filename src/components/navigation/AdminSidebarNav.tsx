"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  BookOpen,
  GraduationCap,
  CalendarCheck,
  Mail,
  FileText,
  UserCheck,
  ClipboardList,
  Layers,
  Video,
  CreditCard,
} from "lucide-react";

export const ADMIN_NAV_LINKS = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Student Applications", href: "/admin/applications", icon: ClipboardList },
  { label: "Students", href: "/admin/students", icon: GraduationCap },
  { label: "Guardians & Invites", href: "/admin/guardians", icon: ShieldCheck },
  { label: "Faculty / Instructors", href: "/admin/instructors", icon: UserCheck },
  { label: "Courses & Curricula", href: "/admin/courses", icon: BookOpen },
  { label: "Batches & Cohorts", href: "/admin/batches", icon: Layers },
  { label: "Enrollments", href: "/admin/enrollments", icon: Users },
  { label: "Live Class Center", href: "/admin/live-classes", icon: Video },
  { label: "Attendance Records", href: "/admin/attendance", icon: CalendarCheck },
  { label: "Payments & Invoices", href: "/admin/payments", icon: CreditCard },
  { label: "Admissions Enquiries", href: "/admin/enquiries", icon: Mail },
  { label: "Audit Logs", href: "/admin/audit-logs", icon: FileText },
];

interface AdminSidebarNavProps {
  onItemClick?: () => void;
}

export function AdminSidebarNav({ onItemClick }: AdminSidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1" aria-label="Admin Navigation">
      {ADMIN_NAV_LINKS.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              isActive
                ? "bg-[#168B83] text-white font-bold shadow-xs"
                : "text-[#DCE4EE]/80 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon
              className={`h-4 w-4 shrink-0 ${
                isActive ? "text-white" : "text-[#168B83]"
              }`}
              aria-hidden="true"
            />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

