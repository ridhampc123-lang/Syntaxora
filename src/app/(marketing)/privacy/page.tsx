import React from "react";
import { Alert } from "@/components/ui/alert";

export const metadata = {
  title: "Privacy Policy — Syntaxora AI Academy",
  description:
    "Information regarding our data collection, guardian oversight, and minor privacy protections at Syntaxora.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-[#F3F6FA] min-h-screen py-12 lg:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#142541] tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs text-[#5F6F84] mt-1">
            Last Updated: October 2026 • Effective for all Syntaxora users
          </p>
        </div>

        <Alert variant="warning" title="Draft Policy — Owner Review Notice">
          This document represents the platform privacy and data architecture specification for Syntaxora. It must undergo formal legal counsel review before commercial launch in your operating jurisdiction.
        </Alert>

        <div className="rounded-2xl border border-[#DCE4EE] bg-white p-8 sm:p-12 space-y-6 text-sm text-[#263449] leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#142541]">1. Commitment to Minor & Student Privacy</h2>
            <p>
              Syntaxora delivers educational programs to children, teenagers, university students, and adults. We treat all student and family data with heightened care, following the principle of minimal data collection:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[#5F6F84]">
              <li>We collect only information strictly necessary to provide learning instruction and maintain classroom safety.</li>
              <li>Date of birth is strictly restricted and optional unless required for age-restricted cohort placement.</li>
              <li>Minor student profiles, assignments, progress, grades, and class recordings are never made publicly searchable.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#142541]">2. Guardian–Student Relationship Authorization</h2>
            <p>
              To protect family privacy, Syntaxora prohibits automatic account linkage based solely on matching surnames, email addresses, or phone numbers. Access to a student&apos;s educational records is granted only through an explicit, auditable invitation token verified by an authorized guardian.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#142541]">3. Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-1 text-[#5F6F84]">
              <li><strong>Account Credentials:</strong> Email address and hashed passwords managed securely via Supabase Auth.</li>
              <li><strong>Academic Records:</strong> Course enrollments, live session attendance, homework submissions, and instructor-released feedback.</li>
              <li><strong>Guardian Details:</strong> Verified guardian contact information and relationship permissions.</li>
              <li><strong>Payment Records:</strong> Transaction IDs, order numbers, and verified payment statuses. Syntaxora does not store raw credit card numbers or CVV codes.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#142541]">4. Data Retention & Revocation</h2>
            <p>
              If a guardian relationship is revoked, access to student attendance and academic records is terminated immediately. Users may request account deletion or data portability by emailing <a href="mailto:privacy@syntaxora.com" className="text-[#3869AD] underline">privacy@syntaxora.com</a>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#142541]">5. Indian Data Protection Alignment</h2>
            <p>
              Syntaxora is designed in alignment with Indian digital personal data protection principles, respecting lawful purpose limitation, explicit consent mechanisms for children&apos;s data, and verifiable parental consent.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
