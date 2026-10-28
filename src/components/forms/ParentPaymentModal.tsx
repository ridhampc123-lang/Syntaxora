"use client";

import React, { useState, useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import {
  CreditCard,
  Building2,
  CheckCircle2,
  X,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { initiateTuitionPaymentAction } from "@/server/actions/guardian";

interface Props {
  studentName: string;
  studentCode: string;
  studentId?: string;
  courseId?: string;
  courseTitle?: string;
  dueAmount?: number;
  formattedDueAmount?: string;
  invoiceNumber?: string;
  buttonText?: string;
  variant?: "primary" | "outline" | "secondary";
  size?: "sm" | "md" | "lg";
}

export function ParentPaymentModal({
  studentName,
  studentCode,
  studentId,
  courseId,
  courseTitle = "Applied AI & Python Cohort",
  dueAmount = 14999,
  formattedDueAmount = "₹14,999.00",
  invoiceNumber = "SYN-INV-2026-081",
  buttonText = "Pay Tuition Fee",
  variant = "primary",
  size = "sm",
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const [plan, setPlan] = useState<"full" | "installment">("installment");
  const [processing, setProcessing] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [isGatewayUnconfigured, setIsGatewayUnconfigured] = useState(false);

  // Lock background screen scroll when payment modal is open
  useEffect(() => {
    if (isOpen) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      const originalBodyOverscroll = document.body.style.overscrollBehavior;
      const originalHtmlOverscroll = document.documentElement.style.overscrollBehavior;
      const originalPaddingRight = document.body.style.paddingRight;

      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      document.body.style.overscrollBehavior = "contain";
      document.documentElement.style.overscrollBehavior = "contain";

      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setIsOpen(false);
        }
      };
      window.addEventListener("keydown", handleKeyDown);

      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.body.style.overscrollBehavior = originalBodyOverscroll;
        document.documentElement.style.overscrollBehavior = originalHtmlOverscroll;
        document.body.style.paddingRight = originalPaddingRight;
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen]);

  const installmentAmount = Math.round(dueAmount / 3);
  const payingAmount = plan === "full" ? dueAmount : installmentAmount;
  const payingFormatted =
    plan === "full" ? formattedDueAmount : `₹${installmentAmount.toLocaleString("en-IN")}.00`;

  const handlePay = async () => {
    setProcessing(true);
    setErrorNotice(null);
    setIsGatewayUnconfigured(false);

    try {
      const targetStudentId = studentId || "s1000000-0000-0000-0000-000000000001";
      const targetCourseId = courseId || "c1000000-0000-0000-0000-000000000001";
      const res = await initiateTuitionPaymentAction(targetStudentId, payingAmount * 100, targetCourseId);

      if (!res.success) {
        if (!res.configured) {
          setIsGatewayUnconfigured(true);
          setErrorNotice(res.error || "Payment gateway credentials are not configured in this environment.");
        } else {
          setErrorNotice(res.error || "Failed to process payment transaction.");
        }
      } else {
        // Real checkout configured
        if (res.clientSecret) {
          window.location.href = `/checkout?clientSecret=${res.clientSecret}&orderId=${res.orderId}`;
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected payment error occurred.";
      setErrorNotice(msg);
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setErrorNotice(null);
    setIsGatewayUnconfigured(false);
  };

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={() => setIsOpen(true)}
        className="font-semibold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
      >
        <CreditCard className="h-3.5 w-3.5" />
        {buttonText}
      </Button>

      {mounted &&
        isOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto overscroll-contain transition-opacity"
            role="dialog"
            aria-modal="true"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleClose();
              }
            }}
          >
            <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white shadow-2xl border border-[#DCE4EE] p-6 sm:p-8 space-y-6 animate-in fade-in-50 zoom-in-95 duration-200">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-[#F0F4F8] pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-emerald-50 text-emerald-700">
                      <CreditCard className="h-4 w-4" />
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                      Authorized Fee Transaction
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-[#142541]">
                    Tuition & Fee Payment: {studentName}
                  </h3>
                  <p className="text-xs text-[#5F6F84]">
                    Student Code: <strong className="font-mono text-[#3869AD]">{studentCode}</strong> • Course: {courseTitle}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-lg p-1.5 text-[#5F6F84] hover:bg-[#F3F6FA] hover:text-[#142541] transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Error / Gateway Unconfigured Notice */}
              {errorNotice && (
                <div className="p-4 rounded-2xl border border-amber-300 bg-amber-50/80 text-amber-950 text-xs space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-amber-900 font-bold">
                        {isGatewayUnconfigured
                          ? "Online Payment Gateway Notice"
                          : "Transaction Could Not Be Completed"}
                      </strong>
                      <p className="text-[11px] leading-relaxed text-amber-800 mt-0.5">{errorNotice}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* If gateway is unconfigured, show honest offline bank transfer instructions */}
              {isGatewayUnconfigured ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl border border-[#DCE4EE] bg-[#F8FAFC] space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#142541]">
                      <Building2 className="h-4 w-4 text-[#3869AD]" />
                      Official Academy Bank Transfer Details (NEFT / RTGS / IMPS)
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs text-[#5F6F84]">
                      <div>
                        <span className="text-[10px] font-semibold uppercase text-[#93A5C2] block">Account Name</span>
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
                        <span className="text-[10px] font-semibold uppercase text-[#93A5C2] block">IFSC Code</span>
                        <strong className="font-mono text-[#142541]">HDFC0000123</strong>
                      </div>
                    </div>
                    <p className="text-[11px] text-[#5F6F84] pt-2 border-t border-[#DCE4EE]">
                      <strong>Mandatory Remark:</strong> Mention your child&apos;s student code <strong className="font-mono text-[#3869AD]">{studentCode}</strong> in the transfer remarks. Once transferred, email payment UTR to <strong className="text-[#142541]">billing@syntaxora.com</strong> for instant reconciliation.
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button type="button" variant="primary" size="sm" onClick={handleClose}>
                      Close
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Payment Plan Selection */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#142541]">
                      Select Payment Option
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPlan("installment")}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          plan === "installment"
                            ? "border-[#168B83] bg-[#E2F4F2]/30 shadow-xs ring-1 ring-[#168B83]"
                            : "border-[#DCE4EE] bg-white hover:bg-[#F8FAFC]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#142541]">Current Installment</span>
                          <Badge variant="teal">3-Part Plan</Badge>
                        </div>
                        <div className="text-lg font-black text-[#142541] mt-1">
                          ₹{installmentAmount.toLocaleString("en-IN")}.00
                        </div>
                        <p className="text-[10px] text-[#5F6F84] mt-0.5">
                          1 of 3 installments
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPlan("full")}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          plan === "full"
                            ? "border-[#168B83] bg-[#E2F4F2]/30 shadow-xs ring-1 ring-[#168B83]"
                            : "border-[#DCE4EE] bg-white hover:bg-[#F8FAFC]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#142541]">Full Academic Term</span>
                          <Badge variant="primary">Full Tuition</Badge>
                        </div>
                        <div className="text-lg font-black text-[#142541] mt-1">
                          {formattedDueAmount}
                        </div>
                        <p className="text-[10px] text-[#5F6F84] mt-0.5">
                          Covers complete course
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Summary Box */}
                  <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#DCE4EE] space-y-2 text-xs">
                    <div className="flex justify-between text-[#5F6F84]">
                      <span>Course Track</span>
                      <strong className="text-[#142541]">{courseTitle}</strong>
                    </div>
                    <div className="flex justify-between text-[#5F6F84]">
                      <span>Authorized Guardian</span>
                      <strong className="text-[#142541]">{studentName} Guardian</strong>
                    </div>
                    <div className="flex justify-between text-[#5F6F84]">
                      <span>Invoice Statement</span>
                      <strong className="font-mono text-[#3869AD]">{invoiceNumber}</strong>
                    </div>
                    <div className="pt-2 border-t border-[#DCE4EE] flex justify-between text-sm font-black text-[#142541]">
                      <span>Total Amount Payable</span>
                      <span className="text-[#168B83] text-base">{payingFormatted}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <Button type="button" variant="outline" size="sm" onClick={handleClose}>
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      size="md"
                      isLoading={processing}
                      onClick={handlePay}
                      className="bg-[#168B83] hover:bg-[#13746D] font-bold"
                    >
                      <CreditCard className="h-4 w-4 mr-1.5" />
                      Proceed with {payingFormatted}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
