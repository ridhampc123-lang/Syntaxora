import React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "success" | "warning" | "error";
  title?: string;
}

export function Alert({
  className,
  variant = "info",
  title,
  children,
  ...props
}: AlertProps) {
  const icons = {
    info: <Info className="h-5 w-5 text-[#3869AD] shrink-0" aria-hidden="true" />,
    success: <CheckCircle2 className="h-5 w-5 text-[#15803D] shrink-0" aria-hidden="true" />,
    warning: <AlertTriangle className="h-5 w-5 text-[#B45309] shrink-0" aria-hidden="true" />,
    error: <AlertCircle className="h-5 w-5 text-[#B91C1C] shrink-0" aria-hidden="true" />,
  };

  const variantStyles = {
    info: "bg-[#E8EFF8] border-[#3869AD]/30 text-[#142541]",
    success: "bg-[#DCFCE7] border-[#15803D]/30 text-[#14532D]",
    warning: "bg-[#FEF3C7] border-[#B45309]/30 text-[#78350F]",
    error: "bg-[#FEE2E2] border-[#B91C1C]/30 text-[#7F1D1D]",
  };

  return (
    <div
      role="alert"
      className={cn(
        "flex gap-3 rounded-lg border p-4 text-sm leading-relaxed",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {icons[variant]}
      <div className="space-y-1">
        {title && <h5 className="font-semibold">{title}</h5>}
        <div>{children}</div>
      </div>
    </div>
  );
}
