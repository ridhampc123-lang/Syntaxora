import React from "react";
import Link from "next/link";
import { ExternalLink, PlusCircle, Search, BookOpen, ArrowLeft } from "lucide-react";
import { getAllCourses } from "@/server/services/courseService";
import { CreateCourseForm } from "@/components/forms/CreateCourseForm";
import { CoursePublishButton } from "@/components/forms/CoursePublishButton";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export const metadata = {
  title: "Course Catalog Management — Syntaxora Admin",
  description: "Create and publish courses, syllabus modules, and pricing configuration.",
};

interface CoursesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminCoursesPage({ searchParams }: CoursesPageProps) {
  const resolved = await searchParams;
  const statusFilter = typeof resolved.status === "string" ? resolved.status : undefined;
  const search = typeof resolved.q === "string" ? resolved.q.toLowerCase().trim() : "";

  const allCourses = await getAllCourses();

  let filtered = allCourses;
  if (statusFilter && statusFilter !== "all") {
    filtered = filtered.filter((c) => c.status === statusFilter);
  }
  if (search) {
    filtered = filtered.filter(
      (c) =>
        c.title.toLowerCase().includes(search) ||
        c.slug.toLowerCase().includes(search) ||
        c.audience_group.toLowerCase().includes(search) ||
        c.level.toLowerCase().includes(search)
    );
  }

  const counts = {
    all: allCourses.length,
    published: allCourses.filter((c) => c.status === "published").length,
    draft: allCourses.filter((c) => c.status === "draft").length,
    archived: allCourses.filter((c) => c.status === "archived").length,
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#5F6F84] mb-1">
            <Link href="/admin" className="hover:text-[#3869AD] flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" />
              <span>Admin Overview</span>
            </Link>
            <span>/</span>
            <span className="font-semibold text-[#142541]">Courses & Curriculum</span>
          </div>

          <h2 className="text-2xl font-black text-[#142541] tracking-tight">
            <span className="text-gradient-ai">Artificial Intelligence</span> Curriculum & Course Management
          </h2>
          <p className="text-xs text-[#5F6F84] mt-0.5">
            Only published courses are visible to prospective students on the public academy catalog.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/courses" target="_blank" rel="noopener noreferrer">
            <button className="px-3 py-1.5 rounded-lg border border-[#DCE4EE] bg-white text-xs font-semibold text-[#142541] hover:bg-[#F3F6FA] transition-colors">
              Public Catalog &rarr;
            </button>
          </Link>
        </div>
      </div>

      {/* Creation Drawer / Card */}
      <div className="rounded-xl border border-[#DCE4EE] bg-white p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#142541] uppercase tracking-wider flex items-center gap-2">
          <PlusCircle className="h-4 w-4 text-[#3869AD]" />
          Create New Course Track
        </h3>
        <CreateCourseForm />
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#F3F6FA] border border-[#DCE4EE] text-xs">
          {[
            { id: "all", label: "All Courses", count: counts.all },
            { id: "published", label: "Published", count: counts.published },
            { id: "draft", label: "Drafts", count: counts.draft },
            { id: "archived", label: "Archived", count: counts.archived },
          ].map((tab) => {
            const isSelected = (!statusFilter && tab.id === "all") || statusFilter === tab.id;
            return (
              <Link
                key={tab.id}
                href={tab.id === "all" ? "/admin/courses" : `/admin/courses?status=${tab.id}`}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-white text-[#142541] shadow-xs"
                    : "text-[#5F6F84] hover:text-[#142541]"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? "bg-[#E8EFF8] text-[#3869AD]" : "bg-[#DCE4EE]/70 text-[#5F6F84]"
                  }`}
                >
                  {tab.count}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Courses Table */}
      <div className="rounded-xl border border-[#DCE4EE] bg-white overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#DCE4EE] bg-[#F3F6FA] text-xs font-semibold text-[#142541] flex items-center justify-between">
          <span>Academy Curriculum Tracks ({filtered.length} of {allCourses.length})</span>
          <span className="text-[11px] text-[#5F6F84]">
            Enforces strict public discovery isolation
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#DCE4EE] text-[#142541] font-semibold uppercase tracking-wider text-[11px] bg-[#F3F6FA]/50">
              <tr>
                <th className="p-3.5">Course Title</th>
                <th className="p-3.5">Track / Audience</th>
                <th className="p-3.5">Level</th>
                <th className="p-3.5">Topics</th>
                <th className="p-3.5">Tuition</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE4EE] text-[#263449]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-[#5F6F84]">
                    <BookOpen className="h-8 w-8 text-[#5F6F84]/40 mx-auto mb-2" />
                    <p className="font-semibold text-sm text-[#142541]">No courses match criteria</p>
                    <p className="text-xs text-[#5F6F84] mt-0.5">
                      Use the &ldquo;Create New Course Track&rdquo; form above to add an educational program.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((course) => (
                  <tr key={course.id} className="hover:bg-[#F3F6FA]/50 transition-colors">
                    <td className="p-3.5 font-bold text-[#142541]">
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
                    <td className="p-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#E8EFF8] text-[#3869AD] text-[11px] font-bold">
                        {course.modules?.length || 0} Topics
                      </span>
                    </td>
                    <td className="p-3.5 font-black text-[#142541]">
                      {course.price_in_cents > 0
                        ? formatCurrency(course.price_in_cents, course.currency)
                        : "Free"}
                    </td>
                    <td className="p-3.5">
                      <Badge variant={course.status === "published" ? "success" : "secondary"}>
                        {course.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-right whitespace-nowrap space-x-2">
                      <Link
                        href={`/admin/courses/${course.id}`}
                        className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#E8EFF8] text-[#3869AD] hover:bg-[#3869AD] hover:text-white text-xs font-semibold transition-colors"
                      >
                        Manage & Topics &rarr;
                      </Link>
                      <CoursePublishButton
                        courseId={course.id}
                        currentStatus={course.status}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
