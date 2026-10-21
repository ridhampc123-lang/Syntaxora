"use client";

import React, { useState } from "react";
import { UploadCloud, AlertCircle, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { submitAssignmentAction } from "@/server/actions/student";

interface Props {
  assignmentId: string;
  assignmentTitle: string;
  maxScore: number;
  existingContent?: string;
}

export function SubmitAssignmentModal({
  assignmentId,
  assignmentTitle,
  maxScore,
  existingContent,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [content, setContent] = useState(existingContent || "");
  const [attachmentUrl, setAttachmentUrl] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.set("assignmentId", assignmentId);
      formData.set("content", content);
      if (attachmentUrl) {
        formData.set("attachmentUrl", attachmentUrl);
      }

      const res = await submitAssignmentAction(formData);
      if (!res.success) {
        setError(res.error || "Failed to submit assignment");
      } else {
        setSuccess(true);
        setTimeout(() => {
          setIsOpen(false);
          setSuccess(false);
        }, 1500);
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
        className="bg-[#168B83] hover:bg-[#126f69] text-white text-xs h-7 px-3 flex items-center gap-1.5 shadow-xs"
      >
        <UploadCloud className="h-3.5 w-3.5" />
        {existingContent ? "Update Submission" : "Submit Deliverable"}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-[#DCE4EE] space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE4EE]">
              <div>
                <h3 className="text-sm font-bold text-[#142541]">Submit Project Solution</h3>
                <p className="text-[11px] text-[#5F6F84] mt-0.5">{assignmentTitle} ({maxScore} pts)</p>
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

            {success ? (
              <Alert variant="success">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-xs font-semibold">
                  Deliverable submitted successfully! Your instructor has been notified.
                </span>
              </Alert>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label htmlFor="sub-content-input" className="font-semibold text-[#142541]">
                    Solution Code / Repository Link / Summary <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    id="sub-content-input"
                    rows={4}
                    placeholder="Provide your GitHub repository URL, key implementation choices, and execution instructions."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    className="w-full rounded-lg border border-[#DCE4EE] p-2.5 text-xs text-[#263449] focus:outline-none focus:ring-2 focus:ring-[#3869AD] font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="sub-attach-input" className="font-semibold text-[#142541]">
                    External Artifact URL (Optional)
                  </label>
                  <Input
                    id="sub-attach-input"
                    type="url"
                    placeholder="https://colab.research.google.com/... or cloud artifact link"
                    value={attachmentUrl}
                    onChange={(e) => setAttachmentUrl(e.target.value)}
                    className="text-xs"
                  />
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
                    disabled={loading || content.trim().length < 5}
                    className="bg-[#142541] hover:bg-[#1f3760] text-white text-xs"
                  >
                    {loading ? "Submitting..." : "Confirm & Submit"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
