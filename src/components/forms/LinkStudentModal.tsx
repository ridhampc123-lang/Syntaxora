"use client";

import React, { useState } from "react";
import { PlusCircle, X, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LinkStudentForm } from "./LinkStudentForm";

interface Props {
  buttonText?: string;
  variant?: "outline" | "primary" | "secondary";
  size?: "sm" | "md" | "lg";
}

export function LinkStudentModal({
  buttonText = "Link Another Child",
  variant = "outline",
  size = "sm",
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={() => setIsOpen(true)}
        className="font-semibold text-xs flex items-center gap-1.5"
      >
        <PlusCircle className="h-3.5 w-3.5" />
        {buttonText}
      </Button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50 duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-[#DCE4EE] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#DCE4EE] pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#E8EFF8] text-[#3869AD]">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#142541]">
                    Link Additional Student
                  </h3>
                  <p className="text-[11px] text-[#5F6F84]">
                    Connect a sibling or secondary learner to your parent account.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-[#5F6F84] hover:bg-[#F3F6FA] hover:text-[#142541] transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <LinkStudentForm />
          </div>
        </div>
      )}
    </>
  );
}
