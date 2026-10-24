"use client";

import React, { useActionState } from "react";
import { Link2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { requestStudentLinkAction, type GuardianActionResult } from "@/server/actions/guardian";

const initialActionState: GuardianActionResult = {
  success: false,
  message: "",
};

export function LinkStudentForm() {
  const [state, formAction, isPending] = useActionState(requestStudentLinkAction, initialActionState);

  return (
    <div className="rounded-2xl border border-[#DCE4EE] bg-white p-6 shadow-sm space-y-5">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-[#E8EFF8] text-[#3869AD] flex items-center justify-center">
            <Link2 className="h-4 w-4" />
          </div>
          <h3 className="text-base font-bold text-[#142541]">
            Link a Student / Connect Your Child
          </h3>
        </div>
        <p className="text-xs text-[#5F6F84] leading-relaxed">
          Enter the permanent student code provided by your child or admissions counselor to request authorized guardian access.
        </p>
      </div>

      {state.message && (
        <Alert variant={state.success ? "success" : "error"}>
          {state.message}
        </Alert>
      )}

      <form action={formAction} className="space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="studentCode"
            className="block text-xs font-semibold uppercase tracking-wider text-[#142541]"
          >
            Student Code <span className="text-[#B91C1C]">*</span>
          </label>
          <input
            id="studentCode"
            name="studentCode"
            type="text"
            required
            placeholder="e.g. STU-8F39A1C2"
            maxLength={12}
            className="w-full rounded-lg border border-[#DCE4EE] bg-white px-3.5 py-2.5 font-mono text-xs text-[#142541] uppercase tracking-wider shadow-2xs focus:border-[#3869AD] focus:outline-none focus:ring-1 focus:ring-[#3869AD]"
          />
          {state.errors?.studentCode && (
            <p className="text-xs text-[#B91C1C] mt-1">{state.errors.studentCode[0]}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="relationshipType"
            className="block text-xs font-semibold uppercase tracking-wider text-[#142541]"
          >
            Relationship to Student <span className="text-[#B91C1C]">*</span>
          </label>
          <select
            id="relationshipType"
            name="relationshipType"
            defaultValue="parent"
            className="w-full rounded-lg border border-[#DCE4EE] bg-white px-3.5 py-2 text-xs text-[#142541] shadow-2xs focus:border-[#3869AD] focus:outline-none focus:ring-1 focus:ring-[#3869AD]"
          >
            <option value="parent">Parent</option>
            <option value="legal_guardian">Legal Guardian</option>
            <option value="other_authorized_guardian">Other Authorized Guardian</option>
          </select>
        </div>

        {/* Security Notice */}
        <div className="rounded-xl border border-[#3869AD]/20 bg-[#E8EFF8]/40 p-3.5 text-xs text-[#3869AD] flex items-start gap-2.5">
          <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-[#3869AD]" />
          <p className="leading-relaxed text-[11px] text-[#263449]">
            <strong>Zero-Trust Child Protection:</strong> Student codes identify a student but do not grant immediate data access. Your connection request must be verified by academy admissions before private learning and attendance records are unlocked.
          </p>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isPending}
            className="w-full sm:w-auto"
          >
            Submit Connection Request
          </Button>
        </div>
      </form>
    </div>
  );
}
