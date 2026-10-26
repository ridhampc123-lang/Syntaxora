"use client";

import React, { useActionState, useState, useEffect } from "react";
import { submitContactEnquiry, type ContactActionResult } from "@/server/actions/contact";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const initialState: ContactActionResult = {
  success: false,
  message: "",
};

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitContactEnquiry, initialState);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  useEffect(() => {
    if (state?.values) {
      setFormData((prev) => ({
        ...prev,
        ...state.values,
      }));
    }
  }, [state?.values]);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.message && (
        <Alert variant={state.success ? "success" : "error"}>
          {state.message}
        </Alert>
      )}

      {/* Honeypot field - invisible to humans */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="botField">Do not fill this field</label>
        <input id="botField" name="botField" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Input
            label="Full Name"
            name="fullName"
            id="fullName"
            required
            value={formData.fullName}
            onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
            placeholder="e.g. Rachel Sterling"
            error={state.errors?.fullName?.[0]}
          />
          {state.errors?.fullName?.[0] && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#DC2626] mt-1.5 bg-[#FEF2F2] border border-[#FECACA] px-2.5 py-1 rounded-lg">
              <AlertCircle className="h-3 w-3 shrink-0 text-[#DC2626]" />
              <span>{state.errors.fullName[0]}</span>
            </div>
          )}
        </div>

        <div>
          <Input
            label="Email Address"
            name="email"
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
            placeholder="e.g. rachel@example.com"
            error={state.errors?.email?.[0]}
          />
          {state.errors?.email?.[0] && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#DC2626] mt-1.5 bg-[#FEF2F2] border border-[#FECACA] px-2.5 py-1 rounded-lg">
              <AlertCircle className="h-3 w-3 shrink-0 text-[#DC2626]" />
              <span>{state.errors.email[0]}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Input
            label="Phone Number (Optional)"
            name="phone"
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
            placeholder="e.g. +1 (555) 019-2834"
            error={state.errors?.phone?.[0]}
          />
          {state.errors?.phone?.[0] && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#DC2626] mt-1.5 bg-[#FEF2F2] border border-[#FECACA] px-2.5 py-1 rounded-lg">
              <AlertCircle className="h-3 w-3 shrink-0 text-[#DC2626]" />
              <span>{state.errors.phone[0]}</span>
            </div>
          )}
        </div>

        <div>
          <Input
            label="Subject"
            name="subject"
            id="subject"
            required
            value={formData.subject}
            onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
            placeholder="e.g. Teen Robotics Cohort Inquiry"
            error={state.errors?.subject?.[0]}
          />
          {state.errors?.subject?.[0] && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#DC2626] mt-1.5 bg-[#FEF2F2] border border-[#FECACA] px-2.5 py-1 rounded-lg">
              <AlertCircle className="h-3 w-3 shrink-0 text-[#DC2626]" />
              <span>{state.errors.subject[0]}</span>
            </div>
          )}
        </div>
      </div>

      <div className="w-full space-y-1.5">
        <label
          htmlFor="message"
          className="block text-xs font-semibold uppercase tracking-wider text-[#17243A]"
        >
          Your Message <span className="text-[#B91C1C] ml-1">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          value={formData.message}
          onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
          placeholder="Tell us about the prospective student, current experience level, or specific curriculum questions..."
          className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-[#354052] placeholder:text-[#687386]/60 transition-colors focus:border-[#355F99] focus:outline-none focus:ring-2 focus:ring-[#355F99]/20 disabled:cursor-not-allowed disabled:bg-[#FAF8F3] ${
            state.errors?.message?.[0]
              ? "border-[#DC2626] ring-1 ring-[#DC2626]/20 bg-[#FEF2F2]/20"
              : "border-[#DDE2E7]"
          }`}
        />
        {state.errors?.message?.[0] && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#DC2626] mt-1 bg-[#FEF2F2] border border-[#FECACA] px-2.5 py-1 rounded-lg" role="alert">
            <AlertCircle className="h-3 w-3 shrink-0 text-[#DC2626]" />
            <span>{state.errors.message[0]}</span>
          </div>
        )}
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isPending}
        className="w-full sm:w-auto"
      >
        Submit Enquiry
      </Button>
    </form>
  );
}
