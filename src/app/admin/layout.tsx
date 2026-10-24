import React from "react";
import Link from "next/link";
import {
  Sparkles,
  LayoutDashboard,
  Users,
  ShieldCheck,
  BookOpen,
  GraduationCap,
  CalendarCheck,
  Mail,
  FileText,
  LogOut,
  UserCheck,
  ClipboardList,
  Layers,
  Video,
} from "lucide-react";
import { requireRole } from "@/server/services/authService";
import { signOutAction } from "@/server/actions/auth";
import { Badge } from "@/components/ui/badge";

const ADMIN_LINKS = [
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
  { label: "Admissions Enquiries", href: "/admin/enquiries", icon: Mail },
  { label: "Audit Logs", href: "/admin/audit-logs", icon: FileText },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await requireRole(["admin"]);

  return (
    <div className="flex min-h-screen bg-[#F3F6FA]">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-[#DCE4EE] bg-[#142541] text-white flex flex-col justify-between hidden md:flex shrink-0">
        <div className="p-6 space-y-6">
          {/* Brand Wordmark */}
          <Link href="/admin" className="flex items-center gap-2.5 font-bold text-lg tracking-tight">
            <div className="h-8 w-8 rounded-lg bg-[#3869AD] flex items-center justify-center text-white">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            </div>
            <span>Syntaxora</span>
          </Link>

          <div className="px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between">
            <span className="text-xs text-[#DCE4EE]/70 font-medium">Portal Scope</span>
            <Badge variant="teal">Administrator</Badge>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1" aria-label="Admin Navigation">
            {ADMIN_LINKS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-[#DCE4EE]/80 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <Icon className="h-4 w-4 shrink-0 text-[#168B83]" aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Identity & Sign Out */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="px-2 text-xs truncate">
            <div className="font-semibold text-white truncate">{auth.profile.full_name}</div>
            <div className="text-[#DCE4EE]/60 text-[11px] truncate">{auth.email}</div>
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-red-300 hover:bg-red-950/40 hover:text-red-200 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-[#DCE4EE] bg-white px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-semibold text-[#142541] uppercase tracking-wider">
              Administration Workspace
            </h1>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-[#5F6F84]">Logged in as:</span>
            <span className="font-bold text-[#142541]">{auth.profile.full_name}</span>
          </div>
        </header>

        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
