"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Menu, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { label: "Courses", href: "/courses" },
  { label: "Programs", href: "/programs" },
  { label: "Admissions", href: "/apply" },
  { label: "About", href: "/about" },
  { label: "Instructors", href: "/instructors" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export function MarketingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#DCE4EE] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Wordmark */}
        <Link
          href="/"
          className="flex items-center gap-2.5 font-bold text-xl text-[#142541] tracking-tight focus-visible:ring-2 focus-visible:ring-[#3869AD] rounded-lg p-1"
        >
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-[#142541] to-[#3869AD] flex items-center justify-center text-white shadow-sm">
            <Sparkles className="h-5 w-5 text-white" aria-hidden="true" />
          </div>
          <span className="flex items-center gap-1.5">
            Syntaxora
            <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-[#E8EFF8] text-[#3869AD]">
              AI Academy
            </span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-5" aria-label="Main Navigation">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-[#3869AD] focus-visible:ring-2 focus-visible:ring-[#3869AD] rounded px-2 py-1 ${
                  isActive ? "text-[#3869AD] font-semibold" : "text-[#263449]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action CTAs */}
        <div className="hidden md:flex items-center gap-2.5">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
          <Link href="/apply">
            <Button variant="primary" size="sm">
              Apply for Admission
              <ArrowRight className="h-4 w-4 ml-1" aria-hidden="true" />
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-[#263449] hover:bg-[#F3F6FA] focus:outline-none focus:ring-2 focus:ring-[#3869AD]"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#DCE4EE] bg-white px-4 pt-2 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-medium text-[#263449] hover:bg-[#F3F6FA] hover:text-[#3869AD]"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="pt-3 border-t border-[#DCE4EE] flex flex-col gap-2">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full">
              <Button variant="outline" size="md" className="w-full justify-center">
                Sign In
              </Button>
            </Link>
            <Link href="/courses" onClick={() => setMobileMenuOpen(false)} className="w-full">
              <Button variant="primary" size="md" className="w-full justify-center">
                Explore Courses
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
