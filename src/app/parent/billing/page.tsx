import React from "react";
import {
  Lock,
  CheckCircle2,
  CreditCard,
  Download,
  Receipt,
  ShieldCheck,
  Building,
  HelpCircle,
  FileCheck,
  AlertCircle,
} from "lucide-react";
import { requireRole } from "@/server/services/authService";
import {
  getActiveChildrenForGuardian,
  getStudentInvoices,
} from "@/server/services/guardianService";
import { getStudentEnrollments } from "@/server/services/studentService";
import { ParentChildSelector } from "@/components/forms/ParentChildSelector";
import { ParentPaymentModal } from "@/components/forms/ParentPaymentModal";
import { LinkStudentModal } from "@/components/forms/LinkStudentModal";
import { PrintButton, PrintReceiptLink } from "@/components/ui/PrintButton";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Tuition Fees & Invoices — Syntaxora Guardian",
  description: "Official tuition invoices, fee statements, and payment status for your student.",
};

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ParentBillingPage({ searchParams }: Props) {
  const auth = await requireRole(["parent", "admin"]);
  const relationships = await getActiveChildrenForGuardian(auth.userId);

  const resolvedParams = await searchParams;
  const requestedChildId = typeof resolvedParams.childId === "string" ? resolvedParams.childId : undefined;
  const activeRel =
    relationships.find((r) => r.student_id === requestedChildId) ||
    relationships[0];

  if (!activeRel) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4 bg-white rounded-3xl border border-[#DCE4EE] p-8 shadow-xs">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-[#E8EFF8] text-[#168B83] flex items-center justify-center">
          <CreditCard className="h-7 w-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-[#142541]">No Active Student Connected</h2>
          <p className="text-xs text-[#5F6F84] max-w-sm mx-auto leading-relaxed">
            Link your child using their unique student code to access academic invoices, fee installment schedules, and authorized payment options.
          </p>
        </div>
        <div className="pt-2 flex justify-center">
          <LinkStudentModal buttonText="Link Your Child Now" variant="primary" size="md" />
        </div>
      </div>
    );
  }

  const studentName = activeRel.student?.profile?.full_name || "Linked Student";
  const studentCode = activeRel.student?.student_code || "STU-CODE";

  if (!activeRel.can_view_fees) {
    return (
      <div className="space-y-6">
        <ParentChildSelector relationships={relationships} selectedChildId={activeRel.student_id} />
        <div className="rounded-3xl border border-amber-200 bg-amber-50/50 p-12 text-center space-y-4">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <Lock className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-amber-900">Financial Records Restricted</h3>
            <p className="text-xs text-amber-700 max-w-md mx-auto leading-relaxed">
              Your verified guardian link for <strong>{studentName}</strong> does not currently include billing and tuition viewing authorization.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const [invoices, enrollments] = await Promise.all([
    getStudentInvoices(activeRel.student_id, auth.userId),
    getStudentEnrollments(activeRel.student_id),
  ]);

  const courseTitle = enrollments[0]?.course?.title || "Applied AI Program";
  const hasPendingInvoices = invoices.some((i) => i.status === "pending");

  return (
    <div className="space-y-8">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#5F6F84] mb-1">
            <span>Parent Portal</span>
            <span>/</span>
            <span className="font-semibold text-[#142541]">Tuition & Fee Records</span>
          </div>
          <h1 className="text-2xl font-black text-[#142541] tracking-tight">
            Tuition Statements: {studentName}
          </h1>
          <p className="text-xs text-[#5F6F84] mt-0.5">
            Student Code: <strong className="font-mono text-[#3869AD]">{studentCode}</strong> • Official tax receipts, invoices, and payment tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ParentChildSelector
            relationships={relationships}
            selectedChildId={activeRel.student_id}
          />
          <LinkStudentModal
            buttonText="+ Link Sibling"
            variant="outline"
            size="sm"
          />
          <PrintButton
            label="Print Statement"
            icon="printer"
            variant="outline"
            size="sm"
          />
          <ParentPaymentModal
            studentName={studentName}
            studentCode={studentCode}
            studentId={activeRel.student_id}
            courseId={enrollments[0]?.course?.id}
            courseTitle={courseTitle}
            buttonText="Pay Tuition Fee"
            variant="primary"
            size="sm"
          />
        </div>
      </div>

      {/* Tuition Standing Banner */}
      <div className="rounded-3xl border border-[#DCE4EE] bg-white p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F0F4F8]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-emerald-50 text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                Academic Account Standing
              </span>
            </div>
            <h3 className="text-lg font-black text-[#142541]">
              {hasPendingInvoices ? "Tuition Payment Awaiting Action" : "Account in Good Standing — Tuition Verified"}
            </h3>
            <p className="text-xs text-[#5F6F84]">
              Enrolled Program: <strong className="text-[#142541]">{courseTitle}</strong>
            </p>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-[#5F6F84] block">Official Status</span>
            <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block mt-0.5">
              {hasPendingInvoices ? "Pending Invoice" : "Enrolled & Cleared"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#5F6F84]">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#93A5C2] block">Invoices on Record</span>
            <strong className="text-sm font-bold text-[#142541]">{invoices.length} Statements</strong>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#93A5C2] block">Admission Category</span>
            <strong className="text-sm font-bold text-[#142541]">Direct Academy Enrollment</strong>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#93A5C2] block">Payment Gateway</span>
            <strong className="text-sm font-bold text-[#142541]">Secured UPI / Card / NEFT</strong>
          </div>
        </div>
      </div>

      {/* Official Invoices Table */}
      <div className="rounded-3xl border border-[#DCE4EE] bg-white overflow-hidden shadow-xs">
        <div className="p-5 border-b border-[#DCE4EE] bg-[#F8FAFC] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#142541]">
              Official Academic Invoices ({invoices.length})
            </h3>
            <p className="text-xs text-[#5F6F84]">
              Reconciled invoices and tax receipts for tuition and compute resources.
            </p>
          </div>
          <span className="text-[11px] text-[#5F6F84] font-medium bg-white px-2.5 py-1 rounded-lg border border-[#DCE4EE]">
            Tax Deductible (Sec 80E)
          </span>
        </div>

        {invoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#DCE4EE] text-[#5F6F84] font-semibold uppercase tracking-wider text-[11px] bg-[#F8FAFC]">
                <tr>
                  <th className="p-4">Invoice No.</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F4F8] text-[#142541]">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="p-4 font-mono font-bold text-[#3869AD]">{inv.number}</td>
                    <td className="p-4 font-medium">{inv.description}</td>
                    <td className="p-4 text-[#5F6F84]">
                      {inv.paidAt ? new Date(inv.paidAt).toLocaleDateString() : "Recent"}
                    </td>
                    <td className="p-4 font-bold text-[#142541]">{inv.amountFormatted}</td>
                    <td className="p-4">
                      <Badge variant={inv.status === "paid" ? "success" : "warning"}>
                        {inv.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <PrintReceiptLink label="Print PDF" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center space-y-3">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-[#E8EFF8] text-[#168B83] flex items-center justify-center">
              <Receipt className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-[#142541]">No Invoices or Pending Balances</h4>
              <p className="text-xs text-[#5F6F84] max-w-sm mx-auto leading-relaxed">
                There are no outstanding invoices for this student. Official statements appear here upon enrollment confirmation or installment generation.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Official Academy Bank Details for Direct Transfers */}
      <div className="rounded-3xl border border-[#DCE4EE] bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#F0F4F8]">
          <Building className="h-4 w-4 text-[#3869AD]" />
          <h3 className="text-sm font-bold text-[#142541]">
            Direct Bank Transfer & Wire Remittance Details
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-[#5F6F84]">
          <div>
            <span className="text-[10px] font-semibold uppercase text-[#93A5C2] block">Beneficiary</span>
            <strong className="text-[#142541]">Syntaxora AI Academy Ltd.</strong>
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase text-[#93A5C2] block">Bank Name</span>
            <strong className="text-[#142541]">HDFC Bank</strong>
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase text-[#93A5C2] block">Account Number</span>
            <strong className="font-mono text-[#142541]">50200088921441</strong>
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase text-[#93A5C2] block">IFSC / Routing</span>
            <strong className="font-mono text-[#142541]">HDFC0000123</strong>
          </div>
        </div>

        <p className="text-[11px] text-[#5F6F84] pt-2 border-t border-[#F0F4F8]">
          * When initiating wire transfers or NEFT remittances, include student code <strong className="font-mono text-[#3869AD]">{studentCode}</strong> in transfer remarks and email receipt to <strong className="text-[#142541]">billing@syntaxora.com</strong>.
        </p>
      </div>

      {/* Security & Financial Notice */}
      <div className="rounded-2xl border border-[#DCE4EE] bg-[#F8FAFC] p-4 text-xs text-[#5F6F84] flex items-start gap-3">
        <HelpCircle className="h-5 w-5 text-[#3869AD] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-[#142541] block">Financial Privacy & Compliance Policy</strong>
          <p className="leading-relaxed">
            Syntaxora never stores raw payment card numbers, CVVs, or bank login credentials on our servers. Transactions are processed through PCI-DSS Level 1 compliant processors. Fee records are accessible only to guardians explicitly granted financial permissions.
          </p>
        </div>
      </div>
    </div>
  );
}
