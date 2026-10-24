"use client";

import React, { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInAction, type AuthActionResult } from "@/server/actions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

const initialState: AuthActionResult = {
  success: false,
  message: "",
};

export function LoginForm({ redirectUrl }: { redirectUrl?: string }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(signInAction, initialState);

  useEffect(() => {
    if (state.success && state.redirectTo) {
      window.location.href = state.redirectTo;
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-4">
      {redirectUrl && <input type="hidden" name="redirect" value={redirectUrl} />}
      {state.message && (
        <Alert variant={state.success ? "success" : "error"}>
          {state.message}
        </Alert>
      )}

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

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label
            htmlFor="password"
            className="block text-xs font-semibold uppercase tracking-wider text-[#142541]"
          >
            Password <span className="text-[#B91C1C] ml-1">*</span>
          </label>
          <Link
            href="/forgot-password"
            className="text-xs font-medium text-[#3869AD] hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <Input
          name="password"
          id="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          error={state.errors?.password?.[0]}
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isPending}
        className="w-full justify-center"
      >
        Sign In to Portal
      </Button>
    </form>
  );
}
