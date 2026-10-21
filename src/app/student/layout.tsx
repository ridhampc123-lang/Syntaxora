import React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  BookOpen,
  CalendarCheck,
  ClipboardList,
  Award,
  CheckSquare,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { requireRole } from "@/server/services/authService";
import { getStudentByProfileId } from "@/server/services/studentService";
import { signOutAction } from "@/server/actions/auth";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await requireRole(["student", "admin"]);
  const student = await getStudentByProfileId(auth.userId);

  const navLinks = [
    { href: "/student", label: "Dashboard", icon: LayoutDashboard },
    { href: "/student/courses", label: "Enrolled Tracks", icon: BookOpen },
    { href: "/student/classes", label: "Live Classes", icon: CalendarCheck },
    { href: "/student/assignments", label: "Assignments & Labs", icon: ClipboardList },
    { href: "/student/grades", label: "Released Grades", icon: Award },
    { href: "/student/attendance", label: "Attendance Log", icon: CheckSquare },
  ];

  return (
    <div className="min-h-screen bg-[#F3F6FA] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#142541] text-white flex flex-col shrink-0 border-r border-[#142541]">
        {/* Brand */}
        <div className="p-6 border-b border-white/10">
          <Link href="/student" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[#3869AD] text-white font-extrabold flex items-center justify-center text-sm shadow-md">
              S
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight block">Syntaxora</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#3869AD] block">
                Student Portal
              </span>
            </div>
          </Link>
        </div>

        {/* Student Code Badge */}
        <div className="p-4 mx-4 my-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-[#3869AD] text-white flex items-center justify-center font-bold text-xs shrink-0">
            {auth.profile.full_name?.charAt(0) || "S"}
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-bold truncate text-white">
              {auth.profile.full_name}
            </div>
            <div className="text-[10px] text-[#3869AD] font-mono tracking-wider font-semibold">
              {student?.student_code || "STUDENT"}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-[#DCE4EE] hover:text-white hover:bg-white/10 transition-colors"
              >
                <Icon className="h-4 w-4 text-[#3869AD]" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 space-y-2 text-xs">
          <Link
            href="/"
            className="flex items-center gap-2 text-[#DCE4EE]/70 hover:text-white transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Public Website
          </Link>
          <form action={signOutAction} className="pt-2">
            <button
              type="submit"
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-[#DCE4EE] px-8 flex items-center justify-between shrink-0 shadow-xs">
          <div className="text-xs font-bold text-[#5F6F84] uppercase tracking-wider">
            Academy Learning Environment
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="font-mono text-[#3869AD] font-bold">
              {student?.student_code}
            </span>
            <span className="text-[#5F6F84]">({auth.email})</span>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
