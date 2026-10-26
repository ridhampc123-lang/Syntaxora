"use client";

import React, { useActionState } from "react";
import Link from "next/link";
import { forgotPasswordAction, type AuthActionResult } from "@/server/actions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

const initialState: AuthActionResult = {
  success: false,
  message: "",
};

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(forgotPasswordAction, initialState);

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center sm:text-left">
        <h1 className="text-2xl font-bold text-[#17243A]">Reset Password</h1>
        <p className="text-xs text-[#687386]">
          Enter your registered email address and we will dispatch a password recovery link.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        {state.message && (
          <Alert variant={state.success ? "success" : "error"}>
            {state.message}
          </Alert>
        )}

        <Input
          label="Registered Email Address"
          name="email"
          id="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isPending}
          className="w-full justify-center font-semibold"
        >
          Send Password Reset Link
        </Button>
      </form>

      <div className="text-center text-xs text-[#687386] pt-4 border-t border-[#DDE2E7]">
        Remembered your password?{" "}
        <Link href="/login" className="font-semibold text-[#355F99] hover:underline">
          Return to Sign In
        </Link>
      </div>
    </div>
  );
}
