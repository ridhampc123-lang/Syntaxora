"use client";

import React, { useState } from "react";
import { PlusCircle, AlertCircle, X, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Course } from "@/types";
import { createAssignmentAction } from "@/server/actions/instructor";

interface Props {
  courses: Course[];
}

export function CreateAssignmentModal({ courses }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [courseId, setCourseId] = useState(courses[0]?.id || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [maxScore, setMaxScore] = useState(100);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.set("courseId", courseId);
      formData.set("title", title);
      formData.set("description", description);
      formData.set("dueAt", new Date(dueAt).toISOString());
      formData.set("maxScore", String(maxScore));

      const res = await createAssignmentAction(formData);
      if (!res.success) {
        setError(res.error || "Failed to create assignment");
      } else {
        setIsOpen(false);
        setTitle("");
        setDescription("");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-[#142541] hover:bg-[#1f3760] text-white text-xs flex items-center gap-2 shadow-sm"
      >
        <PlusCircle className="h-4 w-4" />
        Create Assignment
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-[#DCE4EE] space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE4EE]">
              <div className="flex items-center gap-2 text-[#142541] font-bold text-base">
                <ClipboardList className="h-5 w-5 text-[#3869AD]" />
                New Course Project / Assignment
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[#5F6F84] hover:text-[#142541] p-1 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <Alert variant="error">
                <AlertCircle className="h-4 w-4" />
                <span className="text-xs">{error}</span>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label htmlFor="asn-course-select" className="font-semibold text-[#142541]">
                  Target Course Track <span className="text-rose-500">*</span>
                </label>
                <select
                  id="asn-course-select"
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  required
                  className="w-full rounded-lg border border-[#DCE4EE] bg-white p-2.5 text-xs text-[#263449] focus:outline-none focus:ring-2 focus:ring-[#3869AD]"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="asn-title-input" className="font-semibold text-[#142541]">
                  Assignment Title <span className="text-rose-500">*</span>
                </label>
                <Input
                  id="asn-title-input"
                  placeholder="e.g. Project: Train a Custom Image Classifier"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="asn-desc-input" className="font-semibold text-[#142541]">
                  Specifications & Instructions <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="asn-desc-input"
                  rows={3}
                  placeholder="Define technical deliverables, rubric criteria, and repository link requirements."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="w-full rounded-lg border border-[#DCE4EE] p-2.5 text-xs text-[#263449] focus:outline-none focus:ring-2 focus:ring-[#3869AD]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="asn-due-input" className="font-semibold text-[#142541]">
                    Submission Deadline <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    id="asn-due-input"
                    type="datetime-local"
                    value={dueAt}
                    onChange={(e) => setDueAt(e.target.value)}
                    required
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="asn-score-input" className="font-semibold text-[#142541]">
                    Maximum Score
                  </label>
                  <Input
                    id="asn-score-input"
                    type="number"
                    min={1}
                    max={1000}
                    value={maxScore}
                    onChange={(e) => setMaxScore(Number(e.target.value))}
                    required
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#DCE4EE]">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !title || !description || !dueAt}
                  className="bg-[#142541] hover:bg-[#1f3760] text-white text-xs"
                >
                  {loading ? "Publishing..." : "Create Assignment"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
