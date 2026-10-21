import React from "react";
import Link from "next/link";
import { ExternalLink, PlusCircle } from "lucide-react";
import { getPublishedCourses } from "@/server/services/courseService";
import { CreateCourseForm } from "@/components/forms/CreateCourseForm";
import { CoursePublishButton } from "@/components/forms/CoursePublishButton";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export const metadata = {
  title: "Course Catalog Management — Syntaxora Admin",
  description: "Create and publish courses, syllabus modules, and pricing configuration.",
};

export default async function AdminCoursesPage() {
  const courses = await getPublishedCourses();

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold text-[#142541] tracking-tight">
          Curriculum & Course Management
        </h2>
        <p className="text-xs text-[#5F6F84] mt-0.5">
          Only published courses are visible to prospective students on the public academy catalog.
        </p>
      </div>

      {/* Creation Drawer / Card */}
      <div className="rounded-xl border border-[#DCE4EE] bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-[#142541] uppercase tracking-wider flex items-center gap-2">
          <PlusCircle className="h-4 w-4 text-[#3869AD]" />
          Create New Course
        </h3>
        <CreateCourseForm />
      </div>

      {/* Courses Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-[#5F6F84]">
          <span>
            Active Academy Courses: <strong className="text-[#142541]">{courses.length}</strong>
          </span>
        </div>

        <div className="rounded-xl border border-[#DCE4EE] bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F3F6FA] border-b border-[#DCE4EE] text-[#142541] font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5">Course Title</th>
                  <th className="p-3.5">Track / Audience</th>
                  <th className="p-3.5">Level</th>
                  <th className="p-3.5">Tuition</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE4EE] text-[#263449]">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-[#F3F6FA]/50 transition-colors">
                    <td className="p-3.5 font-medium text-[#142541]">
                      <div className="flex items-center gap-2">
                        <span>{course.title}</span>
                        <Link
                          href={`/courses/${course.slug}`}
                          target="_blank"
                          className="text-[#3869AD] hover:text-[#142541]"
                          title="View public page"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                      <div className="text-[11px] text-[#5F6F84] font-mono mt-0.5">
                        /{course.slug}
                      </div>
                    </td>
                    <td className="p-3.5 capitalize text-[#5F6F84]">
                      {course.audience_group.replace("_", " ")}
                    </td>
                    <td className="p-3.5">
                      <Badge variant="outline">{course.level}</Badge>
                    </td>
                    <td className="p-3.5 font-semibold text-[#142541]">
                      {course.price_in_cents > 0
                        ? formatCurrency(course.price_in_cents, course.currency)
                        : "Free"}
                    </td>
                    <td className="p-3.5">
                      <Badge variant={course.status === "published" ? "success" : "secondary"}>
                        {course.status}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <CoursePublishButton
                        courseId={course.id}
                        currentStatus={course.status}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
