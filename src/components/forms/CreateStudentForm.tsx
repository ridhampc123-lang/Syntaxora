"use client";

import React, { useActionState, useEffect } from "react";
import { createStudentAction, type ActionResult } from "@/server/actions/admin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

const initialState: ActionResult = {
  success: false,
  message: "",
};

export function CreateStudentForm({ onComplete }: { onComplete?: () => void }) {
  const [state, formAction, isPending] = useActionState(createStudentAction, initialState);

  useEffect(() => {
    if (state.success && onComplete) {
      onComplete();
    }
  }, [state, onComplete]);

  return (
    <form action={formAction} className="space-y-4">
      {state.message && (
        <Alert variant={state.success ? "success" : "error"}>
          {state.message}
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Full Legal Name"
          name="fullName"
          id="studentFullName"
          required
          placeholder="e.g. Liam O'Connor"
          error={state.errors?.fullName?.[0]}
        />

        <Input
          label="Student Email"
          name="email"
          id="studentEmail"
          type="email"
          required
          placeholder="student@example.com"
          error={state.errors?.email?.[0]}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Date of Birth (Optional)"
          name="dateOfBirth"
          id="studentDob"
          type="date"
          helperText="Restricted data for minor cohort age verification"
        />

        <Input
          label="Emergency Contact Phone"
          name="emergencyPhone"
          id="emergencyPhone"
          type="tel"
          placeholder="+1 (555) 000-0000"
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="studentNotes"
          className="block text-xs font-semibold uppercase tracking-wider text-[#142541]"
        >
          Administrative Notes
        </label>
        <textarea
          name="notes"
          id="studentNotes"
          rows={2}
          placeholder="Internal notes, cohort goals, or accommodations..."
          className="w-full rounded-lg border border-[#DCE4EE] bg-white px-3 py-2 text-xs text-[#263449] focus:border-[#3869AD] focus:outline-none"
        />
      </div>

      <Button
        type="submit"
        variant="ai"
        size="md"
        isLoading={isPending}
        className="w-full justify-center font-bold shadow-xs"
      >
        Generate Student Code & Create Record
      </Button>
    </form>
  );
}
