"use client";

import React, { useState, useActionState } from "react";
import { UserPlus, X, AlertCircle } from "lucide-react";
import { assignStudentAction, type BatchActionResult } from "@/server/actions/batch";
import { Student, Batch, Course } from "@/types";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

interface AssignStudentModalProps {
  students: Student[];
  courses: Course[];
  batches: Batch[];
  preselectedBatchId?: string;
  preselectedCourseId?: string;
  preselectedStudentId?: string;
  triggerButtonText?: string;
}

const initialState: BatchActionResult = {
  success: false,
  message: "",
};

export function AssignStudentModal({
  students,
  courses,
  batches,
  preselectedBatchId,
  preselectedCourseId,
  preselectedStudentId,
  triggerButtonText = "Assign Student",
}: AssignStudentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(assignStudentAction, initialState);

  const [selectedStudentId, setSelectedStudentId] = useState(preselectedStudentId || students[0]?.id || "");
  const [selectedCourseId, setSelectedCourseId] = useState(preselectedCourseId || courses[0]?.id || "");
  const [selectedBatchId, setSelectedBatchId] = useState(preselectedBatchId || "");

  // Filter batches for selected course
  const eligibleBatches = batches.filter(
    (b) => b.course_id === selectedCourseId && b.status !== "cancelled" && b.status !== "completed"
  );

  const selectedBatchObj = batches.find((b) => b.id === selectedBatchId);
  const isFull = selectedBatchObj ? (selectedBatchObj.enrolled_count ?? 0) >= selectedBatchObj.capacity : false;

  return (
    <>
      <Button variant="primary" size="sm" onClick={() => setIsOpen(true)}>
        <UserPlus className="h-4 w-4 mr-1.5" />
        {triggerButtonText}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-xl border border-[#DCE4EE] relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 text-[#5F6F84] hover:text-[#142541]"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-[#E8EFF8] text-[#3869AD]">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#142541]">Assign Student to Cohort</h3>
                <p className="text-xs text-[#5F6F84]">
                  Associate canonical student with an active batch and grant timetable access.
                </p>
              </div>
            </div>

            {state.message && (
              <Alert variant={state.success ? "success" : "error"}>
                {state.message}
              </Alert>
            )}

            <form action={formAction} className="space-y-4">
              {/* Student Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#142541] mb-1">
                  Enrolled Student <span className="text-red-500">*</span>
                </label>
                <select
                  name="studentId"
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full rounded-lg border border-[#DCE4EE] bg-white px-3 py-2 text-xs text-[#263449] focus:border-[#3869AD] focus:outline-hidden"
                  required
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.profile?.full_name || "Academy Learner"} ({s.student_code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Course Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#142541] mb-1">
                  Course Track <span className="text-red-500">*</span>
                </label>
                <select
                  name="courseId"
                  value={selectedCourseId}
                  onChange={(e) => {
                    setSelectedCourseId(e.target.value);
                    setSelectedBatchId("");
                  }}
                  className="w-full rounded-lg border border-[#DCE4EE] bg-white px-3 py-2 text-xs text-[#263449] focus:border-[#3869AD] focus:outline-hidden"
                  required
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Batch Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#142541] mb-1">
                  Assigned Cohort Batch
                </label>
                <select
                  name="batchId"
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  className="w-full rounded-lg border border-[#DCE4EE] bg-white px-3 py-2 text-xs text-[#263449] focus:border-[#3869AD] focus:outline-hidden"
                >
                  <option value="">— Awaiting Batch Assignment (Entitlement only) —</option>
                  {eligibleBatches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.batch_code}) — {b.enrolled_count ?? 0}/{b.capacity} Seats
                    </option>
                  ))}
                </select>

                {isFull && (
                  <div className="mt-2 p-2.5 rounded-lg bg-red-50 border border-red-200 text-[11px] text-red-700 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>Warning: Selected batch is at capacity ({selectedBatchObj?.capacity} seats). Assignment will be rejected to prevent overbooking.</span>
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#DCE4EE]">
                <Button variant="outline" size="sm" type="button" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={isPending || isFull}>
                  {isPending ? "Assigning..." : "Confirm Assignment"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
