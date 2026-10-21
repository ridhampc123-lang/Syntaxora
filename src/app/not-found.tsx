import React from "react";
import Link from "next/link";
import { Compass, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F3F6FA] px-4 text-center">
      <div className="max-w-md space-y-6">
        <div className="mx-auto h-16 w-16 rounded-full bg-[#E8EFF8] text-[#3869AD] flex items-center justify-center">
          <Compass className="h-8 w-8" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-[#142541]">Page Not Found</h1>
          <p className="text-sm text-[#5F6F84]">
            The course, lesson, or page you were looking for does not exist or may have been moved.
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/">
            <Button variant="primary" size="md">
              Return to Home
            </Button>
          </Link>
          <Link href="/courses">
            <Button variant="outline" size="md">
              Explore Courses
              <ArrowRight className="h-4 w-4 ml-1.5" aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
