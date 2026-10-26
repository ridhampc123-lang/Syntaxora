import React from "react";
import Link from "next/link";
import { Alert } from "@/components/ui/alert";

export const metadata = {
  title: "Terms of Service — Syntaxora AI Academy",
  description:
    "Terms of service, live classroom code of conduct, and enrollment conditions for Syntaxora learners.",
};

export default function TermsOfServicePage() {
  return (
    <div className="bg-[#FAF8F3] min-h-screen py-12 lg:py-18 text-[#354052]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="text-xs text-[#687386]">
          <ol className="flex items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-[#17243A]">
                Home
              </Link>
            </li>
            <li>/</li>
            <li className="font-semibold text-[#17243A]">Terms of Service</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-gradient-ai">
            Academy Operating Rules
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#17243A]">
            Syntaxora <span className="text-gradient-ai">AI</span> Terms of Service & Code of Conduct
          </h1>
          <p className="text-xs text-[#687386] pt-1">
            Last Updated: October 2026 • Effective for all enrolled students, guardians, and portal accounts
          </p>
        </div>

        <Alert variant="warning" title="Draft Agreement Notice">
          These Terms of Service represent the operational and classroom policy guidelines for Syntaxora. They require legal counsel review prior to entering commercial binding agreements with students and guardians in your operating jurisdiction.
        </Alert>

        {/* Terms Content */}
        <div className="rounded-2xl border border-[#DDE2E7] bg-white p-8 sm:p-12 space-y-8 text-sm text-[#354052] leading-relaxed shadow-sm animate-fade-in-up">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#17243A]">1. Acceptance of Terms</h2>
            <p>
              By enrolling in Syntaxora courses, accessing student or guardian portals, or attending live interactive cohorts, you agree to comply with these Terms of Service and our Classroom Code of Conduct.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-[#DDE2E7]">
            <h2 className="text-xl font-bold text-[#17243A]">2. Live Classroom Code of Conduct</h2>
            <p>
              Syntaxora fosters a supportive, respectful, and focused engineering environment:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#687386]">
              <li>Harassment, bullying, discriminatory language, or disruptions during live studio video classes will result in immediate suspension.</li>
              <li>Students must respect the intellectual property and code submissions of their peers.</li>
              <li>Unauthorized recording, screenshotting, or redistribution of live classroom feeds or fellow student video streams is strictly prohibited to protect student privacy.</li>
            </ul>
          </section>

          <section className="space-y-3 pt-4 border-t border-[#DDE2E7]">
            <h2 className="text-xl font-bold text-[#17243A]">3. Account Security & Verification</h2>
            <p>
              Users are responsible for safeguarding login credentials. Parents and guardians must not share account credentials with unauthorized third parties. Any security concerns must be reported to <a href="mailto:security@syntaxora.com" className="text-[#355F99] font-medium underline">security@syntaxora.com</a> immediately.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-[#DDE2E7]">
            <h2 className="text-xl font-bold text-[#17243A]">4. Tuition, Cohort Transfers & Cancellations</h2>
            <p>
              Tuition fees are stated in full prior to cohort allocation. Cohort transfers or cancellations requested more than 7 days prior to the first scheduled live session are eligible for full cohort transfer or documented refund processing.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-[#DDE2E7]">
            <h2 className="text-xl font-bold text-[#17243A]">5. Academic Integrity & Responsible AI Use</h2>
            <p>
              While Syntaxora teaches students how to use AI tools responsibly, homework submissions and capstone projects must reflect the student&apos;s genuine comprehension and original effort as specified in instructor guidelines.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
