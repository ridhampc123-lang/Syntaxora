import React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  CalendarCheck,
  CheckSquare,
  Award,
  CreditCard,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { requireRole } from "@/server/services/authService";
import { getActiveChildrenForGuardian } from "@/server/services/guardianService";
import { signOutAction } from "@/server/actions/auth";

export default async function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await requireRole(["parent", "admin"]);
  const activeChildren = await getActiveChildrenForGuardian(auth.userId);

  const navLinks = [
    { href: "/parent", label: "Overview", icon: LayoutDashboard },
    { href: "/parent/attendance", label: "Attendance Record", icon: CheckSquare },
    { href: "/parent/progress", label: "Learning Progress & Grades", icon: Award },
    { href: "/parent/schedule", label: "Class Schedule", icon: CalendarCheck },
    { href: "/parent/billing", label: "Tuition & Invoices", icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-[#F3F6FA] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#142541] text-white flex flex-col shrink-0 border-r border-[#142541]">
        {/* Brand */}
        <div className="p-6 border-b border-white/10">
          <Link href="/parent" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[#168B83] text-white font-extrabold flex items-center justify-center text-sm shadow-md">
              S
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight block">Syntaxora</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#168B83] block">
                Parent Portal
              </span>
            </div>
          </Link>
        </div>

        {/* Parent Identity & Verified Children Badge */}
        <div className="p-4 mx-4 my-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-[#168B83] text-white flex items-center justify-center font-bold text-xs shrink-0">
              {auth.profile.full_name?.charAt(0) || "P"}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold truncate text-white">
                {auth.profile.full_name}
              </div>
              <div className="text-[10px] text-[#DCE4EE]/70 uppercase tracking-wider font-semibold">
                Authorized Guardian
              </div>
            </div>
          </div>
          <div className="pt-2 border-t border-white/10 text-[11px] text-[#DCE4EE]/80">
            Verified Links: <strong className="text-white">{activeChildren.length}</strong>
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
            Verified Guardian Oversight Portal
          </div>
          <div className="text-xs font-medium text-[#142541]">
            {auth.email}
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
