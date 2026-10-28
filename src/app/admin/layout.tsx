import React from "react";
import Link from "next/link";
import Image from "next/image";
import { LogOut } from "lucide-react";
import { requireRole } from "@/server/services/authService";
import { signOutAction } from "@/server/actions/auth";
import { Badge } from "@/components/ui/badge";
import { AdminSidebarNav } from "@/components/navigation/AdminSidebarNav";
import { AdminHeader } from "@/components/navigation/AdminHeader";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await requireRole(["admin"]);

  return (
    <div className="flex min-h-screen bg-[#F3F6FA]">
      {/* Desktop Sidebar Navigation - Fixed to viewport so it never scrolls with page */}
      <aside className="fixed top-0 left-0 bottom-0 w-64 h-screen border-r border-[#DCE4EE] bg-[#142541] text-white hidden md:flex flex-col justify-between shrink-0 z-30 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Brand Wordmark */}
          <Link href="/admin" className="flex items-center gap-2.5 font-bold text-lg tracking-tight">
            <div className="relative h-8 w-8 rounded-lg overflow-hidden bg-[#03060C] border border-white/20 shadow-md shrink-0">
              <Image
                src="/icon.png"
                alt="Syntaxora"
                width={32}
                height={32}
                className="h-full w-full object-cover"
              />
            </div>
            <span>Syntaxora <span className="text-gradient-ai-glow font-black text-xs ml-0.5">AI</span></span>
          </Link>

          <div className="px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between">
            <span className="text-xs text-[#DCE4EE]/70 font-medium">Portal Scope</span>
            <Badge variant="teal">Administrator</Badge>
          </div>

          {/* Navigation Links */}
          <AdminSidebarNav />
        </div>

        {/* User Identity & Sign Out */}
        <div className="p-4 border-t border-white/10 space-y-3 shrink-0 mt-auto">
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
      <div className="flex-1 md:ml-64 flex flex-col min-w-0 min-h-screen">
        <AdminHeader
          userFullName={auth.profile.full_name}
          userEmail={auth.email}
          signOutAction={signOutAction}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
