"use client";

import React, { useState } from "react";
import { CalendarPlus, AlertCircle, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitStudentLeaveNoticeAction } from "@/server/actions/student";

export function StudentLeaveRequestModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [category, setCategory] = useState("academic_conflict");
  const [explanation, setExplanation] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.set("startDate", startDate);
      formData.set("endDate", endDate);
      formData.set("reasonCategory", category);
      formData.set("explanation", explanation);

      const res = await submitStudentLeaveNoticeAction(formData);
      if (!res.success) {
        setError(res.error || "Failed to submit leave notice.");
      } else {
        setSuccess(res.message || "Leave notice submitted successfully.");
        setTimeout(() => {
          setIsOpen(false);
          setSuccess(null);
          setExplanation("");
        }, 1800);
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
        className="bg-[#142541] hover:bg-[#1E375F] text-white text-xs h-8 px-3.5 flex items-center gap-1.5 shadow-xs"
      >
        <CalendarPlus className="h-3.5 w-3.5 text-cyan-300" />
        <span>Report Absence / Request Leave</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-[#DCE4EE] space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE4EE]">
              <div>
                <h3 className="text-sm font-bold text-[#142541]">
                  Advance Absence Notification
                </h3>
                <p className="text-[11px] text-[#5F6F84] mt-0.5">
                  Notify your cohort instructor and mentors in advance of an unavoidable session absence.
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[#5F6F84] hover:text-[#142541] p-1 rounded-lg transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {success ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <span className="font-semibold">{success}</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#142541]">
                      Start Date *
                    </label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#142541]">
                      End Date *
                    </label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#142541]">
                    Absence Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs rounded-lg border border-[#DCE4EE] p-2.5 bg-white text-[#142541] focus:outline-hidden focus:ring-2 focus:ring-[#3869AD]"
                  >
                    <option value="academic_conflict">School / College Exam Conflict</option>
                    <option value="medical_illness">Medical / Health Leave</option>
                    <option value="family_emergency">Family Emergency</option>
                    <option value="technical_outage">Hardware / Internet Infrastructure Issue</option>
                    <option value="other">Other Official Reason</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#142541]">
                    Detailed Explanation *
                  </label>
                  <textarea
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    rows={3}
                    placeholder="Provide details regarding the upcoming absence. Recorded for faculty audit."
                    required
                    className="w-full text-xs rounded-lg border border-[#DCE4EE] p-2.5 bg-white text-[#142541] focus:outline-hidden focus:ring-2 focus:ring-[#3869AD]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#DCE4EE]">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    className="text-xs h-8"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-[#142541] hover:bg-[#1E375F] text-white text-xs h-8"
                  >
                    {loading ? "Submitting..." : "Submit Absence Notice"}
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
