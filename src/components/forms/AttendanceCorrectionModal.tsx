"use client";

import React, { useActionState, useState } from "react";
import { correctAttendanceAction, type ActionResult } from "@/server/actions/admin";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

const initialState: ActionResult = {
  success: false,
  message: "",
};

export function AttendanceCorrectionModal({
  attendanceId,
  studentName,
  currentStatus,
}: {
  attendanceId: string;
  studentName: string;
  currentStatus: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(correctAttendanceAction, initialState);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
      >
        Correct
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#DCE4EE]">
              <h3 className="text-base font-bold text-[#142541]">
                Correct Attendance Record
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-[#5F6F84] hover:text-[#142541] text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#5F6F84]">
              Modifying attendance for <strong className="text-[#142541]">{studentName}</strong>. All corrections are logged to the immutable audit trail with your verifier ID and mandatory reason.
            </p>

            <form action={formAction} className="space-y-4 text-left">
              {state.message && (
                <Alert variant={state.success ? "success" : "error"}>
                  {state.message}
                </Alert>
              )}

              <input type="hidden" name="attendanceId" value={attendanceId} />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#142541]">
                  Updated Attendance Status
                </label>
                <select
                  name="newStatus"
                  defaultValue={currentStatus}
                  className="w-full rounded-lg border border-[#DCE4EE] bg-white px-3 py-2 text-xs text-[#263449] focus:border-[#3869AD] focus:outline-none"
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                  <option value="excused">Excused (Medical / Emergency)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#142541]">
                  Mandatory Audit Correction Reason <span className="text-[#B91C1C]">*</span>
                </label>
                <textarea
                  name="correctionReason"
                  required
                  rows={3}
                  placeholder="State the verifiable reason for updating this record (e.g. Guardian confirmed medical leave)..."
                  className="w-full rounded-lg border border-[#DCE4EE] bg-white px-3 py-2 text-xs text-[#263449] focus:border-[#3869AD] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DCE4EE]">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isPending}
                >
                  Save Audited Correction
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
