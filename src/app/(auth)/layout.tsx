import React from "react";
import Link from "next/link";
import { Sparkles, ShieldCheck } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F3F6FA] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-bold text-2xl text-[#142541] tracking-tight"
        >
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-[#142541] to-[#3869AD] flex items-center justify-center text-white shadow-sm">
            <Sparkles className="h-5 w-5 text-white" aria-hidden="true" />
          </div>
          <span>Syntaxora</span>
        </Link>
        <p className="text-xs text-[#5F6F84]">
          AI Academy Portal Authentication
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-sm border border-[#DCE4EE] rounded-2xl space-y-6">
          {children}
        </div>

        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-1.5 text-xs text-[#5F6F84]">
            <ShieldCheck className="h-4 w-4 text-[#168B83]" aria-hidden="true" />
            <span>Encrypted Session • Role-Scoped Access Control</span>
          </div>
        </div>
      </div>
    </div>
  );
}
