import React from "react";
import Link from "next/link";
import { LoginForm } from "@/components/forms/LoginForm";

export const metadata = {
  title: "Sign In — Syntaxora AI Academy",
  description: "Sign in to access your student, parent, instructor, or admin portal.",
};

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center sm:text-left">
        <h1 className="text-2xl font-bold text-[#142541]">Portal Sign In</h1>
        <p className="text-xs text-[#5F6F84]">
          Enter your academy credentials to enter your role-specific portal.
        </p>
      </div>

      <LoginForm />

      <div className="text-center text-xs text-[#5F6F84] pt-2 border-t border-[#DCE4EE]">
        Don&apos;t have an account yet?{" "}
        <Link href="/sign-up" className="font-semibold text-[#3869AD] hover:underline">
          Register here
        </Link>
      </div>
    </div>
  );
}
