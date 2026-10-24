"use client";

import React, { useState, useActionState } from "react";
import { CalendarClock, X } from "lucide-react";
import { rescheduleSessionAction, type BatchActionResult } from "@/server/actions/batch";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

interface RescheduleSessionModalProps {
  sessionId: string;
  sessionTitle: string;
  currentStartsAt: string;
  currentEndsAt: string;
}

const initialState: BatchActionResult = {
  success: false,
  message: "",
};

export function RescheduleSessionModal({
  sessionId,
  sessionTitle,
  currentStartsAt,
  currentEndsAt,
}: RescheduleSessionModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(rescheduleSessionAction, initialState);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#3869AD] hover:underline cursor-pointer"
      >
        <CalendarClock className="h-3 w-3" />
        Reschedule
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-[#DCE4EE] relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 text-[#5F6F84] hover:text-[#142541]"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-[#E8EFF8] text-[#3869AD]">
                <CalendarClock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#142541]">Reschedule Class Session</h3>
                <p className="text-xs text-[#5F6F84]">
                  Update occurrence time. Enrolled students and faculty will be notified.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#F3F6FA] border border-[#DCE4EE] text-xs space-y-1">
              <div className="font-semibold text-[#142541]">{sessionTitle}</div>
              <div className="text-[#5F6F84] text-[11px]">
                Currently: {new Date(currentStartsAt).toLocaleString()} – {new Date(currentEndsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            {state.message && (
              <Alert variant={state.success ? "success" : "error"}>
                {state.message}
              </Alert>
            )}

            <form action={formAction} className="space-y-3">
              <input type="hidden" name="sessionId" value={sessionId} />

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#142541] mb-1">
                  New Start Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="newStartsAt"
                  required
                  className="w-full rounded-lg border border-[#DCE4EE] bg-white px-3 py-2 text-xs text-[#263449] focus:border-[#3869AD] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#142541] mb-1">
                  New End Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="newEndsAt"
                  required
                  className="w-full rounded-lg border border-[#DCE4EE] bg-white px-3 py-2 text-xs text-[#263449] focus:border-[#3869AD] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#142541] mb-1">
                  Reason for Rescheduling <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="reason"
                  rows={2}
                  required
                  placeholder="e.g. Faculty medical reschedule, agreed with cohort."
                  className="w-full rounded-lg border border-[#DCE4EE] bg-white px-3 py-2 text-xs text-[#263449] focus:border-[#3869AD] focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#DCE4EE]">
                <Button variant="outline" size="sm" type="button" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={isPending}>
                  {isPending ? "Rescheduling..." : "Confirm Reschedule"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
