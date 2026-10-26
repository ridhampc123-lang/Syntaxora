import React from "react";
import Link from "next/link";
import { ArrowRight, HelpCircle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

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
        a: "Our programs are categorized by cognitive developmental stages: Young Learners (ages 7–11) focus on visual logic and pattern games; Teens (ages 12–17) transition to authentic Python and computer vision. If your child has an advanced coding background, contact admissions for a placement assessment.",
      },
      {
        q: "What is the typical class size for live cohorts?",
        a: "Live cohort sizes are kept small (typically 8–14 students) to ensure instructors can inspect each learner's code, debug errors in real time, and answer questions interactively.",
      },
      {
        q: "What happens if we enroll midway through a cohort cycle?",
        a: "Cohorts launch on fixed dates each month. If a cohort is full or in progress, admissions will place you into the next upcoming session.",
      },
      {
        q: "Why can't students create an account directly through self-signup?",
        a: "To ensure student safety, maintain high-calibre class participation, and match learners to the appropriate curriculum level, all student accounts are provisioned exclusively after faculty application review at /apply.",
      },
    ],
  },
  {
    category: "Live Classes & Studio Attendance",
    items: [
      {
        q: "How are live class sessions conducted?",
        a: "Classes are held via secured live video sessions directly linked from the Student Portal. Meeting links are protected and visible only to actively enrolled students and assigned instructors.",
      },
      {
        q: "What if a student misses a session?",
        a: "All lessons have structured notes, recorded walkthroughs, and lab exercises available in the Student Portal. Instructors record attendance with official audit reasons, which are immediately visible to linked parents.",
      },
      {
        q: "Are the live classes interactive or lecture-based?",
        a: "Classes are studio-style engineering workshops. Faculty introduce concepts briefly, then students code locally while the instructor inspects terminals and debugs errors collaboratively.",
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
        a: "Yes. Each guardian relationship is authorized and audited independently in our database.",
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
      {
        q: "Do young learners need Python installed before their first class?",
        a: "No. The Young Explorers track starts with browser-based interactive sandboxes. Instructors guide high-school and college students through local environment setup in their first orientation session.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="bg-[#FAF8F3] min-h-screen py-12 lg:py-18 text-[#354052]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="text-xs text-[#687386]">
          <ol className="flex items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-[#17243A]">
                Home
              </Link>
            </li>
            <li>/</li>
            <li className="font-semibold text-[#17243A]">FAQ</li>
          </ol>
        </nav>

        {/* Editorial Header */}
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-gradient-ai">
            Frequently Asked Questions
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#17243A]">
            Answers about our <span className="text-gradient-ai">AI</span> Academy cohorts.
          </h1>
          <p className="text-base text-[#687386] leading-relaxed max-w-2xl font-normal">
            Information regarding our admissions process, cohort sizes, live classes, hardware requirements, and guardian privacy.
          </p>
        </div>

        {/* Categorized FAQs */}
        <Reveal>
          <div className="space-y-10">
            {FAQ_SECTIONS.map((section) => (
              <div key={section.category} className="space-y-4">
                <h2 className="text-lg font-bold text-[#17243A] border-b border-[#DDE2E7] pb-2">
                  {section.category}
                </h2>
                <div className="space-y-3">
                  {section.items.map((item, idx) => (
                    <details
                      key={idx}
                      className="group rounded-2xl border border-[#DDE2E7] bg-white p-6 transition-all duration-200 open:shadow-sm open:border-[#355F99]/60 hover:border-[#355F99]/40"
                    >
                      <summary className="flex cursor-pointer items-center justify-between font-bold text-sm sm:text-base text-[#17243A] focus-visible:outline-none list-none select-none">
                        <span>{item.q}</span>
                        <span className="ml-4 h-6 w-6 rounded-full bg-[#FAF8F3] border border-[#DDE2E7] flex items-center justify-center text-[#355F99] group-open:rotate-180 transition-transform duration-200 shrink-0">
                          <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                        </span>
                      </summary>
                      <p className="mt-3.5 text-xs sm:text-sm text-[#687386] leading-relaxed pt-3 border-t border-[#DDE2E7]/60">
                        {item.a}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Still Have Questions Box */}
        <Reveal delay={100}>
          <div className="rounded-2xl border border-[#DDE2E7] bg-white p-8 sm:p-10 text-center space-y-4 shadow-sm card-editorial">
            <div className="h-10 w-10 rounded-xl bg-[#EAF0F8] text-[#355F99] flex items-center justify-center mx-auto">
              <HelpCircle className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-bold text-[#17243A]">Still Have Questions?</h3>
            <p className="text-sm text-[#687386] max-w-md mx-auto leading-relaxed">
              Our admissions counselors can evaluate your learner&apos;s specific background and recommend the optimal cohort.
            </p>
            <div className="pt-2">
              <Link href="/contact">
                <Button variant="primary" size="md" className="font-semibold">
                  Contact Admissions Support
                  <ArrowRight className="h-4 w-4 ml-1.5 arrow-icon" aria-hidden="true" />
                </Button>
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
