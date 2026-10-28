"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Compass,
  FileCheck,
  Video,
  ShieldCheck,
  ArrowRight,
  GraduationCap,
  Users,
  CheckCircle2,
  Calendar,
  Award,
  KeyRound,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AIHighlight } from "@/components/ui/ai-highlight";

interface Step {
  step: string;
  title: string;
  subtitle: string;
  description: string;
  highlightPoints: string[];
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
  badgeVariant?: "primary" | "teal" | "navy" | "outline" | "secondary";
  actionLink?: {
    href: string;
    label: string;
  };
}

const STUDENT_STEPS: Step[] = [
  {
    step: "01",
    title: "Explore Age-Matched AI Tracks",
    subtitle: "Real Python, Computer Vision, Deep Learning & Generative AI",
    description:
      "Review our 4 specialized learning pathways tailored for Young Learners (ages 7–11), Teens (ages 12–17), College Scholars, and Working Professionals. Each track has clearly defined prerequisite skillsets and practical capstone deliverables.",
    highlightPoints: [
      "Young Explorers: Visual block logic, sensor interaction & playful AI puzzles",
      "Teens: Hands-on OpenCV image recognition & interactive Python AI apps",
      "College & Pro: PyTorch neural architectures, backpropagation & enterprise RAG pipelines",
    ],
    icon: Compass,
    badge: "Curriculum Discovery",
    badgeVariant: "primary",
    actionLink: {
      href: "/courses",
      label: "Browse Cohort Catalog",
    },
  },
  {
    step: "02",
    title: "Submit an Admission Application",
    subtitle: "Selective cohort admission — no direct student self-signup",
    description:
      "Unlike ordinary pre-recorded tutorial sites, Syntaxora conducts live cohort classes. Prospective students complete the online application at /apply. You receive an immediate unique Application Reference Code (e.g. APP-8F39A1C2) to track review status.",
    highlightPoints: [
      "Select your desired course track and monthly cohort start date",
      "Share your educational background and technical interests",
      "Receive instant confirmation with a traceable application code",
    ],
    icon: FileCheck,
    badge: "Admissions Review",
    badgeVariant: "teal",
    actionLink: {
      href: "/apply",
      label: "Start Admission Application",
    },
  },
  {
    step: "03",
    title: "Faculty Placement & Permanent Student Code",
    subtitle: "Cohort allocation capped strictly at 8–14 learners",
    description:
      "Admissions coordinators and faculty evaluate prerequisite readiness and place students into balanced cohorts. Upon approval, you receive an official academy setup email with your unique permanent Student Code (e.g. STU-8F39A1C2).",
    highlightPoints: [
      "Small cohort guarantee ensures personal faculty attention",
      "Unique permanent Student Code (STU-XXXXXXXX) generated",
      "Secure single-use activation link dispatched to student inbox",
    ],
    icon: KeyRound,
    badge: "Account Provisioning",
    badgeVariant: "navy",
  },
  {
    step: "04",
    title: "Attend Live Video Studio Sessions",
    subtitle: "Interactive pair debugging, screen sharing & mentor labs",
    description:
      "Log in to the Student Portal to join scheduled live studio sessions via secure WebRTC video. Faculty mentors (Dr. Elena Vance, Marcus Chen, and Ananya Sharma) inspect code terminals, demonstrate model mechanics, and guide hands-on engineering.",
    highlightPoints: [
      "Live terminal inspection and real-time error debugging",
      "Direct Q&A with Stanford-credentialed and industry ML faculty",
      "Session recordings and shared code notebooks archived in portal",
    ],
    icon: Video,
    badge: "Live Mentorship",
    badgeVariant: "teal",
  },
  {
    step: "05",
    title: "Real Assignments & Verified AI Certification",
    subtitle: "Continuous code reviews, transparent grading & portfolio credentials",
    description:
      "Complete hands-on assignments (e.g., OpenCV color trackers, PyTorch tensor autograd, generative LLM agents). Faculty review submissions line-by-line and publish grades. Upon cohort completion, earn your accredited Syntaxora AI Credential.",
    highlightPoints: [
      "Submit Git repositories and code files directly in the portal",
      "Receive line-by-line feedback and rubric evaluations from instructors",
      "Earn industry-verifiable AI mastery certificates to showcase on resumes",
    ],
    icon: Award,
    badge: "Mastery & Portfolio",
    badgeVariant: "primary",
  },
];

const PARENT_STEPS: Step[] = [
  {
    step: "01",
    title: "Register a Dedicated Parent Portal Account",
    subtitle: "Independent guardian access layer with zero data leaks",
    description:
      "Parents and legal guardians register directly on our Parent Registration Portal (/sign-up). Unlike students (who enter through faculty review), parents can establish their account immediately to prepare for student monitoring.",
    highlightPoints: [
      "Instant guardian registration with full name, email, and secure password",
      "Dedicated portal dashboard designed specifically for learning oversight",
      "Compliant with FERPA and strict international minor privacy standards",
    ],
    icon: Users,
    badge: "Guardian Signup",
    badgeVariant: "primary",
    actionLink: {
      href: "/sign-up?role=parent",
      label: "Register Parent Account",
    },
  },
  {
    step: "02",
    title: "Connect to Your Child via Unique Student Code",
    subtitle: "Immediate link during registration or from your Parent Dashboard",
    description:
      "Every enrolled student has a permanent 12-character Student Code (e.g., STU-8F39A1C2). Simply enter this code during your registration or click 'Link Student' inside your Parent Dashboard. Alternatively, accept an encrypted invitation link sent to your email.",
    highlightPoints: [
      "Method 1: Enter your child's Student Code (STU-XXXXXXXX) directly",
      "Method 2: Accept a single-use token link sent by academy admissions",
      "Declare relationship type: Parent (Mother/Father) or Legal Guardian",
    ],
    icon: KeyRound,
    badge: "Student Linkage",
    badgeVariant: "teal",
  },
  {
    step: "03",
    title: "Zero-Trust Minor Privacy Verification",
    subtitle: "Strict access control to protect student data",
    description:
      "In accordance with our zero-trust minor safety policy, parent accounts have zero access to student records until the relationship is verified against academy records. This guarantees that no unauthorized third party can ever view your child's education records.",
    highlightPoints: [
      "Cryptographic access gating: records are restricted until approved",
      "Verified relationship linkage links guardian to authorized student ID",
      "Prevents student identity spoofing and unauthorized data harvesting",
    ],
    icon: ShieldCheck,
    badge: "FERPA / COPPA Safety",
    badgeVariant: "navy",
  },
  {
    step: "04",
    title: "Monitor Live Session Attendance & Schedule",
    subtitle: "Live cohort presence tracking & upcoming class dates",
    description:
      "Inside the Parent Portal (/parent), view real-time class attendance percentages (Present, Late, Excused, Absent) logged directly by faculty after each session. Check upcoming live class dates, cohort meeting schedules, and assigned instructors.",
    highlightPoints: [
      "Accurate attendance percentages updated immediately after each class",
      "Upcoming live class schedule calendar with session topics and times",
      "Instant visibility into instructor attendance notes and excused absences",
    ],
    icon: Calendar,
    badge: "Attendance Tracking",
    badgeVariant: "teal",
    actionLink: {
      href: "/parent",
      label: "Open Parent Portal",
    },
  },
  {
    step: "05",
    title: "Inspect Released Grades & Multi-Child Management",
    subtitle: "Transparent mentor evaluations & sibling management",
    description:
      "Review published assignment grades, mentor comments, and capstone project submissions. If you have more than one child enrolled in Syntaxora, seamlessly switch between siblings using the convenient Child Selector at the top of your dashboard.",
    highlightPoints: [
      "Read faculty feedback, score breakdowns, and homework submissions",
      "Inspect tuition payment receipts and enrolled cohort batch codes",
      "Connect and switch between multiple children from a single parent account",
    ],
    icon: Award,
    badge: "Grades & Multi-Child",
    badgeVariant: "primary",
  },
];

export function HowItWorksTabs() {
  const [activeTab, setActiveTab] = useState<"students" | "parents">("students");

  const currentSteps = activeTab === "students" ? STUDENT_STEPS : PARENT_STEPS;

  return (
    <div className="space-y-10">
      {/* Interactive Segmented Tabs Switcher */}
      <div className="flex flex-col items-center justify-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[#5F6F84]">
          Select Your Learning Perspective:
        </span>

        <div className="inline-flex p-1.5 rounded-2xl bg-white border border-[#DCE4EE] shadow-sm max-w-md w-full">
          <button
            type="button"
            onClick={() => setActiveTab("students")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
              activeTab === "students"
                ? "bg-[#142541] text-white shadow-md"
                : "text-[#5F6F84] hover:text-[#142541] hover:bg-[#F3F6FA]"
            }`}
          >
            <GraduationCap className={`h-4 w-4 ${activeTab === "students" ? "text-[#FF994B]" : "text-[#5F6F84]"}`} />
            <span>For Students</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              activeTab === "students" ? "bg-white/20 text-white" : "bg-[#E8EFF8] text-[#3869AD]"
            }`}>
              Learner Path
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("parents")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
              activeTab === "parents"
                ? "bg-[#142541] text-white shadow-md"
                : "text-[#5F6F84] hover:text-[#142541] hover:bg-[#F3F6FA]"
            }`}
          >
            <ShieldCheck className={`h-4 w-4 ${activeTab === "parents" ? "text-[#168B83]" : "text-[#5F6F84]"}`} />
            <span>For Parents &amp; Guardians</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              activeTab === "parents" ? "bg-white/20 text-white" : "bg-[#E8EFF8] text-[#3869AD]"
            }`}>
              Oversight
            </span>
          </button>
        </div>
      </div>

      {/* Tab Highlight Overview Banner */}
      <div className="rounded-2xl border border-[#DCE4EE] bg-white p-6 sm:p-8 shadow-xs animate-fade-in space-y-4">
        {activeTab === "students" ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#3869AD] flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#FF994B]" />
                Student Educational Roadmap
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#142541]">
                Hands-On <AIHighlight text="AI Learning" /> from Application to Portfolio
              </h2>
              <p className="text-xs sm:text-sm text-[#5F6F84] max-w-2xl leading-relaxed">
                Step-by-step walkthrough of how students apply, receive placement, attend live studio labs with Stanford-credentialed faculty, and earn certified project credentials.
              </p>
            </div>
            <Link href="/apply" className="shrink-0">
              <Button variant="ai" size="md" className="font-bold shadow-sm">
                Apply for Cohort
                <ArrowRight className="h-4 w-4 ml-1.5 arrow-icon" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#168B83] flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-[#168B83]" />
                Parent &amp; Guardian Connection Process
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#142541]">
                Zero-Trust <AIHighlight text="Student Linking" /> &amp; Real-Time Oversight
              </h2>
              <p className="text-xs sm:text-sm text-[#5F6F84] max-w-2xl leading-relaxed">
                Learn how parents create an account, connect directly to their enrolled student using their permanent Student Code (STU-XXXXXXXX), and track verified attendance and grades.
              </p>
            </div>
            <Link href="/sign-up?role=parent" className="shrink-0">
              <Button size="md" className="font-bold bg-[#168B83] hover:bg-[#116e68] text-white shadow-xs">
                Register Parent Account
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Steps Timeline Card Stack */}
      <div className="space-y-6">
        {currentSteps.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.step}
              className="rounded-2xl border border-[#DCE4EE] bg-white p-7 sm:p-9 shadow-xs hover:border-[#3869AD]/40 transition-all card-ai-glow group"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                {/* Step Number */}
                <div className="md:col-span-1 flex items-center justify-start">
                  <span className="font-display italic font-extrabold text-2xl sm:text-3xl text-[#3869AD] transition-transform group-hover:scale-105 duration-200">
                    {s.step}
                  </span>
                </div>

                {/* Content */}
                <div className="md:col-span-8 space-y-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg sm:text-xl font-bold text-[#142541] group-hover:text-[#3869AD] transition-colors">
                        <AIHighlight text={s.title} />
                      </h3>
                      <Badge variant={s.badgeVariant || "secondary"} className="text-[10px] font-bold">
                        {s.badge}
                      </Badge>
                    </div>
                    <p className="text-xs font-semibold text-[#168B83]">
                      {s.subtitle}
                    </p>
                  </div>

                  <p className="text-xs sm:text-sm text-[#263449] leading-relaxed">
                    {s.description}
                  </p>

                  {/* Bullet Highlights */}
                  <div className="space-y-1.5 pt-2 border-t border-[#DCE4EE]/70">
                    {s.highlightPoints.map((point, pIdx) => (
                      <div key={pIdx} className="flex items-start gap-2 text-xs text-[#5F6F84]">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#168B83] mt-0.5 shrink-0" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>

                  {/* Optional Action Link */}
                  {s.actionLink && (
                    <div className="pt-2">
                      <Link
                        href={s.actionLink.href}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3869AD] hover:underline"
                      >
                        <span>{s.actionLink.label}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  )}
                </div>

                {/* Step Icon Box */}
                <div className="md:col-span-3 flex md:justify-end items-center pt-2 md:pt-0">
                  <div className="h-14 w-14 rounded-2xl bg-[#F3F6FA] border border-[#DCE4EE] text-[#142541] flex items-center justify-center transition-transform group-hover:scale-105 duration-200 shadow-2xs">
                    <Icon className="h-6 w-6 text-[#3869AD]" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Special Feature Box: Student Code Breakdown (Shown prominently on both tabs) */}
      <div className="rounded-2xl border border-[#3869AD]/30 bg-[#E8EFF8]/40 p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#3869AD] flex items-center gap-1.5">
              <KeyRound className="h-4 w-4" />
              The Syntaxora Unique Student Code System
            </span>
            <h3 className="text-xl font-bold text-[#142541]">
              How the Student Code (STU-XXXXXXXX) Connects Learners &amp; Parents
            </h3>
            <p className="text-xs text-[#5F6F84] leading-relaxed max-w-2xl">
              Every learner enrolled in Syntaxora is assigned an immutable, unique Student Code generated upon faculty admission. This code acts as the bridge between student coursework and verified guardian portals.
            </p>
          </div>

          {/* Visual Badge Card */}
          <div className="rounded-xl border border-[#DCE4EE] bg-white p-4 shadow-sm text-center shrink-0 space-y-1 sm:w-64">
            <span className="text-[10px] font-bold text-[#5F6F84] uppercase tracking-wider block">
              Sample Student Code
            </span>
            <div className="text-lg font-mono font-black text-[#142541] tracking-wider bg-[#F3F6FA] py-1 px-3 rounded-lg border border-[#DCE4EE]">
              STU-8F39A1C2
            </div>
            <span className="text-[10px] text-[#168B83] font-semibold block">
              ✓ Verified Active Enrollment
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#3869AD]/20 text-xs">
          <div className="space-y-1">
            <strong className="text-[#142541] block">1. Where to Find the Code</strong>
            <p className="text-[#5F6F84] text-[11px] leading-relaxed">
              Found on the student admission letter, confirmation email, or at the top of the Student Portal dashboard.
            </p>
          </div>
          <div className="space-y-1">
            <strong className="text-[#142541] block">2. How Parents Connect</strong>
            <p className="text-[#5F6F84] text-[11px] leading-relaxed">
              Parents enter the code during registration at /sign-up or inside the Parent Dashboard to request access.
            </p>
          </div>
          <div className="space-y-1">
            <strong className="text-[#142541] block">3. Zero-Trust Verification</strong>
            <p className="text-[#5F6F84] text-[11px] leading-relaxed">
              Admissions coordinates identity verification so no unauthorized adult can view student grades or records.
            </p>
          </div>
        </div>
      </div>

      {/* Frequently Asked Admissions Questions */}
      <div className="rounded-2xl border border-[#DCE4EE] bg-white p-7 sm:p-9 space-y-6 shadow-sm">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#3869AD]">
            Academy Transparency
          </span>
          <h3 className="text-xl sm:text-2xl font-bold text-[#142541]">
            Common Questions About Our Process
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-[#263449]">
          <div className="p-4 rounded-xl bg-[#F3F6FA] border border-[#DCE4EE] space-y-1.5">
            <h4 className="font-bold text-[#142541] text-sm">
              Why can&apos;t students directly self-register?
            </h4>
            <p className="text-[#5F6F84] leading-relaxed">
              Unlike static video courses, every Syntaxora cohort is limited to 8–14 students and led live by credentialed faculty. Applications allow our team to ensure learners are placed in cohorts with matching skill prerequisites and age groups.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F3F6FA] border border-[#DCE4EE] space-y-1.5">
            <h4 className="font-bold text-[#142541] text-sm">
              Can a parent monitor more than one child?
            </h4>
            <p className="text-[#5F6F84] leading-relaxed">
              Yes! A single parent account can connect to multiple children using each student&apos;s unique code. The Child Selector in the Parent Portal allows you to easily switch between siblings.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F3F6FA] border border-[#DCE4EE] space-y-1.5">
            <h4 className="font-bold text-[#142541] text-sm">
              What if a parent registers before the student receives their code?
            </h4>
            <p className="text-[#5F6F84] leading-relaxed">
              Parents can leave the Student Code field blank during registration. Once the student completes admission review and receives their code, the parent simply clicks &ldquo;Link Student&rdquo; inside their dashboard.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F3F6FA] border border-[#DCE4EE] space-y-1.5">
            <h4 className="font-bold text-[#142541] text-sm">
              What live video technology is used?
            </h4>
            <p className="text-[#5F6F84] leading-relaxed">
              We utilize secure WebRTC studio links embedded directly inside the Student Portal. No third-party account is required, and classrooms include encrypted logging and verified instructor oversight.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center gap-3 border-t border-[#DCE4EE]">
          <Link href="/apply">
            <Button variant="ai" size="lg" className="font-bold shadow-md">
              Submit Student Admission Application
              <ArrowRight className="h-4 w-4 ml-2 arrow-icon" />
            </Button>
          </Link>
          <Link href="/sign-up?role=parent">
            <Button variant="outline" size="lg" className="font-semibold">
              Create Parent Portal Account
            </Button>
          </Link>
          <Link href="/contact" className="sm:ml-auto">
            <span className="text-xs text-[#3869AD] hover:underline font-semibold flex items-center gap-1">
              Ask Admissions a Question &rarr;
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
