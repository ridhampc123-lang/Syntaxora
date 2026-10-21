"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw } from "lucide-react";
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F3F6FA] px-4 text-center">
      <div className="max-w-md space-y-6">
        <div className="mx-auto h-16 w-16 rounded-full bg-[#FEE2E2] text-[#B91C1C] flex items-center justify-center">
          <AlertCircle className="h-8 w-8" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-[#142541]">Something Went Wrong</h1>
          <p className="text-sm text-[#5F6F84]">
            An unexpected error occurred while processing your request. Please try again or return to the main dashboard.
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button variant="primary" size="md" onClick={() => reset()}>
            <RotateCcw className="h-4 w-4 mr-1.5" />
            Try Again
          </Button>
          <Link href="/">
            <Button variant="outline" size="md">
              Go to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
