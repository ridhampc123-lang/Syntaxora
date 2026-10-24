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
      <div className="rounded-xl border border-[#DCE4EE] bg-[#E8EFF8] p-3.5 flex items-start gap-2.5">
        <Users className="h-4 w-4 text-[#3869AD] shrink-0 mt-0.5" aria-hidden="true" />
        <div className="text-xs text-[#263449] space-y-1">
          <span className="font-bold text-[#142541]">
            Parent & Guardian Registration Portal
          </span>
          <p className="text-[#5F6F84] leading-normal">
            This registration is exclusively for parents and guardians. Prospective students must submit an{" "}
            <Link href="/apply" className="font-semibold text-[#3869AD] underline hover:text-[#142541]">
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
