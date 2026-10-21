"use client";

import React, { useActionState } from "react";
import { submitContactEnquiry, type ContactActionResult } from "@/server/actions/contact";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

const initialState: ContactActionResult = {
  success: false,
  message: "",
};

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitContactEnquiry, initialState);

  return (
    <form action={formAction} className="space-y-4">
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
        <Input
          label="Full Name"
          name="fullName"
          id="fullName"
          required
          placeholder="e.g. Rachel Sterling"
          error={state.errors?.fullName?.[0]}
        />

        <Input
          label="Email Address"
          name="email"
          id="email"
          type="email"
          required
          placeholder="e.g. rachel@example.com"
          error={state.errors?.email?.[0]}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Phone Number (Optional)"
          name="phone"
          id="phone"
          type="tel"
          placeholder="e.g. +1 (555) 019-2834"
          error={state.errors?.phone?.[0]}
        />

        <Input
          label="Subject"
          name="subject"
          id="subject"
          required
          placeholder="e.g. Teen Robotics Cohort Inquiry"
          error={state.errors?.subject?.[0]}
        />
      </div>

      <div className="w-full space-y-1.5">
        <label
          htmlFor="message"
          className="block text-xs font-semibold uppercase tracking-wider text-[#142541]"
        >
          Your Message <span className="text-[#B91C1C] ml-1">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          placeholder="Tell us about the prospective student, current experience level, or specific curriculum questions..."
          className="w-full rounded-lg border border-[#DCE4EE] bg-white px-3.5 py-2.5 text-sm text-[#263449] placeholder:text-[#5F6F84]/60 transition-colors focus:border-[#3869AD] focus:outline-none focus:ring-2 focus:ring-[#3869AD]/20 disabled:cursor-not-allowed disabled:bg-[#F3F6FA]"
        />
        {state.errors?.message?.[0] && (
          <p className="text-xs font-medium text-[#B91C1C]" role="alert">
            {state.errors.message[0]}
          </p>
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
