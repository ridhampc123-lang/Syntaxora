"use client";

import React, { useActionState, useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signInAction, type AuthActionResult } from "@/server/actions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { ShieldCheck, UserCheck, GraduationCap, Users, Sparkles, KeyRound, CheckCircle2 } from "lucide-react";

const initialState: AuthActionResult = {
  success: false,
  message: "",
};

export function LoginForm({ redirectUrl }: { redirectUrl?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryEmail = searchParams.get("email") || "";
  const isSetup = searchParams.get("setup") === "true";

  const [state, formAction, isPending] = useActionState(signInAction, initialState);
  const [email, setEmail] = useState(queryEmail);
  const [password, setPassword] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (queryEmail && !email) {
      setEmail(queryEmail);
    }
  }, [queryEmail, email]);

  useEffect(() => {
    if (state.success && state.redirectTo) {
      window.location.href = state.redirectTo;
    }
  }, [state, router]);

  const fillCredentials = (roleEmail: string, rolePass: string, autoSubmit = false) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    if (autoSubmit && formRef.current) {
      setTimeout(() => {
        formRef.current?.requestSubmit();
      }, 50);
    }
  };

  return (
    <div className="space-y-5">
      {isSetup && (
        <div className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-900 space-y-1 text-xs">
          <div className="font-bold flex items-center gap-1.5 text-emerald-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Admission Approved — Welcome to Syntaxora!</span>
          </div>
          <p className="text-[11px] text-emerald-700 leading-relaxed">
            Your student account is active. Enter your temporary password (e.g. <strong>StudentPassword123!</strong> or the code sent by admissions) to sign in.
          </p>
        </div>
      )}

      {/* Quick Administrator Access Card */}
      <div className="p-3.5 rounded-xl border border-[#00E5FF]/30 bg-gradient-to-br from-[#10233D] to-[#0A1628] text-white shadow-lg space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#00E5FF]/20 text-[#00E5FF]">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white tracking-wide block">
                Administrator Access
              </span>
              <span className="text-[11px] text-[#93A5C2]">
                Full platform control & academy management
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => fillCredentials("admin@syntaxora.com", "AdminPassword123!", true)}
            className="px-3 py-1.5 text-xs font-bold text-[#0A1628] bg-gradient-to-r from-[#00E5FF] to-[#38BDF8] hover:brightness-110 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
          >
            <Sparkles className="h-3 w-3 text-[#0A1628]" />
            1-Click Sign In
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#A6B7D4] pt-2 border-t border-white/10 font-mono">
          <span>
            Email: <strong className="text-white">admin@syntaxora.com</strong>
          </span>
          <span>
            Pass: <strong className="text-white">AdminPassword123!</strong>
          </span>
        </div>
      </div>

      {/* Role Quick-Fill Buttons */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5F6F84] block">
          Demo Portals (Click to Auto-Fill):
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => fillCredentials("admin@syntaxora.com", "AdminPassword123!")}
            className="p-2 rounded-lg border border-[#DCE4EE] bg-white hover:border-[#3869AD] hover:bg-[#F3F6FA] text-left transition-all cursor-pointer text-[#142541]"
          >
            <div className="flex items-center gap-1 font-bold text-[11px]">
              <ShieldCheck className="h-3 w-3 text-[#B91C1C]" /> Admin
            </div>
            <div className="text-[10px] text-[#5F6F84] truncate">admin@syntaxora.com</div>
          </button>

          <button
            type="button"
            onClick={() => fillCredentials("elena.vance@syntaxora.com", "Password123!")}
            className="p-2 rounded-lg border border-[#DCE4EE] bg-white hover:border-[#3869AD] hover:bg-[#F3F6FA] text-left transition-all cursor-pointer text-[#142541]"
          >
            <div className="flex items-center gap-1 font-bold text-[11px]">
              <UserCheck className="h-3 w-3 text-[#168B83]" /> Instructor
            </div>
            <div className="text-[10px] text-[#5F6F84] truncate">elena.vance@...</div>
          </button>

          <button
            type="button"
            onClick={() => fillCredentials("liam.oconnor@example.com", "Password123!")}
            className="p-2 rounded-lg border border-[#DCE4EE] bg-white hover:border-[#3869AD] hover:bg-[#F3F6FA] text-left transition-all cursor-pointer text-[#142541]"
          >
            <div className="flex items-center gap-1 font-bold text-[11px]">
              <GraduationCap className="h-3 w-3 text-[#3869AD]" /> Student
            </div>
            <div className="text-[10px] text-[#5F6F84] truncate">liam.oconnor@...</div>
          </button>

          <button
            type="button"
            onClick={() => fillCredentials("parent@example.com", "Password123!")}
            className="p-2 rounded-lg border border-[#DCE4EE] bg-white hover:border-[#3869AD] hover:bg-[#F3F6FA] text-left transition-all cursor-pointer text-[#142541]"
          >
            <div className="flex items-center gap-1 font-bold text-[11px]">
              <Users className="h-3 w-3 text-[#D97706]" /> Parent
            </div>
            <div className="text-[10px] text-[#5F6F84] truncate">parent@example.com</div>
          </button>
        </div>
      </div>

      <form ref={formRef} action={formAction} className="space-y-4">
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
          placeholder="admin@syntaxora.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={state.errors?.email?.[0]}
        />

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-xs font-semibold uppercase tracking-wider text-[#17243A]"
            >
              Password <span className="text-[#B91C1C] ml-1">*</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-[#355F99] hover:underline"
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={state.errors?.password?.[0]}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isPending}
          className="w-full justify-center text-sm font-semibold tracking-wide"
        >
          <KeyRound className="h-4 w-4 mr-1.5" />
          Sign In to Portal
        </Button>
      </form>
    </div>
  );
}
