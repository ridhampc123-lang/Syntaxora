"use client";

import React from "react";
import { Printer, Download } from "lucide-react";

export function PrintTranscriptButton() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <button
      onClick={handlePrint}
      type="button"
      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#F3F6FA] text-xs font-semibold text-[#142541] border border-[#DCE4EE] shadow-xs transition-all cursor-pointer active:scale-95"
    >
      <Printer className="h-3.5 w-3.5 text-[#3869AD]" />
      <span>Print Academic Transcript</span>
    </button>
  );
}
