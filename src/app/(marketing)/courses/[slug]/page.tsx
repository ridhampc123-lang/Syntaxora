import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Calendar,
  Clock,
  Video,
  Users,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { getCourseBySlug, getPublishedCourses } from "@/server/services/courseService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { AIHighlight } from "@/components/ui/ai-highlight";

interface CourseDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const courses = await getPublishedCourses();
  return courses.map((course) => ({
    slug: course.slug,
  }));
}

export async function generateMetadata({ params }: CourseDetailPageProps) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);

  if (!course) {
    return {
      title: "Course Not Found — Syntaxora",
    };
  }

  return {
    title: `${course.title} — Syntaxora AI Academy`,
    description: course.summary,
  };
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);

  if (!course) {
    notFound();
  }

  return (
    <div className="bg-[#FAF8F3] min-h-screen py-12 lg:py-18 text-[#354052]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="text-xs text-[#687386]">
          <ol className="flex items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-[#17243A]">
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/courses" className="hover:text-[#17243A]">
                Courses
              </Link>
            </li>
            <li>/</li>
            <li className="font-semibold text-[#17243A] truncate max-w-xs">{course.title}</li>
          </ol>
        </nav>

        {/* Hero Banner Header */}
        <div className="rounded-2xl bg-[#17243A] text-white p-8 lg:p-12 space-y-6 shadow-md border border-[#17243A] animate-fade-in-up">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-white">
              <Sparkles className="h-3.5 w-3.5 text-[#D7A66A]" aria-hidden="true" />
              <span>Syntaxora Verified Curriculum</span>
            </div>
            {course.status !== "published" && (
              <Badge variant="secondary" className="uppercase text-[10px] tracking-wider font-bold bg-[#FF994B]/20 text-[#FF994B] border-[#FF994B]/40">
                Draft Preview
              </Badge>
            )}
            <Badge variant="teal" className="uppercase text-[10px] tracking-wider font-bold">
              {course.level} Level
            </Badge>
            <Badge variant="outline" className="text-white border-white/20 capitalize text-[10px] tracking-wider">
              {course.audience_group.replace("_", " ")}
            </Badge>
            <Badge variant="outline" className="text-white border-white/20 capitalize text-[10px] tracking-wider">
              {course.delivery_mode.replace("_", " ")}
            </Badge>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight text-white">
            <AIHighlight text={course.title} glow={true} />
          </h1>

          <p className="text-base sm:text-lg text-[#DDE2E7]/90 max-w-3xl leading-relaxed font-normal">
            {course.summary}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/10 text-xs sm:text-sm">
            <div className="space-y-1">
              <span className="text-[#DDE2E7]/60 block uppercase text-[10px] font-semibold tracking-wider">
                Cohort Duration
              </span>
              <span className="font-medium flex items-center gap-1.5 text-white">
                <Clock className="h-4 w-4 text-[#167F78]" aria-hidden="true" />
                {course.duration_weeks} Weeks
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-[#DDE2E7]/60 block uppercase text-[10px] font-semibold tracking-wider">
                Class Format
              </span>
              <span className="font-medium flex items-center gap-1.5 capitalize text-white">
                <Video className="h-4 w-4 text-[#355F99]" aria-hidden="true" />
                {course.delivery_mode.replace("_", " ")}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-[#DDE2E7]/60 block uppercase text-[10px] font-semibold tracking-wider">
                Audience Group
              </span>
              <span className="font-medium flex items-center gap-1.5 capitalize text-white">
                <Users className="h-4 w-4 text-[#167F78]" aria-hidden="true" />
                {course.audience_group.replace("_", " ")}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-[#DDE2E7]/60 block uppercase text-[10px] font-semibold tracking-wider">
                Cohort Tuition
              </span>
              <span className="font-bold text-white text-base">
                {course.price_in_cents > 0
                  ? formatCurrency(course.price_in_cents, course.currency)
                  : "Included"}
              </span>
            </div>
          </div>
        </div>

        {/* Course Body Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Syllabus & Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <div className="rounded-2xl border border-[#DDE2E7] bg-white p-7 sm:p-9 space-y-4 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-[#355F99]">
                Course Overview
              </span>
              <h2 className="text-2xl font-bold text-[#17243A]">About this Program</h2>
              <p className="text-sm sm:text-base text-[#354052] leading-relaxed">
                {course.description}
              </p>
            </div>

            {/* Learning Outcomes */}
            <div className="rounded-2xl border border-[#DDE2E7] bg-white p-7 sm:p-9 space-y-5 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-[#167F78]">
                Core Competencies
              </span>
              <h2 className="text-2xl font-bold text-[#17243A]">Verified Learning Outcomes</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs sm:text-sm text-[#354052]">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#167F78] mt-0.5 shrink-0" aria-hidden="true" />
                  <span>Build and train real models on genuine data sets.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#167F78] mt-0.5 shrink-0" aria-hidden="true" />
                  <span>Master practical algorithmic problem solving.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#167F78] mt-0.5 shrink-0" aria-hidden="true" />
                  <span>Deploy code to working edge or cloud environments.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#167F78] mt-0.5 shrink-0" aria-hidden="true" />
                  <span>Receive continuous feedback from academy mentors.</span>
                </li>
              </ul>
            </div>

            {/* Modules and Syllabus */}
            <div className="rounded-2xl border border-[#DDE2E7] bg-white p-7 sm:p-9 space-y-6 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-[#DDE2E7]">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#355F99]">
                    Curriculum Structure
                  </span>
                  <h2 className="text-2xl font-bold text-[#17243A] mt-1">Syllabus & Modules</h2>
                </div>
                <Badge variant="primary" className="text-xs">
                  {course.modules?.length || 0} Modules
                </Badge>
              </div>

              {course.modules && course.modules.length > 0 ? (
                <div className="space-y-4">
                  {course.modules.map((module) => (
                    <div
                      key={module.id}
                      className="rounded-xl border border-[#DDE2E7] bg-[#FAF8F3] p-5 space-y-3 transition-colors hover:border-[#355F99]/50"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-base text-[#17243A]">
                          <AIHighlight text={module.title} />
                        </h3>
                        <span className="text-xs text-[#687386]">
                          {module.lessons?.length || 0} Lessons
                        </span>
                      </div>
                      {module.description && (
                        <p className="text-xs text-[#687386] leading-relaxed">{module.description}</p>
                      )}

                      {module.lessons && module.lessons.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-[#DDE2E7]">
                          {module.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className="flex items-center justify-between rounded-lg bg-white border border-[#DDE2E7]/80 px-3.5 py-2.5 text-xs transition-all hover:border-[#355F99]/60 hover:shadow-xs"
                            >
                              <div className="flex items-center gap-2.5 text-[#17243A] font-medium">
                                <BookOpen className="h-3.5 w-3.5 text-[#355F99]" aria-hidden="true" />
                                <span>{lesson.title}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="capitalize text-[#687386] text-[11px] font-semibold">
                                  {lesson.lesson_type}
                                </span>
                                {lesson.is_preview && (
                                  <Badge variant="teal" className="text-[10px]">
                                    Free Preview
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#687386]">
                  Detailed syllabus schedule is currently being finalized for the upcoming cohort.
                </p>
              )}
            </div>
          </div>

          {/* Sidebar Sticky Enrollment Card */}
          <div className="space-y-6 lg:sticky lg:top-24">
            <div className="rounded-2xl border border-[#DDE2E7] bg-white p-7 space-y-6 shadow-sm card-editorial">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#687386] tracking-wider block">
                  Cohort Tuition
                </span>
                <div className="text-3xl font-extrabold text-[#17243A] mt-1">
                  {course.price_in_cents > 0
                    ? formatCurrency(course.price_in_cents, course.currency)
                    : "Free"}
                </div>
                <p className="text-xs text-[#687386] mt-1">
                  Includes live video studio sessions, weekly mentor reviews, and portal access.
                </p>
              </div>

              {/* Application Action Button */}
              <div className="space-y-3 pt-4 border-t border-[#DDE2E7]">
                <Link href={`/apply?course=${course.id}`} className="w-full block">
                  <Button variant="ai" size="lg" className="w-full font-bold justify-center shadow-md">
                    Apply for Cohort Admission
                    <ArrowRight className="h-4 w-4 ml-2 arrow-icon" aria-hidden="true" />
                  </Button>
                </Link>
                <Link href="/contact" className="w-full block">
                  <Button variant="outline" size="md" className="w-full justify-center">
                    Ask Admissions a Question
                  </Button>
                </Link>
              </div>

              {/* Informational Points */}
              <div className="space-y-2.5 pt-4 border-t border-[#DDE2E7] text-xs text-[#687386]">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#167F78] shrink-0" aria-hidden="true" />
                  <span>Cohorts start on scheduled monthly dates</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#355F99] shrink-0" aria-hidden="true" />
                  <span>Authorized student & guardian portals</span>
                </div>
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-[#17243A] shrink-0" aria-hidden="true" />
                  <span>Small cohort placement: 8–14 students</span>
                </div>
              </div>

              {/* Parent Registration Link */}
              <div className="pt-4 border-t border-[#DDE2E7] text-center text-xs text-[#687386]">
                Are you a parent or guardian?{" "}
                <Link
                  href="/sign-up?role=parent"
                  className="font-semibold text-[#167F78] hover:underline block mt-0.5"
                >
                  Create Parent Account to link with your student
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
