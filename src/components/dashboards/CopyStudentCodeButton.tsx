"use client";

import React, { useState } from "react";
import { Copy, Check, ShieldCheck } from "lucide-react";

interface Props {
  studentCode: string;
  variant?: "badge" | "button" | "card";
}

export function CopyStudentCodeButton({ studentCode, variant = "badge" }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(studentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (variant === "card") {
    return (
      <div className="p-4 rounded-xl bg-gradient-to-br from-[#142541]/5 to-[#3869AD]/5 border border-[#3869AD]/20 flex items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#3869AD]">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Permanent Student Code</span>
          </div>
          <div className="font-mono text-base font-extrabold text-[#142541] tracking-wider">
            {studentCode}
          </div>
          <p className="text-[11px] text-[#5F6F84]">
            Share this with your parent/guardian so they can request portal access.
          </p>
        </div>

        <button
          onClick={handleCopy}
          type="button"
          className="shrink-0 px-3.5 py-2 rounded-lg bg-[#3869AD] hover:bg-[#2A528A] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-300" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy Code</span>
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleCopy}
      type="button"
      title="Click to copy student code for parent portal link"
      className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-[11px] font-mono font-bold text-white transition-all cursor-pointer"
    >
      <span>{studentCode}</span>
      {copied ? (
        <Check className="h-3 w-3 text-emerald-400" />
      ) : (
        <Copy className="h-3 w-3 text-[#7B9CC7] group-hover:text-white transition-colors" />
      )}
      {copied && (
        <span className="text-[10px] text-emerald-300 font-sans font-semibold">
          Copied!
        </span>
      )}
    </button>
  );
}
