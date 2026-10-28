"use client";

import React, { useActionState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { submitGuardianInquiryAction, type GuardianActionResult } from "@/server/actions/guardian";

interface Props {
  activeStudentId?: string;
  activeStudentCode?: string;
  activeStudentName?: string;
}

const initialState: GuardianActionResult = {
  success: false,
  message: "",
};

export function ParentSupportInquiryForm({
  activeStudentId,
  activeStudentCode,
  activeStudentName,
}: Props) {
  const [state, formAction, isPending] = useActionState(submitGuardianInquiryAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="studentId" value={activeStudentId || ""} />
      <input type="hidden" name="studentCode" value={activeStudentCode || ""} />

      {state.message && (
        <Alert variant={state.success ? "success" : "error"}>
          {state.message}
        </Alert>
      )}

      {state.success ? (
        <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
          <div className="mx-auto h-10 w-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h4 className="font-bold text-sm text-emerald-950">Inquiry Logged Successfully</h4>
          <p className="text-xs text-emerald-800">
            Your request has been routed to the student success team. You can submit another request below if needed.
          </p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="inquiryType" className="block text-xs font-semibold text-[#142541]">
            Request Category <span className="text-rose-600">*</span>
          </label>
          <select
            id="inquiryType"
            name="inquiryType"
            required
            defaultValue="attendance_review"
            className="w-full rounded-xl border border-[#DCE4EE] bg-white px-3 py-2 text-xs text-[#142541] shadow-2xs focus:border-[#3869AD] focus:outline-none focus:ring-1 focus:ring-[#3869AD]"
          >
            <option value="attendance_review">Attendance Correction Review</option>
            <option value="absence_notice">Advance Leave Notification</option>
            <option value="linking_help">Student Code / Linking Assistance</option>
            <option value="general_support">Academic Program Inquiry</option>
            <option value="billing_support">Tuition / Fee Invoice Assistance</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="subject" className="block text-xs font-semibold text-[#142541]">
            Subject Brief <span className="text-rose-600">*</span>
          </label>
          <input
            id="subject"
            name="subject"
            type="text"
            required
            placeholder="e.g. Attendance review for Oct 24 session"
            className="w-full rounded-xl border border-[#DCE4EE] bg-white px-3 py-2 text-xs text-[#142541] shadow-2xs focus:border-[#3869AD] focus:outline-none focus:ring-1 focus:ring-[#3869AD]"
          />
        </div>
      </div>

      {activeStudentName && (
        <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#DCE4EE] text-xs flex items-center justify-between text-[#5F6F84]">
          <span>Associated Student Profile:</span>
          <strong className="text-[#142541]">
            {activeStudentName} ({activeStudentCode})
          </strong>
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="message" className="block text-xs font-semibold text-[#142541]">
          Detailed Explanation / Supporting Information <span className="text-rose-600">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          placeholder="Please provide full details including session date, makeup work done, or relevant context..."
          className="w-full rounded-xl border border-[#DCE4EE] bg-white p-3 text-xs text-[#142541] shadow-2xs focus:border-[#3869AD] focus:outline-none focus:ring-1 focus:ring-[#3869AD]"
        />
      </div>

      <div className="flex items-center justify-end pt-2">
        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isPending}
          className="bg-[#168B83] hover:bg-[#13746D] font-bold"
        >
          <Send className="h-4 w-4 mr-1.5" />
          Submit Support Ticket
        </Button>
      </div>
    </form>
  );
}

