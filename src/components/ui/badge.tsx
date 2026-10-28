import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "teal" | "navy" | "secondary" | "success" | "warning" | "error" | "outline" | "warm" | "ai";
}

export function Badge({
  className,
  variant = "primary",
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    primary: "bg-[#EAF0F8] text-[#355F99] border-[#355F99]/20",
    teal: "bg-[#E7F5F4] text-[#167F78] border-[#167F78]/20",
    navy: "bg-[#17243A] text-white border-transparent",
    warm: "bg-[#FDF6ED] text-[#9A6726] border-[#D7A66A]/30",
    secondary: "bg-[#F0F2F4] text-[#687386] border-[#DDE2E7]",
    success: "bg-[#DCFCE7] text-[#15803D] border-transparent",
    warning: "bg-[#FEF3C7] text-[#B45309] border-transparent",
    error: "bg-[#FEE2E2] text-[#B91C1C] border-transparent",
    outline: "bg-transparent text-[#354052] border-[#DDE2E7]",
    ai: "badge-ai-gradient text-[#17243A] font-bold border-[#D34BE9]/30",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
