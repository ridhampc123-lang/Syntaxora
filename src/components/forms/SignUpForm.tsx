"use client";

import React, { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUpAction, type AuthActionResult } from "@/server/actions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Users } from "lucide-react";

const initialState: AuthActionResult = {
  success: false,
  message: "",
};

export function SignUpForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(signUpAction, initialState);

  useEffect(() => {
    if (state.success && state.redirectTo) {
      window.location.href = state.redirectTo;
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-4">
      {state.message && (
        <Alert variant={state.success ? "success" : "error"}>
          {state.message}
        </Alert>
      )}

      {/* Prospective Student Notice */}
      <div className="rounded-xl border border-[#DDE2E7] bg-[#EAF0F8] p-3.5 flex items-start gap-2.5">
        <Users className="h-4 w-4 text-[#355F99] shrink-0 mt-0.5" aria-hidden="true" />
        <div className="text-xs text-[#354052] space-y-1">
          <span className="font-bold text-[#17243A]">
            Parent & Guardian Registration Portal
          </span>
          <p className="text-[#687386] leading-normal">
            This registration is exclusively for parents and guardians. Prospective students must submit an{" "}
            <Link href="/apply" className="font-semibold text-[#355F99] underline hover:text-[#17243A]">
              Admission Application
            </Link>{" "}
            for faculty review.
          </p>
        </div>
      </div>

      <input type="hidden" name="role" value="parent" />

      <Input
        label="Full Name"
        name="fullName"
        id="fullName"
        required
        placeholder="e.g. Sarah O'Connor"
        error={state.errors?.fullName?.[0]}
      />

      <Input
        label="Email Address"
        name="email"
        id="email"
        type="email"
        required
        autoComplete="email"
        placeholder="parent@example.com"
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

      {/* Student Unique Code Connection Section */}
      <div className="rounded-xl border border-[#3869AD]/20 bg-[#F3F6FA] p-4 space-y-3.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="studentCode"
            className="block text-xs font-bold uppercase tracking-wider text-[#142541]"
          >
            Student Unique Code
          </label>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E8EFF8] text-[#3869AD]">
            Connect Your Child
          </span>
        </div>

        <input
          id="studentCode"
          name="studentCode"
          type="text"
          placeholder="e.g. STU-8F39A1C2"
          maxLength={15}
          className="w-full rounded-lg border border-[#DCE4EE] bg-white px-3.5 py-2.5 font-mono text-xs text-[#142541] uppercase tracking-wider shadow-2xs focus:border-[#3869AD] focus:outline-none focus:ring-1 focus:ring-[#3869AD]"
        />
        {state.errors?.studentCode && (
          <p className="text-xs text-[#B91C1C] mt-1">{state.errors.studentCode[0]}</p>
        )}

        <div className="space-y-1.5">
          <label
            htmlFor="relationshipType"
            className="block text-[11px] font-semibold text-[#5F6F84] uppercase tracking-wider"
          >
            Relationship to Student
          </label>
          <select
            id="relationshipType"
            name="relationshipType"
            defaultValue="parent"
            className="w-full rounded-lg border border-[#DCE4EE] bg-white px-3 py-2 text-xs text-[#142541] shadow-2xs focus:border-[#3869AD] focus:outline-none"
          >
            <option value="parent">Parent (Mother / Father)</option>
            <option value="legal_guardian">Legal Guardian</option>
            <option value="other_authorized_guardian">Other Authorized Guardian</option>
          </select>
        </div>

        <p className="text-[11px] text-[#5F6F84] leading-relaxed">
          💡 <strong>How to find your Student Code:</strong> Stated on your child&apos;s admission confirmation email or at the top of their Student Portal (e.g. <code>STU-8F39A1C2</code>). You can also leave this blank and connect them anytime from your Parent Dashboard.
        </p>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isPending}
        className="w-full justify-center"
      >
        Create Parent Account
      </Button>
    </form>
  );
}
