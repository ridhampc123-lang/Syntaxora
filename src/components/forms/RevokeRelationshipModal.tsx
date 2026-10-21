"use client";

import React, { useState } from "react";
import { ShieldX, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { revokeGuardianRelationshipAction } from "@/server/actions/guardian";

interface Props {
  relationshipId: string;
  guardianName: string;
  studentName: string;
}

export function RevokeRelationshipModal({ relationshipId, guardianName, studentName }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  async function handleRevoke(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.set("relationshipId", relationshipId);
      formData.set("revocationReason", reason);

      const res = await revokeGuardianRelationshipAction(formData);

      if (!res.success) {
        setError(res.error || "Failed to revoke relationship");
      } else {
        setIsOpen(false);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="text-[11px] h-7 px-2.5 text-rose-600 border-rose-200 hover:bg-rose-50"
      >
        Revoke Link
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-[#DCE4EE] space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE4EE]">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                <ShieldX className="h-5 w-5" />
                Revoke Guardian Authorization
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[#5F6F84] hover:text-[#142541] p-1 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <Alert variant="error">
                <AlertCircle className="h-4 w-4" />
                <span className="text-xs">{error}</span>
              </Alert>
            )}

            <p className="text-xs text-[#5F6F84] leading-relaxed">
              This will immediately deny <strong className="text-[#142541]">{guardianName}</strong> access to all academic, attendance, and fee records for <strong className="text-[#142541]">{studentName}</strong>. This action is permanently audited.
            </p>

            <form onSubmit={handleRevoke} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label htmlFor="revoke-reason-input" className="font-semibold text-[#142541]">
                  Mandatory Justification / Reason <span className="text-rose-500">*</span>
                </label>
                <Input
                  id="revoke-reason-input"
                  placeholder="e.g. Guardian requested link removal or legal custody update"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  className="text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DCE4EE]">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || reason.length < 5}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs"
                >
                  {loading ? "Revoking..." : "Confirm Revocation"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
