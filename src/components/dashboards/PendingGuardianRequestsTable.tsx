"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { GuardianStudentRelationship } from "@/types";
import { ReviewPendingRelationshipModal } from "@/components/forms/ReviewPendingRelationshipModal";

interface Props {
  pendingRequests: GuardianStudentRelationship[];
}

export function PendingGuardianRequestsTable({ pendingRequests }: Props) {
  const [selectedRelationship, setSelectedRelationship] = useState<GuardianStudentRelationship | null>(null);

  if (pendingRequests.length === 0) {
    return null;
  }

  return (
    <>
      <div className="rounded-xl border border-amber-300 bg-amber-50/70 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-amber-300 bg-amber-100/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-amber-700" />
            <span className="text-xs font-bold text-amber-950 uppercase tracking-wider">
              Pending Parent Connection Requests ({pendingRequests.length})
            </span>
          </div>
          <span className="text-[11px] text-amber-800 font-medium">
            Requires Administrator Identity Verification
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-amber-300 text-amber-950 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">Parent / Guardian</th>
                <th className="p-3.5">Target Student</th>
                <th className="p-3.5">Student Code</th>
                <th className="p-3.5">Relationship</th>
                <th className="p-3.5">Submitted</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-200 text-[#263449]">
              {pendingRequests.map((rel) => {
                const guardianName = rel.guardian?.full_name || "Parent Account";
                const guardianEmail = rel.guardian?.email || "—";
                const studentName = rel.student?.profile?.full_name || "Enrolled Student";
                const studentCode = rel.student?.student_code || "STU-CODE";

                return (
                  <tr key={rel.id} className="hover:bg-amber-100/40 transition-colors">
                    <td className="p-3.5">
                      <div className="font-semibold text-[#142541]">{guardianName}</div>
                      <div className="text-[11px] text-[#5F6F84]">{guardianEmail}</div>
                    </td>
                    <td className="p-3.5 font-medium text-[#142541]">
                      {studentName}
                    </td>
                    <td className="p-3.5 font-mono text-[#3869AD] font-bold">
                      {studentCode}
                    </td>
                    <td className="p-3.5 capitalize text-[#5F6F84]">
                      {rel.relationship_type.replace("_", " ")}
                    </td>
                    <td className="p-3.5 text-[#5F6F84]">
                      {new Date(rel.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-3.5 text-right">
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => setSelectedRelationship(rel)}
                        className="text-xs bg-[#168B83] hover:bg-[#13746D]"
                      >
                        <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                        Review & Verify
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedRelationship && (
        <ReviewPendingRelationshipModal
          relationship={selectedRelationship}
          isOpen={Boolean(selectedRelationship)}
          onClose={() => setSelectedRelationship(null)}
          onSuccess={() => setSelectedRelationship(null)}
        />
      )}
    </>
  );
}
