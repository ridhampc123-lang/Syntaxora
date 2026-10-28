"use client";

import React, { useActionState, useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Info,
  AlertTriangle,
} from "lucide-react";
import { submitApplicationAction, type ApplicationActionResult } from "@/server/actions/application";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EDUCATION_LEVELS } from "@/lib/validation/application";
import { Course } from "@/types";

const initialState: ApplicationActionResult = {
  success: false,
  message: "",
};

interface Props {
  courses: Course[];
  initialCourseId?: string;
}

function getFieldLabel(fieldName: string): string {
  switch (fieldName) {
    case "fullName":
      return "Full Legal Name";
    case "email":
      return "Student Email Address";
    case "phone":
      return "Contact Phone Number";
    case "dateOfBirth":
      return "Date of Birth";
    case "educationLevel":
      return "Current Education Level";
    case "courseId":
      return "Cohort Curriculum";
    case "guardianName":
      return "Guardian Full Name";
    case "guardianEmail":
      return "Guardian Email";
    case "guardianPhone":
      return "Guardian Phone";
    case "statementOfInterest":
      return "Statement of Interest";
    case "consent":
      return "Admissions Certification & Terms";
    default:
      return fieldName;
  }
}

export function StudentApplicationForm({ courses, initialCourseId }: Props) {
  const [state, formAction, isPending] = useActionState(submitApplicationAction, initialState);
  const [copied, setCopied] = useState(false);
  const errorBannerRef = useRef<HTMLDivElement>(null);

  // Controlled form state to ensure NO user input is ever reset or cleared on error
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    courseId: initialCourseId || "",
    educationLevel: "",
    guardianName: "",
    guardianEmail: "",
    guardianPhone: "",
    statementOfInterest: "",
    consent: false,
  });

  // Keep state synchronized with any returned values
  useEffect(() => {
    if (state?.values) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData((prev) => ({
        ...prev,
        ...state.values,
      }));
    }
  }, [state?.values]);

  // Smoothly scroll to the error summary when errors occur
  useEffect(() => {
    if (!state.success && (state.message || state.errors)) {
      errorBannerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [state]);

  const handleCopyReference = () => {
    if (state.reference) {
      navigator.clipboard.writeText(state.reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (state.success && state.reference) {
    return (
      <div className="rounded-2xl border border-[#DDE2E7] bg-white p-8 sm:p-10 shadow-sm text-center space-y-6 animate-fade-in">
        <div className="mx-auto h-16 w-16 rounded-full bg-[#E7F5F4] text-[#167F78] flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF0F8] text-[#355F99] text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Application Successfully Submitted</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#17243A] tracking-tight">
            Thank You for Applying to Syntaxora
          </h2>
          <p className="text-sm text-[#687386] max-w-lg mx-auto">
            {state.message}
          </p>
        </div>

        {/* Application Reference Badge with Copy */}
        <div className="max-w-md mx-auto p-4 rounded-xl bg-[#FAF8F3] border border-[#DDE2E7] space-y-2">
          <div className="text-xs font-semibold text-[#687386] uppercase tracking-wider">
            Your Admissions Reference Number
          </div>
          <div className="flex items-center justify-center gap-3">
            <span className="font-mono text-2xl font-black text-[#17243A] tracking-wider">
              {state.reference}
            </span>
            <button
              type="button"
              onClick={handleCopyReference}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-white border border-[#DDE2E7] text-[#17243A] hover:bg-[#EAF0F8] hover:text-[#355F99] transition-colors cursor-pointer"
              aria-label="Copy reference number"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-600 font-semibold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <p className="text-[11px] text-[#687386]">
            Save this reference number to check admissions updates or correspond with our academic coordinators.
          </p>
        </div>

        {/* Security & Access Clarification Banner */}
        <div className="max-w-lg mx-auto rounded-xl p-4 bg-[#EAF0F8]/60 border border-[#355F99]/20 text-left flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-[#355F99] shrink-0 mt-0.5" aria-hidden="true" />
          <div className="text-xs text-[#354052] space-y-1">
            <div className="font-semibold text-[#17243A]">
              Account & Portal Provisioning Policy
            </div>
            <p className="leading-relaxed text-[#687386]">
              In accordance with Syntaxora security rules, <strong>no student account or login session has been created</strong> at this stage. Upon application review and faculty approval, an official student code and secure account setup link will be dispatched to your registered email.
            </p>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/courses">
            <Button variant="outline" size="md">
              Browse Syllabi & Projects
            </Button>
          </Link>
          <Link href="/">
            <Button variant="primary" size="md">
              Return to Homepage
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const hasErrors = !state.success && Boolean(state.message || state.errors);
  const errorCount = state.errors ? Object.keys(state.errors).length : 0;

  return (
    <form action={formAction} className="space-y-8" noValidate>
      {/* Top Banner Notice */}
      <div className="rounded-xl border border-[#DDE2E7] bg-[#FAF8F3] p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-[#355F99] shrink-0 mt-0.5" aria-hidden="true" />
        <div className="text-xs text-[#354052] space-y-1">
          <span className="font-semibold text-[#17243A]">
            Admissions & Student Approval Notice
          </span>
          <p className="text-[#687386] leading-relaxed">
            All Syntaxora student enrollments require faculty review. Submitting this application registers your interest with our admissions team. Student portal accounts are provisioned exclusively upon admission approval.
          </p>
        </div>
      </div>

      {/* Prominent Error Warning Box - Informs user that their data is safe & highlights exact problems */}
      {hasErrors && (
        <div
          ref={errorBannerRef}
          className="rounded-2xl border-2 border-[#DC2626] bg-[#FEF2F2] p-5 sm:p-6 text-[#991B1B] shadow-md space-y-3.5 animate-in fade-in slide-in-from-top-2 duration-300"
          role="alert"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-[#FEE2E2] text-[#DC2626] shrink-0 shadow-xs">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="space-y-1 flex-1">
              <h4 className="text-base font-bold text-[#7F1D1D] tracking-tight">
                {errorCount > 0
                  ? `Please Review ${errorCount} Item${errorCount > 1 ? "s" : ""} in Your Application`
                  : "Unable to Complete Application"}
              </h4>
              <p className="text-xs text-[#991B1B] leading-relaxed">
                <strong>Your entered information has NOT been cleared.</strong> All your typed details are saved below. Please correct the highlighted field{errorCount > 1 ? "s" : ""} below and submit again:
              </p>
            </div>
          </div>

          {state.errors && Object.keys(state.errors).length > 0 && (
            <div className="pt-2 border-t border-[#FECACA] space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#7F1D1D] block">
                Details Requiring Attention:
              </span>
              <ul className="text-xs text-[#991B1B] space-y-1.5 pl-5 list-disc">
                {Object.entries(state.errors).map(([field, msgs]) => (
                  <li key={field}>
                    <strong className="font-bold text-[#7F1D1D]">{getFieldLabel(field)}:</strong>{" "}
                    {msgs.join(", ")}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Section 1: Prospective Student Details */}
      <div className="space-y-4">
        <div className="border-b border-[#DDE2E7] pb-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#17243A]">
            1. Applicant Information
          </h3>
          <p className="text-xs text-[#687386]">
            Personal details of the prospective student.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              label="Full Legal Name"
              name="fullName"
              id="fullName"
              required
              value={formData.fullName}
              onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
              placeholder="e.g. Maya Patel"
              error={state.errors?.fullName?.[0]}
            />
            {state.errors?.fullName?.[0] && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#DC2626] mt-1.5 bg-[#FEF2F2] border border-[#FECACA] px-3 py-1.5 rounded-lg shadow-xs">
                <AlertCircle className="h-3.5 w-3.5 shrink-0 text-[#DC2626]" />
                <span>{state.errors.fullName[0]}</span>
              </div>
            )}
          </div>

          <div>
            <Input
              label="Student Email Address"
              name="email"
              id="email"
              type="email"
              required
              autoComplete="email"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="student@example.com"
              helperText="Official notices and setup invitations will be sent here."
              error={state.errors?.email?.[0]}
            />
            {state.errors?.email?.[0] && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#DC2626] mt-1.5 bg-[#FEF2F2] border border-[#FECACA] px-3 py-1.5 rounded-lg shadow-xs">
                <AlertCircle className="h-3.5 w-3.5 shrink-0 text-[#DC2626]" />
                <span>{state.errors.email[0]}</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              label="Contact Phone Number"
              name="phone"
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="+91 98765 43210"
              error={state.errors?.phone?.[0]}
            />
            {state.errors?.phone?.[0] && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#DC2626] mt-1.5 bg-[#FEF2F2] border border-[#FECACA] px-3 py-1.5 rounded-lg shadow-xs">
                <AlertCircle className="h-3.5 w-3.5 shrink-0 text-[#DC2626]" />
                <span>{state.errors.phone[0]}</span>
              </div>
            )}
          </div>

          <div>
            <Input
              label="Date of Birth"
              name="dateOfBirth"
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
              helperText="Used to verify age eligibility for younger cohorts."
              error={state.errors?.dateOfBirth?.[0]}
            />
            {state.errors?.dateOfBirth?.[0] && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#DC2626] mt-1.5 bg-[#FEF2F2] border border-[#FECACA] px-3 py-1.5 rounded-lg shadow-xs">
                <AlertCircle className="h-3.5 w-3.5 shrink-0 text-[#DC2626]" />
                <span>{state.errors.dateOfBirth[0]}</span>
              </div>
            )}
          </div>
        </div>

        {/* Education Level Dropdown */}
        <div className="space-y-1">
          <label
            htmlFor="educationLevel"
            className="block text-xs font-semibold uppercase tracking-wider text-[#17243A]"
          >
            Current Education Level <span className="text-[#B91C1C] ml-1">*</span>
          </label>
          <select
            id="educationLevel"
            name="educationLevel"
            required
            value={formData.educationLevel}
            onChange={(e) => setFormData((prev) => ({ ...prev, educationLevel: e.target.value }))}
            className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-xs text-[#17243A] shadow-sm transition-colors focus:border-[#355F99] focus:outline-none focus:ring-1 focus:ring-[#355F99] ${
              state.errors?.educationLevel?.[0]
                ? "border-[#DC2626] ring-1 ring-[#DC2626]/30 bg-[#FEF2F2]/30"
                : "border-[#DDE2E7]"
            }`}
          >
            <option value="" disabled>
              Select current academic level...
            </option>
            {EDUCATION_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
          {state.errors?.educationLevel?.[0] && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#DC2626] mt-1.5 bg-[#FEF2F2] border border-[#FECACA] px-3 py-1.5 rounded-lg shadow-xs">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 text-[#DC2626]" />
              <span>{state.errors.educationLevel[0]}</span>
            </div>
          )}
        </div>
      </div>

      {/* Section 2: Program of Interest */}
      <div className="space-y-4">
        <div className="border-b border-[#DDE2E7] pb-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#17243A]">
            2. Program of Interest
          </h3>
          <p className="text-xs text-[#687386]">
            Select the cohort track you wish to apply for.
          </p>
        </div>

        <div className="space-y-1">
          <label
            htmlFor="courseId"
            className="block text-xs font-semibold uppercase tracking-wider text-[#17243A]"
          >
            Cohort Curriculum
          </label>
          <select
            id="courseId"
            name="courseId"
            value={formData.courseId}
            onChange={(e) => setFormData((prev) => ({ ...prev, courseId: e.target.value }))}
            className="w-full rounded-lg border border-[#DDE2E7] bg-white px-3.5 py-2.5 text-xs text-[#17243A] shadow-sm transition-colors focus:border-[#355F99] focus:outline-none focus:ring-1 focus:ring-[#355F99]"
          >
            <option value="">General Academy Admissions (Review all tracks)</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} ({c.level} • {c.duration_weeks} wks)
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label
            htmlFor="statementOfInterest"
            className="block text-xs font-semibold uppercase tracking-wider text-[#17243A]"
          >
            Statement of Interest & Prior Background
          </label>
          <textarea
            id="statementOfInterest"
            name="statementOfInterest"
            rows={3}
            value={formData.statementOfInterest}
            onChange={(e) => setFormData((prev) => ({ ...prev, statementOfInterest: e.target.value }))}
            placeholder="Tell us briefly about any coding, computer science, or mathematics experience, and what you hope to build at Syntaxora..."
            maxLength={1000}
            className={`w-full rounded-lg border bg-white p-3 text-xs text-[#17243A] shadow-sm placeholder:text-[#687386]/60 focus:border-[#355F99] focus:outline-none focus:ring-1 focus:ring-[#355F99] ${
              state.errors?.statementOfInterest?.[0]
                ? "border-[#DC2626] ring-1 ring-[#DC2626]/30 bg-[#FEF2F2]/30"
                : "border-[#DDE2E7]"
            }`}
          />
          <div className="flex items-center justify-between text-[11px] text-[#687386]">
            <span>Tell us your learning goals. Maximum 1,000 characters.</span>
            <span>{formData.statementOfInterest.length}/1000</span>
          </div>
          {state.errors?.statementOfInterest?.[0] && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#DC2626] mt-1.5 bg-[#FEF2F2] border border-[#FECACA] px-3 py-1.5 rounded-lg shadow-xs">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 text-[#DC2626]" />
              <span>{state.errors.statementOfInterest[0]}</span>
            </div>
          )}
        </div>
      </div>

      {/* Section 3: Guardian Details (For Minors / Emergency Contact) */}
      <div className="space-y-4">
        <div className="border-b border-[#DDE2E7] pb-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#17243A]">
            3. Parent / Guardian Contact (Required for Minors)
          </h3>
          <p className="text-xs text-[#687386]">
            Required for applicants under 18 years old. Also serves as primary emergency contact.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Input
              label="Guardian Full Name"
              name="guardianName"
              id="guardianName"
              value={formData.guardianName}
              onChange={(e) => setFormData((prev) => ({ ...prev, guardianName: e.target.value }))}
              placeholder="e.g. Dev Patel"
              error={state.errors?.guardianName?.[0]}
            />
            {state.errors?.guardianName?.[0] && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#DC2626] mt-1.5 bg-[#FEF2F2] border border-[#FECACA] px-3 py-1.5 rounded-lg shadow-xs">
                <AlertCircle className="h-3.5 w-3.5 shrink-0 text-[#DC2626]" />
                <span>{state.errors.guardianName[0]}</span>
              </div>
            )}
          </div>

          <div>
            <Input
              label="Guardian Email"
              name="guardianEmail"
              id="guardianEmail"
              type="email"
              value={formData.guardianEmail}
              onChange={(e) => setFormData((prev) => ({ ...prev, guardianEmail: e.target.value }))}
              placeholder="guardian@example.com"
              error={state.errors?.guardianEmail?.[0]}
            />
            {state.errors?.guardianEmail?.[0] && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#DC2626] mt-1.5 bg-[#FEF2F2] border border-[#FECACA] px-3 py-1.5 rounded-lg shadow-xs">
                <AlertCircle className="h-3.5 w-3.5 shrink-0 text-[#DC2626]" />
                <span>{state.errors.guardianEmail[0]}</span>
              </div>
            )}
          </div>

          <div>
            <Input
              label="Guardian Phone"
              name="guardianPhone"
              id="guardianPhone"
              type="tel"
              value={formData.guardianPhone}
              onChange={(e) => setFormData((prev) => ({ ...prev, guardianPhone: e.target.value }))}
              placeholder="+91 98765 00000"
              error={state.errors?.guardianPhone?.[0]}
            />
            {state.errors?.guardianPhone?.[0] && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#DC2626] mt-1.5 bg-[#FEF2F2] border border-[#FECACA] px-3 py-1.5 rounded-lg shadow-xs">
                <AlertCircle className="h-3.5 w-3.5 shrink-0 text-[#DC2626]" />
                <span>{state.errors.guardianPhone[0]}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 4: Consent & Terms */}
      <div className="space-y-3 pt-2">
        <div
          className={`flex items-start gap-3 p-4 rounded-xl border bg-white transition-colors ${
            state.errors?.consent?.[0]
              ? "border-[#DC2626] bg-[#FEF2F2]/30 ring-1 ring-[#DC2626]/20"
              : "border-[#DDE2E7]"
          }`}
        >
          <input
            id="consent"
            name="consent"
            type="checkbox"
            required
            checked={formData.consent}
            onChange={(e) => setFormData((prev) => ({ ...prev, consent: e.target.checked }))}
            className="h-4 w-4 rounded border-[#DDE2E7] text-[#355F99] focus:ring-[#355F99] mt-0.5 cursor-pointer"
          />
          <label htmlFor="consent" className="text-xs text-[#354052] leading-relaxed cursor-pointer select-none">
            I certify that the information provided is accurate. I understand that submitting this admission form does not automatically grant student portal access and that admission decisions are subject to cohort capacity and faculty approval. <span className="text-[#B91C1C] font-bold">*</span>
          </label>
        </div>
        {state.errors?.consent?.[0] && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#DC2626] bg-[#FEF2F2] border border-[#FECACA] px-3 py-1.5 rounded-lg shadow-xs">
            <AlertCircle className="h-3.5 w-3.5 shrink-0 text-[#DC2626]" />
            <span>{state.errors.consent[0]}</span>
          </div>
        )}
      </div>

      {/* Bottom error advisory */}
      {hasErrors && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
          <span>
            Some required details need your correction above. Please review the highlighted red boxes before clicking submit.
          </span>
        </div>
      )}

      <div className="pt-2">
        <Button
          type="submit"
          variant="ai"
          size="lg"
          isLoading={isPending}
          className="w-full sm:w-auto px-8 justify-center font-bold shadow-md hover:shadow-lg transition-all"
        >
          Submit Admission Application
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </form>
  );
}
