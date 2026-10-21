import React, { Suspense } from "react";
import Link from "next/link";
import { Video, Users, BookOpen, Clock } from "lucide-react";
import { getPublishedCourses } from "@/server/services/courseService";
import { CourseFilters } from "@/components/marketing/CourseFilters";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

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
    <div className="py-12 lg:py-16 bg-[#F3F6FA] min-h-[calc(100vh-4rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#142541] tracking-tight">
            Academy Course Catalog
          </h1>
          <p className="text-base text-[#5F6F84] max-w-2xl">
            Live instructor-led cohorts designed for young learners, teens, university students, and industry professionals.
          </p>
        </div>

        {/* Filter Controls (wrapped in Suspense for useSearchParams) */}
        <Suspense fallback={<div className="h-28 rounded-xl bg-white animate-pulse" />}>
          <CourseFilters />
        </Suspense>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-sm text-[#5F6F84]">
          <p>
            Showing <span className="font-semibold text-[#142541]">{courses.length}</span> published course{courses.length === 1 ? "" : "s"}
          </p>
        </div>

        {/* Course Cards Grid or Empty State */}
        {courses.length === 0 ? (
          <div className="rounded-xl border border-[#DCE4EE] bg-white p-12 text-center space-y-4">
            <div className="mx-auto h-12 w-12 rounded-full bg-[#E8EFF8] text-[#3869AD] flex items-center justify-center">
              <BookOpen className="h-6 w-6" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-bold text-[#142541]">No courses match your filter criteria</h3>
            <p className="text-sm text-[#5F6F84] max-w-md mx-auto">
              Try broadening your search terms or clearing your audience and level filters to see available cohorts.
            </p>
            <Link href="/courses">
              <Button variant="outline" size="sm">
                Clear Filters
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card
                key={course.id}
                className="flex flex-col justify-between hover:shadow-lg transition-all border-[#DCE4EE] bg-white"
              >
                <div>
                  <CardHeader className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge
                        variant={
                          course.level === "beginner"
                            ? "teal"
                            : course.level === "advanced"
                            ? "navy"
                            : "primary"
                        }
                      >
                        {course.level}
                      </Badge>
                      <span className="flex items-center gap-1 text-xs text-[#5F6F84] font-medium">
                        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                        {course.duration_weeks} Weeks
                      </span>
                    </div>
                    <CardTitle className="text-xl text-[#142541] hover:text-[#3869AD] transition-colors">
                      <Link href={`/courses/${course.slug}`}>{course.title}</Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-[#5F6F84] leading-relaxed line-clamp-3">
                      {course.summary}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-[#263449] pt-2 border-t border-[#DCE4EE]">
                      <span className="flex items-center gap-1 capitalize">
                        <Video className="h-3.5 w-3.5 text-[#168B83]" aria-hidden="true" />
                        {course.delivery_mode.replace("_", " ")}
                      </span>
                      <span className="flex items-center gap-1 capitalize">
                        <Users className="h-3.5 w-3.5 text-[#3869AD]" aria-hidden="true" />
                        {course.audience_group.replace("_", " ")}
                      </span>
                    </div>
                  </CardContent>
                </div>
                <div className="p-6 pt-0 flex items-center justify-between border-t border-[#DCE4EE]/60 mt-4">
                  <div className="text-lg font-bold text-[#142541]">
                    {course.price_in_cents > 0
                      ? formatCurrency(course.price_in_cents, course.currency)
                      : "Free"}
                  </div>
                  <Link href={`/courses/${course.slug}`}>
                    <Button variant="primary" size="sm">
                      View Syllabus
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
