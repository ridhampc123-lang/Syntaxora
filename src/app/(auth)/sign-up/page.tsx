import React from "react";
import Link from "next/link";
import { SignUpForm } from "@/components/forms/SignUpForm";

export const metadata = {
  title: "Parent & Guardian Registration — Syntaxora AI Academy",
  description: "Register a parent or guardian account to securely link to your student's progress and attendance.",
};

export default function SignUpPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center sm:text-left">
        <h1 className="text-2xl font-bold text-[#17243A]">Parent & Guardian Registration</h1>
        <p className="text-xs text-[#687386]">
          Create a guardian account to securely monitor your enrolled student&apos;s verified attendance and progress.
        </p>
      </div>

      <SignUpForm />

      <div className="pt-4 border-t border-[#DDE2E7] text-center space-y-2 text-xs text-[#687386]">
        <div>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-[#355F99] hover:underline">
            Sign In
          </Link>
        </div>
        <div>
          Prospective student?{" "}
          <Link href="/apply" className="font-semibold text-[#167F78] hover:underline">
            Submit Cohort Admission Application
          </Link>
        </div>
      </div>
    </div>
  );
}
