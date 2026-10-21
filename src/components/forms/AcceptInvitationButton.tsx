"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { redeemGuardianInvitationAction } from "@/server/actions/guardian";

interface Props {
  token: string;
}

export function AcceptInvitationButton({ token }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAccept() {
    setError(null);
    setLoading(true);

    try {
      const res = await redeemGuardianInvitationAction(token);
      if (!res.success) {
        setError(res.error || "Failed to redeem invitation");
      } else {
        router.push("/parent");
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="error">
          <AlertCircle className="h-4 w-4" />
          <span className="text-xs">{error}</span>
        </Alert>
      )}

      <Button
        onClick={handleAccept}
        disabled={loading}
        className="w-full bg-[#168B83] hover:bg-[#126f69] text-white font-semibold text-sm py-3 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
      >
        <CheckCircle2 className="h-4 w-4" />
        {loading ? "Activating Relationship..." : "Confirm & Activate Student Link"}
      </Button>
    </div>
  );
}
