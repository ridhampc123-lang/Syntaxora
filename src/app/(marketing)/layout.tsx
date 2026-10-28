import React from "react";
import { MarketingHeader } from "@/components/navigation/MarketingHeader";
import { MarketingFooter } from "@/components/navigation/MarketingFooter";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#FAF8F3] text-[#354052]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#17243A] focus:text-white focus:rounded-lg focus:shadow-md focus:outline-none focus:ring-2 focus:ring-[#355F99] text-xs font-semibold"
      >
        Skip to main content
      </a>
      <MarketingHeader />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <MarketingFooter />
    </div>
  );
}
