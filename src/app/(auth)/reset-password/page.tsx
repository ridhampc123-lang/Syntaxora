"use client";

import React, { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { resetPasswordAction, type AuthActionResult } from "@/server/actions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

const initialState: AuthActionResult = {
  success: false,
  message: "",
};

export default function ResetPasswordPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(resetPasswordAction, initialState);

  useEffect(() => {
    if (state.success && state.redirectTo) {
      const timer = setTimeout(() => {
        router.push(state.redirectTo!);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [state, router]);

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center sm:text-left">
        <h1 className="text-2xl font-bold text-[#142541]">Set New Password</h1>
        <p className="text-xs text-[#5F6F84]">
          Create a secure password with at least 8 characters, 1 uppercase letter, and 1 number.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        {state.message && (
          <Alert variant={state.success ? "success" : "error"}>
            {state.message}
          </Alert>
        )}

        <Input
          label="New Password"
          name="password"
          id="password"
          type="password"
          required
          autoComplete="new-password"
          placeholder="••••••••"
          helperText="At least 8 characters, 1 uppercase, 1 number"
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isPending}
          className="w-full justify-center"
        >
          Update Password
        </Button>
      </form>

      <div className="text-center text-xs text-[#5F6F84] pt-2 border-t border-[#DCE4EE]">
        Back to{" "}
        <Link href="/login" className="font-semibold text-[#3869AD] hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}
