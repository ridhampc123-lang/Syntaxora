import React, { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "@/components/forms/LoginForm";

export const metadata = {
  title: "Sign In — Syntaxora AI Academy",
  description: "Sign in to access your student, parent, instructor, or admin portal.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ redirect?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const redirectUrl = resolvedParams?.redirect;

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center sm:text-left">
        <h1 className="text-2xl font-bold text-[#17243A]">Portal Sign In</h1>
        <p className="text-xs text-[#687386]">
          Enter your academy credentials to access your authorized portal.
        </p>
      </div>

      <Suspense fallback={<div className="h-48 animate-pulse rounded-xl bg-gray-100" />}>
        <LoginForm redirectUrl={redirectUrl} />
      </Suspense>

      <div className="pt-4 border-t border-[#DDE2E7] text-center space-y-2 text-xs text-[#687386]">
        <div>
          Parent or Guardian?{" "}
          <Link href="/sign-up?role=parent" className="font-semibold text-[#167F78] hover:underline">
            Register Parent Account
          </Link>
        </div>
        <div>
          Prospective Student?{" "}
          <Link href="/apply" className="font-semibold text-[#355F99] hover:underline">
            Apply for Cohort Admission
          </Link>
        </div>
      </div>
    </div>
  );
}
