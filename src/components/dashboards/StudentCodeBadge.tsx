"use client";

import React, { useState } from "react";
import { Copy, Check, Shield } from "lucide-react";

interface Props {
  studentCode: string;
  showExplanation?: boolean;
  className?: string;
}

export function StudentCodeBadge({
  studentCode,
  showExplanation = true,
  className = "",
}: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(studentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className={`inline-flex flex-col gap-1.5 ${className}`}>
      <div className="inline-flex items-center gap-2 p-1.5 pl-3 rounded-lg bg-[#E8EFF8] border border-[#3869AD]/30 text-xs font-mono text-[#3869AD]">
        <Shield className="h-3.5 w-3.5 text-[#3869AD] shrink-0" />
        <span className="font-bold tracking-wider">{studentCode}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white hover:bg-[#DCE4EE]/70 text-[11px] font-sans font-semibold text-[#142541] shadow-2xs transition-colors cursor-pointer"
          title="Copy Student Code"
          aria-label="Copy student code"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-[#168B83]" />
              <span className="text-[#168B83]">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3 text-[#5F6F84]" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      {showExplanation && (
        <span className="text-[11px] text-[#5F6F84] leading-tight">
          Share this code with your verified parents/guardians to enable portal monitoring.
        </span>
      )}
    </div>
  );
}
