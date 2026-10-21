import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "teal" | "navy" | "secondary" | "success" | "warning" | "error" | "outline";
}

export function Badge({
  className,
  variant = "primary",
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    primary: "bg-[#E8EFF8] text-[#3869AD] border-transparent",
    teal: "bg-[#E2F4F2] text-[#168B83] border-transparent",
    navy: "bg-[#142541] text-white border-transparent",
    secondary: "bg-[#F3F6FA] text-[#5F6F84] border-[#DCE4EE]",
    success: "bg-[#DCFCE7] text-[#15803D] border-transparent",
    warning: "bg-[#FEF3C7] text-[#B45309] border-transparent",
    error: "bg-[#FEE2E2] text-[#B91C1C] border-transparent",
    outline: "bg-transparent text-[#263449] border-[#DCE4EE]",
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
