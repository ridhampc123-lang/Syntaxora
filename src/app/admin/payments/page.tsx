import React from "react";
import Link from "next/link";
import {
  CreditCard,
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldCheck,
  Receipt,
  FileCheck,
} from "lucide-react";
import { getAdminPayments } from "@/server/services/adminService";
import { isPaymentConfigured } from "@/server/integrations/payments/paymentAdapter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { verifyManualPaymentAction } from "@/server/actions/admin";

export const metadata = {
  title: "Tuition, Payments & Financial Records — Syntaxora Admin",
  description: "Official tuition transactions, payment orders, invoices, and reconciliation audits.",
};

interface PaymentsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminPaymentsPage({ searchParams }: PaymentsPageProps) {
  const resolved = await searchParams;
  const statusFilter = typeof resolved.status === "string" ? resolved.status : undefined;

  const [paymentData, isConfigured] = await Promise.all([
    getAdminPayments(statusFilter),
    Promise.resolve(isPaymentConfigured()),
  ]);

  const { payments, totalCollectedCents, pendingCount } = paymentData;

  const paidCount = payments.filter((p) => p.status === "paid").length;
  const failedCount = payments.filter((p) => p.status === "failed").length;

  return (
    <div className="space-y-8">
      {/* Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#5F6F84] mb-1">
            <Link href="/admin" className="hover:text-[#3869AD] flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" />
              <span>Admin Overview</span>
            </Link>
            <span>/</span>
            <span className="font-semibold text-[#142541]">Payments & Invoices</span>
          </div>

          <h2 className="text-2xl font-black text-[#142541] tracking-tight">
            Academy Tuition & Payment Records
          </h2>
          <p className="text-xs text-[#5F6F84] mt-0.5">
            Authoritative financial orders, course tuition reconciliations, and payment audit records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/enrollments">
            <Button variant="outline" size="sm">
              Enrollment Seats &rarr;
            </Button>
          </Link>
        </div>
      </div>

      {/* Payment Gateway Status Transparency Notice */}
      {!isConfigured ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 shadow-xs space-y-1 text-xs text-amber-900">
          <div className="flex items-center gap-2 font-bold">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span>Payment Provider Notice: Development Reconciliation Mode</span>
          </div>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            Live gateway credentials (STRIPE_SECRET_KEY / RAZORPAY_KEY_SECRET) are unconfigured in environment variables. Live public checkout displays an honest &ldquo;Payments not configured&rdquo; state per Section 12 of the academy specification. Manual payment verifications and administrative reconciliation records are fully recorded and audited in PostgreSQL.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 shadow-xs space-y-1 text-xs text-emerald-900">
          <div className="flex items-center gap-2 font-bold">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Payment Provider Active</span>
          </div>
          <p className="text-[11px] text-emerald-800">
            Payment gateway keys detected in environment. Live webhook signatures are cryptographically verified via HMAC-SHA256.
          </p>
        </div>
      )}

      {/* 4 Financial Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-[#DCE4EE] bg-white space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-[#5F6F84] uppercase">
            <span>Verified Inflow</span>
            <span className="text-xs font-bold text-[#168B83]">INR (₹)</span>
          </div>
          <div className="text-2xl font-black text-[#142541]">
            {formatCurrency(totalCollectedCents, "INR")}
          </div>
          <div className="text-[11px] text-[#5F6F84]">Collected academy tuition</div>
        </div>

        <div className="p-4 rounded-xl border border-[#DCE4EE] bg-white space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-[#5F6F84] uppercase">
            <span>Pending Orders</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700">{pendingCount}</div>
          <div className="text-[11px] text-[#5F6F84]">Awaiting verification</div>
        </div>

        <div className="p-4 rounded-xl border border-[#DCE4EE] bg-white space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-[#5F6F84] uppercase">
            <span>Completed Orders</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{paidCount}</div>
          <div className="text-[11px] text-[#5F6F84]">Reconciled transactions</div>
        </div>

        <div className="p-4 rounded-xl border border-[#DCE4EE] bg-white space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-[#5F6F84] uppercase">
            <span>Gateway Mode</span>
            <CreditCard className="h-4 w-4 text-[#3869AD]" />
          </div>
          <div className="text-sm font-bold text-[#142541] mt-1">
            {isConfigured ? "Live Gateway" : "Reconciliation"}
          </div>
          <div className="text-[11px] text-[#5F6F84]">
            {isConfigured ? "Automated Webhooks" : "Audited Manual Mode"}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs">
        <Link
          href="/admin/payments"
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            !statusFilter
              ? "bg-[#142541] text-white"
              : "bg-white border border-[#DCE4EE] text-[#5F6F84] hover:bg-[#F3F6FA]"
          }`}
        >
          All Transactions ({payments.length})
        </Link>
        {["paid", "pending", "failed", "refunded"].map((st) => (
          <Link
            key={st}
            href={`/admin/payments?status=${st}`}
            className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition-colors ${
              statusFilter === st
                ? "bg-[#142541] text-white"
                : "bg-white border border-[#DCE4EE] text-[#5F6F84] hover:bg-[#F3F6FA]"
            }`}
          >
            {st}
          </Link>
        ))}
      </div>

      {/* Transactions Table */}
      <div className="rounded-xl border border-[#DCE4EE] bg-white overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#DCE4EE] bg-[#F3F6FA] text-xs font-semibold text-[#142541] flex items-center justify-between">
          <span>Authoritative Financial Ledger ({payments.length})</span>
          <span className="text-[11px] text-[#5F6F84]">
            Strict integer minor units (paise/cents) stored in PostgreSQL
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#DCE4EE] text-[#142541] font-semibold uppercase tracking-wider text-[11px] bg-[#F3F6FA]/50">
              <tr>
                <th className="p-3.5">Order / Tx ID</th>
                <th className="p-3.5">Student Code</th>
                <th className="p-3.5">Student Name</th>
                <th className="p-3.5">Course Track</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Provider / Method</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE4EE] text-[#263449]">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-[#5F6F84]">
                    <Receipt className="h-8 w-8 text-[#5F6F84]/40 mx-auto mb-2" />
                    <p className="font-semibold text-sm text-[#142541]">No Payment Records Found</p>
                    <p className="text-xs text-[#5F6F84] mt-0.5">
                      Financial transactions will appear here when students enroll or payment orders are initiated.
                    </p>
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F3F6FA]/50 transition-colors">
                    <td className="p-3.5 font-mono text-[11px] text-[#3869AD] whitespace-nowrap">
                      {p.order_id || p.id.substring(0, 10)}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-[#142541]">
                      {p.student_code}
                    </td>
                    <td className="p-3.5 font-bold text-[#142541]">
                      {p.student_name}
                    </td>
                    <td className="p-3.5 text-[#142541]">
                      {p.course_title}
                    </td>
                    <td className="p-3.5 font-black text-[#142541]">
                      {formatCurrency(p.amount_in_cents, p.currency)}
                    </td>
                    <td className="p-3.5 capitalize text-[#5F6F84]">
                      {p.provider || p.payment_method || "Direct Bank"}
                    </td>
                    <td className="p-3.5 text-[#5F6F84] whitespace-nowrap">
                      {formatDate(p.created_at)}
                    </td>
                    <td className="p-3.5">
                      <Badge
                        variant={
                          p.status === "paid"
                            ? "success"
                            : p.status === "pending"
                            ? "warning"
                            : "error"
                        }
                      >
                        {p.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-right whitespace-nowrap">
                      {p.status === "pending" && (
                        <form
                          action={async (formData: FormData) => {
                            "use server";
                            await verifyManualPaymentAction(formData);
                          }}
                          className="inline"
                        >
                          <input type="hidden" name="orderId" value={p.id} />
                          <input type="hidden" name="paymentMethod" value="manual_bank_transfer" />
                          <input type="hidden" name="notes" value="Verified by administrator" />
                          <button
                            type="submit"
                            className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 text-xs font-bold transition-colors cursor-pointer"
                          >
                            Mark Verified
                          </button>
                        </form>
                      )}
                      {p.status === "paid" && (
                        <span className="text-[11px] text-emerald-700 font-bold flex items-center justify-end gap-1">
                          <FileCheck className="h-3.5 w-3.5" />
                          Reconciled
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
