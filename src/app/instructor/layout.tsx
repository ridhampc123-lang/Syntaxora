import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  CalendarCheck,
  ClipboardList,
  CheckSquare,
  GraduationCap,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { requireRole } from "@/server/services/authService";
import { signOutAction } from "@/server/actions/auth";

export default async function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await requireRole(["instructor", "admin"]);

  const navLinks = [
    { href: "/instructor", label: "Overview", icon: LayoutDashboard },
    { href: "/instructor/sessions", label: "Class Sessions", icon: CalendarCheck },
    { href: "/instructor/attendance", label: "Attendance Roster", icon: CheckSquare },
    { href: "/instructor/assignments", label: "Assignments", icon: ClipboardList },
    { href: "/instructor/submissions", label: "Submissions & Grading", icon: GraduationCap },
  ];

  return (
    <div className="min-h-screen bg-[#F3F6FA] flex">
      {/* Sidebar - Fixed to viewport so it never scrolls with page */}
      <aside className="fixed top-0 left-0 bottom-0 w-64 h-screen bg-[#142541] text-white flex flex-col shrink-0 border-r border-[#142541] z-30 overflow-y-auto">
        {/* Brand */}
        <div className="p-6 border-b border-white/10 shrink-0">
          <Link href="/instructor" className="flex items-center gap-2.5">
            <div className="relative h-8 w-8 rounded-lg overflow-hidden bg-[#03060C] border border-white/20 shadow-md shrink-0">
              <Image
                src="/icon.png"
                alt="Syntaxora"
                width={32}
                height={32}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight block">Syntaxora</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#168B83] block">
                Faculty Portal
              </span>
            </div>
          </Link>
        </div>

        {/* User Badge */}
        <div className="p-4 mx-4 my-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3 shrink-0">
          <div className="h-9 w-9 rounded-full bg-[#168B83] text-white flex items-center justify-center font-bold text-xs shrink-0">
            {auth.profile.full_name?.charAt(0) || "F"}
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-bold truncate text-white">
              {auth.profile.full_name}
            </div>
            <div className="text-[10px] text-[#DCE4EE]/70 truncate uppercase tracking-wider font-semibold">
              {auth.profile.role}
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
                <Icon className="h-4 w-4 text-[#168B83]" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer links */}
        <div className="p-4 border-t border-white/10 space-y-2 text-xs shrink-0 mt-auto">
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

      {/* Main Content */}
      <div className="flex-1 ml-64 flex flex-col min-w-0 min-h-screen">
        <header className="h-16 bg-white border-b border-[#DCE4EE] px-8 flex items-center justify-between shrink-0 shadow-xs sticky top-0 z-20">
          <div className="text-xs font-bold text-[#5F6F84] uppercase tracking-wider">
            Faculty Teaching Space
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-[#142541]">
              {auth.email}
            </span>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
