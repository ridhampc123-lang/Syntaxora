import React from "react";
import Link from "next/link";
import { HowItWorksTabs } from "@/components/marketing/HowItWorksTabs";

export const metadata = {
  title: "How Learning & Student Connection Works — Syntaxora AI Academy",
  description:
    "Explore our complete educational process for students and parents: from cohort admission applications and permanent student codes to live studio sessions and parent guardian oversight.",
};

export default function HowItWorksPage() {
  return (
    <div className="bg-[#FAF8F3] min-h-screen py-12 lg:py-18 text-[#354052]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="text-xs text-[#687386]">
          <ol className="flex items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-[#17243A]">
                Home
              </Link>
            </li>
            <li>/</li>
            <li className="font-semibold text-[#17243A]">How Learning Works</li>
          </ol>
        </nav>

        {/* Editorial Header */}
        <div className="space-y-4 max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-wider text-gradient-ai">
            Syntaxora Educational Architecture
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#17243A] leading-tight">
            How <span className="text-gradient-ai">AI</span> learning &amp; guardian oversight works at our academy.
          </h1>
          <p className="text-base sm:text-lg text-[#687386] leading-relaxed font-normal">
            We operate on a transparent educational model: small live cohorts, selective admission placement, and zero-trust minor privacy. Select below to explore the student learning path or parent oversight process.
          </p>
        </div>

        {/* Interactive Tabs for Students & Parents */}
        <HowItWorksTabs />
      </div>
    </div>
  );
}
