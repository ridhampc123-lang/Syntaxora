import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "teal" | "warm" | "editorial" | "ai";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "group inline-flex items-center justify-center font-medium transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-lg cursor-pointer select-none";

    const variantStyles = {
      primary:
        "bg-[#355F99] text-white hover:bg-[#294D7F] hover:shadow-xs focus-visible:ring-[#355F99] shadow-sm border border-transparent",
      secondary:
        "bg-[#17243A] text-white hover:bg-[#0F1827] hover:shadow-xs focus-visible:ring-[#17243A] shadow-sm border border-transparent",
      teal:
        "bg-[#167F78] text-white hover:bg-[#11655F] hover:shadow-xs focus-visible:ring-[#167F78] shadow-sm border border-transparent",
      outline:
        "border border-[#DDE2E7] bg-white text-[#354052] hover:bg-[#FAF8F3] hover:border-[#355F99]/60 hover:text-[#17243A] hover:shadow-xs focus-visible:ring-[#355F99]",
      ghost:
        "text-[#354052] hover:bg-[#F0F2F4] hover:text-[#17243A] focus-visible:ring-[#355F99]",
      warm:
        "bg-[#D7A66A] text-[#17243A] hover:bg-[#C89555] hover:shadow-xs focus-visible:ring-[#D7A66A] shadow-sm border border-transparent font-semibold",
      editorial:
        "border-b border-[#167F78] text-[#17243A] hover:text-[#167F78] rounded-none px-0 py-0.5 bg-transparent shadow-none hover:border-[#11655F] transition-colors",
      danger:
        "bg-[#B91C1C] text-white hover:bg-[#991b1b] hover:shadow-xs focus-visible:ring-[#B91C1C] shadow-sm border border-transparent",
      ai:
        "btn-gradient-ai text-white border-0 shadow-sm focus-visible:ring-[#D34BE9]",
    };

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 h-8 gap-1.5",
      md: "text-sm px-4 py-2 h-10 gap-2",
      lg: "text-base px-5 py-2.5 h-11 gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
