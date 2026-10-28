import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Compass, ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
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
          <div className="mx-auto h-14 w-14 rounded-2xl bg-[#EAF0F8] text-[#355F99] flex items-center justify-center border border-[#355F99]/20">
            <Compass className="h-7 w-7" aria-hidden="true" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#355F99]">
              Error 404 • Resource Not Found
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#17243A] tracking-tight">
              Page Not Located
            </h1>
            <p className="text-xs sm:text-sm text-[#687386] leading-relaxed">
              The syllabus, lesson, or directory you requested does not exist or may have been repositioned.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/" className="w-full sm:w-auto">
              <Button variant="primary" size="md" className="w-full justify-center font-semibold">
                <Home className="h-4 w-4 mr-1.5" aria-hidden="true" />
                Return Home
              </Button>
            </Link>
            <Link href="/courses" className="w-full sm:w-auto">
              <Button variant="outline" size="md" className="w-full justify-center">
                Browse Courses
                <ArrowRight className="h-4 w-4 ml-1.5 arrow-icon" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </div>

        <p className="text-xs text-[#687386]">
          Need admissions assistance? Contact{" "}
          <Link href="/contact" className="text-[#355F99] font-semibold hover:underline">
            admissions support
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
