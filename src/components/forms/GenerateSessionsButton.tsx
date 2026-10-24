"use client";

import React, { useTransition } from "react";
import { Sparkles } from "lucide-react";
import { generateBatchSessionsAction } from "@/server/actions/batch";
import { Button } from "@/components/ui/button";

interface GenerateSessionsButtonProps {
  batchId: string;
}

export function GenerateSessionsButton({ batchId }: GenerateSessionsButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleGenerate = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("batchId", batchId);
      formData.set("windowDays", "30");
      await generateBatchSessionsAction(formData);
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleGenerate}
      disabled={isPending}
    >
      <Sparkles className="h-3.5 w-3.5 mr-1.5 text-[#168B83]" />
      {isPending ? "Generating..." : "Generate Next 30 Days"}
    </Button>
  );
}
