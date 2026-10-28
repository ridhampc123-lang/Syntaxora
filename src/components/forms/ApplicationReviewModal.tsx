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
  Copy,
  Check,
  Key,
  RefreshCw,
  ExternalLink,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { StudentApplication, ApplicationStatus, Batch } from "@/types";
import {
  reviewApplicationAction,
  resendStudentSetupEmailAction,
  resetStudentCredentialsAction,
  type ActionResult,
} from "@/server/actions/admin";
import type { DuplicateDetectionResult } from "@/server/services/applicationService";

const initialActionState: ActionResult = {
  success: false,
  message: "",
};

interface Props {
  application: StudentApplication;
  duplicates: DuplicateDetectionResult;
  batches?: Batch[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ApplicationReviewModal({
  application,
  duplicates,
  batches = [],
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const [state, formAction, isPending] = useActionState(reviewApplicationAction, initialActionState);
  const [decision, setDecision] = useState<ApplicationStatus>(application.status);
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<{ message: string; success: boolean } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Filter batches relevant to applicant's chosen course
  const relevantBatches = batches.filter(
    (b) => !application.course_id || b.course_id === application.course_id
  );
  const availableBatches = relevantBatches.length > 0 ? relevantBatches : batches;

  const [selectedBatchId, setSelectedBatchId] = useState<string>(
    availableBatches[0]?.id || ""
  );

  const [currentStudentCode, setCurrentStudentCode] = useState<string>(
    application.student_code || application.student?.student_code || ""
  );
  const [currentTemporaryPassword, setCurrentTemporaryPassword] = useState<string>("");
  const [currentAssignedBatch, setCurrentAssignedBatch] = useState<string>("");

  const studentCodeDisplay = state.studentCode || currentStudentCode || "STU-PENDING";
  const selectedBatchObj = batches.find((b) => b.id === selectedBatchId);
  const assignedBatchDisplay =
    state.assignedBatch ||
    currentAssignedBatch ||
    (selectedBatchObj ? `${selectedBatchObj.name} (${selectedBatchObj.batch_code})` : "");

  // Update credentials when action responds
  useEffect(() => {
    if (state.success) {
      if (state.studentCode) {
        setCurrentStudentCode(state.studentCode);
      }
      if (state.temporaryPassword) {
        setCurrentTemporaryPassword(state.temporaryPassword);
      }
      if (state.assignedBatch) {
        setCurrentAssignedBatch(state.assignedBatch);
      }
      onSuccess?.();
    }
  }, [state, onSuccess]);

  const handleResendSetupEmail = async () => {
    setResending(true);
    setResendStatus(null);
    try {
      const res = await resendStudentSetupEmailAction(application.id);
      if (res.studentCode) {
        setCurrentStudentCode(res.studentCode);
      }
      if (res.temporaryPassword) {
        setCurrentTemporaryPassword(res.temporaryPassword);
      }
      if (res.assignedBatch) {
        setCurrentAssignedBatch(res.assignedBatch);
      }
      setResendStatus({ message: res.message, success: res.success });
    } catch {
      setResendStatus({ message: "Network error attempting to resend setup email.", success: false });
    } finally {
      setResending(false);
    }
  };

  const handleCopyCode = async () => {
    if (!studentCodeDisplay) return;
    try {
      await navigator.clipboard.writeText(studentCodeDisplay);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCopyPassword = async () => {
    const pwdToCopy = currentTemporaryPassword || state.temporaryPassword || "StudentPassword123!";
    try {
      await navigator.clipboard.writeText(pwdToCopy);
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCopyAllCredentials = async () => {
    const siteUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const pwd = currentTemporaryPassword || state.temporaryPassword || "StudentPassword123!";
    const text = [
      `🎓 Syntaxora AI Academy — Student Portal Credentials`,
      `======================================================`,
      `Student Name: ${application.full_name}`,
      `Permanent Student Code: ${studentCodeDisplay}`,
      `Login URL: ${siteUrl}/login?email=${encodeURIComponent(application.email)}&setup=true`,
      `Registered Email: ${application.email}`,
      `Unique Temporary Password: ${pwd}`,
      assignedBatchDisplay ? `Assigned Cohort: ${assignedBatchDisplay}` : "",
      `======================================================`,
      `📌 Quick Start Instructions:`,
      `1. Open the Login URL and sign in using your email and unique temporary password.`,
      `2. You can set a custom personal password anytime from your Student Profile.`,
      `3. Share your Permanent Student Code (${studentCodeDisplay}) with your parent/guardian to link their authorized portal.`,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleResetPassword = async () => {
    setResetting(true);
    setResendStatus(null);
    try {
      const res = await resetStudentCredentialsAction(application.id);
      if (res.studentCode) {
        setCurrentStudentCode(res.studentCode);
      }
      if (res.temporaryPassword) {
        setCurrentTemporaryPassword(res.temporaryPassword);
      }
      setResendStatus({
        message: res.success ? `Password regenerated: ${res.temporaryPassword}` : res.message,
        success: res.success,
      });
    } catch {
      setResendStatus({ message: "Network error attempting to reset student credentials.", success: false });
    } finally {
      setResetting(false);
    }
  };

  if (!isOpen) return null;

  const isProvisioned = Boolean(
    application.provisioned_student_id ||
      state.studentCode ||
      currentStudentCode ||
      state.temporaryPassword
  );

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

        {/* Duplicate Detection Alert */}
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

        {/* Provisioned Student Credentials & Access Card */}
        {isProvisioned && (
          <div className="rounded-xl border border-[#3869AD]/30 bg-[#E8EFF8]/60 p-4 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#168B83]" />
                <span className="text-xs font-bold text-[#142541]">
                  Student Account Provisioned
                </span>
                {assignedBatchDisplay && (
                  <span className="text-[11px] font-semibold text-[#168B83] bg-[#E2F4F2] px-2 py-0.5 rounded">
                    {assignedBatchDisplay}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyAllCredentials}
                  className="text-xs font-semibold bg-white text-[#142541]"
                >
                  {copiedAll ? (
                    <>
                      <Check className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                      Copied Details!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 mr-1" />
                      Copy All Credentials
                    </>
                  )}
                </Button>
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
            </div>

            {/* Credentials Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-lg bg-white border border-[#DCE4EE] text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F6F84]">
                  Permanent Student Code
                </span>
                <div className="flex items-center gap-1.5 font-mono font-bold text-sm text-[#3869AD]">
                  <span>{studentCodeDisplay}</span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    title="Copy student code"
                    className="p-1 rounded hover:bg-[#E8EFF8] text-[#5F6F84] hover:text-[#3869AD] transition-colors cursor-pointer"
                  >
                    {copiedCode ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
                <p className="text-[10px] text-[#5F6F84]">Required for parent portal linking.</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F6F84]">
                  Login Email
                </span>
                <div className="font-semibold text-[#142541] truncate">{application.email}</div>
                <p className="text-[10px] text-[#5F6F84]">Student&apos;s registered email.</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F6F84]">
                  Unique Temporary Password
                </span>
                <div className="flex items-center gap-1.5 font-mono font-bold text-sm text-[#142541]">
                  <span className="truncate">
                    {currentTemporaryPassword || state.temporaryPassword || "StudentPassword123!"}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyPassword}
                    title="Copy temporary password"
                    className="p-1 rounded hover:bg-[#E8EFF8] text-[#5F6F84] hover:text-[#3869AD] transition-colors cursor-pointer"
                  >
                    {copiedPassword ? (
                      <Check className="h-3 w-3 text-emerald-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    disabled={resetting}
                    title="Regenerate unique temporary password"
                    className="p-1 rounded hover:bg-[#E8EFF8] text-[#5F6F84] hover:text-[#3869AD] transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`h-3 w-3 ${resetting ? "animate-spin" : ""}`} />
                  </button>
                </div>
                <p className="text-[10px] text-emerald-700 font-medium">Distinct, unique per student.</p>
              </div>
            </div>

            {/* Email Dispatch & Schedule Notice */}
            <div className="text-[11px] text-[#5F6F84] bg-[#F8FAFC] p-2.5 rounded-lg border border-[#DCE4EE] flex items-start gap-2">
              <span className="text-[#3869AD] font-bold shrink-0">ℹ️ Note:</span>
              <span>
                Account setup email with Student Code, Unique Temporary Password, and Live Class Schedule is automatically dispatched. If email delivery is in sandbox/testing, click <strong>&ldquo;Copy All Credentials&rdquo;</strong> to share via WhatsApp/SMS directly.
              </span>
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

          {/* Cohort Batch & Timetable Allocation (Shown when Approving) */}
          {decision === "approved" && (
            <div className="space-y-2 rounded-xl border border-[#3869AD]/30 bg-[#F3F7FD] p-3.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="batchId"
                  className="block text-xs font-bold uppercase tracking-wider text-[#142541] flex items-center gap-1.5"
                >
                  <Users className="h-3.5 w-3.5 text-[#3869AD]" />
                  <span>Cohort Batch & Live Schedule Allocation</span>
                  <span className="text-[#B91C1C]">*</span>
                </label>
                <span className="text-[10px] font-semibold text-[#3869AD] bg-[#E8EFF8] px-2 py-0.5 rounded-full">
                  Automated Schedule Sync
                </span>
              </div>
              <p className="text-[11px] text-[#5F6F84] leading-relaxed">
                Assign which class cohort and timetable this student will join. Approving immediately enrolls the student into this batch, scheduling their live classes and populating their timetable.
              </p>
              <select
                id="batchId"
                name="batchId"
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                className="w-full rounded-lg border border-[#DCE4EE] bg-white px-3 py-2 text-xs font-medium text-[#142541] shadow-xs focus:border-[#3869AD] focus:outline-none focus:ring-1 focus:ring-[#3869AD]"
              >
                <option value="">-- Select Cohort Batch & Schedule --</option>
                {availableBatches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.batch_code}) — {b.timezone} • {b.enrolled_count ?? 0}/{b.capacity} Enrolled
                  </option>
                ))}
              </select>

              {selectedBatchObj && (
                <div className="rounded-lg bg-white border border-[#DCE4EE] p-2.5 text-xs space-y-1">
                  <div className="flex items-center justify-between font-semibold text-[#142541]">
                    <span>Cohort: {selectedBatchObj.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">
                      {selectedBatchObj.capacity - (selectedBatchObj.enrolled_count || 0)} Seats Available
                    </span>
                  </div>
                  <div className="text-[11px] text-[#5F6F84]">
                    Instructor:{" "}
                    <strong className="text-[#142541]">
                      {selectedBatchObj.primary_instructor?.full_name || "Senior Academy Faculty"}
                    </strong>{" "}
                    • Timezone: {selectedBatchObj.timezone}
                  </div>
                </div>
              )}
            </div>
          )}

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
              defaultValue={
                application.decision_reason ||
                (selectedBatchObj
                  ? `Admitted to ${selectedBatchObj.name}. Welcome to Syntaxora!`
                  : "Admission approved. Student account provisioned.")
              }
              placeholder="e.g. Matched to Cohort Alpha. Welcome to Syntaxora!"
              className="w-full rounded-lg border border-[#DCE4EE] bg-white px-3 py-2 text-xs text-[#142541] shadow-xs focus:border-[#3869AD] focus:outline-none focus:ring-1 focus:ring-[#3869AD]"
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
              className="w-full rounded-lg border border-[#DCE4EE] bg-white p-2.5 text-xs text-[#142541] shadow-xs focus:border-[#3869AD] focus:outline-none focus:ring-1 focus:ring-[#3869AD]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#DCE4EE]">
            <div>
              {isProvisioned && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  className="text-xs"
                >
                  Done / Close
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
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
                variant={decision === "approved" ? "ai" : "primary"}
                size="sm"
                isLoading={isPending}
                className="font-bold shadow-xs"
              >
                {decision === "approved" ? "Approve & Provision Student" : "Save Decision"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
