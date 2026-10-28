"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut, Bell, Search, Shield } from "lucide-react";
import { AdminSidebarNav, ADMIN_NAV_LINKS } from "./AdminSidebarNav";
import { Badge } from "@/components/ui/badge";

interface AdminHeaderProps {
  userFullName: string;
  userEmail: string;
  signOutAction: (formData: FormData) => void | Promise<void>;
}

export function AdminHeader({
  userFullName,
  userEmail,
  signOutAction,
}: AdminHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Find active link for breadcrumb
  const currentLink = ADMIN_NAV_LINKS.find((link) =>
    link.href === "/admin"
      ? pathname === "/admin"
      : pathname.startsWith(link.href)
  );

  return (
    <>
      <header className="h-16 border-b border-[#DCE4EE] bg-white px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
        {/* Left: Mobile hamburger & Breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-lg text-[#142541] hover:bg-[#F3F6FA] transition-colors"
            aria-label="Open administration menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs">
            <Link
              href="/admin"
              className="text-[#5F6F84] hover:text-[#3869AD] font-medium flex items-center gap-1"
            >
              <Shield className="h-3.5 w-3.5 text-[#3869AD]" />
              <span>Admin</span>
            </Link>
            {currentLink && currentLink.href !== "/admin" && (
              <>
                <span className="text-[#DCE4EE] font-semibold">/</span>
                <span className="font-bold text-[#142541]">{currentLink.label}</span>
              </>
            )}
          </nav>
        </div>

        {/* Right: Quick actions & Logged in profile */}
        <div className="flex items-center gap-3 sm:gap-5 text-xs">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F3F6FA] border border-[#DCE4EE] text-[#5F6F84]">
            <Search className="h-3.5 w-3.5 text-[#3869AD]" />
            <span className="text-[11px] font-mono">Asia/Kolkata (IST)</span>
          </div>

          <Link
            href="/admin/live-classes"
            className="relative p-2 rounded-lg text-[#5F6F84] hover:text-[#142541] hover:bg-[#F3F6FA] transition-colors"
            title="Class control center"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </Link>

          <div className="hidden sm:flex flex-col items-end text-right">
            <span className="font-bold text-[#142541] leading-tight truncate max-w-[150px]">
              {userFullName}
            </span>
            <span className="text-[10px] text-[#5F6F84] font-mono truncate max-w-[150px]">
              {userEmail}
            </span>
          </div>

          <Badge variant="teal" className="hidden sm:inline-flex text-[10px]">
            Admin
          </Badge>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 md:hidden bg-[#142541]/60 backdrop-blur-xs flex"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-72 max-w-[85vw] h-full bg-[#142541] text-white flex flex-col justify-between p-6 shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              {/* Header with Close Button */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 font-bold text-lg tracking-tight"
                >
                  <div className="relative h-8 w-8 rounded-lg overflow-hidden bg-[#03060C] border border-white/20 shadow-md shrink-0">
                    <Image
                      src="/icon.png"
                      alt="Syntaxora"
                      width={32}
                      height={32}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span>Syntaxora</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between">
                <span className="text-xs text-[#DCE4EE]/70 font-medium">Portal Scope</span>
                <Badge variant="teal">Administrator</Badge>
              </div>

              {/* Navigation Links */}
              <AdminSidebarNav onItemClick={() => setMobileMenuOpen(false)} />
            </div>

            {/* Mobile Footer & Sign Out */}
            <div className="p-4 border-t border-white/10 space-y-3 shrink-0 mt-6">
              <div className="px-2 text-xs truncate">
                <div className="font-semibold text-white truncate">{userFullName}</div>
                <div className="text-[#DCE4EE]/60 text-[11px] truncate">{userEmail}</div>
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
          </div>
        </div>
      )}
    </>
  );
}

