import React from "react";
import { Alert } from "@/components/ui/alert";

export const metadata = {
  title: "Terms of Service — Syntaxora AI Academy",
  description:
    "Terms of service, live classroom code of conduct, and enrollment conditions for Syntaxora learners.",
};

export default function TermsOfServicePage() {
  return (
    <div className="bg-[#F3F6FA] min-h-screen py-12 lg:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#142541] tracking-tight">
            Terms of Service
          </h1>
          <p className="text-xs text-[#5F6F84] mt-1">
            Last Updated: October 2026 • Academy Operating Rules
          </p>
        </div>

        <Alert variant="warning" title="Draft Agreement — Owner Review Notice">
          These Terms of Service represent the operational and classroom policy guidelines for Syntaxora. They require legal counsel review prior to entering commercial binding agreements with students and guardians.
        </Alert>

        <div className="rounded-2xl border border-[#DCE4EE] bg-white p-8 sm:p-12 space-y-6 text-sm text-[#263449] leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#142541]">1. Acceptance of Terms</h2>
            <p>
              By enrolling in Syntaxora courses, accessing student or guardian portals, or attending live interactive cohorts, you agree to comply with these Terms of Service and our Classroom Code of Conduct.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#142541]">2. Live Classroom Code of Conduct</h2>
            <p>
              Syntaxora fosters a supportive, respectful, and focused learning environment:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[#5F6F84]">
              <li>Harassment, bullying, offensive language, or disruptions during live video classes will result in immediate suspension.</li>
              <li>Students must respect the intellectual property and code submissions of their peers.</li>
              <li>Unauthorized recording or redistribution of live classroom feeds or fellow student cameras is strictly prohibited.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#142541]">3. Account Security & Verification</h2>
            <p>
              Users are responsible for safeguarding login credentials. Parents and guardians must not share account credentials with third parties. Any unauthorized access must be reported to <a href="mailto:security@syntaxora.com" className="text-[#3869AD] underline">security@syntaxora.com</a> immediately.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#142541]">4. Tuition, Cancellations & Refunds</h2>
            <p>
              Tuition fees are stated in full prior to cohort enrollment. Cohort transfers or cancellations requested more than 7 days prior to the first scheduled live session are eligible for full transfer or documented refund processing.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#142541]">5. Academic Integrity</h2>
            <p>
              While Syntaxora teaches students how to use AI tools responsibly, homework submissions and capstone projects must reflect the student&apos;s genuine comprehension and original effort as specified in instructor guidelines.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
