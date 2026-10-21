import React from "react";
import Link from "next/link";
import { SignUpForm } from "@/components/forms/SignUpForm";

export const metadata = {
  title: "Create an Account — Syntaxora AI Academy",
  description: "Register for a student or guardian account to enroll in live courses.",
};

export default function SignUpPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center sm:text-left">
        <h1 className="text-2xl font-bold text-[#142541]">Join Syntaxora</h1>
        <p className="text-xs text-[#5F6F84]">
          Create your account to start practical AI learning or monitor child progress.
        </p>
      </div>

      <SignUpForm />

      <div className="text-center text-xs text-[#5F6F84] pt-2 border-t border-[#DCE4EE]">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-[#3869AD] hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}
