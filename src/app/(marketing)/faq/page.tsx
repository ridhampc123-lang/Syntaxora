import React from "react";
import Link from "next/link";
import { ArrowRight, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Frequently Asked Questions — Syntaxora AI Academy",
  description:
    "Common questions regarding course placement, live class attendance, hardware requirements, tuition, and guardian oversight.",
};

const FAQ_SECTIONS = [
  {
    category: "Admissions & Course Placement",
    items: [
      {
        q: "How do I choose the correct learning track for my child?",
        a: "Our programs are categorized by cognitive developmental stages: Young Learners (ages 7–11) focus on visual logic and pattern games; Teens (ages 12–17) transition to authentic Python and computer vision. If your child has advanced coding background, contact admissions for a placement assessment.",
      },
      {
        q: "What is the typical class size for live cohorts?",
        a: "Live cohort sizes are kept small (typically 8–14 students) to ensure instructors can inspect each learner's code, debug errors in real time, and answer questions interactively.",
      },
      {
        q: "What happens if we enroll midway through a cohort cycle?",
        a: "Cohorts launch on fixed dates each month. If a cohort is full or in progress, admissions will place you into the next upcoming session.",
      },
    ],
  },
  {
    category: "Live Classes & Attendance",
    items: [
      {
        q: "How are live class sessions conducted?",
        a: "Classes are held via secured live video sessions directly linked from the Student Portal. Meeting links are protected and visible only to actively enrolled students and assigned instructors.",
      },
      {
        q: "What if a student misses a session?",
        a: "All lessons have structured notes and exercise walkthroughs available in the Student Portal. Instructors record attendance with official audit reasons, which are immediately visible to linked parents.",
      },
    ],
  },
  {
    category: "Guardian Portal & Minor Privacy",
    items: [
      {
        q: "Why do parents need an invitation to view student data?",
        a: "We enforce zero-trust privacy for minors. Guardian accounts are never linked automatically based on matching surnames or email domains. An explicit, single-use cryptographically hashed invitation is required to bind a guardian to a student.",
      },
      {
        q: "What data can a verified parent see?",
        a: "Verified parents can monitor live class attendance, assignment submission status, instructor-released grades, upcoming class calendars, and payment receipts. Each category is governed by explicit permission flags.",
      },
      {
        q: "Can multiple parents or guardians link to the same student?",
        a: "Yes. Each guardian relationship is authorized and audited independently.",
      },
    ],
  },
  {
    category: "Technical & Hardware Requirements",
    items: [
      {
        q: "What computer specs are required for AI and robotics coursework?",
        a: "A desktop or laptop running Windows 10/11, macOS, or modern Linux with at least 8GB RAM, a working webcam, and a microphone. For college and adult deep learning courses, compute-intensive model training is conducted on cloud instances, avoiding costly local GPU requirements.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="bg-[#F3F6FA] min-h-screen py-12 lg:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-[#E8EFF8] text-[#3869AD] flex items-center justify-center mx-auto">
            <HelpCircle className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#142541] tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-base text-[#5F6F84]">
            Answers to common questions regarding admissions, pedagogy, live classes, and guardian privacy.
          </p>
        </div>

        {/* Categorized FAQs */}
        <div className="space-y-10">
          {FAQ_SECTIONS.map((section) => (
            <div key={section.category} className="space-y-4">
              <h2 className="text-lg font-bold text-[#142541] border-b border-[#DCE4EE] pb-2">
                {section.category}
              </h2>
              <div className="space-y-3">
                {section.items.map((item, idx) => (
                  <details
                    key={idx}
                    className="group rounded-xl border border-[#DCE4EE] bg-white p-5 transition-colors open:border-[#3869AD]"
                  >
                    <summary className="flex cursor-pointer items-center justify-between font-semibold text-sm text-[#142541] focus-visible:outline-none">
                      <span>{item.q}</span>
                      <span className="ml-4 text-xs font-bold text-[#3869AD] group-open:rotate-180 transition-transform">
                        ▼
                      </span>
                    </summary>
                    <p className="mt-3 text-xs sm:text-sm text-[#5F6F84] leading-relaxed">
                      {item.a}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Still Have Questions CTA */}
        <div className="rounded-2xl border border-[#DCE4EE] bg-white p-8 text-center space-y-4">
          <h3 className="text-xl font-bold text-[#142541]">Still Have Questions?</h3>
          <p className="text-sm text-[#5F6F84] max-w-md mx-auto">
            Our admissions counselors can evaluate your specific background and help you choose the right path.
          </p>
          <Link href="/contact">
            <Button variant="primary" size="md">
              Speak with Admissions
              <ArrowRight className="h-4 w-4 ml-1.5" aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
