"use client";

import React, { useTransition } from "react";
import { updateBatchStatusAction } from "@/server/actions/batch";
import { BatchStatus } from "@/types";

interface BatchStatusSelectorProps {
  batchId: string;
  currentStatus: BatchStatus;
}

export function BatchStatusSelector({ batchId, currentStatus }: BatchStatusSelectorProps) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    startTransition(async () => {
      const formData = new FormData();
      formData.set("batchId", batchId);
      formData.set("status", newStatus);
      await updateBatchStatusAction(formData);
    });
  };

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-[#5F6F84] font-medium">Lifecycle:</span>
      <select
        defaultValue={currentStatus}
        onChange={handleStatusChange}
        disabled={isPending}
        className="rounded-lg border border-[#DCE4EE] bg-white px-2.5 py-1 text-xs font-semibold text-[#142541] focus:border-[#3869AD] focus:outline-hidden disabled:opacity-50"
      >
        <option value="draft">Draft</option>
        <option value="upcoming">Upcoming</option>
        <option value="active">Active</option>
        <option value="paused">Paused</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>
    </div>
  );
}
