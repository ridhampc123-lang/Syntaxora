import React from "react";
import { Mail, Clock, ShieldCheck } from "lucide-react";
import { ContactForm } from "@/components/forms/ContactForm";

export const metadata = {
  title: "Contact Admissions & Student Support — Syntaxora",
  description:
    "Connect with our admissions team for personalized guidance on course placement, cohort schedules, and guardian enrollment.",
};

export default function ContactPage() {
  return (
    <div className="bg-[#F3F6FA] min-h-screen py-12 lg:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#142541] tracking-tight">
            Contact Admissions & Support
          </h1>
          <p className="text-base text-[#5F6F84]">
            Have questions regarding age eligibility, cohort timings, or guardian portal features? Our admissions advisors are here to help.
          </p>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Information Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-xl border border-[#DCE4EE] bg-white p-6 sm:p-8 space-y-6">
              <h2 className="text-xl font-bold text-[#142541]">Direct Enquiries</h2>

              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-[#3869AD] mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <span className="font-semibold text-[#142541] block">Admissions Email</span>
                    <a
                      href="mailto:admissions@syntaxora.com"
                      className="text-[#3869AD] hover:underline text-xs"
                    >
                      admissions@syntaxora.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-[#168B83] mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <span className="font-semibold text-[#142541] block">Advisory Hours</span>
                    <span className="text-xs text-[#5F6F84]">
                      Monday – Friday: 9:00 AM – 6:00 PM IST
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-[#142541] mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <span className="font-semibold text-[#142541] block">Guardian Verification Support</span>
                    <span className="text-xs text-[#5F6F84]">
                      Assistance with student linking and permission activation
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[#DCE4EE] bg-[#E8EFF8] p-6 text-xs text-[#142541] space-y-2">
              <span className="font-bold uppercase tracking-wider text-[#3869AD] block">
                Admissions Commitment
              </span>
              <p className="leading-relaxed">
                All submitted enquiries receive an individual response from an academic advisor within 24 business hours. We never share your contact details with external commercial vendors.
              </p>
            </div>
          </div>

          {/* Form Column */}
          <div className="lg:col-span-7 rounded-xl border border-[#DCE4EE] bg-white p-6 sm:p-10 shadow-sm space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-[#142541]">Send an Enquiry</h2>
              <p className="text-xs text-[#5F6F84] mt-1">
                Fill in the details below and an admissions counselor will reach out.
              </p>
            </div>

            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
