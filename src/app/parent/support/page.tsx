import React from "react";
import {
  HelpCircle,
  MessageSquare,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Clock,
  Send,
  AlertCircle,
  Mail,
  Phone,
} from "lucide-react";
import { requireRole } from "@/server/services/authService";
import {
  getActiveChildrenForGuardian,
  getGuardianInquiries,
} from "@/server/services/guardianService";
import { ParentChildSelector } from "@/components/forms/ParentChildSelector";
import { LinkStudentModal } from "@/components/forms/LinkStudentModal";
import { ParentSupportInquiryForm } from "@/components/forms/ParentSupportInquiryForm";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Guardian Support & Inquiries — Syntaxora",
  description: "Submit attendance review requests, leave notices, and student linking support tickets to academy administrators.",
};

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ParentSupportPage({ searchParams }: Props) {
  const auth = await requireRole(["parent", "admin"]);
  const [relationships, recentInquiries] = await Promise.all([
    getActiveChildrenForGuardian(auth.userId),
    getGuardianInquiries(auth.email),
  ]);

  const resolvedParams = await searchParams;
  const requestedChildId = typeof resolvedParams.childId === "string" ? resolvedParams.childId : undefined;
  const activeRel =
    relationships.find((r) => r.student_id === requestedChildId) ||
    relationships[0];

  const studentName = activeRel?.student?.profile?.full_name || "Linked Student";
  const studentCode = activeRel?.student?.student_code || "";

  return (
    <div className="space-y-8">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#5F6F84] mb-1">
            <span>Parent Portal</span>
            <span>/</span>
            <span className="font-semibold text-[#142541]">Support & Help Desk</span>
          </div>
          <h1 className="text-2xl font-black text-[#142541] tracking-tight">
            Guardian Support Desk
          </h1>
          <p className="text-xs text-[#5F6F84] mt-0.5">
            Submit attendance correction reviews, student linking inquiries, or academic coordination requests.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeRel && (
            <ParentChildSelector
              relationships={relationships}
              selectedChildId={activeRel.student_id}
            />
          )}
          <LinkStudentModal
            buttonText="+ Link Sibling"
            variant="outline"
            size="sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Support Ticket Submission Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-[#DCE4EE] bg-white p-6 sm:p-8 shadow-xs space-y-6">
            <div className="space-y-1 pb-4 border-b border-[#F0F4F8]">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-[#E8EFF8] text-[#3869AD]">
                  <MessageSquare className="h-4 w-4" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#3869AD]">
                  New Support Request
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-[#142541]">
                Submit an Official Request
              </h2>
              <p className="text-xs text-[#5F6F84]">
                Your inquiry is recorded in academy audit logs and dispatched to student operations advisors.
              </p>
            </div>

            <ParentSupportInquiryForm
              activeStudentId={activeRel?.student_id}
              activeStudentCode={studentCode}
              activeStudentName={studentName}
            />
          </div>

          {/* Previous Inquiries / Tickets Table */}
          {recentInquiries.length > 0 && (
            <div className="rounded-3xl border border-[#DCE4EE] bg-white p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-[#142541]">
                Recent Inquiries on File ({recentInquiries.length})
              </h3>
              <div className="divide-y divide-[#F0F4F8]">
                {recentInquiries.map((inq) => (
                  <div key={inq.id} className="py-3.5 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <strong className="text-[#142541] font-semibold">{inq.subject}</strong>
                      <Badge variant={inq.status === "unread" ? "warning" : "teal"}>
                        {inq.status?.toUpperCase() || "PENDING"}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-[#5F6F84] line-clamp-2 leading-relaxed">
                      {inq.message}
                    </p>
                    <span className="text-[10px] text-[#93A5C2] block">
                      Submitted: {inq.created_at ? new Date(inq.created_at).toLocaleDateString() : "Recent"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Support Help & Direct Contact Sidebar */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-[#DCE4EE] bg-white p-6 shadow-xs space-y-4 text-xs">
            <h3 className="text-sm font-bold text-[#142541] flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-[#3869AD]" />
              Support Guidelines
            </h3>

            <div className="space-y-3 text-[#5F6F84]">
              <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#DCE4EE] space-y-1">
                <strong className="text-[#142541] block">Attendance Reviews</strong>
                <p className="leading-relaxed text-[11px]">
                  Submit review requests within 48 hours of session completion with the date and reason for leave reconciliation.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#DCE4EE] space-y-1">
                <strong className="text-[#142541] block">Student Linking Help</strong>
                <p className="leading-relaxed text-[11px]">
                  If your student code has not been approved after 24 hours, select <strong>Student Linking Assistance</strong>.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#DCE4EE] space-y-1">
                <strong className="text-[#142541] block">Privacy Notice</strong>
                <p className="leading-relaxed text-[11px]">
                  All communications remain confidential between authorized guardians and academy operations.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-[#DCE4EE] bg-white p-6 shadow-xs space-y-3 text-xs">
            <h4 className="font-bold text-sm text-[#142541]">Direct Operations Contacts</h4>
            <div className="space-y-2 text-[#5F6F84]">
              <div className="flex items-center gap-2 text-[11px]">
                <Mail className="h-3.5 w-3.5 text-[#3869AD]" />
                <span>support@syntaxora.com</span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <Mail className="h-3.5 w-3.5 text-[#168B83]" />
                <span>admissions@syntaxora.com</span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <Clock className="h-3.5 w-3.5 text-[#5F6F84]" />
                <span>Mon – Sat, 9:00 AM – 7:00 PM IST</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

