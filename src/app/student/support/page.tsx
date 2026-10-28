import React from "react";
import {
  HelpCircle,
  MessageSquare,
  Mail,
  Send,
} from "lucide-react";
import { requireRole } from "@/server/services/authService";
import { getStudentByProfileId } from "@/server/services/studentService";
import { submitStudentQueryAction } from "@/server/actions/student";

export const metadata = {
  title: "Student Support & Help Desk — Syntaxora",
  description: "Academic assistance, platform FAQs, and direct inquiry submission to faculty and operations.",
};

const FAQS = [
  {
    q: "How do I enter my scheduled live laboratory classes?",
    a: "Live classes unlock 15 minutes before the scheduled start time in the Live Classes tab. Click 'Enter Classroom' to launch the interactive virtual lab room.",
  },
  {
    q: "How do I submit code solutions for assignments and labs?",
    a: "Open the Assignments & Labs tab, locate your pending deliverable, and click 'Submit Deliverable'. You can paste your Python solution code directly or provide your GitHub repository link.",
  },
  {
    q: "Why isn't my grade showing immediately after submitting?",
    a: "Syntaxora uses pedagogical code reviews. All deliverables are manually reviewed and benchmarked by academy faculty before official grades and feedback are verified and published.",
  },
  {
    q: "How can my parent or guardian connect to my academic record?",
    a: "Provide your parent with your unique Student Code (found on your dashboard and Profile tab). They can enter it in their Parent Portal under '+ Link Sibling or Student'.",
  },
  {
    q: "What should I do if I cannot attend a scheduled class session?",
    a: "Navigate to the Attendance Log tab and click 'Submit Absence Notice'. Select your leave date and provide a brief academic or personal reason so your instructor is notified in advance.",
  },
];

export default async function StudentSupportPage() {
  const auth = await requireRole(["student", "admin"]);
  const student = await getStudentByProfileId(auth.userId);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#142541]/5 text-[#3869AD] text-xs font-bold mb-2">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Academic Help Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142541] tracking-tight">
            Student Support & Faculty Assistance
          </h1>
          <p className="text-xs sm:text-sm text-[#5F6F84] mt-1 max-w-2xl">
            Find immediate answers to common curriculum questions or submit an inquiry to our faculty and operations team.
          </p>
        </div>
      </div>

      {/* 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Submit Query Form */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#DCE4EE] bg-white p-6 shadow-sm space-y-5">
            <div className="space-y-1 pb-3 border-b border-[#DCE4EE]">
              <h2 className="text-base font-bold text-[#142541] flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-[#3869AD]" />
                <span>Submit Query to Faculty or Operations</span>
              </h2>
              <p className="text-xs text-[#5F6F84]">
                Inquiries are automatically linked to your student code:{" "}
                <strong className="font-mono text-[#3869AD]">{student?.student_code}</strong>
              </p>
            </div>

            <form
              action={async (formData: FormData): Promise<void> => {
                "use server";
                await submitStudentQueryAction(formData);
              }}
              className="space-y-4 text-xs"
            >
              <div className="space-y-1.5">
                <label className="font-bold text-[#142541]" htmlFor="category">
                  Inquiry Category
                </label>
                <select
                  id="category"
                  name="category"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE4EE] bg-white text-[#142541] text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-[#3869AD]"
                  defaultValue="academic"
                >
                  <option value="academic">Academic & Curriculum Inquiry</option>
                  <option value="lab_technical">Lab Hardware & Python Environment Issue</option>
                  <option value="timetable">Live Class Timetable & Schedule Conflict</option>
                  <option value="billing">Tuition Fee & Invoice Question</option>
                  <option value="other">General Operational Assistance</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[#142541]" htmlFor="subject">
                  Subject Line
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  required
                  placeholder="e.g. Question regarding Module 2 OpenCV contour smoothing"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE4EE] bg-white text-[#142541] text-xs placeholder:text-[#5F6F84]/60 focus:outline-hidden focus:ring-2 focus:ring-[#3869AD]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[#142541]" htmlFor="message">
                  Detailed Description
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  placeholder="Describe your question or technical blocker in detail. Include relevant error messages or assignment titles..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE4EE] bg-white text-[#142541] text-xs placeholder:text-[#5F6F84]/60 focus:outline-hidden focus:ring-2 focus:ring-[#3869AD] resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full px-5 py-3 rounded-xl bg-[#142541] hover:bg-[#1E375F] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5 text-cyan-300" />
                  <span>Send Inquiry to Academic Desk</span>
                </button>
              </div>
            </form>
          </div>

          {/* Direct Contact Card */}
          <div className="rounded-2xl border border-[#DCE4EE] bg-[#F8FAFC] p-5 space-y-3">
            <div className="text-xs font-bold text-[#142541] flex items-center gap-2">
              <Mail className="h-4 w-4 text-[#3869AD]" />
              <span>Direct Academy Contact Channels</span>
            </div>
            <div className="space-y-2 text-xs text-[#5F6F84]">
              <div className="flex items-center justify-between">
                <span>Admissions & Support:</span>
                <span className="font-semibold text-[#142541]">admissions@syntaxora.com</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Desk Hours:</span>
                <span className="font-semibold text-[#142541]">Mon–Fri • 9:00 AM – 7:00 PM IST</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Response SLA:</span>
                <span className="font-semibold text-emerald-700">Within 24 Business Hours</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Platform FAQs */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#DCE4EE] bg-white p-6 shadow-sm space-y-4">
            <div className="space-y-1 pb-3 border-b border-[#DCE4EE]">
              <h2 className="text-base font-bold text-[#142541] flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-[#3869AD]" />
                <span>Frequently Asked Questions</span>
              </h2>
              <p className="text-xs text-[#5F6F84]">
                Instant answers regarding classrooms, deliverables, and transcripts
              </p>
            </div>

            <div className="space-y-3">
              {FAQS.map((faq, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-[#DCE4EE] bg-[#F8FAFC]/60 p-4 space-y-1.5"
                >
                  <div className="font-bold text-xs text-[#142541] flex items-start gap-2">
                    <span className="h-4 w-4 rounded-full bg-blue-100 text-[#3869AD] flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      Q
                    </span>
                    <span>{faq.q}</span>
                  </div>
                  <p className="text-xs text-[#5F6F84] leading-relaxed pl-6">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
