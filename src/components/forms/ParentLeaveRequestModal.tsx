"use client";

import React, { useState, useEffect, useSyncExternalStore, useActionState } from "react";
import { createPortal } from "react-dom";
import { Calendar, CheckCircle2, X, Send, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { submitGuardianInquiryAction, type GuardianActionResult } from "@/server/actions/guardian";

interface Props {
  studentName: string;
  studentCode: string;
  studentId?: string;
}

const initialState: GuardianActionResult = {
  success: false,
  message: "",
};

export function ParentLeaveRequestModal({ studentName, studentCode, studentId }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const [state, formAction, isPending] = useActionState(submitGuardianInquiryAction, initialState);

  // Lock background screen scroll when leave modal is open
  useEffect(() => {
    if (isOpen) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      const originalBodyOverscroll = document.body.style.overscrollBehavior;
      const originalHtmlOverscroll = document.documentElement.style.overscrollBehavior;
      const originalPaddingRight = document.body.style.paddingRight;

      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      document.body.style.overscrollBehavior = "contain";
      document.documentElement.style.overscrollBehavior = "contain";

      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setIsOpen(false);
        }
      };
      window.addEventListener("keydown", handleKeyDown);

      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.body.style.overscrollBehavior = originalBodyOverscroll;
        document.documentElement.style.overscrollBehavior = originalHtmlOverscroll;
        document.body.style.paddingRight = originalPaddingRight;
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="font-semibold text-xs flex items-center gap-1.5 cursor-pointer bg-white"
      >
        <Calendar className="h-3.5 w-3.5 text-[#3869AD]" />
        Submit Absence Notice / Leave Request
      </Button>

      {mounted &&
        isOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto overscroll-contain transition-opacity"
            role="dialog"
            aria-modal="true"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleClose();
              }
            }}
          >
            <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-[#DCE4EE] p-6 sm:p-7 space-y-5 animate-in fade-in-50 zoom-in-95 duration-200">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-[#F0F4F8] pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-[#E8EFF8] text-[#3869AD]">
                      <Calendar className="h-4 w-4" />
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#3869AD]">
                      Official Absence Notification
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-[#142541]">
                    Student Leave Request: {studentName}
                  </h3>
                  <p className="text-xs text-[#5F6F84]">
                    Code: <strong className="font-mono text-[#3869AD]">{studentCode}</strong> • Submitted notices are recorded in academy audit logs for instructor review.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-lg p-1.5 text-[#5F6F84] hover:bg-[#F3F6FA] hover:text-[#142541] transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {state.message && (
                <Alert variant={state.success ? "success" : "error"}>
                  {state.message}
                </Alert>
              )}

              {state.success ? (
                <div className="py-6 text-center space-y-3">
                  <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-[#142541]">
                      Leave Notice Logged Successfully
                    </h4>
                    <p className="text-xs text-[#5F6F84] max-w-sm mx-auto">
                      Your absence notice has been transmitted to student operations and the assigned course faculty.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleClose}
                    className="mt-2"
                  >
                    Done
                  </Button>
                </div>
              ) : (
                <form action={formAction} className="space-y-4">
                  <input type="hidden" name="studentId" value={studentId || ""} />
                  <input type="hidden" name="studentCode" value={studentCode} />
                  <input type="hidden" name="inquiryType" value="absence_notice" />
                  <input type="hidden" name="subject" value="Student Absence Notice" />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="leaveDate" className="block text-xs font-semibold text-[#142541]">
                        Absence Date <span className="text-rose-600">*</span>
                      </label>
                      <input
                        id="leaveDate"
                        name="leaveDate"
                        type="date"
                        required
                        defaultValue={new Date().toISOString().split("T")[0]}
                        className="w-full rounded-xl border border-[#DCE4EE] bg-white px-3 py-2 text-xs text-[#142541] shadow-2xs focus:border-[#3869AD] focus:outline-none focus:ring-1 focus:ring-[#3869AD]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="reason" className="block text-xs font-semibold text-[#142541]">
                        Reason for Absence <span className="text-rose-600">*</span>
                      </label>
                      <select
                        id="reason"
                        name="reason"
                        required
                        defaultValue="Medical / Healthcare Appointment"
                        className="w-full rounded-xl border border-[#DCE4EE] bg-white px-3 py-2 text-xs text-[#142541] shadow-2xs focus:border-[#3869AD] focus:outline-none focus:ring-1 focus:ring-[#3869AD]"
                      >
                        <option value="Medical / Healthcare Appointment">Medical / Healthcare Appointment</option>
                        <option value="School Examination / Academic Conflict">School Examination / Academic Conflict</option>
                        <option value="Family Commitment / Urgent Travel">Family Commitment / Urgent Travel</option>
                        <option value="Technical / Power / Internet Outage">Technical / Power / Internet Outage</option>
                        <option value="Other Authorized Reason">Other Authorized Reason</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="notes" className="block text-xs font-semibold text-[#142541]">
                      Detailed Note for Instructor & Operations <span className="text-rose-600">*</span>
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      required
                      rows={3}
                      placeholder="Please mention any makeup laboratory requirements or relevant details..."
                      className="w-full rounded-xl border border-[#DCE4EE] bg-white p-3 text-xs text-[#142541] shadow-2xs focus:border-[#3869AD] focus:outline-none focus:ring-1 focus:ring-[#3869AD]"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#DCE4EE] text-[11px] text-[#5F6F84] leading-relaxed">
                    <strong>Punctuality Policy:</strong> Submitting advance notice allows session recordings and lab notebook keys to be shared automatically with your learner upon faculty approval.
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleClose}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      isLoading={isPending}
                      className="bg-[#168B83] hover:bg-[#13746D]"
                    >
                      <Send className="h-3.5 w-3.5 mr-1" />
                      Submit Absence Notice
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
