"use client";

import React, { useState } from "react";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { markLessonCompleteAction } from "@/server/actions/student";

interface Props {
  lessonId: string;
  initialCompleted: boolean;
}

export function LessonCompleteButton({ lessonId, initialCompleted }: Props) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (completed) return; // already completed
    setLoading(true);
    try {
      const formData = new FormData();
      formData.set("lessonId", lessonId);
      const res = await markLessonCompleteAction(formData);
      if (res.success) {
        setCompleted(true);
      }
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={completed || loading}
      type="button"
      title={completed ? "Lesson Completed" : "Mark as Completed"}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
        completed
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default"
          : "bg-white hover:bg-[#F3F6FA] text-[#5F6F84] border border-[#DCE4EE] active:scale-95"
      }`}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-[#3869AD]" />
      ) : completed ? (
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
      ) : (
        <Circle className="h-3.5 w-3.5 text-[#5F6F84]" />
      )}
      <span>{completed ? "Completed" : "Mark Done"}</span>
    </button>
  );
}
