import React, { Suspense } from "react";
import Link from "next/link";
import { Video, Users, BookOpen, Clock, ArrowRight, ShieldCheck } from "lucide-react";
import { getPublishedCourses } from "@/server/services/courseService";
import { CourseFilters } from "@/components/marketing/CourseFilters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Reveal } from "@/components/ui/reveal";
import { AIHighlight } from "@/components/ui/ai-highlight";

export const metadata = {
  title: "All Courses & AI Curricula — Syntaxora",
  description:
    "Browse our complete catalog of live interactive courses in computer vision, neural networks, robotics, and generative AI for students and professionals.",
};

interface CoursesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const resolvedParams = await searchParams;
  const audience = typeof resolvedParams.audience === "string" ? resolvedParams.audience : "all";
  const level = typeof resolvedParams.level === "string" ? resolvedParams.level : "all";
  const mode = typeof resolvedParams.mode === "string" ? resolvedParams.mode : "all";
  const search = typeof resolvedParams.q === "string" ? resolvedParams.q : "";

  const courses = await getPublishedCourses({
    audience,
    level,
    deliveryMode: mode,
    search,
  });

  return (
    <div className="py-12 lg:py-18 bg-[#FAF8F3] min-h-[calc(100vh-4.5rem)] text-[#354052]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header Breadcrumbs & Title */}
        <div className="space-y-3">
          <nav aria-label="Breadcrumb" className="text-xs text-[#687386]">
            <ol className="flex items-center gap-1.5">
              <li>
                <Link href="/" className="hover:text-[#17243A]">
                  Home
                </Link>
              </li>
              <li>/</li>
              <li className="font-semibold text-[#17243A]">Course Catalog</li>
            </ol>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gradient-ai">
                Interactive AI Masterclass Directory
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#17243A] mt-1">
                Academy <span className="text-gradient-ai">AI</span> Course Catalog
              </h1>
            </div>
            <p className="text-sm text-[#687386] max-w-md">
              Every course features live interactive cohorts, direct mentor code reviews, and age-tailored safety.
            </p>
          </div>
        </div>

        {/* Filter Controls (wrapped in Suspense for useSearchParams) */}
        <Suspense fallback={<div className="h-32 rounded-2xl bg-white border border-[#DDE2E7] animate-pulse" />}>
          <CourseFilters />
        </Suspense>

        {/* Results Counter & Summary Bar */}
        <div className="flex items-center justify-between text-xs text-[#687386] pb-2 border-b border-[#DDE2E7]">
          <p>
            Showing <span className="font-bold text-[#17243A]">{courses.length}</span> published course
            {courses.length === 1 ? "" : "s"}
          </p>
          <div className="hidden sm:flex items-center gap-3">
            <span className="flex items-center gap-1 text-[#167F78] font-semibold">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Verified Faculty Instruction
            </span>
          </div>
        </div>

        {/* Course Cards Grid or Empty State */}
        {courses.length === 0 ? (
          <div className="rounded-2xl border border-[#DDE2E7] bg-white p-14 text-center space-y-4 shadow-sm">
            <div className="mx-auto h-12 w-12 rounded-full bg-[#EAF0F8] text-[#355F99] flex items-center justify-center">
              <BookOpen className="h-6 w-6" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-bold text-[#17243A]">No courses match your filter criteria</h3>
            <p className="text-sm text-[#687386] max-w-md mx-auto leading-relaxed">
              Try adjusting your search terms or selecting a different age audience to view open cohorts.
            </p>
            <div className="pt-2">
              <Link href="/courses">
                <Button variant="outline" size="sm">
                  Reset Course Filters
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <Reveal>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="rounded-2xl border border-[#DDE2E7] bg-white p-7 sm:p-8 flex flex-col justify-between card-editorial card-ai-glow group"
                >
                <div className="space-y-4">
                  {/* Card Header Meta */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge
                      variant={
                        course.level === "beginner"
                          ? "teal"
                          : course.level === "advanced"
                          ? "navy"
                          : "primary"
                      }
                      className="uppercase text-[10px] tracking-wider"
                    >
                      {course.level} Level
                    </Badge>
                    <span className="flex items-center gap-1 text-xs text-[#687386] font-medium">
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                      {course.duration_weeks} Weeks
                    </span>
                  </div>

                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-[#17243A] leading-snug hover:text-[#355F99] transition-colors">
                      <Link href={`/courses/${course.slug}`}>
                        <AIHighlight text={course.title} />
                      </Link>
                    </h2>
                    <p className="text-sm text-[#687386] mt-2 line-clamp-3 leading-relaxed">
                      {course.summary}
                    </p>
                  </div>

                  {/* Delivery & Audience Badges */}
                  <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[#DDE2E7] text-xs text-[#354052]">
                    <span className="flex items-center gap-1.5 capitalize font-medium">
                      <Video className="h-3.5 w-3.5 text-[#167F78]" aria-hidden="true" />
                      {course.delivery_mode.replace("_", " ")}
                    </span>
                    <span className="text-[#DDE2E7]">•</span>
                    <span className="flex items-center gap-1.5 capitalize font-medium">
                      <Users className="h-3.5 w-3.5 text-[#355F99]" aria-hidden="true" />
                      {course.audience_group.replace("_", " ")}
                    </span>
                  </div>
                </div>

                {/* Footer Action & Tuition */}
                <div className="pt-6 mt-6 border-t border-[#DDE2E7] flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#687386] block">
                      Cohort Tuition
                    </span>
                    <div className="text-lg font-bold text-[#17243A]">
                      {course.price_in_cents > 0
                        ? formatCurrency(course.price_in_cents, course.currency)
                        : "Included"}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/courses/${course.slug}`}>
                      <Button variant="outline" size="sm">
                        Syllabus
                      </Button>
                    </Link>
                    <Link href={`/apply?course=${course.id}`}>
                      <Button variant="primary" size="sm">
                        Apply
                        <ArrowRight className="h-3.5 w-3.5 ml-1 arrow-icon" aria-hidden="true" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      )}
      </div>
    </div>
  );
}
