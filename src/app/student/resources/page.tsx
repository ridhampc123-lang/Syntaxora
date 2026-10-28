import React from "react";
import Link from "next/link";
import {
  FolderDown,
  FileCode,
  FileText,
  Archive,
  Database,
  Download,
} from "lucide-react";
import { requireRole } from "@/server/services/authService";
import {
  getStudentByProfileId,
  getStudentResources,
  getStudentCourses,
} from "@/server/services/studentService";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Course Resources & Downloads — Syntaxora",
  description: "Official downloadable code repositories, OpenCV guides, datasets, and lab worksheets.",
};

export default async function StudentResourcesPage() {
  const auth = await requireRole(["student", "admin"]);
  const student = await getStudentByProfileId(auth.userId);

  if (!student) {
    return (
      <div className="p-12 text-center text-xs text-[#5F6F84] bg-white rounded-2xl border border-[#DCE4EE]">
        No active student record linked to your profile.
      </div>
    );
  }

  const [resources, courses] = await Promise.all([
    getStudentResources(student.id),
    getStudentCourses(student.id),
  ]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#142541]/5 text-[#3869AD] text-xs font-bold mb-2">
            <FolderDown className="h-3.5 w-3.5" />
            <span>Learning Repository</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142541] tracking-tight">
            Course Resources & Laboratory Assets
          </h1>
          <p className="text-xs sm:text-sm text-[#5F6F84] mt-1 max-w-2xl">
            Official curriculum PDFs, pre-configured OpenCV starter code, sample sensor datasets, and laboratory guidelines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-mono py-1 px-3 bg-white border-[#DCE4EE]">
            {resources.length} Authorized Files
          </Badge>
        </div>
      </div>

      {/* Resources Table / Cards */}
      <div className="rounded-2xl border border-[#DCE4EE] bg-white overflow-hidden shadow-sm">
        <div className="p-5 border-b border-[#DCE4EE] bg-[#F8FAFC] flex items-center justify-between">
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#142541]">
              Available Downloadable Materials ({resources.length})
            </h3>
            <p className="text-[11px] text-[#5F6F84] mt-0.5">
              Access is restricted strictly to your verified curriculum tracks
            </p>
          </div>
          <span className="text-[11px] text-[#5F6F84]">
            Enrolled Tracks: {courses.length}
          </span>
        </div>

        <div className="divide-y divide-[#DCE4EE] text-xs">
          {resources.length === 0 ? (
            <div className="p-12 text-center text-[#5F6F84] space-y-2">
              <div className="h-10 w-10 rounded-full bg-[#E8EFF8] text-[#3869AD] flex items-center justify-center mx-auto">
                <FolderDown className="h-5 w-5" />
              </div>
              <div className="font-bold text-sm text-[#142541]">No Resources Available</div>
              <p className="text-xs max-w-sm mx-auto">
                {courses.length === 0
                  ? "You are not currently enrolled in any curriculum tracks. Course materials unlock upon confirmed enrollment."
                  : "Materials and code repositories will be uploaded by your faculty mentor as module milestones commence."}
              </p>
              {courses.length === 0 && (
                <div className="pt-2">
                  <Link
                    href="/courses"
                    className="px-4 py-2 rounded-xl bg-[#142541] text-white font-semibold text-xs inline-block"
                  >
                    Browse Academic Tracks
                  </Link>
                </div>
              )}
            </div>
          ) : (
            resources.map((res) => {
              const matchedCourse = courses.find((c) => c.id === res.course_id);

              return (
                <div
                  key={res.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F8FAFC] transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        res.file_type === "pdf"
                          ? "bg-rose-50 text-rose-600"
                          : res.file_type === "code"
                          ? "bg-blue-50 text-[#3869AD]"
                          : res.file_type === "dataset"
                          ? "bg-purple-50 text-purple-600"
                          : "bg-teal-50 text-[#168B83]"
                      }`}
                    >
                      {res.file_type === "pdf" ? (
                        <FileText className="h-5 w-5" />
                      ) : res.file_type === "code" ? (
                        <FileCode className="h-5 w-5" />
                      ) : res.file_type === "dataset" ? (
                        <Database className="h-5 w-5" />
                      ) : (
                        <Archive className="h-5 w-5" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-[#142541]">{res.title}</span>
                        <Badge variant="outline" className="text-[10px] uppercase font-mono">
                          {res.file_type}
                        </Badge>
                        {res.file_size && (
                          <span className="text-[10px] text-[#5F6F84] font-mono">
                            {res.file_size}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[#5F6F84] leading-relaxed max-w-xl">
                        {res.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#5F6F84] pt-0.5">
                        <span className="text-[#3869AD] font-semibold">
                          {matchedCourse?.title || "Enrolled Curriculum Track"}
                        </span>
                        {res.module_title && (
                          <>
                            <span>•</span>
                            <span>{res.module_title}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                    <a
                      href={res.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-[#142541] hover:bg-[#1E375F] text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Download className="h-3.5 w-3.5 text-cyan-300" />
                      <span>Download Resource</span>
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
