import React from "react";
import { MarketingHeader } from "@/components/navigation/MarketingHeader";
import { MarketingFooter } from "@/components/navigation/MarketingFooter";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F3F6FA]">
      <MarketingHeader />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
