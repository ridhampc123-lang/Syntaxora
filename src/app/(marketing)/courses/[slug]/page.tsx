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
} from "lucide-react";
import { getCourseBySlug, getPublishedCourses } from "@/server/services/courseService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

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
    <div className="bg-[#F3F6FA] min-h-screen py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="text-xs text-[#5F6F84]">
          <ol className="flex items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-[#3869AD]">
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/courses" className="hover:text-[#3869AD]">
                Courses
              </Link>
            </li>
            <li>/</li>
            <li className="font-semibold text-[#142541] truncate max-w-xs">{course.title}</li>
          </ol>
        </nav>

        {/* Hero Banner Header */}
        <div className="rounded-2xl bg-[#142541] text-white p-8 lg:p-12 space-y-6 shadow-md">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="teal">{course.level}</Badge>
            <Badge variant="outline" className="text-white border-white/20">
              {course.audience_group.replace("_", " ")}
            </Badge>
            <Badge variant="outline" className="text-white border-white/20">
              {course.delivery_mode.replace("_", " ")}
            </Badge>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            {course.title}
          </h1>

          <p className="text-base sm:text-lg text-[#DCE4EE]/90 max-w-3xl leading-relaxed">
            {course.summary}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/10 text-xs sm:text-sm">
            <div className="space-y-1">
              <span className="text-[#DCE4EE]/60 block uppercase text-[11px] font-semibold">
                Duration
              </span>
              <span className="font-medium flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-[#168B83]" aria-hidden="true" />
                {course.duration_weeks} Weeks
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-[#DCE4EE]/60 block uppercase text-[11px] font-semibold">
                Class Format
              </span>
              <span className="font-medium flex items-center gap-1.5 capitalize">
                <Video className="h-4 w-4 text-[#3869AD]" aria-hidden="true" />
                {course.delivery_mode.replace("_", " ")}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-[#DCE4EE]/60 block uppercase text-[11px] font-semibold">
                Target Group
              </span>
              <span className="font-medium flex items-center gap-1.5 capitalize">
                <Users className="h-4 w-4 text-[#168B83]" aria-hidden="true" />
                {course.audience_group.replace("_", " ")}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-[#DCE4EE]/60 block uppercase text-[11px] font-semibold">
                Tuition
              </span>
              <span className="font-bold text-white text-base">
                {course.price_in_cents > 0
                  ? formatCurrency(course.price_in_cents, course.currency)
                  : "Free"}
              </span>
            </div>
          </div>
        </div>

        {/* Course Body Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Syllabus & Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <div className="rounded-xl border border-[#DCE4EE] bg-white p-6 sm:p-8 space-y-4">
              <h2 className="text-xl font-bold text-[#142541]">Course Overview</h2>
              <p className="text-sm sm:text-base text-[#263449] leading-relaxed">
                {course.description}
              </p>
            </div>

            {/* Learning Outcomes */}
            <div className="rounded-xl border border-[#DCE4EE] bg-white p-6 sm:p-8 space-y-4">
              <h2 className="text-xl font-bold text-[#142541]">Learning Outcomes</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-[#263449]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#168B83] mt-0.5 shrink-0" aria-hidden="true" />
                  <span>Build and train real models on genuine data sets.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#168B83] mt-0.5 shrink-0" aria-hidden="true" />
                  <span>Master practical algorithmic problem solving.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#168B83] mt-0.5 shrink-0" aria-hidden="true" />
                  <span>Deploy code to working edge or cloud environments.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#168B83] mt-0.5 shrink-0" aria-hidden="true" />
                  <span>Receive continuous review from academy mentors.</span>
                </li>
              </ul>
            </div>

            {/* Modules and Syllabus Accordion */}
            <div className="rounded-xl border border-[#DCE4EE] bg-white p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#142541]">Syllabus & Modules</h2>
                <span className="text-xs font-semibold text-[#5F6F84]">
                  {course.modules?.length || 0} Modules
                </span>
              </div>

              {course.modules && course.modules.length > 0 ? (
                <div className="space-y-4">
                  {course.modules.map((module) => (
                    <div
                      key={module.id}
                      className="rounded-lg border border-[#DCE4EE] bg-[#F3F6FA] p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-base text-[#142541]">
                          {module.title}
                        </h3>
                        <span className="text-xs text-[#5F6F84]">
                          {module.lessons?.length || 0} Lessons
                        </span>
                      </div>
                      {module.description && (
                        <p className="text-xs text-[#5F6F84]">{module.description}</p>
                      )}

                      {module.lessons && module.lessons.length > 0 && (
                        <div className="space-y-1.5 pt-2 border-t border-[#DCE4EE]">
                          {module.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className="flex items-center justify-between rounded bg-white px-3 py-2 text-xs"
                            >
                              <div className="flex items-center gap-2 text-[#263449]">
                                <BookOpen className="h-3.5 w-3.5 text-[#3869AD]" aria-hidden="true" />
                                <span>{lesson.title}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="capitalize text-[#5F6F84] font-medium">
                                  {lesson.lesson_type}
                                </span>
                                {lesson.is_preview && (
                                  <Badge variant="teal">Free Preview</Badge>
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
                <p className="text-sm text-[#5F6F84]">
                  Detailed syllabus schedule is currently being finalized for the upcoming cohort.
                </p>
              )}
            </div>
          </div>

          {/* Sidebar Action & Enrollment Card */}
          <div className="space-y-6">
            <Card className="sticky top-24 border-[#DCE4EE] bg-white shadow-md">
              <CardContent className="p-6 space-y-6">
                <div>
                  <div className="text-xs uppercase font-semibold text-[#5F6F84] tracking-wider">
                    Enrollment Tuition
                  </div>
                  <div className="text-3xl font-extrabold text-[#142541] mt-1">
                    {course.price_in_cents > 0
                      ? formatCurrency(course.price_in_cents, course.currency)
                      : "Free"}
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-[#DCE4EE]">
                  <Link href={`/sign-up?course=${course.slug}`} className="w-full block">
                    <Button variant="primary" size="lg" className="w-full font-semibold">
                      Enroll in Next Cohort
                      <ArrowRight className="h-4 w-4 ml-2" aria-hidden="true" />
                    </Button>
                  </Link>
                  <Link href="/contact" className="w-full block">
                    <Button variant="outline" size="md" className="w-full">
                      Ask Admissions a Question
                    </Button>
                  </Link>
                </div>

                <div className="space-y-3 pt-4 border-t border-[#DCE4EE] text-xs text-[#5F6F84]">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#168B83] shrink-0" aria-hidden="true" />
                    <span>Next live cohort begins first Monday of next month</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[#3869AD] shrink-0" aria-hidden="true" />
                    <span>Authorized Guardian & Student Portal Access</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
