"use client";

import React, { useState, useActionState, useEffect } from "react";
import { X, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Student } from "@/types";
import {
  adminDirectConnectAction,
  type GuardianActionResult,
} from "@/server/actions/guardian";

const initialActionState: GuardianActionResult = {
  success: false,
  message: "",
};

interface Props {
  students: Student[];
}

export function CreateDirectRelationshipModal({ students }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    adminDirectConnectAction,
    initialActionState
  );

  const [selectedStudentCode, setSelectedStudentCode] = useState("");
  const [canViewAttendance, setCanViewAttendance] = useState(true);
  const [canViewProgress, setCanViewProgress] = useState(true);
  const [canViewSchedule, setCanViewSchedule] = useState(true);
  const [canViewFees, setCanViewFees] = useState(true);
  const [canReceiveNotifications, setCanReceiveNotifications] = useState(true);

  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        setIsOpen(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [state.success]);

  return (
    <>
      <Button
        type="button"
        variant="primary"
        size="sm"
        onClick={() => setIsOpen(true)}
      >
        <UserPlus className="h-4 w-4 mr-1.5" />
        Direct Connect Parent & Student
      </Button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50 duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-[#DCE4EE] p-6 space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#DCE4EE] pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-[#142541]">
                  Direct Connect Parent & Student
                </h2>
                <p className="text-xs text-[#5F6F84] mt-0.5">
                  Establishes an authoritative relationship record between an existing parent account and student.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
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

            <form action={formAction} className="space-y-4">
              <input type="hidden" name="canViewAttendance" value={String(canViewAttendance)} />
              <input type="hidden" name="canViewProgress" value={String(canViewProgress)} />
              <input type="hidden" name="canViewSchedule" value={String(canViewSchedule)} />
              <input type="hidden" name="canViewFees" value={String(canViewFees)} />
              <input type="hidden" name="canReceiveNotifications" value={String(canReceiveNotifications)} />

              {/* Student Selection */}
              <div className="space-y-1">
                <label
                  htmlFor="studentCode"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#142541]"
                >
                  Select Enrolled Student <span className="text-[#B91C1C]">*</span>
                </label>
                <select
                  id="studentCode"
                  name="studentCode"
                  required
                  value={selectedStudentCode}
                  onChange={(e) => setSelectedStudentCode(e.target.value)}
                  className="w-full rounded-lg border border-[#DCE4EE] bg-white px-3 py-2 text-xs text-[#142541] shadow-2xs focus:border-[#3869AD] focus:outline-none"
                >
                  <option value="">-- Choose Canonical Student --</option>
                  {students.map((stu) => (
                    <option key={stu.id} value={stu.student_code}>
                      {stu.profile?.full_name || "Student"} ({stu.student_code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Parent Email */}
              <div className="space-y-1">
                <label
                  htmlFor="guardianEmail"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#142541]"
                >
                  Registered Parent Account Email <span className="text-[#B91C1C]">*</span>
                </label>
                <input
                  id="guardianEmail"
                  name="guardianEmail"
                  type="email"
                  required
                  placeholder="parent@example.com"
                  className="w-full rounded-lg border border-[#DCE4EE] bg-white px-3 py-2 text-xs text-[#142541] shadow-2xs focus:border-[#3869AD] focus:outline-none"
                />
                <p className="text-[11px] text-[#5F6F84]">
                  Account must be registered as a parent before linking can proceed.
                </p>
              </div>

              {/* Relationship Type */}
              <div className="space-y-1">
                <label
                  htmlFor="relationshipType"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#142541]"
                >
                  Relationship Type <span className="text-[#B91C1C]">*</span>
                </label>
                <select
                  id="relationshipType"
                  name="relationshipType"
                  defaultValue="parent"
                  className="w-full rounded-lg border border-[#DCE4EE] bg-white px-3 py-2 text-xs text-[#142541] shadow-2xs focus:border-[#3869AD] focus:outline-none"
                >
                  <option value="parent">Parent</option>
                  <option value="legal_guardian">Legal Guardian</option>
                  <option value="other_authorized_guardian">Other Authorized Guardian</option>
                </select>
              </div>

              {/* Granular Permissions */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#142541]">
                  Authorized Access Categories
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { label: "Attendance", checked: canViewAttendance, setter: setCanViewAttendance },
                    { label: "Grades & Progress", checked: canViewProgress, setter: setCanViewProgress },
                    { label: "Schedule", checked: canViewSchedule, setter: setCanViewSchedule },
                    { label: "Tuition / Fees", checked: canViewFees, setter: setCanViewFees },
                    { label: "Notifications", checked: canReceiveNotifications, setter: setCanReceiveNotifications },
                  ].map((p, idx) => (
                    <label
                      key={idx}
                      className="flex items-center gap-2 p-2 rounded-lg border border-[#DCE4EE] bg-[#F3F6FA] cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={p.checked}
                        onChange={(e) => p.setter(e.target.checked)}
                        className="rounded border-[#DCE4EE] text-[#3869AD]"
                      />
                      <span className="font-medium text-[#142541]">{p.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Verification Method */}
              <div className="space-y-1">
                <label
                  htmlFor="verificationMethod"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#142541]"
                >
                  Documented Verification Method
                </label>
                <select
                  id="verificationMethod"
                  name="verificationMethod"
                  defaultValue="admin_assisted_connection"
                  className="w-full rounded-lg border border-[#DCE4EE] bg-white px-3 py-2 text-xs text-[#142541] shadow-2xs focus:border-[#3869AD] focus:outline-none"
                >
                  <option value="admin_assisted_connection">Admin In-Person Verification</option>
                  <option value="government_id_verified">Government Photo ID Verified</option>
                  <option value="court_order_guardianship">Legal Guardianship Document On File</option>
                  <option value="admission_contract">Academy Admission Contract Signatory</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DCE4EE]">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(false)} disabled={isPending}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={isPending}>
                  Establish & Activate Link
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
