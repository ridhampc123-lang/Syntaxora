"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  CheckSquare,
  Award,
  CreditCard,
} from "lucide-react";

export function ParentSidebarNav() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/parent", label: "Overview", icon: LayoutDashboard },
    { href: "/parent/attendance", label: "Attendance Record", icon: CheckSquare },
    { href: "/parent/progress", label: "Learning Progress & Grades", icon: Award },
    { href: "/parent/schedule", label: "Class Schedule & Labs", icon: CalendarCheck },
    { href: "/parent/billing", label: "Tuition & Invoices", icon: CreditCard },
  ];

  return (
    <nav className="flex-1 px-3 py-2 space-y-1">
      {navLinks.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/parent"
            ? pathname === "/parent"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              isActive
                ? "bg-gradient-to-r from-[#168B83] to-[#147972] text-white shadow-md font-bold"
                : "text-[#DCE4EE] hover:text-white hover:bg-white/10"
            }`}
          >
            <Icon
              className={`h-4 w-4 ${
                isActive ? "text-white" : "text-[#168B83]"
              }`}
            />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
