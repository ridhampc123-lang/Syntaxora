import React from "react";
import { Lock, CheckCircle2 } from "lucide-react";
import { requireRole } from "@/server/services/authService";
import { getActiveChildrenForGuardian } from "@/server/services/guardianService";
import { ParentChildSelector } from "@/components/forms/ParentChildSelector";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Tuition & Invoices — Syntaxora Guardian",
  description: "Official tuition invoices, fee statements, and payment status.",
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
      <div className="p-8 text-center text-xs text-[#5F6F84]">
        No active verified student links found.
      </div>
    );
  }

  const studentName = activeRel.student?.profile?.full_name || "Linked Student";

  if (!activeRel.can_view_fees) {
    return (
      <div className="space-y-6">
        <ParentChildSelector relationships={relationships} selectedChildId={activeRel.student_id} />
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-8 text-center space-y-3">
          <div className="mx-auto h-12 w-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
            <Lock className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-amber-900">Financial Records Access Restricted</h3>
          <p className="text-xs text-amber-700 max-w-md mx-auto">
            Your verified guardian link for {studentName} does not currently include billing and tuition viewing authorization.
          </p>
        </div>
      </div>
    );
  }

  const sampleInvoices = [
    {
      id: "inv-2026-081",
      number: "SYN-INV-2026-081",
      description: "Applied AI & Python Robotics for Teens — Fall 2026 Term",
      amountFormatted: "$299.00",
      status: "paid",
      paidAt: "2026-09-01T12:00:00Z",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Title & Child Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#142541] tracking-tight">
            Tuition & Billing: {studentName}
          </h2>
          <p className="text-xs text-[#5F6F84] mt-0.5">
            Verified academic invoices and receipts for enrolled cohorts.
          </p>
        </div>
        <ParentChildSelector
          relationships={relationships}
          selectedChildId={activeRel.student_id}
        />
      </div>

      <div className="rounded-xl border border-[#DCE4EE] bg-white overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#DCE4EE] bg-[#F3F6FA] text-xs font-semibold text-[#142541]">
          Academic Invoices & Statements
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#DCE4EE] text-[#142541] font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">Invoice #</th>
                <th className="p-3.5">Curriculum Program</th>
                <th className="p-3.5">Date Paid</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE4EE] text-[#263449]">
              {sampleInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-[#F3F6FA]/50 transition-colors">
                  <td className="p-3.5 font-mono text-[#3869AD] font-semibold">
                    {inv.number}
                  </td>
                  <td className="p-3.5 font-medium text-[#142541]">
                    {inv.description}
                  </td>
                  <td className="p-3.5 text-[#5F6F84] whitespace-nowrap">
                    {new Date(inv.paidAt).toLocaleDateString()}
                  </td>
                  <td className="p-3.5 font-bold text-[#142541]">
                    {inv.amountFormatted}
                  </td>
                  <td className="p-3.5">
                    <Badge variant="success">Paid in Full</Badge>
                  </td>
                  <td className="p-3.5 text-right whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Verified
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
