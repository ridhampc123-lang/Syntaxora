"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleGradePublicationAction } from "@/server/actions/instructor";

interface Props {
  submissionId: string;
  isPublished: boolean;
}

export function ToggleGradePublicationButton({ submissionId, isPublished }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.set("submissionId", submissionId);
      formData.set("isGradePublished", String(!isPublished));
      await toggleGradePublicationAction(formData);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handleToggle}
      disabled={loading}
      variant="outline"
      className={`text-[11px] h-7 px-2 flex items-center gap-1 ${
        isPublished
          ? "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
          : "border-slate-300 text-slate-600 hover:bg-slate-50"
      }`}
    >
      {isPublished ? (
        <>
          <Eye className="h-3.5 w-3.5 text-emerald-600" />
          Published
        </>
      ) : (
        <>
          <EyeOff className="h-3.5 w-3.5 text-slate-500" />
          Draft Hidden
        </>
      )}
    </Button>
  );
}
