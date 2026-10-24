"use client";

import React, { useState, useActionState } from "react";
import { Plus, X, Layers, Calendar } from "lucide-react";
import { createBatchAction, type BatchActionResult } from "@/server/actions/batch";
import { Course, Profile } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";

interface CreateBatchModalProps {
  courses: Course[];
  instructors: Profile[];
  preselectedCourseId?: string;
}

const initialState: BatchActionResult = {
  success: false,
  message: "",
};

export function CreateBatchModal({
  courses,
  instructors,
  preselectedCourseId,
}: CreateBatchModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(createBatchAction, initialState);

  const [selectedCourse, setSelectedCourse] = useState(preselectedCourseId || courses[0]?.id || "");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  return (
    <>
      <Button variant="primary" size="sm" onClick={handleOpen}>
        <Plus className="h-4 w-4 mr-1.5" />
        Create Batch
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-xl border border-[#DCE4EE] relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 text-[#5F6F84] hover:text-[#142541]"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-[#E8EFF8] text-[#3869AD]">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#142541]">Create New Cohort Batch</h3>
                <p className="text-xs text-[#5F6F84]">
                  Configure course scheduling, assigned faculty, capacity constraints, and timezone.
                </p>
              </div>
            </div>

            {state.message && (
              <Alert variant={state.success ? "success" : "error"}>
                {state.message}
              </Alert>
            )}

            <form action={formAction} className="space-y-4">
              {/* Course Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#142541] mb-1">
                  Target Course Curriculum <span className="text-red-500">*</span>
                </label>
                <select
                  name="courseId"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full rounded-lg border border-[#DCE4EE] bg-white px-3 py-2 text-xs text-[#263449] focus:border-[#3869AD] focus:outline-hidden"
                  required
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.audience_group.replace("_", " ")})
                    </option>
                  ))}
                </select>
                {state.errors?.courseId && (
                  <p className="text-[11px] text-red-600 mt-1">{state.errors.courseId[0]}</p>
                )}
              </div>

              {/* Name & Batch Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Batch Name"
                  name="name"
                  id="batchName"
                  placeholder="e.g. Cohort Alpha (Morning)"
                  required
                  error={state.errors?.name?.[0]}
                />

                <Input
                  label="Batch Code (Unique)"
                  name="batchCode"
                  id="batchCode"
                  placeholder="e.g. BAT-AIR-01"
                  required
                  error={state.errors?.batchCode?.[0]}
                />
              </div>

              {/* Instructor & Capacity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#142541] mb-1">
                    Primary Faculty <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="primaryInstructorId"
                    className="w-full rounded-lg border border-[#DCE4EE] bg-white px-3 py-2 text-xs text-[#263449] focus:border-[#3869AD] focus:outline-hidden"
                    required
                  >
                    {instructors.map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.full_name} ({inst.email})
                      </option>
                    ))}
                  </select>
                  {state.errors?.primaryInstructorId && (
                    <p className="text-[11px] text-red-600 mt-1">{state.errors.primaryInstructorId[0]}</p>
                  )}
                </div>

                <Input
                  label="Student Capacity"
                  name="capacity"
                  id="batchCapacity"
                  type="number"
                  min="1"
                  max="200"
                  defaultValue="20"
                  required
                  error={state.errors?.capacity?.[0]}
                />
              </div>

              {/* Start & End Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#142541] mb-1">
                    Start Date & Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="startAt"
                    value={startAt}
                    onChange={(e) => setStartAt(e.target.value)}
                    required
                    className="w-full rounded-lg border border-[#DCE4EE] bg-white px-3 py-2 text-xs text-[#263449] focus:border-[#3869AD] focus:outline-hidden"
                  />
                  {state.errors?.startAt && (
                    <p className="text-[11px] text-red-600 mt-1">{state.errors.startAt[0]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#142541] mb-1">
                    End Date & Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="endAt"
                    value={endAt}
                    onChange={(e) => setEndAt(e.target.value)}
                    required
                    className="w-full rounded-lg border border-[#DCE4EE] bg-white px-3 py-2 text-xs text-[#263449] focus:border-[#3869AD] focus:outline-hidden"
                  />
                  {state.errors?.endAt && (
                    <p className="text-[11px] text-red-600 mt-1">{state.errors.endAt[0]}</p>
                  )}
                </div>
              </div>

              {/* Timezone */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#142541] mb-1">
                  Schedule Timezone (IANA)
                </label>
                <select
                  name="timezone"
                  defaultValue="Asia/Kolkata"
                  className="w-full rounded-lg border border-[#DCE4EE] bg-white px-3 py-2 text-xs text-[#263449] focus:border-[#3869AD] focus:outline-hidden"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST +05:30) — Academy Default</option>
                  <option value="UTC">UTC (Coordinated Universal Time)</option>
                  <option value="America/New_York">America/New_York (EST/EDT)</option>
                  <option value="Europe/London">Europe/London (GMT/BST)</option>
                  <option value="Asia/Dubai">Asia/Dubai (GST +04:00)</option>
                  <option value="Asia/Singapore">Asia/Singapore (SGT +08:00)</option>
                </select>
              </div>

              {/* Live Preview Box */}
              {startAt && endAt && (
                <div className="rounded-xl bg-[#F3F6FA] border border-[#DCE4EE] p-3 text-xs space-y-1">
                  <div className="font-semibold text-[#142541] flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-[#3869AD]" />
                    Timetable Range Preview
                  </div>
                  <div className="text-[11px] text-[#5F6F84]">
                    Duration: {Math.max(1, Math.round((new Date(endAt).getTime() - new Date(startAt).getTime()) / (1000 * 60 * 60 * 24)))} days
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#DCE4EE]">
                <Button variant="outline" size="sm" type="button" onClick={handleClose}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={isPending}>
                  {isPending ? "Creating..." : "Confirm & Create Batch"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
