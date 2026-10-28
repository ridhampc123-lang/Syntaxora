"use client";

import React from "react";
import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  label?: string;
  variant?: "outline" | "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  icon?: "download" | "printer";
  className?: string;
}

export function PrintButton({
  label = "Export Statement",
  variant = "outline",
  size = "sm",
  icon = "download",
  className = "",
}: Props) {
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handlePrint}
      className={`text-xs flex items-center gap-1.5 cursor-pointer ${className}`}
    >
      {icon === "printer" ? (
        <Printer className="h-3.5 w-3.5" />
      ) : (
        <Download className="h-3.5 w-3.5" />
      )}
      <span>{label}</span>
    </Button>
  );
}

export function PrintReceiptLink({
  label = "PDF Receipt",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <button
      type="button"
      onClick={handlePrint}
      className={`inline-flex items-center gap-1 text-xs font-bold text-[#3869AD] hover:underline cursor-pointer ${className}`}
    >
      <Download className="h-3 w-3" />
      <span>{label}</span>
    </button>
  );
}
