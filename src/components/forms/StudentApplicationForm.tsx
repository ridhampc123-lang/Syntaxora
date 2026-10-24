"use client";

import React, { useActionState, useState } from "react";
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
} from "lucide-react";
import { submitApplicationAction, type ApplicationActionResult } from "@/server/actions/application";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
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

export function StudentApplicationForm({ courses, initialCourseId }: Props) {
  const [state, formAction, isPending] = useActionState(submitApplicationAction, initialState);
  const [copied, setCopied] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourseId || "");

  const handleCopyReference = () => {
    if (state.reference) {
      navigator.clipboard.writeText(state.reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (state.success && state.reference) {
    return (
      <div className="rounded-2xl border border-[#DCE4EE] bg-white p-8 sm:p-10 shadow-sm text-center space-y-6 animate-in fade-in-50 duration-300">
        <div className="mx-auto h-16 w-16 rounded-full bg-[#E2F4F2] text-[#168B83] flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8EFF8] text-[#3869AD] text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Application Successfully Submitted</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#142541] tracking-tight">
            Thank You for Applying to Syntaxora
          </h2>
          <p className="text-sm text-[#5F6F84] max-w-lg mx-auto">
            {state.message}
          </p>
        </div>

        {/* Application Reference Badge with Copy */}
        <div className="max-w-md mx-auto p-4 rounded-xl bg-[#F3F6FA] border border-[#DCE4EE] space-y-2">
          <div className="text-xs font-semibold text-[#5F6F84] uppercase tracking-wider">
            Your Admissions Reference Number
          </div>
          <div className="flex items-center justify-center gap-3">
            <span className="font-mono text-2xl font-black text-[#142541] tracking-wider">
              {state.reference}
            </span>
            <button
              type="button"
              onClick={handleCopyReference}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-white border border-[#DCE4EE] text-[#142541] hover:bg-[#E8EFF8] hover:text-[#3869AD] transition-colors cursor-pointer"
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
          <p className="text-[11px] text-[#5F6F84]">
            Save this reference number to check admissions updates or correspond with our academic coordinators.
          </p>
        </div>

        {/* Security & Access Clarification Banner */}
        <div className="max-w-lg mx-auto rounded-xl p-4 bg-[#E8EFF8]/60 border border-[#3869AD]/20 text-left flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-[#3869AD] shrink-0 mt-0.5" aria-hidden="true" />
          <div className="text-xs text-[#263449] space-y-1">
            <div className="font-semibold text-[#142541]">
              Account & Portal Provisioning Policy
            </div>
            <p className="leading-relaxed text-[#5F6F84]">
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

  return (
    <form action={formAction} className="space-y-8" noValidate>
      {/* Top Banner Notice */}
      <div className="rounded-xl border border-[#DCE4EE] bg-[#F3F6FA] p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-[#3869AD] shrink-0 mt-0.5" aria-hidden="true" />
        <div className="text-xs text-[#263449] space-y-1">
          <span className="font-semibold text-[#142541]">
            Admissions & Student Approval Notice
          </span>
          <p className="text-[#5F6F84] leading-relaxed">
            All Syntaxora student enrollments require faculty review. Submitting this application registers your interest with our admissions team. Student portal accounts are provisioned exclusively upon admission approval.
          </p>
        </div>
      </div>

      {state.message && (
        <Alert variant={state.success ? "success" : "error"}>
          {state.message}
        </Alert>
      )}

      {/* Section 1: Prospective Student Details */}
      <div className="space-y-4">
        <div className="border-b border-[#DCE4EE] pb-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#142541]">
            1. Applicant Information
          </h3>
          <p className="text-xs text-[#5F6F84]">
            Personal details of the prospective student.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full Legal Name"
            name="fullName"
            id="fullName"
            required
            placeholder="e.g. Maya Patel"
            error={state.errors?.fullName?.[0]}
          />

          <Input
            label="Student Email Address"
            name="email"
            id="email"
            type="email"
            required
            autoComplete="email"
            placeholder="student@example.com"
            helperText="Official notices and setup invitations will be sent here."
            error={state.errors?.email?.[0]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Contact Phone Number"
            name="phone"
            id="phone"
            type="tel"
            placeholder="+1 (555) 000-0000"
            error={state.errors?.phone?.[0]}
          />

          <Input
            label="Date of Birth"
            name="dateOfBirth"
            id="dateOfBirth"
            type="date"
            helperText="Used to verify age eligibility for younger cohorts."
            error={state.errors?.dateOfBirth?.[0]}
          />
        </div>

        {/* Education Level Dropdown */}
        <div className="space-y-1">
          <label
            htmlFor="educationLevel"
            className="block text-xs font-semibold uppercase tracking-wider text-[#142541]"
          >
            Current Education Level <span className="text-[#B91C1C] ml-1">*</span>
          </label>
          <select
            id="educationLevel"
            name="educationLevel"
            required
            defaultValue=""
            className="w-full rounded-lg border border-[#DCE4EE] bg-white px-3.5 py-2.5 text-xs text-[#142541] shadow-sm transition-colors focus:border-[#3869AD] focus:outline-none focus:ring-1 focus:ring-[#3869AD]"
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
            <p className="text-xs text-[#B91C1C] flex items-center gap-1 mt-1">
              <AlertCircle className="h-3 w-3 shrink-0" />
              <span>{state.errors.educationLevel[0]}</span>
            </p>
          )}
        </div>
      </div>

      {/* Section 2: Program of Interest */}
      <div className="space-y-4">
        <div className="border-b border-[#DCE4EE] pb-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#142541]">
            2. Program of Interest
          </h3>
          <p className="text-xs text-[#5F6F84]">
            Select the cohort track you wish to apply for.
          </p>
        </div>

        <div className="space-y-1">
          <label
            htmlFor="courseId"
            className="block text-xs font-semibold uppercase tracking-wider text-[#142541]"
          >
            Cohort Curriculum
          </label>
          <select
            id="courseId"
            name="courseId"
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full rounded-lg border border-[#DCE4EE] bg-white px-3.5 py-2.5 text-xs text-[#142541] shadow-sm transition-colors focus:border-[#3869AD] focus:outline-none focus:ring-1 focus:ring-[#3869AD]"
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
            className="block text-xs font-semibold uppercase tracking-wider text-[#142541]"
          >
            Statement of Interest & Prior Background
          </label>
          <textarea
            id="statementOfInterest"
            name="statementOfInterest"
            rows={3}
            placeholder="Tell us briefly about any coding, robotics, or mathematics experience, and what you hope to build at Syntaxora..."
            maxLength={1000}
            className="w-full rounded-lg border border-[#DCE4EE] bg-white p-3 text-xs text-[#142541] shadow-sm placeholder:text-[#5F6F84]/60 focus:border-[#3869AD] focus:outline-none focus:ring-1 focus:ring-[#3869AD]"
          />
          <span className="text-[11px] text-[#5F6F84]">Maximum 1,000 characters.</span>
        </div>
      </div>

      {/* Section 3: Guardian Details (For Minors / Emergency Contact) */}
      <div className="space-y-4">
        <div className="border-b border-[#DCE4EE] pb-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#142541]">
            3. Parent / Guardian Contact (Required for Minors)
          </h3>
          <p className="text-xs text-[#5F6F84]">
            Required for applicants under 18 years old. Also serves as primary emergency contact.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Guardian Full Name"
            name="guardianName"
            id="guardianName"
            placeholder="e.g. Dev Patel"
            error={state.errors?.guardianName?.[0]}
          />

          <Input
            label="Guardian Email"
            name="guardianEmail"
            id="guardianEmail"
            type="email"
            placeholder="guardian@example.com"
            error={state.errors?.guardianEmail?.[0]}
          />

          <Input
            label="Guardian Phone"
            name="guardianPhone"
            id="guardianPhone"
            type="tel"
            placeholder="+1 (555) 000-0000"
            error={state.errors?.guardianPhone?.[0]}
          />
        </div>
      </div>

      {/* Section 4: Consent & Terms */}
      <div className="space-y-3 pt-2">
        <div className="flex items-start gap-3 p-4 rounded-xl border border-[#DCE4EE] bg-white">
          <input
            id="consent"
            name="consent"
            type="checkbox"
            required
            className="h-4 w-4 rounded border-[#DCE4EE] text-[#3869AD] focus:ring-[#3869AD] mt-0.5 cursor-pointer"
          />
          <label htmlFor="consent" className="text-xs text-[#263449] leading-relaxed cursor-pointer">
            I certify that the information provided is accurate. I understand that submitting this admission form does not automatically grant student portal access and that admission decisions are subject to cohort capacity and faculty approval. <span className="text-[#B91C1C]">*</span>
          </label>
        </div>
        {state.errors?.consent?.[0] && (
          <p className="text-xs text-[#B91C1C] flex items-center gap-1">
            <AlertCircle className="h-3 w-3 shrink-0" />
            <span>{state.errors.consent[0]}</span>
          </p>
        )}
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isPending}
          className="w-full sm:w-auto px-8 justify-center font-bold"
        >
          Submit Admission Application
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </form>
  );
}
