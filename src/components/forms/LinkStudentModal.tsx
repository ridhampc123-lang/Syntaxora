"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
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
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock background screen scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      const originalBodyOverscroll = document.body.style.overscrollBehavior;
      const originalHtmlOverscroll = document.documentElement.style.overscrollBehavior;
      const originalPaddingRight = document.body.style.paddingRight;

      // Prevent layout shift from scrollbar disappearing
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      document.body.style.overscrollBehavior = "contain";
      document.documentElement.style.overscrollBehavior = "contain";

      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setIsOpen(false);
        }
      };
      window.addEventListener("keydown", handleKeyDown);

      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.body.style.overscrollBehavior = originalBodyOverscroll;
        document.documentElement.style.overscrollBehavior = originalHtmlOverscroll;
        document.body.style.paddingRight = originalPaddingRight;
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen]);

  const handleSuccess = () => {
    router.refresh();
    setTimeout(() => {
      setIsOpen(false);
    }, 1000);
  };

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={() => setIsOpen(true)}
        className="font-semibold text-xs flex items-center gap-1.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
      >
        <PlusCircle className="h-3.5 w-3.5" />
        <span>{buttonText}</span>
      </Button>

      {mounted &&
        isOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto overscroll-contain transition-opacity"
            role="dialog"
            aria-modal="true"
            aria-labelledby="link-sibling-title"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsOpen(false);
              }
            }}
            onWheel={(e) => {
              if (e.target === e.currentTarget) {
                e.preventDefault();
              }
            }}
            onTouchMove={(e) => {
              if (e.target === e.currentTarget) {
                e.preventDefault();
              }
            }}
          >
            <div
              className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto overscroll-contain rounded-2xl bg-white shadow-2xl border border-[#DCE4EE] p-6 sm:p-7 space-y-4"
              style={{ overscrollBehavior: "contain" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#DCE4EE] pb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#E8EFF8] text-[#3869AD] shrink-0">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 id="link-sibling-title" className="text-base font-bold text-[#142541]">
                      Link Student / Sibling
                    </h3>
                    <p className="text-[11px] text-[#5F6F84]">
                      Connect an additional learner to your authorized guardian account.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1.5 text-[#5F6F84] hover:bg-[#F3F6FA] hover:text-[#142541] transition-colors cursor-pointer"
                  aria-label="Close dialog"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form */}
              <LinkStudentForm isModal onSuccess={handleSuccess} />
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
