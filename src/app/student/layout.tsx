import React from "react";
import Link from "next/link";
import Image from "next/image";
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
import {
  getStudentByProfileId,
  getStudentAssignments,
  getStudentSessions,
} from "@/server/services/studentService";
import { signOutAction } from "@/server/actions/auth";
import { StudentSidebarNav } from "@/components/navigation/StudentSidebarNav";
import { CopyStudentCodeButton } from "@/components/dashboards/CopyStudentCodeButton";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await requireRole(["student", "admin"]);
  const student = await getStudentByProfileId(auth.userId);

  // STRICT SECURITY INVARIANT: Deny student-portal access if unverified, inactive, suspended, or not linked
  if (auth.profile.role === "student" && (!student || student.status !== "active")) {
    return (
      <div className="min-h-screen bg-[#F3F6FA] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-[#DCE4EE] p-8 text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <span className="text-xl font-bold">!</span>
          </div>
          <h2 className="text-xl font-extrabold text-[#142541]">Student Account Restricted</h2>
          <p className="text-xs text-[#5F6F84] leading-relaxed">
            {student
              ? `Your student enrollment is currently marked as "${student.status}". Access to the learning portal is restricted.`
              : "No active student record is associated with your account. Student accounts require an approved application and administrative provisioning."}
          </p>
          <div className="pt-4 border-t border-[#DCE4EE] flex justify-center gap-3">
            <form action={signOutAction}>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#F3F6FA] text-xs font-semibold text-[#5F6F84] hover:bg-[#DCE4EE] transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </form>
            <Link
              href="/apply"
              className="px-4 py-2 rounded-lg bg-[#3869AD] text-xs font-semibold text-white hover:bg-[#2D558C] transition-colors"
            >
              Admissions Portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Fetch badge counts for navigation
  const [assignments, sessions] = student
    ? await Promise.all([
        getStudentAssignments(student.id),
        getStudentSessions(student.id),
      ])
    : [[], []];

  const pendingAssignmentsCount = assignments.filter((a) => !a.submission).length;
  const upcomingSessionsCount = sessions.filter((s) => s.status === "scheduled" || s.status === "in_progress").length;

  return (
    <div className="min-h-screen bg-[#F3F6FA] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-[#142541] via-[#0E1B31] to-[#0A1322] text-white flex flex-col shrink-0 border-r border-[#142541] shadow-xl z-20">
        {/* Brand */}
        <div className="p-5 border-b border-white/10">
          <Link href="/student" className="flex items-center gap-3">
            <div className="relative h-9 w-9 rounded-xl overflow-hidden bg-[#03060C] border border-white/20 shadow-md shrink-0 ring-1 ring-cyan-500/30">
              <Image
                src="/icon.png"
                alt="Syntaxora"
                width={36}
                height={36}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight block text-white">Syntaxora</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 block">
                Student Terminal
              </span>
            </div>
          </Link>
        </div>

        {/* Student Code & Profile Badge */}
        <div className="p-3.5 mx-3.5 my-3 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-between gap-2.5 backdrop-blur-xs">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#3869AD] to-[#168B83] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              {auth.profile.full_name?.charAt(0) || "S"}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold truncate text-white">
                {auth.profile.full_name}
              </div>
              <div className="text-[10px] text-cyan-300 font-mono tracking-wider font-semibold">
                {student?.student_code || "STUDENT"}
              </div>
            </div>
          </div>
          {student?.student_code && (
            <CopyStudentCodeButton studentCode={student.student_code} />
          )}
        </div>

        {/* Dynamic Navigation with Active Path Highlighting */}
        <StudentSidebarNav
          pendingAssignmentsCount={pendingAssignmentsCount}
          upcomingSessionsCount={upcomingSessionsCount}
        />

        {/* Footer */}
        <div className="p-4 border-t border-white/10 space-y-2 text-xs">
          <Link
            href="/"
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-[#DCE4EE]/70 hover:text-white hover:bg-white/5 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Public Website</span>
          </Link>
          <form action={signOutAction} className="pt-1">
            <button
              type="submit"
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-[#DCE4EE] px-8 flex items-center justify-between shrink-0 shadow-xs z-10">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Active Student Cohort</span>
            </div>
            <span className="hidden md:inline text-xs text-[#5F6F84]">
              Applied Artificial Intelligence & Robotics
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="hidden sm:flex items-center gap-2 bg-[#F3F6FA] px-3 py-1.5 rounded-lg border border-[#DCE4EE]">
              <span className="text-[11px] text-[#5F6F84]">Student Code:</span>
              <span className="font-mono text-[#142541] font-bold">
                {student?.student_code}
              </span>
            </div>
            <span className="text-[#5F6F84] font-medium text-[11px]">
              {auth.email}
            </span>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
