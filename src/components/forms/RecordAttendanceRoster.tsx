"use client";

import React, { useState } from "react";
import { Check, Clock, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { AttendanceRecord, AttendanceStatus, Student } from "@/types";
import { recordAttendanceAction } from "@/server/actions/instructor";

interface Props {
  sessionId: string;
  sessionTitle: string;
  students: Student[];
  initialRecords: AttendanceRecord[];
}

export function RecordAttendanceRoster({
  sessionId,
  sessionTitle,
  students,
  initialRecords,
}: Props) {
  const [records, setRecords] = useState<AttendanceRecord[]>(initialRecords);
  const [loadingStudentId, setLoadingStudentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Correction state
  const [correctingStudentId, setCorrectingStudentId] = useState<string | null>(null);
  const [pendingStatus, setPendingStatus] = useState<AttendanceStatus>("present");
  const [correctionReason, setCorrectionReason] = useState("");

  async function handleMarkAttendance(studentId: string, status: AttendanceStatus) {
    const existing = records.find((r) => r.student_id === studentId);

    // If an existing record is already recorded and status is changing, require audit reason
    if (existing && existing.status !== status) {
      setCorrectingStudentId(studentId);
      setPendingStatus(status);
      setCorrectionReason("");
      return;
    }

    await submitAttendance(studentId, status);
  }

  async function submitAttendance(studentId: string, status: AttendanceStatus, reason?: string) {
    setError(null);
    setLoadingStudentId(studentId);

    try {
      const formData = new FormData();
      formData.set("sessionId", sessionId);
      formData.set("studentId", studentId);
      formData.set("status", status);
      if (reason) {
        formData.set("correctionReason", reason);
      }

      const res = await recordAttendanceAction(formData);
      if (!res.success) {
        setError(res.error || "Failed to record attendance");
      } else {
        setRecords((prev) => {
          const idx = prev.findIndex((r) => r.student_id === studentId);
          if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = {
              ...updated[idx],
              status,
              correction_reason: reason || updated[idx].correction_reason,
            };
            return updated;
          }
          return [
            ...prev,
            {
              id: `att-${Date.now()}`,
              class_session_id: sessionId,
              student_id: studentId,
              status,
              recorded_by: "current-instructor",
              recorded_at: new Date().toISOString(),
              correction_reason: reason || null,
            },
          ];
        });
        setCorrectingStudentId(null);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoadingStudentId(null);
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

      {/* Correction Reason Modal */}
      {correctingStudentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-[#DCE4EE] space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE4EE]">
              <div className="text-[#142541] font-bold text-sm">
                Audited Attendance Correction
              </div>
              <button
                onClick={() => setCorrectingStudentId(null)}
                className="text-[#5F6F84] hover:text-[#142541]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-[#5F6F84]">
              You are updating attendance to <strong className="uppercase text-[#142541]">{pendingStatus}</strong> for this session. A justification reason is required for compliance auditing.
            </p>

            <div className="space-y-1">
              <label htmlFor="modal-att-reason" className="text-xs font-semibold text-[#142541]">
                Correction Reason <span className="text-rose-500">*</span>
              </label>
              <input
                id="modal-att-reason"
                type="text"
                value={correctionReason}
                onChange={(e) => setCorrectionReason(e.target.value)}
                placeholder="e.g. Verified late arrival due to campus transportation delay"
                className="w-full rounded-lg border border-[#DCE4EE] p-2 text-xs text-[#263449] focus:outline-none focus:ring-2 focus:ring-[#3869AD]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DCE4EE]">
              <Button
                variant="ghost"
                onClick={() => setCorrectingStudentId(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={() => submitAttendance(correctingStudentId, pendingStatus, correctionReason)}
                disabled={correctionReason.trim().length < 5}
                className="bg-[#142541] hover:bg-[#1f3760] text-white text-xs"
              >
                Save Correction
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Roster Table */}
      <div className="rounded-xl border border-[#DCE4EE] bg-white overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#DCE4EE] bg-[#F3F6FA] flex items-center justify-between text-xs">
          <span className="font-bold text-[#142541] uppercase tracking-wider">
            {sessionTitle} — Eligible Enrolled Learners ({students.length})
          </span>
          <span className="text-[11px] text-[#5F6F84]">
            Official Academy Attendance Log
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#DCE4EE] text-[#142541] font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">Student</th>
                <th className="p-3.5">Student Code</th>
                <th className="p-3.5">Current Status</th>
                <th className="p-3.5">Audit Note</th>
                <th className="p-3.5 text-right">Record Attendance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE4EE] text-[#263449]">
              {students.map((student) => {
                const record = records.find((r) => r.student_id === student.id);
                const currentStatus = record?.status;
                const isLoading = loadingStudentId === student.id;

                return (
                  <tr key={student.id} className="hover:bg-[#F3F6FA]/50 transition-colors">
                    <td className="p-3.5 font-medium text-[#142541]">
                      {student.profile?.full_name || "Enrolled Student"}
                    </td>
                    <td className="p-3.5 font-mono text-[#3869AD]">
                      {student.student_code}
                    </td>
                    <td className="p-3.5">
                      {currentStatus === "present" && <Badge variant="success">Present</Badge>}
                      {currentStatus === "late" && <Badge variant="warning">Late</Badge>}
                      {currentStatus === "absent" && <Badge variant="error">Absent</Badge>}
                      {currentStatus === "excused" && <Badge variant="outline">Excused</Badge>}
                      {!currentStatus && <span className="text-[#5F6F84] italic">Unrecorded</span>}
                    </td>
                    <td className="p-3.5 text-[#5F6F84] max-w-xs truncate text-[11px]">
                      {record?.correction_reason || "—"}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="inline-flex items-center gap-1">
                        <Button
                          disabled={isLoading}
                          onClick={() => handleMarkAttendance(student.id, "present")}
                          className={`h-7 px-2 text-[11px] ${
                            currentStatus === "present"
                              ? "bg-emerald-600 text-white"
                              : "bg-white border border-[#DCE4EE] text-[#263449] hover:bg-emerald-50 hover:text-emerald-700"
                          }`}
                        >
                          <Check className="h-3 w-3 mr-0.5" /> Present
                        </Button>
                        <Button
                          disabled={isLoading}
                          onClick={() => handleMarkAttendance(student.id, "late")}
                          className={`h-7 px-2 text-[11px] ${
                            currentStatus === "late"
                              ? "bg-amber-600 text-white"
                              : "bg-white border border-[#DCE4EE] text-[#263449] hover:bg-amber-50 hover:text-amber-700"
                          }`}
                        >
                          <Clock className="h-3 w-3 mr-0.5" /> Late
                        </Button>
                        <Button
                          disabled={isLoading}
                          onClick={() => handleMarkAttendance(student.id, "absent")}
                          className={`h-7 px-2 text-[11px] ${
                            currentStatus === "absent"
                              ? "bg-rose-600 text-white"
                              : "bg-white border border-[#DCE4EE] text-[#263449] hover:bg-rose-50 hover:text-rose-700"
                          }`}
                        >
                          <X className="h-3 w-3 mr-0.5" /> Absent
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
