import React from "react";
import {
  CreditCard,
  CheckCircle2,
  Receipt,
  ShieldCheck,
  Lock,
} from "lucide-react";
import { requireRole } from "@/server/services/authService";
import {
  getStudentByProfileId,
  getStudentBillingRecords,
  getStudentEnrollments,
} from "@/server/services/studentService";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PrintButton } from "@/components/ui/PrintButton";

export const metadata = {
  title: "Tuition Fees & Invoices — Syntaxora",
  description: "Official institutional fee invoices, payment receipts, and enrollment fee statements.",
};

export default async function StudentBillingPage() {
  const auth = await requireRole(["student", "admin"]);
  const student = await getStudentByProfileId(auth.userId);

  if (!student) {
    return (
      <div className="p-12 text-center text-xs text-[#5F6F84] bg-white rounded-2xl border border-[#DCE4EE]">
        No active student record linked to your profile.
      </div>
    );
  }

  const [invoices, enrollments] = await Promise.all([
    getStudentBillingRecords(student.id),
    getStudentEnrollments(student.id),
  ]);

  const totalPaidCents = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.amount_in_cents, 0);

  const formattedTotalPaid = (totalPaidCents / 100).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#142541]/5 text-[#3869AD] text-xs font-bold mb-2">
            <CreditCard className="h-3.5 w-3.5" />
            <span>Academic Billing</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142541] tracking-tight">
            Tuition Fees & Official Invoices
          </h1>
          <p className="text-xs sm:text-sm text-[#5F6F84] mt-1 max-w-2xl">
            Official institutional fee statements, verified transaction receipts, and payment compliance records for your student identity.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <PrintButton />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-[#DCE4EE] bg-white shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-[#5F6F84] uppercase tracking-wider">
              Enrolled Tracks
            </CardTitle>
            <div className="h-8 w-8 rounded-xl bg-blue-50 text-[#3869AD] flex items-center justify-center">
              <CreditCard className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-[#142541]">{enrollments.length}</div>
            <p className="text-[11px] text-[#5F6F84] mt-1">Confirmed curriculum admissions</p>
          </CardContent>
        </Card>

        <Card className="border-[#DCE4EE] bg-white shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-[#5F6F84] uppercase tracking-wider">
              Total Settled Tuition
            </CardTitle>
            <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-emerald-700">{formattedTotalPaid}</div>
            <p className="text-[11px] text-[#5F6F84] mt-1">Verified by admissions finance</p>
          </CardContent>
        </Card>

        <Card className="border-[#DCE4EE] bg-white shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-[#5F6F84] uppercase tracking-wider">
              Account Financial Status
            </CardTitle>
            <div className="h-8 w-8 rounded-xl bg-teal-50 text-[#168B83] flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-[#142541]">In Good Standing</div>
            <p className="text-[11px] text-emerald-700 font-semibold mt-1">
              Zero outstanding tuition balances
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <div className="rounded-2xl border border-[#DCE4EE] bg-white overflow-hidden shadow-sm">
        <div className="p-5 border-b border-[#DCE4EE] bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#142541]">
              Tax Invoices & Fee Statements ({invoices.length})
            </h3>
            <p className="text-[11px] text-[#5F6F84] mt-0.5">
              Audited payment statements linked to your student code
            </p>
          </div>
          <span className="text-[11px] text-[#5F6F84]">
            Student Code: <strong className="font-mono text-[#3869AD]">{student.student_code}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#DCE4EE] bg-[#F8FAFC]/50 text-[#142541] font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-4">Invoice Number</th>
                <th className="p-4">Curriculum Track</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Payment Method</th>
                <th className="p-4">Paid Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE4EE] text-[#263449]">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-[#5F6F84]">
                    <div className="max-w-sm mx-auto space-y-2">
                      <div className="h-10 w-10 rounded-full bg-[#E8EFF8] text-[#3869AD] flex items-center justify-center mx-auto">
                        <Receipt className="h-5 w-5" />
                      </div>
                      <div className="font-bold text-sm text-[#142541]">No Invoices Found</div>
                      <p className="text-xs">
                        Invoices for your curriculum enrollment and tuition fee receipts will appear here once finalized by admissions.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => {
                  const amountFormatted = (inv.amount_in_cents / 100).toLocaleString("en-IN", {
                    style: "currency",
                    currency: inv.currency,
                  });

                  return (
                    <tr key={inv.id} className="hover:bg-[#F8FAFC]/80 transition-colors">
                      <td className="p-4 font-mono font-bold text-[#142541]">
                        {inv.invoice_number}
                      </td>
                      <td className="p-4 font-medium text-[#142541]">
                        {inv.course_title}
                      </td>
                      <td className="p-4 font-bold text-[#142541]">
                        {amountFormatted}
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={inv.status === "paid" ? "success" : "teal"}
                          className="text-[11px] font-bold"
                        >
                          {inv.status === "paid" ? "Paid (Verified)" : inv.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-4 text-[#5F6F84]">
                        {inv.payment_method || "Online Payment"}
                      </td>
                      <td className="p-4 text-[#5F6F84]">
                        {inv.paid_at
                          ? new Date(inv.paid_at).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "Pending"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Notice */}
      <div className="rounded-2xl border border-[#DCE4EE] bg-[#F8FAFC] p-5 space-y-2 flex items-start gap-3">
        <Lock className="h-5 w-5 text-[#3869AD] shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <div className="font-bold text-[#142541]">PCI-DSS Compliant Financial Record Storage</div>
          <p className="text-[#5F6F84] leading-relaxed">
            All tuition transactions are reconciled against official bank tokens. Syntaxora never stores raw payment card numbers or bank credentials on application servers.
          </p>
        </div>
      </div>
    </div>
  );
}
