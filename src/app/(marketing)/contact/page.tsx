import React from "react";
import Link from "next/link";
import { Mail, Clock, ShieldCheck } from "lucide-react";
import { ContactForm } from "@/components/forms/ContactForm";

export const metadata = {
  title: "Contact Admissions & Student Support — Syntaxora",
  description:
    "Connect with our admissions team for personalized guidance on course placement, cohort schedules, and guardian enrollment.",
};

export default function ContactPage() {
  return (
    <div className="bg-[#FAF8F3] min-h-screen py-12 lg:py-18 text-[#354052]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="text-xs text-[#687386]">
          <ol className="flex items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-[#17243A]">
                Home
              </Link>
            </li>
            <li>/</li>
            <li className="font-semibold text-[#17243A]">Contact Admissions</li>
          </ol>
        </nav>

        {/* Editorial Header */}
        <div className="space-y-3 max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-gradient-ai">
            Advisory & Admissions Support
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#17243A]">
            Contact <span className="text-gradient-ai">Artificial Intelligence</span> Admissions & Faculty Support
          </h1>
          <p className="text-base text-[#687386] leading-relaxed font-normal">
            Have questions regarding age placement, hardware prerequisites, cohort schedules, or guardian portal linking? Our admissions advisors are available to assist.
          </p>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Information Column */}
          <div className="lg:col-span-5 space-y-6 animate-fade-in-up">
            <div className="rounded-2xl border border-[#DDE2E7] bg-white p-7 sm:p-8 space-y-6 shadow-sm card-editorial">
              <h2 className="text-xl font-bold text-[#17243A]">Direct Enquiries</h2>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-[#EAF0F8] text-[#355F99] flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div>
                    <span className="font-bold text-[#17243A] block">Admissions Email</span>
                    <a
                      href="mailto:admissions@syntaxora.com"
                      className="text-[#355F99] hover:underline font-semibold"
                    >
                      admissions@syntaxora.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-[#E7F5F4] text-[#167F78] flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div>
                    <span className="font-bold text-[#17243A] block">Advisory Hours</span>
                    <span className="text-[#687386] text-xs">
                      Monday – Friday: 9:00 AM – 6:00 PM IST
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-[#FAF8F3] border border-[#DDE2E7] text-[#17243A] flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div>
                    <span className="font-bold text-[#17243A] block">Guardian Verification Support</span>
                    <span className="text-[#687386] text-xs">
                      Assistance with cryptographic invitation tokens and parent permissions
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#DDE2E7] bg-[#EAF0F8]/70 p-6 text-xs text-[#17243A] space-y-2 card-editorial">
              <span className="font-bold uppercase tracking-wider text-[#355F99] block text-[11px]">
                Admissions Privacy Commitment
              </span>
              <p className="leading-relaxed text-[#354052]">
                All submitted enquiries receive a direct response from an academic coordinator within 24 business hours. We never share student or guardian contact information with third-party marketers.
              </p>
            </div>
          </div>

          {/* Form Column */}
          <div className="lg:col-span-7 rounded-2xl border border-[#DDE2E7] bg-white p-7 sm:p-10 shadow-sm space-y-6 animate-fade-in-up animation-delay-150 card-editorial">
            <div>
              <h2 className="text-2xl font-bold text-[#17243A]">Send an Admissions Enquiry</h2>
              <p className="text-xs text-[#687386] mt-1">
                Fill in the details below and an admissions counselor will reach out directly.
              </p>
            </div>

            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
