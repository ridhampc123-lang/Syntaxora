import React from "react";
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
        <h1 className="text-2xl font-bold text-[#142541]">Portal Sign In</h1>
        <p className="text-xs text-[#5F6F84]">
          Enter your academy credentials to enter your role-specific portal.
        </p>
      </div>

      <LoginForm redirectUrl={redirectUrl} />

      <div className="pt-3 border-t border-[#DCE4EE] text-center space-y-2 text-xs text-[#5F6F84]">
        <div>
          Parent or Guardian?{" "}
          <Link href="/sign-up?role=parent" className="font-semibold text-[#168B83] hover:underline">
            Register Parent Account
          </Link>
        </div>
        <div>
          Prospective Student?{" "}
          <Link href="/apply" className="font-semibold text-[#3869AD] hover:underline">
            Apply for Admission
          </Link>
        </div>
      </div>
    </div>
  );
}
