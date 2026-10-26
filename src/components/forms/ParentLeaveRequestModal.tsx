"use client";

import React, { useState } from "react";
import { Calendar, FileText, CheckCircle2, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  studentName: string;
  studentCode: string;
}

export function ParentLeaveRequestModal({ studentName, studentCode }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [leaveDate, setLeaveDate] = useState(new Date().toISOString().split("T")[0]);
  const [reason, setReason] = useState("Medical / Healthcare Appointment");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 800);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSubmitted(false);
    setNotes("");
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="font-semibold text-xs flex items-center gap-1.5"
      >
        <Calendar className="h-3.5 w-3.5" />
        Submit Absence Notice / Leave Request
      </Button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50 duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-[#DCE4EE] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#DCE4EE] pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#E2F4F2] text-[#168B83]">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#142541]">
                    Student Leave Notification
                  </h3>
                  <p className="text-[11px] text-[#5F6F84]">
                    Notify instructor for {studentName} ({studentCode})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg p-1 text-[#5F6F84] hover:bg-[#F3F6FA] hover:text-[#142541] transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {submitted ? (
              <div className="py-4 text-center space-y-3">
                <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-[#142541]">
                    Leave Notice Logged
                  </h4>
                  <p className="text-xs text-[#5F6F84] max-w-xs mx-auto leading-relaxed">
                    Your advance absence notice for <strong>{leaveDate}</strong> has been transmitted to faculty mentors. The session will be officially designated as <strong>Excused</strong>.
                  </p>
                </div>
                <div className="pt-2">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleClose}
                    className="w-full justify-center"
                  >
                    Done
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#142541]">
                    Date of Expected Absence <span className="text-[#B91C1C]">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={leaveDate}
                    onChange={(e) => setLeaveDate(e.target.value)}
                    className="w-full rounded-lg border border-[#DCE4EE] bg-white px-3 py-2 text-xs text-[#142541] focus:outline-none focus:ring-1 focus:ring-[#3869AD]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#142541]">
                    Reason Category <span className="text-[#B91C1C]">*</span>
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full rounded-lg border border-[#DCE4EE] bg-white px-3 py-2 text-xs text-[#142541] font-semibold focus:outline-none focus:ring-1 focus:ring-[#3869AD]"
                  >
                    <option>Medical / Healthcare Appointment</option>
                    <option>School Examination / Academic Contest</option>
                    <option>Family Travel / Emergency</option>
                    <option>Religious / Cultural Observance</option>
                    <option>Technical / Hardware Maintenance</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#142541]">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Brief explanation for mentor review..."
                    className="w-full rounded-lg border border-[#DCE4EE] bg-white p-2.5 text-xs text-[#142541] focus:outline-none focus:ring-1 focus:ring-[#3869AD]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DCE4EE]">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleClose}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={submitting}
                    className="font-bold"
                  >
                    <Send className="h-3 w-3 mr-1" />
                    Submit Notice
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
