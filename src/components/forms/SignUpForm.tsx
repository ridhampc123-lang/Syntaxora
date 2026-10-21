"use client";

import React, { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signUpAction, type AuthActionResult } from "@/server/actions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { GraduationCap, Users } from "lucide-react";

const initialState: AuthActionResult = {
  success: false,
  message: "",
};

export function SignUpForm() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<"student" | "parent">("student");
  const [state, formAction, isPending] = useActionState(signUpAction, initialState);

  useEffect(() => {
    if (state.success && state.redirectTo) {
      router.push(state.redirectTo);
      router.refresh();
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-4">
      {state.message && (
        <Alert variant={state.success ? "success" : "error"}>
          {state.message}
        </Alert>
      )}

      {/* Role Selection Tabs - strictly Student or Parent */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#142541]">
          Register As <span className="text-[#B91C1C] ml-1">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setSelectedRole("student")}
            className={`flex items-center justify-center gap-2 rounded-lg border p-3 text-xs font-semibold transition-all cursor-pointer ${
              selectedRole === "student"
                ? "border-[#3869AD] bg-[#E8EFF8] text-[#3869AD]"
                : "border-[#DCE4EE] bg-white text-[#5F6F84] hover:bg-[#F3F6FA]"
            }`}
          >
            <GraduationCap className="h-4 w-4" aria-hidden="true" />
            <span>Student</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole("parent")}
            className={`flex items-center justify-center gap-2 rounded-lg border p-3 text-xs font-semibold transition-all cursor-pointer ${
              selectedRole === "parent"
                ? "border-[#168B83] bg-[#E2F4F2] text-[#168B83]"
                : "border-[#DCE4EE] bg-white text-[#5F6F84] hover:bg-[#F3F6FA]"
            }`}
          >
            <Users className="h-4 w-4" aria-hidden="true" />
            <span>Parent / Guardian</span>
          </button>
        </div>
        <input type="hidden" name="role" value={selectedRole} />
        {selectedRole === "parent" && (
          <p className="text-[11px] text-[#5F6F84] leading-normal pt-1">
            Note: Guardian accounts require an explicit verification invitation to link to student records.
          </p>
        )}
      </div>

      <Input
        label="Full Name"
        name="fullName"
        id="fullName"
        required
        placeholder="e.g. Alex Morgan"
        error={state.errors?.fullName?.[0]}
      />

      <Input
        label="Email Address"
        name="email"
        id="email"
        type="email"
        required
        autoComplete="email"
        placeholder="you@example.com"
        error={state.errors?.email?.[0]}
      />

      <Input
        label="Password"
        name="password"
        id="password"
        type="password"
        required
        autoComplete="new-password"
        placeholder="At least 8 chars, 1 uppercase, 1 number"
        helperText="Must be 8+ characters with at least 1 uppercase letter and 1 number"
        error={state.errors?.password?.[0]}
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isPending}
        className="w-full justify-center"
      >
        Create {selectedRole === "parent" ? "Guardian" : "Student"} Account
      </Button>
    </form>
  );
}
