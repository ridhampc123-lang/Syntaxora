import React from "react";
import Link from "next/link";
import { Alert } from "@/components/ui/alert";

export const metadata = {
  title: "Privacy Policy & Minor Protection — Syntaxora AI Academy",
  description:
    "Information regarding our data collection, guardian oversight, and minor privacy protections at Syntaxora.",
};

export default function PrivacyPolicyPage() {
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
            <li className="font-semibold text-[#17243A]">Privacy Policy</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-gradient-ai">
            Legal & Data Governance
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#17243A]">
            Syntaxora <span className="text-gradient-ai">Artificial Intelligence</span> Privacy Policy & Minor Protection
          </h1>
          <p className="text-xs text-[#687386] pt-1">
            Last Updated: October 2026 • Governing all Syntaxora academy portals and marketing services
          </p>
        </div>

        <Alert variant="warning" title="Draft Policy Notice">
          This document represents the platform data governance architecture for Syntaxora. Before commercial launch, it should undergo formal legal counsel review in your operating jurisdiction.
        </Alert>

        {/* Policy Content */}
        <div className="rounded-2xl border border-[#DDE2E7] bg-white p-8 sm:p-12 space-y-8 text-sm text-[#354052] leading-relaxed shadow-sm animate-fade-in-up">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#17243A]">
              1. Commitment to Minor & Student Privacy
            </h2>
            <p>
              Syntaxora delivers online educational programs to children, teenagers, university students, and adults. We treat all student and family data with heightened care, following the principle of minimal data collection:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#687386]">
              <li>We collect only information strictly necessary to provide live learning instruction and maintain classroom safety.</li>
              <li>Date of birth is restricted and used solely for age-restricted cohort placement.</li>
              <li>Minor student profiles, assignments, code submissions, grades, and live sessions are strictly private and never publicly searchable or indexed.</li>
            </ul>
          </section>

          <section className="space-y-3 pt-4 border-t border-[#DDE2E7]">
            <h2 className="text-xl font-bold text-[#17243A]">
              2. Zero-Trust Guardian–Student Relationship Authorization
            </h2>
            <p>
              To protect family privacy, Syntaxora prohibits automatic account linking based solely on matching surnames, email domains, or phone numbers. Access to a student&apos;s educational records is granted only through an explicit, single-use cryptographically hashed invitation verified by an authorized guardian.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-[#DDE2E7]">
            <h2 className="text-xl font-bold text-[#17243A]">
              3. Information We Collect
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-[#687386]">
              <li>
                <strong className="text-[#17243A]">Account Credentials:</strong> Email addresses and hashed passwords managed securely via Supabase Auth.
              </li>
              <li>
                <strong className="text-[#17243A]">Academic Records:</strong> Cohort enrollments, live session attendance records, homework submissions, and instructor-released feedback.
              </li>
              <li>
                <strong className="text-[#17243A]">Guardian Details:</strong> Verified guardian contact information and explicitly granted relationship permissions.
              </li>
              <li>
                <strong className="text-[#17243A]">Payment Records:</strong> Transaction IDs, order numbers, and verified payment statuses. Syntaxora does not store raw credit card numbers or CVV codes on our servers.
              </li>
            </ul>
          </section>

          <section className="space-y-3 pt-4 border-t border-[#DDE2E7]">
            <h2 className="text-xl font-bold text-[#17243A]">
              4. Data Retention, Portability & Revocation
            </h2>
            <p>
              If a guardian relationship is revoked, access to student attendance and academic records is terminated immediately. Users may request account deletion or data portability by contacting <a href="mailto:privacy@syntaxora.com" className="text-[#355F99] font-medium underline">privacy@syntaxora.com</a>.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-[#DDE2E7]">
            <h2 className="text-xl font-bold text-[#17243A]">
              5. Child Data Protection Principles
            </h2>
            <p>
              Syntaxora adheres to child data protection guidelines, incorporating purpose limitation, verifiable parental consent mechanisms, and strict prohibition of behavioral profiling or targeted advertising directed toward children.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
