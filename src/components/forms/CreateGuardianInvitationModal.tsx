"use client";

import React, { useState } from "react";
import { UserPlus, Copy, Check, AlertCircle, ShieldAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Student } from "@/types";
import { createGuardianInvitationAction } from "@/server/actions/guardian";

interface Props {
  students: Student[];
}

export function CreateGuardianInvitationModal({ students }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  // Form states
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || "");
  const [guardianEmail, setGuardianEmail] = useState("");
  const [relationshipType, setRelationshipType] = useState("parent");
  const [canViewAttendance, setCanViewAttendance] = useState(true);
  const [canViewProgress, setCanViewProgress] = useState(true);
  const [canViewSchedule, setCanViewSchedule] = useState(true);
  const [canViewFees, setCanViewFees] = useState(true);
  const [canReceiveNotifications, setCanReceiveNotifications] = useState(true);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.set("studentId", selectedStudentId);
      formData.set("intendedGuardianEmail", guardianEmail);
      formData.set("relationshipType", relationshipType);
      formData.set("canViewAttendance", String(canViewAttendance));
      formData.set("canViewProgress", String(canViewProgress));
      formData.set("canViewSchedule", String(canViewSchedule));
      formData.set("canViewFees", String(canViewFees));
      formData.set("canReceiveNotifications", String(canReceiveNotifications));

      const res = await createGuardianInvitationAction(formData);

      if (!res.success) {
        setError(res.error || "Failed to create invitation");
      } else if (res.invitationUrl) {
        setCreatedUrl(res.invitationUrl);
        setExpiresAt(res.expiresAt || null);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (createdUrl) {
      navigator.clipboard.writeText(createdUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  function handleClose() {
    setIsOpen(false);
    setCreatedUrl(null);
    setError(null);
    setGuardianEmail("");
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-[#142541] hover:bg-[#1f3760] text-white flex items-center gap-2 text-xs shadow-sm"
      >
        <UserPlus className="h-4 w-4" />
        Generate Guardian Invitation
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-[#DCE4EE] space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE4EE]">
              <div className="flex items-center gap-2 text-[#142541]">
                <ShieldAlert className="h-5 w-5 text-[#3869AD]" />
                <h3 className="font-bold text-base">Authorized Guardian Invitation</h3>
              </div>
              <button
                onClick={handleClose}
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

            {createdUrl ? (
              <div className="space-y-4">
                <Alert variant="success">
                  <span className="text-xs font-semibold">
                    Cryptographic single-use token generated successfully!
                  </span>
                </Alert>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#142541]">
                    Invitation Link (Single-Use, 7-Day Expiry)
                  </label>
                  <p className="text-[11px] text-[#5F6F84]">
                    Only the SHA-256 hash has been stored in the database. Provide this link to the verified guardian:
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value={createdUrl}
                      className="w-full text-xs font-mono p-2.5 rounded-lg border border-[#DCE4EE] bg-[#F3F6FA] text-[#142541] select-all"
                    />
                    <Button
                      onClick={handleCopy}
                      variant="outline"
                      className="shrink-0 text-xs flex items-center gap-1.5"
                    >
                      {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                      {copied ? "Copied" : "Copy"}
                    </Button>
                  </div>
                </div>

                {expiresAt && (
                  <p className="text-[11px] text-[#5F6F84]">
                    Expires: <strong className="text-[#142541]">{new Date(expiresAt).toLocaleDateString()}</strong>
                  </p>
                )}

                <div className="pt-3 border-t border-[#DCE4EE] flex justify-end">
                  <Button onClick={handleClose} className="bg-[#142541] hover:bg-[#1f3760] text-white text-xs">
                    Done
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <p className="text-[11px] text-[#5F6F84] leading-relaxed">
                  Generates an immutable, single-use token bound strictly to the selected student and verified guardian email. Never creates inferred relationships.
                </p>

                {/* Student Selector */}
                <div className="space-y-1">
                  <label htmlFor="inv-student-select" className="font-semibold text-[#142541]">
                    Target Student <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="inv-student-select"
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    required
                    className="w-full rounded-lg border border-[#DCE4EE] bg-white p-2.5 text-xs text-[#263449] focus:outline-none focus:ring-2 focus:ring-[#3869AD]"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.profile?.full_name || "Student"} ({s.student_code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Guardian Email */}
                <div className="space-y-1">
                  <label htmlFor="inv-email-input" className="font-semibold text-[#142541]">
                    Intended Guardian Email <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    id="inv-email-input"
                    type="email"
                    placeholder="guardian@example.com"
                    value={guardianEmail}
                    onChange={(e) => setGuardianEmail(e.target.value)}
                    required
                    className="text-xs"
                  />
                </div>

                {/* Relationship Type */}
                <div className="space-y-1">
                  <label htmlFor="inv-type-select" className="font-semibold text-[#142541]">
                    Relationship Type
                  </label>
                  <select
                    id="inv-type-select"
                    value={relationshipType}
                    onChange={(e) => setRelationshipType(e.target.value)}
                    className="w-full rounded-lg border border-[#DCE4EE] bg-white p-2.5 text-xs text-[#263449] focus:outline-none focus:ring-2 focus:ring-[#3869AD]"
                  >
                    <option value="parent">Parent</option>
                    <option value="legal_guardian">Legal Guardian</option>
                    <option value="other_authorized_guardian">Other Authorized Guardian</option>
                  </select>
                </div>

                {/* Granular Permission Boundaries */}
                <div className="space-y-2 pt-2 border-t border-[#DCE4EE]">
                  <span className="font-semibold text-[#142541] block">
                    Granted Permissions Boundary
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-[#263449]">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={canViewAttendance}
                        onChange={(e) => setCanViewAttendance(e.target.checked)}
                        className="rounded border-[#DCE4EE] text-[#3869AD]"
                      />
                      <span>View Attendance</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={canViewProgress}
                        onChange={(e) => setCanViewProgress(e.target.checked)}
                        className="rounded border-[#DCE4EE] text-[#3869AD]"
                      />
                      <span>View Progress & Grades</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={canViewSchedule}
                        onChange={(e) => setCanViewSchedule(e.target.checked)}
                        className="rounded border-[#DCE4EE] text-[#3869AD]"
                      />
                      <span>View Class Schedule</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={canViewFees}
                        onChange={(e) => setCanViewFees(e.target.checked)}
                        className="rounded border-[#DCE4EE] text-[#3869AD]"
                      />
                      <span>View Fees & Billing</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={canReceiveNotifications}
                        onChange={(e) => setCanReceiveNotifications(e.target.checked)}
                        className="rounded border-[#DCE4EE] text-[#3869AD]"
                      />
                      <span>Receive Notifications</span>
                    </label>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#DCE4EE] flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleClose}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || !guardianEmail || !selectedStudentId}
                    className="bg-[#142541] hover:bg-[#1f3760] text-white text-xs"
                  >
                    {loading ? "Generating..." : "Generate Secure Token"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
