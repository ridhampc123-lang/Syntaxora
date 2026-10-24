"use client";

import React, { useState, useActionState } from "react";
import { ArrowLeftRight, X } from "lucide-react";
import { transferStudentBatchAction, type BatchActionResult } from "@/server/actions/batch";
import { Batch } from "@/types";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

interface TransferBatchModalProps {
  enrollmentId: string;
  studentName: string;
  studentCode: string;
  currentBatchName: string;
  courseId: string;
  availableBatches: Batch[];
}

const initialState: BatchActionResult = {
  success: false,
  message: "",
};

export function TransferBatchModal({
  enrollmentId,
  studentName,
  studentCode,
  currentBatchName,
  courseId,
  availableBatches,
}: TransferBatchModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(transferStudentBatchAction, initialState);

  // Eligible destination batches for this course
  const eligibleBatches = availableBatches.filter(
    (b) => b.course_id === courseId && b.name !== currentBatchName && b.status !== "cancelled" && b.status !== "completed"
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#3869AD] hover:underline cursor-pointer"
      >
        <ArrowLeftRight className="h-3 w-3" />
        Transfer
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-xl border border-[#DCE4EE] relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 text-[#5F6F84] hover:text-[#142541]"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-[#E8EFF8] text-[#3869AD]">
                <ArrowLeftRight className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#142541]">Transfer Student Cohort</h3>
                <p className="text-xs text-[#5F6F84]">
                  Move learner to another active batch while preserving all academic history.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#F3F6FA] border border-[#DCE4EE] text-xs space-y-1">
              <div><strong className="text-[#142541]">Student:</strong> {studentName} ({studentCode})</div>
              <div><strong className="text-[#142541]">Current Batch:</strong> {currentBatchName}</div>
            </div>

            {state.message && (
              <Alert variant={state.success ? "success" : "error"}>
                {state.message}
              </Alert>
            )}

            <form action={formAction} className="space-y-4">
              <input type="hidden" name="enrollmentId" value={enrollmentId} />

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#142541] mb-1">
                  Destination Batch <span className="text-red-500">*</span>
                </label>
                {eligibleBatches.length === 0 ? (
                  <p className="text-xs text-[#5F6F84] italic">
                    No other eligible active batches found for this course.
                  </p>
                ) : (
                  <select
                    name="destinationBatchId"
                    className="w-full rounded-lg border border-[#DCE4EE] bg-white px-3 py-2 text-xs text-[#263449] focus:border-[#3869AD] focus:outline-hidden"
                    required
                  >
                    {eligibleBatches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.batch_code}) — {b.enrolled_count ?? 0}/{b.capacity} Seats
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#142541] mb-1">
                  Reason for Transfer <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="reason"
                  rows={2}
                  required
                  placeholder="e.g. Schedule adjustment requested by guardian; verified availability."
                  className="w-full rounded-lg border border-[#DCE4EE] bg-white px-3 py-2 text-xs text-[#263449] focus:border-[#3869AD] focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#DCE4EE]">
                <Button variant="outline" size="sm" type="button" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  disabled={isPending || eligibleBatches.length === 0}
                >
                  {isPending ? "Transferring..." : "Confirm Transfer"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
