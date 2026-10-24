"use client";

import React, { useState, useActionState, useEffect } from "react";
import {
  X,
  CheckCircle2,
  XCircle,
  UserCheck,
  User,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { GuardianStudentRelationship } from "@/types";
import {
  adminApproveRelationshipAction,
  adminRejectRelationshipAction,
  type GuardianActionResult,
} from "@/server/actions/guardian";

const initialActionState: GuardianActionResult = {
  success: false,
  message: "",
};

interface Props {
  relationship: GuardianStudentRelationship;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ReviewPendingRelationshipModal({
  relationship,
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const [approveState, approveAction, isApprovePending] = useActionState(
    adminApproveRelationshipAction,
    initialActionState
  );
  const [rejectState, rejectAction, isRejectPending] = useActionState(
    adminRejectRelationshipAction,
    initialActionState
  );

  const [mode, setMode] = useState<"approve" | "reject">("approve");
  const [canViewAttendance, setCanViewAttendance] = useState(true);
  const [canViewProgress, setCanViewProgress] = useState(true);
  const [canViewSchedule, setCanViewSchedule] = useState(true);
  const [canViewFees, setCanViewFees] = useState(true);
  const [canReceiveNotifications, setCanReceiveNotifications] = useState(true);
  const [verificationMethod, setVerificationMethod] = useState("admin_verified_code_request");

  useEffect(() => {
    if (approveState.success || rejectState.success) {
      const timer = setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [approveState.success, rejectState.success, onClose, onSuccess]);

  if (!isOpen) return null;

  const guardianName = relationship.guardian?.full_name || "Parent Account";
  const guardianEmail = relationship.guardian?.email || "—";
  const studentName = relationship.student?.profile?.full_name || "Enrolled Student";
  const studentCode = relationship.student?.student_code || "STU-CODE";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50 duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-[#DCE4EE] p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#DCE4EE] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="warning">PENDING VERIFICATION</Badge>
              <span className="font-mono text-xs text-[#3869AD] font-bold">
                {studentCode}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-[#142541]">
              Review Guardian Connection Request
            </h2>
            <p className="text-xs text-[#5F6F84]">
              Submitted on {new Date(relationship.created_at).toLocaleDateString()}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#5F6F84] hover:bg-[#F3F6FA] hover:text-[#142541] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Feedback Alerts */}
        {approveState.message && (
          <Alert variant={approveState.success ? "success" : "error"}>
            {approveState.message}
          </Alert>
        )}
        {rejectState.message && (
          <Alert variant={rejectState.success ? "success" : "error"}>
            {rejectState.message}
          </Alert>
        )}

        {/* Entities Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-[#F3F6FA] border border-[#DCE4EE] text-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase text-[#5F6F84]">Parent / Guardian</span>
            <div className="font-bold text-[#142541] flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-[#3869AD]" />
              <span>{guardianName}</span>
            </div>
            <div className="text-[#5F6F84] flex items-center gap-1.5">
              <Mail className="h-3 w-3" />
              <span>{guardianEmail}</span>
            </div>
            <div className="text-[11px] text-[#263449]">
              Type: <strong className="capitalize">{relationship.relationship_type.replace("_", " ")}</strong>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase text-[#5F6F84]">Target Student</span>
            <div className="font-bold text-[#142541] flex items-center gap-1.5">
              <UserCheck className="h-3.5 w-3.5 text-[#168B83]" />
              <span>{studentName}</span>
            </div>
            <div className="text-[#3869AD] font-mono font-bold">
              ID: {studentCode}
            </div>
            <div className="text-[11px] text-[#5F6F84]">
              Status: <span className="font-semibold uppercase text-emerald-700">{relationship.student?.status || "Active"}</span>
            </div>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex gap-2 border-b border-[#DCE4EE] pb-2">
          <button
            type="button"
            onClick={() => setMode("approve")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              mode === "approve"
                ? "bg-[#168B83] text-white"
                : "bg-white border border-[#DCE4EE] text-[#5F6F84] hover:bg-[#F3F6FA]"
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Approve & Set Permissions</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("reject")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              mode === "reject"
                ? "bg-[#B91C1C] text-white"
                : "bg-white border border-[#DCE4EE] text-[#5F6F84] hover:bg-[#F3F6FA]"
            }`}
          >
            <XCircle className="h-3.5 w-3.5" />
            <span>Reject Request</span>
          </button>
        </div>

        {mode === "approve" ? (
          <form action={approveAction} className="space-y-4">
            <input type="hidden" name="relationshipId" value={relationship.id} />
            <input type="hidden" name="canViewAttendance" value={String(canViewAttendance)} />
            <input type="hidden" name="canViewProgress" value={String(canViewProgress)} />
            <input type="hidden" name="canViewSchedule" value={String(canViewSchedule)} />
            <input type="hidden" name="canViewFees" value={String(canViewFees)} />
            <input type="hidden" name="canReceiveNotifications" value={String(canReceiveNotifications)} />

            {/* Granular Permissions Section */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#142541]">
                Authoritative Category Permissions
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  {
                    id: "perm-att",
                    label: "View Live Attendance",
                    checked: canViewAttendance,
                    setter: setCanViewAttendance,
                  },
                  {
                    id: "perm-prog",
                    label: "View Released Grades & Progress",
                    checked: canViewProgress,
                    setter: setCanViewProgress,
                  },
                  {
                    id: "perm-sched",
                    label: "View Class Schedule",
                    checked: canViewSchedule,
                    setter: setCanViewSchedule,
                  },
                  {
                    id: "perm-fees",
                    label: "View Tuition & Invoices",
                    checked: canViewFees,
                    setter: setCanViewFees,
                  },
                  {
                    id: "perm-notif",
                    label: "Receive Course Notifications",
                    checked: canReceiveNotifications,
                    setter: setCanReceiveNotifications,
                  },
                ].map((perm) => (
                  <label
                    key={perm.id}
                    className="flex items-center gap-2 p-2 rounded-lg border border-[#DCE4EE] bg-white hover:bg-[#F3F6FA] cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={perm.checked}
                      onChange={(e) => perm.setter(e.target.checked)}
                      className="rounded border-[#DCE4EE] text-[#3869AD] focus:ring-[#3869AD]"
                    />
                    <span className="font-medium text-[#142541]">{perm.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Verification Method */}
            <div className="space-y-1">
              <label
                htmlFor="verificationMethod"
                className="block text-xs font-semibold uppercase tracking-wider text-[#142541]"
              >
                Verification Method & Evidence
              </label>
              <select
                id="verificationMethod"
                name="verificationMethod"
                value={verificationMethod}
                onChange={(e) => setVerificationMethod(e.target.value)}
                className="w-full rounded-lg border border-[#DCE4EE] bg-white px-3 py-2 text-xs text-[#142541] shadow-2xs focus:border-[#3869AD] focus:outline-none"
              >
                <option value="admin_verified_code_request">Verified Student Code Match</option>
                <option value="in_person_id">In-Person Legal Guardian ID Verification</option>
                <option value="phone_verification">Telephone Verified with Authorized Contact</option>
                <option value="admission_application_match">Matched to Certified Admission Application</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DCE4EE]">
              <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isApprovePending}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isApprovePending}>
                Activate & Enforce RLS
              </Button>
            </div>
          </form>
        ) : (
          <form action={rejectAction} className="space-y-4">
            <input type="hidden" name="relationshipId" value={relationship.id} />

            <div className="space-y-1">
              <label
                htmlFor="rejectionReason"
                className="block text-xs font-semibold uppercase tracking-wider text-[#142541]"
              >
                Rejection Reason (Logged to Audit Trail) <span className="text-[#B91C1C]">*</span>
              </label>
              <textarea
                id="rejectionReason"
                name="rejectionReason"
                required
                rows={3}
                placeholder="e.g. Unverified relationship. Contact details could not be verified with student emergency records."
                className="w-full rounded-lg border border-[#DCE4EE] bg-white p-2.5 text-xs text-[#142541] shadow-2xs focus:border-[#B91C1C] focus:outline-none focus:ring-1 focus:ring-[#B91C1C]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DCE4EE]">
              <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isRejectPending}>
                Cancel
              </Button>
              <Button type="submit" variant="danger" size="sm" isLoading={isRejectPending}>
                Confirm Rejection
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
