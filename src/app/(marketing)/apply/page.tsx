import React from "react";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { getPublishedCourses } from "@/server/services/courseService";
import { StudentApplicationForm } from "@/components/forms/StudentApplicationForm";

export const metadata = {
  title: "Apply for Admission — Syntaxora AI Academy",
  description:
    "Apply for enrollment in Syntaxora AI and robotics cohorts. Student accounts are provisioned upon faculty admissions review.",
};

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ApplyPage({ searchParams }: Props) {
  const [courses, resolvedParams] = await Promise.all([
    getPublishedCourses(),
    searchParams,
  ]);

  const initialCourseId =
    typeof resolvedParams.course === "string" ? resolvedParams.course : undefined;

  return (
    <div className="min-h-screen bg-[#FAF8F3] py-12 lg:py-18 text-[#354052]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="text-xs text-[#687386]">
          <ol className="flex items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-[#17243A]">
                Home
              </Link>
            </li>
            <li>/</li>
            <li className="font-semibold text-[#17243A]">Admission Application</li>
          </ol>
        </nav>

        {/* Header Intro */}
        <div className="space-y-3 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF0F8] border border-[#355F99]/20 text-xs font-semibold text-[#355F99]">
            <GraduationCap className="h-4 w-4" aria-hidden="true" />
            <span>Admissions & Cohort Allocation</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#17243A]">
            Apply to Syntaxora AI Academy
          </h1>

          <p className="text-base text-[#687386] max-w-2xl leading-relaxed font-normal">
            Join a selective cohort of young innovators, high-school roboticists, university researchers, or working professionals mastering real artificial intelligence and neural systems.
          </p>
        </div>

        {/* Admissions Form Card */}
        <div className="rounded-2xl border border-[#DDE2E7] bg-white p-7 sm:p-10 shadow-sm animate-fade-in-up animation-delay-75 card-editorial">
          <StudentApplicationForm
            courses={courses}
            initialCourseId={initialCourseId}
          />
        </div>

        {/* Process Walkthrough Reassurance */}
        <div className="rounded-2xl border border-[#DDE2E7] bg-white p-7 sm:p-8 space-y-5 shadow-sm animate-fade-in-up animation-delay-150 card-editorial">
          <span className="text-xs font-bold uppercase tracking-wider text-[#355F99]">
            Admissions Timeline
          </span>
          <h2 className="text-lg font-bold text-[#17243A]">
            How Syntaxora Admissions Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#687386]">
            <div className="p-4 rounded-xl bg-[#FAF8F3] border border-[#DDE2E7] space-y-1.5">
              <div className="font-bold text-[#17243A] flex items-center gap-1.5">
                <span className="h-5 w-5 rounded-full bg-[#355F99] text-white flex items-center justify-center text-[10px] font-bold">1</span>
                <span>Submit Form</span>
              </div>
              <p className="leading-relaxed">Share learner background details and select a preferred cohort track.</p>
            </div>
            <div className="p-4 rounded-xl bg-[#FAF8F3] border border-[#DDE2E7] space-y-1.5">
              <div className="font-bold text-[#17243A] flex items-center gap-1.5">
                <span className="h-5 w-5 rounded-full bg-[#167F78] text-white flex items-center justify-center text-[10px] font-bold">2</span>
                <span>Faculty Review</span>
              </div>
              <p className="leading-relaxed">Admissions coordinators verify readiness and match you to a live cohort.</p>
            </div>
            <div className="p-4 rounded-xl bg-[#FAF8F3] border border-[#DDE2E7] space-y-1.5">
              <div className="font-bold text-[#17243A] flex items-center gap-1.5">
                <span className="h-5 w-5 rounded-full bg-[#17243A] text-white flex items-center justify-center text-[10px] font-bold">3</span>
                <span>Account Setup</span>
              </div>
              <p className="leading-relaxed">Upon approval, receive your unique student code and portal password setup link.</p>
            </div>
          </div>
        </div>

        {/* Parent / Guardian Registration Footnote */}
        <div className="text-center text-xs text-[#687386] pt-2 pb-6 space-y-1">
          <div>
            Are you a parent or legal guardian looking to oversee an enrolled learner?{" "}
            <Link href="/sign-up?role=parent" className="font-semibold text-[#167F78] hover:underline">
              Register a Parent Account here
            </Link>
          </div>
          <div>
            Already have an active account?{" "}
            <Link href="/login" className="font-semibold text-[#355F99] hover:underline">
              Portal Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
