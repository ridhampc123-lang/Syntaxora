import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", error, label, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-[#142541]"
          >
            {label}
            {props.required && <span className="text-[#B91C1C] ml-1" aria-hidden="true">*</span>}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          ref={ref}
          className={cn(
            "w-full rounded-lg border border-[#DCE4EE] bg-white px-3.5 py-2 text-sm text-[#263449] placeholder:text-[#5F6F84]/60 transition-colors focus:border-[#3869AD] focus:outline-none focus:ring-2 focus:ring-[#3869AD]/20 disabled:cursor-not-allowed disabled:bg-[#F3F6FA] disabled:opacity-75",
            error && "border-[#B91C1C] focus:border-[#B91C1C] focus:ring-[#B91C1C]/20",
            className
          )}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error
              ? `${inputId}-error`
              : helperText
              ? `${inputId}-helper`
              : undefined
          }
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-xs font-medium text-[#B91C1C]" role="alert">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={`${inputId}-helper`} className="text-xs text-[#5F6F84]">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
