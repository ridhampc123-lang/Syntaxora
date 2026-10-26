import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FAF8F3] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-[#354052]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link
          href="/"
          className="inline-flex items-center gap-3 group focus-visible:ring-2 focus-visible:ring-[#355F99] rounded-lg p-1"
          aria-label="Return to Syntaxora Homepage"
        >
          <div className="relative h-10 w-10 rounded-xl overflow-hidden bg-[#03060C] shadow-sm transition-transform group-hover:scale-105 border border-[#17243A]/10 shrink-0">
            <Image
              src="/icon.png"
              alt="Syntaxora"
              width={40}
              height={40}
              className="h-full w-full object-cover"
              priority
            />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-bold text-2xl tracking-tight text-[#17243A] leading-tight">
              Syntaxora
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-[#687386]">
              <span className="text-gradient-ai font-extrabold mr-0.5">AI</span> Learning Academy
            </span>
          </div>
        </Link>
        <p className="text-xs text-[#687386]">
          Secure Academy Authentication & Portal Access
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-sm border border-[#DDE2E7] rounded-2xl space-y-6 animate-fade-in-up card-editorial">
          {children}
        </div>

        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-1.5 text-xs text-[#687386]">
            <ShieldCheck className="h-4 w-4 text-[#167F78]" aria-hidden="true" />
            <span>Encrypted Session • Role-Scoped Access Control</span>
          </div>
        </div>
      </div>
    </div>
  );
}
