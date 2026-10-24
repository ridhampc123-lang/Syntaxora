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
        <h1 className="text-2xl font-bold text-[#142541]">Parent Registration</h1>
        <p className="text-xs text-[#5F6F84]">
          Create a guardian account to securely monitor your child&apos;s verified learning progress and attendance.
        </p>
      </div>

      <SignUpForm />

      <div className="pt-2 border-t border-[#DCE4EE] text-center space-y-2 text-xs text-[#5F6F84]">
        <div>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-[#3869AD] hover:underline">
            Sign in
          </Link>
        </div>
        <div>
          Student applying for admission?{" "}
          <Link href="/apply" className="font-semibold text-[#168B83] hover:underline">
            Submit Admission Application
          </Link>
        </div>
      </div>
    </div>
  );
}
