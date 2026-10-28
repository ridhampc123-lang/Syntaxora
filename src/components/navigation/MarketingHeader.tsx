"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { label: "Courses", href: "/courses" },
  { label: "Learning Pathways", href: "/programs" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Faculty", href: "/instructors" },
  { label: "About", href: "/about" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export function MarketingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 12);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on Esc key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        isScrolled
          ? "border-b border-[#DDE2E7] bg-[#FAF8F3]/95 backdrop-blur-md shadow-[0_1px_4px_rgba(23,36,58,0.03)]"
          : "border-b border-[#DDE2E7]/80 bg-[#FAF8F3]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Wordmark */}
        <Link
          href="/"
          className="flex items-center gap-3 group focus-visible:ring-2 focus-visible:ring-[#355F99] rounded-lg p-1"
          aria-label="Syntaxora AI Academy Homepage"
        >
          <div className="relative h-9 w-9 rounded-xl overflow-hidden shadow-sm transition-transform duration-200 group-hover:scale-105 border border-[#17243A]/10 bg-[#03060C] shrink-0">
            <Image
              src="/icon.png"
              alt="Syntaxora"
              width={36}
              height={36}
              className="h-full w-full object-cover"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl tracking-tight text-[#17243A] leading-tight">
              Syntaxora
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-[#687386]">
              <span className="text-gradient-ai font-extrabold mr-0.5">AI</span> Learning Academy
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav
          className="hidden lg:flex items-center gap-1 xl:gap-2"
          aria-label="Main Navigation"
        >
          {NAV_LINKS.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs xl:text-sm font-medium transition-colors rounded-md px-3 py-1.5 focus-visible:ring-2 focus-visible:ring-[#355F99] ${
                  isActive
                    ? "text-[#17243A] font-semibold bg-[#F0F2F4]"
                    : "text-[#354052] hover:text-[#17243A] hover:bg-[#F0F2F4]/60"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action CTAs */}
        <div className="hidden lg:flex items-center gap-3">
          <Link href="/login">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs font-semibold text-[#17243A]"
            >
              <User className="h-3.5 w-3.5 mr-1 text-[#687386]" aria-hidden="true" />
              Portal Sign In
            </Button>
          </Link>
          <Link href="/apply">
            <Button variant="ai" size="sm" className="text-xs font-bold shadow-xs">
              Apply for Admission
              <ArrowRight
                className="h-3.5 w-3.5 ml-1 arrow-icon"
                aria-hidden="true"
              />
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-[#17243A] hover:bg-[#F0F2F4] transition-colors focus:outline-none focus:ring-2 focus:ring-[#355F99]"
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

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="lg:hidden fixed inset-x-0 top-18 bottom-0 bg-[#17243A]/40 backdrop-blur-xs z-50 overflow-y-auto animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="bg-[#FAF8F3] border-b border-[#DDE2E7] px-5 pt-3 pb-8 space-y-5 shadow-xl max-h-[calc(100vh-4.5rem)] overflow-y-auto animate-fade-in-down"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#687386] px-3 pt-2 pb-1">
                Academy Navigation
              </span>
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-[#F0F2F4] text-[#17243A] font-semibold"
                        : "text-[#354052] hover:bg-[#F0F2F4] hover:text-[#17243A]"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="pt-4 border-t border-[#DDE2E7] space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#687386] px-3">
                Role Portals
              </span>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-lg border border-[#DDE2E7] bg-white text-xs font-semibold text-[#17243A] text-center hover:bg-[#F0F2F4]"
                >
                  Portal Sign In
                </Link>
                <Link
                  href="/sign-up?role=parent"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-lg border border-[#DDE2E7] bg-white text-xs font-semibold text-[#167F78] text-center hover:bg-[#F0F2F4]"
                >
                  Parent Sign Up
                </Link>
              </div>

              <div className="pt-2">
                <Link
                  href="/apply"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full block"
                >
                  <Button variant="ai" size="md" className="w-full justify-center font-bold">
                    Apply for Admission
                    <ArrowRight className="h-4 w-4 ml-1.5" aria-hidden="true" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
