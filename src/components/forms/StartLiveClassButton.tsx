"use client";

import React, { useTransition } from "react";
import { Play, Square, ExternalLink } from "lucide-react";
import { startLiveClassAction, completeLiveClassAction } from "@/server/actions/batch";
import { Button } from "@/components/ui/button";

interface StartLiveClassButtonProps {
  sessionId: string;
  status: string;
  meetingUrl?: string | null;
}

export function StartLiveClassButton({
  sessionId,
  status,
  meetingUrl,
}: StartLiveClassButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleStart = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("sessionId", sessionId);
      await startLiveClassAction(formData);
    });
  };

  const handleComplete = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("sessionId", sessionId);
      await completeLiveClassAction(formData);
    });
  };

  if (status === "completed") {
    return (
      <span className="text-[11px] text-[#5F6F84] italic">
        Session Completed
      </span>
    );
  }

  if (status === "in_progress") {
    return (
      <div className="flex items-center gap-1.5">
        {meetingUrl && (
          <a
            href={meetingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#168B83] text-white text-[11px] font-semibold hover:bg-[#126f69] transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            Enter
          </a>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={handleComplete}
          disabled={isPending}
          className="text-red-700 hover:bg-red-50"
        >
          <Square className="h-3 w-3 mr-1 text-red-600" />
          {isPending ? "Ending..." : "End Class"}
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="primary"
      size="sm"
      onClick={handleStart}
      disabled={isPending}
    >
      <Play className="h-3 w-3 mr-1 fill-current" />
      {isPending ? "Starting..." : "Start Class"}
    </Button>
  );
}
