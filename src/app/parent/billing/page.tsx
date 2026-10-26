import React from "react";
import {
  Lock,
  CheckCircle2,
  CreditCard,
  Download,
  Receipt,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  FileCheck,
  Building,
} from "lucide-react";
import { requireRole } from "@/server/services/authService";
import { getActiveChildrenForGuardian } from "@/server/services/guardianService";
import { ParentChildSelector } from "@/components/forms/ParentChildSelector";
import { ParentPaymentModal } from "@/components/forms/ParentPaymentModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
      <div className="p-12 text-center text-xs text-[#5F6F84] bg-white rounded-2xl border border-[#DCE4EE]">
        No active verified student links found.
      </div>
    );
  }

  const studentName = activeRel.student?.profile?.full_name || "Linked Student";
  const studentCode = activeRel.student?.student_code || "STU-CODE";
  const courseTitle = "Applied AI & Python Robotics for Teens (Ages 15–18)";

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

  const invoices = [
    {
      id: "inv-2026-081",
      number: "SYN-INV-2026-081",
      description: "Applied AI & Python Robotics for Teens — Fall 2026 Full Term",
      amountFormatted: "₹14,999.00",
      amountNumber: 14999,
      status: "paid",
      paymentMethod: "UPI (Verified Autopay)",
      paidAt: "2026-09-01T12:00:00Z",
    },
    {
      id: "inv-2026-082",
      number: "SYN-INV-2026-082",
      description: "NVIDIA Edge Compute & Jetson Hardware Cloud Lab Credits",
      amountFormatted: "₹2,499.00",
      amountNumber: 2499,
      status: "paid",
      paymentMethod: "Corporate NetBanking",
      paidAt: "2026-09-15T09:30:00Z",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Title & Child Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#5F6F84] mb-1">
            <span>Parent Portal</span>
            <span>/</span>
            <span className="font-semibold text-[#142541]">Tuition & Fee Statements</span>
          </div>
          <h1 className="text-2xl font-black text-[#142541] tracking-tight">
            Tuition & Billing: {studentName}
          </h1>
          <p className="text-xs text-[#5F6F84] mt-0.5">
            Student Code: <strong className="font-mono text-[#3869AD]">{studentCode}</strong> • Institutional tax invoices and verified receipts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ParentChildSelector
            relationships={relationships}
            selectedChildId={activeRel.student_id}
          />
          <ParentPaymentModal
            studentName={studentName}
            studentCode={studentCode}
            courseTitle={courseTitle}
            dueAmount={14999}
            buttonText="Pay Tuition Fee"
            variant="primary"
            size="sm"
          />
        </div>
      </div>

      {/* Tuition Financial Account Summary Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#10233D] via-[#142541] to-[#0A1628] text-white shadow-xl border border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Tuition Account Status: Active & In Good Standing
            </span>
          </div>
          <h2 className="text-2xl font-black text-white">
            Fall 2026 Academic Term — Fully Cleared
          </h2>
          <p className="text-xs text-[#93A5C2] max-w-xl leading-relaxed">
            Tuition covers interactive faculty lectures, hardware computing compute credits, hands-on robotics simulations, and certified course completion credentialing.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#A6B7D4] pt-2 border-t border-white/10">
            <div>Total Paid: <strong className="text-white font-bold">₹17,498.00</strong></div>
            <div>•</div>
            <div>Current Outstanding: <strong className="text-emerald-400 font-bold">₹0.00</strong></div>
            <div>•</div>
            <div>Next Term Enrollment: <strong className="text-white">Spring 2027</strong></div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
          <ParentPaymentModal
            studentName={studentName}
            studentCode={studentCode}
            courseTitle={courseTitle}
            buttonText="Pay Tuition Fee / Next Term"
            variant="primary"
            size="md"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              if (typeof window !== "undefined") window.print();
            }}
            className="w-full text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border-white/20 justify-center"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Download Full Statement
          </Button>
        </div>
      </div>

      {/* Tuition Inclusions Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
        <div className="p-4 rounded-2xl bg-white border border-[#DCE4EE] shadow-xs space-y-1.5">
          <span className="text-[10px] font-bold uppercase text-[#5F6F84]">Live AI Instruction</span>
          <div className="font-bold text-[#142541] text-sm">60+ Hours Live Labs</div>
          <p className="text-[11px] text-[#5F6F84]">Small cohort (1:12 max ratio) with interactive breakout rooms.</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#DCE4EE] shadow-xs space-y-1.5">
          <span className="text-[10px] font-bold uppercase text-[#5F6F84]">Cloud GPU Compute</span>
          <div className="font-bold text-[#142541] text-sm">NVIDIA Cloud Sandbox</div>
          <p className="text-[11px] text-[#5F6F84]">Zero local hardware setup; models train directly on cloud cluster.</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#DCE4EE] shadow-xs space-y-1.5">
          <span className="text-[10px] font-bold uppercase text-[#5F6F84]">1-on-1 Mentorship</span>
          <div className="font-bold text-[#142541] text-sm">Weekly Faculty Office Hours</div>
          <p className="text-[11px] text-[#5F6F84]">Private review of student code repositories and research papers.</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#DCE4EE] shadow-xs space-y-1.5">
          <span className="text-[10px] font-bold uppercase text-[#5F6F84]">Official Certification</span>
          <div className="font-bold text-[#142541] text-sm">Verified Credentials</div>
          <p className="text-[11px] text-[#5F6F84]">Cryptographically verifiable blockchain certificates for college apps.</p>
        </div>
      </div>

      {/* Invoices & Statements Table */}
      <div className="rounded-3xl border border-[#DCE4EE] bg-white overflow-hidden shadow-sm">
        <div className="p-5 border-b border-[#DCE4EE] bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#E2F4F2] text-[#168B83]">
              <Receipt className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#142541]">
                Official Academic Invoices & Receipts
              </h3>
              <p className="text-[11px] text-[#5F6F84]">
                All receipts contain formal institutional GST numbers and qualify for educational tax benefits.
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#DCE4EE] bg-[#F8FAFC] text-[#142541] font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-4">Invoice #</th>
                <th className="p-4">Curriculum Program</th>
                <th className="p-4">Date Paid</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Payment Method</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE4EE] text-[#263449]">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-[#F3F6FA]/50 transition-colors">
                  <td className="p-4 font-mono text-[#3869AD] font-bold">
                    {inv.number}
                  </td>
                  <td className="p-4 font-semibold text-[#142541]">
                    {inv.description}
                  </td>
                  <td className="p-4 text-[#5F6F84] whitespace-nowrap">
                    {new Date(inv.paidAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="p-4 font-bold text-[#142541]">
                    {inv.amountFormatted}
                  </td>
                  <td className="p-4 text-[#5F6F84] text-[11px]">
                    {inv.paymentMethod}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/80 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      Paid in Full
                    </span>
                  </td>
                  <td className="p-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof window !== "undefined") window.print();
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#3869AD] hover:underline cursor-pointer"
                    >
                      <Download className="h-3 w-3" />
                      PDF Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Support Notice */}
        <div className="p-4 bg-[#F8FAFC] border-t border-[#DCE4EE] flex items-center justify-between text-[11px] text-[#5F6F84] flex-wrap gap-2">
          <span>
            Institutional GSTIN: <strong>29AAECS1234F1Z5</strong> • Syntaxora Technologies Academic Division
          </span>
          <span className="text-[#3869AD] font-semibold">
            Questions regarding billing? Contact accounts@syntaxora.com
          </span>
        </div>
      </div>
    </div>
  );
}
