"use client";

import React, { useState, useActionState, useEffect } from "react";
import {
  X,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  HelpCircle,
  User,
  Mail,
  Phone,
  BookOpen,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { StudentApplication, ApplicationStatus } from "@/types";
import { reviewApplicationAction, resendStudentSetupEmailAction, type ActionResult } from "@/server/actions/admin";
import type { DuplicateDetectionResult } from "@/server/services/applicationService";

const initialActionState: ActionResult = {
  success: false,
  message: "",
};

interface Props {
  application: StudentApplication;
  duplicates: DuplicateDetectionResult;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ApplicationReviewModal({
  application,
  duplicates,
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const [state, formAction, isPending] = useActionState(reviewApplicationAction, initialActionState);
  const [decision, setDecision] = useState<ApplicationStatus>(application.status);
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<{ message: string; success: boolean } | null>(null);

  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [state.success, onClose, onSuccess]);

  const handleResendSetupEmail = async () => {
    setResending(true);
    setResendStatus(null);
    try {
      const res = await resendStudentSetupEmailAction(application.id);
      setResendStatus({ message: res.message, success: res.success });
    } catch {
      setResendStatus({ message: "Network error attempting to resend setup email.", success: false });
    } finally {
      setResending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50 duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-[#DCE4EE] p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#DCE4EE] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#3869AD] px-2 py-0.5 rounded bg-[#E8EFF8]">
                {application.application_reference}
              </span>
              <Badge
                variant={
                  application.status === "approved"
                    ? "teal"
                    : application.status === "rejected"
                    ? "error"
                    : application.status === "under_review"
                    ? "primary"
                    : "warning"
                }
              >
                {application.status.replace("_", " ").toUpperCase()}
              </Badge>
            </div>
            <h2 id="review-modal-title" className="text-xl font-extrabold text-[#142541]">
              Review Admission Application
            </h2>
            <p className="text-xs text-[#5F6F84]">
              Submitted on {new Date(application.created_at).toLocaleDateString()} at{" "}
              {new Date(application.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#5F6F84] hover:bg-[#F3F6FA] hover:text-[#142541] transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {state.message && (
          <Alert variant={state.success ? "success" : "error"}>
            {state.message}
          </Alert>
        )}

        {/* Duplicate Detection Alert (Requirement: Flag potential duplicates without auto-merging) */}
        {duplicates.hasDuplicates && (
          <div className="rounded-xl border border-amber-300 bg-amber-50/80 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>Potential Duplicate Records Detected</span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              Our automated detector found other records matching this applicant&apos;s email or name. In accordance with academy policy, records are <strong>not automatically merged</strong>.
            </p>
            <div className="space-y-1 text-[11px] text-amber-900 pt-1">
              {duplicates.matchingApplications.map((dup) => (
                <div key={dup.id} className="flex items-center justify-between p-1.5 rounded bg-white/70 border border-amber-200">
                  <span>Application: <strong>{dup.application_reference}</strong> ({dup.full_name})</span>
                  <span className="font-semibold uppercase">{dup.status}</span>
                </div>
              ))}
              {duplicates.matchingStudents.map((stu) => (
                <div key={stu.id} className="flex items-center justify-between p-1.5 rounded bg-white/70 border border-amber-200">
                  <span>Existing Student: <strong>{stu.student_code}</strong> ({stu.full_name})</span>
                  <span className="font-semibold uppercase">{stu.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Applicant Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#F3F6FA] border border-[#DCE4EE] text-xs">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-[#5F6F84] uppercase">Applicant</span>
            <div className="font-bold text-[#142541] text-sm flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-[#3869AD]" />
              <span>{application.full_name}</span>
            </div>
            <div className="text-[#5F6F84] flex items-center gap-1.5">
              <Mail className="h-3 w-3" />
              <span>{application.email}</span>
            </div>
            {application.phone && (
              <div className="text-[#5F6F84] flex items-center gap-1.5">
                <Phone className="h-3 w-3" />
                <span>{application.phone}</span>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-[#5F6F84] uppercase">Demographics & Level</span>
            <div className="font-medium text-[#142541]">
              Level: <span className="font-bold">{application.education_level || "Not specified"}</span>
            </div>
            {application.date_of_birth && (
              <div className="text-[#5F6F84] flex items-center gap-1.5">
                <Calendar className="h-3 w-3" />
                <span>DOB: {application.date_of_birth} {application.age ? `(Age: ${application.age})` : ""}</span>
              </div>
            )}
          </div>

          {/* Program Choice */}
          <div className="sm:col-span-2 pt-2 border-t border-[#DCE4EE] space-y-1">
            <span className="text-[11px] font-semibold text-[#5F6F84] uppercase">Target Course / Track</span>
            <div className="font-bold text-[#142541] flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-[#168B83]" />
              <span>{application.course_title || application.course?.title || "General Academy Track"}</span>
            </div>
          </div>

          {/* Guardian details if present */}
          {(application.guardian_name || application.guardian_email) && (
            <div className="sm:col-span-2 pt-2 border-t border-[#DCE4EE] space-y-1">
              <span className="text-[11px] font-semibold text-[#5F6F84] uppercase">Guardian / Emergency Contact</span>
              <div className="text-[#142541] font-semibold">
                {application.guardian_name || "Guardian"} • {application.guardian_email || ""} • {application.guardian_phone || ""}
              </div>
            </div>
          )}

          {/* Statement */}
          {application.statement_of_interest && (
            <div className="sm:col-span-2 pt-2 border-t border-[#DCE4EE] space-y-1">
              <span className="text-[11px] font-semibold text-[#5F6F84] uppercase">Statement of Interest</span>
              <p className="text-xs text-[#263449] bg-white p-2.5 rounded-lg border border-[#DCE4EE] italic leading-relaxed">
                &ldquo;{application.statement_of_interest}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* Provisioned Student Banner & Resend Action */}
        {application.provisioned_student_id && (
          <div className="rounded-xl border border-[#3869AD]/30 bg-[#E8EFF8]/60 p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#168B83]" />
                <span className="text-xs font-bold text-[#142541]">
                  Student Account Provisioned
                </span>
                <span className="text-[11px] text-[#5F6F84]">
                  ({new Date(application.provisioned_at || application.updated_at).toLocaleDateString()})
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResendSetupEmail}
                isLoading={resending}
                className="text-xs"
              >
                <Mail className="h-3 w-3 mr-1" />
                Resend Setup Email
              </Button>
            </div>
            {resendStatus && (
              <Alert variant={resendStatus.success ? "success" : "warning"}>
                {resendStatus.message}
              </Alert>
            )}
          </div>
        )}

        {/* Decision & Review Form */}
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="applicationId" value={application.id} />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#142541]">
              Review Decision <span className="text-[#B91C1C] ml-1">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { value: "under_review", label: "Under Review", icon: Clock },
                { value: "needs_information", label: "Needs Info", icon: HelpCircle },
                { value: "approved", label: "Approve", icon: CheckCircle2 },
                { value: "rejected", label: "Reject", icon: XCircle },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = decision === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setDecision(item.value as ApplicationStatus)}
                    className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? item.value === "approved"
                          ? "border-[#168B83] bg-[#E2F4F2] text-[#168B83]"
                          : item.value === "rejected"
                          ? "border-[#B91C1C] bg-red-50 text-[#B91C1C]"
                          : "border-[#3869AD] bg-[#E8EFF8] text-[#3869AD]"
                        : "border-[#DCE4EE] bg-white text-[#5F6F84] hover:bg-[#F3F6FA]"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
            <input type="hidden" name="decision" value={decision} />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="decisionReason"
              className="block text-xs font-semibold uppercase tracking-wider text-[#142541]"
            >
              Decision Reason / Notice to Applicant
            </label>
            <input
              id="decisionReason"
              name="decisionReason"
              type="text"
              defaultValue={application.decision_reason || ""}
              placeholder="e.g. Matched to Spring Young Explorers Cohort. Welcome to Syntaxora!"
              className="w-full rounded-lg border border-[#DCE4EE] bg-white px-3 py-2 text-xs text-[#142541] shadow-sm focus:border-[#3869AD] focus:outline-none focus:ring-1 focus:ring-[#3869AD]"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="adminNotes"
              className="block text-xs font-semibold uppercase tracking-wider text-[#142541]"
            >
              Internal Administrator Notes (Confidential)
            </label>
            <textarea
              id="adminNotes"
              name="adminNotes"
              rows={2}
              defaultValue={application.admin_notes || ""}
              placeholder="Confidential admissions review comments..."
              className="w-full rounded-lg border border-[#DCE4EE] bg-white p-2.5 text-xs text-[#142541] shadow-sm focus:border-[#3869AD] focus:outline-none focus:ring-1 focus:ring-[#3869AD]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DCE4EE]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isPending}
            >
              Save Decision & Audit Record
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
