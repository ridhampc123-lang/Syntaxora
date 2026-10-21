import React from "react";
import { BookOpen, CheckCircle2 } from "lucide-react";
import { requireRole } from "@/server/services/authService";
import {
  getStudentByProfileId,
  getStudentCourses,
} from "@/server/services/studentService";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "My Enrolled Tracks — Syntaxora",
  description: "Course syllabus, curriculum modules, and interactive lessons.",
};

export default async function StudentCoursesPage() {
  const auth = await requireRole(["student", "admin"]);
  const student = await getStudentByProfileId(auth.userId);

  const courses = student ? await getStudentCourses(student.id) : [];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold text-[#142541] tracking-tight">
          Enrolled Curriculum Tracks
        </h2>
        <p className="text-xs text-[#5F6F84] mt-0.5">
          Access your live cohort syllabus, weekly modules, code repositories, and hands-on laboratory exercises.
        </p>
      </div>

      <div className="space-y-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className="rounded-2xl border border-[#DCE4EE] bg-white p-6 shadow-sm space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DCE4EE]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="teal">{course.audience_group.replace("_", " ")}</Badge>
                  <Badge variant="outline">{course.level}</Badge>
                </div>
                <h3 className="text-lg font-black text-[#142541]">{course.title}</h3>
                <p className="text-xs text-[#5F6F84] max-w-2xl">{course.description}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs font-bold text-[#142541]">
                  Duration: {course.duration_weeks} Weeks
                </div>
                <div className="text-[11px] text-[#168B83] font-semibold mt-0.5">
                  Live Online Cohort
                </div>
              </div>
            </div>

            {/* Modules List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#142541] flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-[#3869AD]" />
                Curriculum Modules & Edge Labs
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-[#DCE4EE] bg-[#F3F6FA] text-xs space-y-1">
                  <div className="font-bold text-[#142541] flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    Module 1: Python Foundations & Data Processing
                  </div>
                  <p className="text-[11px] text-[#5F6F84]">
                    Numpy arrays, mathematical matrix operations, and sensor data pipelines.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl border border-[#DCE4EE] bg-[#F3F6FA] text-xs space-y-1">
                  <div className="font-bold text-[#142541] flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    Module 2: Computer Vision with OpenCV
                  </div>
                  <p className="text-[11px] text-[#5F6F84]">
                    Frame filtering, edge detection, and real-time object tracking algorithms.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl border border-[#DCE4EE] bg-[#F3F6FA] text-xs space-y-1">
                  <div className="font-bold text-[#142541] flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#3869AD]" />
                    Module 3: Neural Networks & Backpropagation
                  </div>
                  <p className="text-[11px] text-[#5F6F84]">
                    Multilayer perceptrons, activation functions, and gradient descent optimization.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl border border-[#DCE4EE] bg-[#F3F6FA] text-xs space-y-1">
                  <div className="font-bold text-[#142541] flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#3869AD]" />
                    Module 4: Edge Device Deployment & Capstone
                  </div>
                  <p className="text-[11px] text-[#5F6F84]">
                    Deploying lightweight vision models to Raspberry Pi / edge processors.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
