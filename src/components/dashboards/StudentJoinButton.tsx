"use client";

import React, { useState, useSyncExternalStore, useTransition } from "react";
import { ExternalLink, Lock } from "lucide-react";
import { requestStudentJoinAccessAction } from "@/server/actions/batch";
import { Button } from "@/components/ui/button";

interface StudentJoinButtonProps {
  sessionId: string;
  sessionStatus: string;
  startsAt: string;
  endsAt: string;
}

function subscribe(callback: () => void) {
  const interval = setInterval(callback, 15000);
  return () => clearInterval(interval);
}

function getSnapshot() {
  return Date.now();
}

function getServerSnapshot() {
  return 0;
}

export function StudentJoinButton({
  sessionId,
  sessionStatus,
  startsAt,
  endsAt,
}: StudentJoinButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const currentTimeMs = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const startsAtMs = new Date(startsAt).getTime();
  const endsAtMs = new Date(endsAt).getTime();
  const earlyWindowMs = 15 * 60 * 1000;

  const isLive = sessionStatus === "in_progress";
  const effectiveNow = currentTimeMs || startsAtMs;
  const isWithinWindow = effectiveNow >= startsAtMs - earlyWindowMs && effectiveNow <= endsAtMs;
  const isEnded = sessionStatus === "completed" || (currentTimeMs > 0 && currentTimeMs > endsAtMs);

  const handleJoin = () => {
    setErrorMsg(null);
    startTransition(async () => {
      const res = await requestStudentJoinAccessAction(sessionId);
      if (res.success && res.meetingUrl) {
        window.open(res.meetingUrl, "_blank", "noopener,noreferrer");
      } else {
        setErrorMsg(res.error || "Unable to join class session.");
      }
    });
  };

  if (isEnded) {
    return (
      <span className="text-[11px] text-[#5F6F84] italic">
        Session Concluded
      </span>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {isLive || isWithinWindow ? (
        <Button
          variant="primary"
          size="sm"
          onClick={handleJoin}
          disabled={isPending}
          className="bg-[#168B83] hover:bg-[#126f69] text-white"
        >
          <ExternalLink className="h-3 w-3 mr-1" />
          {isPending ? "Verifying..." : isLive ? "Enter Classroom (Live)" : "Join Waiting Room"}
        </Button>
      ) : (
        <div className="flex items-center gap-1 text-[11px] text-[#5F6F84]">
          <Lock className="h-3 w-3 text-[#5F6F84]" />
          <span>Opens 15m before class</span>
        </div>
      )}

      {errorMsg && (
        <p className="text-[10px] text-red-600 font-medium max-w-xs text-right">
          {errorMsg}
        </p>
      )}
    </div>
  );
}
