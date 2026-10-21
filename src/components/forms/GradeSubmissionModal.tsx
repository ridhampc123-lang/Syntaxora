"use client";

import React, { useState } from "react";
import { Award, AlertCircle, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Submission } from "@/types";
import { gradeSubmissionAction } from "@/server/actions/instructor";

interface Props {
  submission: Submission;
}

export function GradeSubmissionModal({ submission }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [score, setScore] = useState<number>(submission.score ?? 90);
  const [feedback, setFeedback] = useState(submission.feedback || "");
  const [isGradePublished, setIsGradePublished] = useState(submission.is_grade_published);

  const studentName = submission.student?.profile?.full_name || "Enrolled Student";
  const studentCode = submission.student?.student_code || "STU-CODE";
  const assignmentTitle = submission.assignment?.title || "Course Project";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.set("submissionId", submission.id);
      formData.set("score", String(score));
      formData.set("feedback", feedback);
      formData.set("isGradePublished", String(isGradePublished));

      const res = await gradeSubmissionAction(formData);
      if (!res.success) {
        setError(res.error || "Failed to submit grade");
      } else {
        setIsOpen(false);
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
        variant="outline"
        className="text-[11px] h-7 px-2.5 text-[#3869AD] border-[#3869AD]/30 hover:bg-[#3869AD]/5"
      >
        <Award className="h-3.5 w-3.5 mr-1 text-[#3869AD]" />
        {submission.status === "graded" ? "Edit Grade" : "Grade Submission"}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-[#DCE4EE] space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE4EE]">
              <div className="flex items-center gap-2 text-[#142541] font-bold text-base">
                <Award className="h-5 w-5 text-[#168B83]" />
                Grade Student Assessment
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

            {/* Student & Project Details */}
            <div className="rounded-xl border border-[#DCE4EE] bg-[#F3F6FA] p-3.5 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#142541]">{studentName}</div>
                  <div className="font-mono text-[#3869AD] text-[11px]">{studentCode}</div>
                </div>
                <div className="text-right text-[11px] text-[#5F6F84]">
                  {assignmentTitle}
                </div>
              </div>
              <div className="pt-2 border-t border-[#DCE4EE]">
                <div className="text-[11px] font-semibold text-[#5F6F84] mb-1">Submitted Content:</div>
                <div className="font-mono text-[11px] bg-white p-2.5 rounded-lg border border-[#DCE4EE] whitespace-pre-wrap max-h-24 overflow-y-auto text-[#263449]">
                  {submission.content}
                </div>
                {submission.attachment_url && (
                  <div className="pt-1.5 flex items-center gap-1 text-[11px]">
                    <ExternalLink className="h-3 w-3 text-[#3869AD]" />
                    <a
                      href={submission.attachment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#3869AD] hover:underline truncate"
                    >
                      {submission.attachment_url}
                    </a>
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label htmlFor="grade-score-input" className="font-semibold text-[#142541]">
                  Score (Out of {submission.assignment?.max_score || 100}) <span className="text-rose-500">*</span>
                </label>
                <Input
                  id="grade-score-input"
                  type="number"
                  min={0}
                  max={submission.assignment?.max_score || 100}
                  value={score}
                  onChange={(e) => setScore(Number(e.target.value))}
                  required
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="grade-feedback-input" className="font-semibold text-[#142541]">
                  Pedagogical Feedback <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="grade-feedback-input"
                  rows={3}
                  placeholder="Detail algorithmic correctness, edge case handling, code style, and areas of excellence."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  required
                  className="w-full rounded-lg border border-[#DCE4EE] p-2.5 text-xs text-[#263449] focus:outline-none focus:ring-2 focus:ring-[#3869AD]"
                />
              </div>

              <div className="pt-2 border-t border-[#DCE4EE]">
                <label className="flex items-center gap-2 cursor-pointer text-[#142541] font-semibold">
                  <input
                    type="checkbox"
                    checked={isGradePublished}
                    onChange={(e) => setIsGradePublished(e.target.checked)}
                    className="rounded border-[#DCE4EE] text-[#168B83]"
                  />
                  <span>Explicitly publish grade to Student & Parent Portals</span>
                </label>
                <p className="text-[11px] text-[#5F6F84] mt-0.5 ml-5">
                  When unchecked, the grade is saved as draft and remains hidden from students and parents.
                </p>
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
                  disabled={loading || feedback.length < 2}
                  className="bg-[#142541] hover:bg-[#1f3760] text-white text-xs"
                >
                  {loading ? "Recording..." : "Record Evaluation"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
