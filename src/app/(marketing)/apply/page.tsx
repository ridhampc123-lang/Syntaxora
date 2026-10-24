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
    <div className="min-h-screen bg-[#F3F6FA] py-12 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Breadcrumbs / Intro */}
        <div className="space-y-3 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8EFF8] text-[#3869AD] text-xs font-semibold">
            <GraduationCap className="h-4 w-4" aria-hidden="true" />
            <span>Admissions & Cohort Registration</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#142541] tracking-tight">
            Apply to Syntaxora AI Academy
          </h1>

          <p className="text-sm text-[#5F6F84] max-w-2xl leading-relaxed">
            Join a selective cohort of young innovators, university researchers, and professionals mastering real artificial intelligence, computer vision, and neural engineering.
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-[#DCE4EE] bg-white p-6 sm:p-10 shadow-sm">
          <StudentApplicationForm
            courses={courses}
            initialCourseId={initialCourseId}
          />
        </div>

        {/* Admissions Process Walkthrough */}
        <div className="rounded-2xl border border-[#DCE4EE] bg-white p-6 sm:p-8 space-y-4 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#142541]">
            How Syntaxora Admissions Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#5F6F84]">
            <div className="p-3 rounded-lg bg-[#F3F6FA] border border-[#DCE4EE] space-y-1">
              <div className="font-bold text-[#142541] flex items-center gap-1.5">
                <span className="h-5 w-5 rounded-full bg-[#3869AD] text-white flex items-center justify-center text-[10px]">1</span>
                <span>Submit Application</span>
              </div>
              <p>Fill out the application form with background details and preferred learning track.</p>
            </div>
            <div className="p-3 rounded-lg bg-[#F3F6FA] border border-[#DCE4EE] space-y-1">
              <div className="font-bold text-[#142541] flex items-center gap-1.5">
                <span className="h-5 w-5 rounded-full bg-[#168B83] text-white flex items-center justify-center text-[10px]">2</span>
                <span>Faculty Review</span>
              </div>
              <p>Admissions coordinators review background and match you to an optimal live class cohort.</p>
            </div>
            <div className="p-3 rounded-lg bg-[#F3F6FA] border border-[#DCE4EE] space-y-1">
              <div className="font-bold text-[#142541] flex items-center gap-1.5">
                <span className="h-5 w-5 rounded-full bg-[#142541] text-white flex items-center justify-center text-[10px]">3</span>
                <span>Secure Provisioning</span>
              </div>
              <p>Upon approval, you receive your unique student code and account setup invitation by email.</p>
            </div>
          </div>
        </div>

        {/* Parent / Guardian Registration Note */}
        <div className="text-center text-xs text-[#5F6F84] pt-2">
          Are you a parent or legal guardian looking to monitor your enrolled student?{" "}
          <Link href="/sign-up?role=parent" className="font-semibold text-[#3869AD] hover:underline">
            Register a Parent Account here
          </Link>
          {" "}or{" "}
          <Link href="/login" className="font-semibold text-[#3869AD] hover:underline">
            Sign In to the Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
