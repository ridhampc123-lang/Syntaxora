"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Structured error logging without leaking secrets or private data
    console.error("[Application Error Boundary]", {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAF8F3] px-4 py-16 text-center text-[#354052]">
      <div className="max-w-md w-full space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 group focus-visible:ring-2 focus-visible:ring-[#355F99] rounded-lg p-1 mx-auto"
          aria-label="Syntaxora AI Academy Homepage"
        >
          <div className="relative h-9 w-9 rounded-xl overflow-hidden shadow-xs border border-[#17243A]/10 bg-[#03060C] shrink-0">
            <Image
              src="/icon.png"
              alt="Syntaxora"
              width={36}
              height={36}
              className="h-full w-full object-cover"
              priority
            />
          </div>
          <span className="font-bold text-xl tracking-tight text-[#17243A]">
            Syntaxora
          </span>
        </Link>

        <div className="rounded-2xl border border-[#DDE2E7] bg-white p-8 sm:p-10 space-y-6 shadow-sm">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-[#FEF2F2] text-[#B91C1C] flex items-center justify-center border border-[#FECACA]">
            <AlertCircle className="h-7 w-7" aria-hidden="true" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#B91C1C]">
              System Notice • Rendering Error
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#17243A] tracking-tight">
              An Unexpected Error Occurred
            </h1>
            <p className="text-xs sm:text-sm text-[#687386] leading-relaxed">
              We encountered an issue processing this request. Your data has not been affected.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="primary"
              size="md"
              className="w-full sm:w-auto justify-center font-semibold"
              onClick={() => reset()}
            >
              <RotateCcw className="h-4 w-4 mr-1.5" aria-hidden="true" />
              Try Again
            </Button>
            <Link href="/" className="w-full sm:w-auto">
              <Button variant="outline" size="md" className="w-full justify-center">
                <Home className="h-4 w-4 mr-1.5" aria-hidden="true" />
                Return to Home
              </Button>
            </Link>
          </div>
        </div>

        <p className="text-xs text-[#687386]">
          If this issue persists, please notify{" "}
          <a
            href="mailto:support@syntaxora.com"
            className="text-[#355F99] font-semibold hover:underline"
          >
            support@syntaxora.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}
