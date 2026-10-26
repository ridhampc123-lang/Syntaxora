"use client";

import React, { useState } from "react";
import {
  CreditCard,
  QrCode,
  Building2,
  CheckCircle2,
  X,
  Sparkles,
  Download,
  ShieldCheck,
  Receipt,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Props {
  studentName: string;
  studentCode: string;
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
  courseTitle = "Applied AI & Python Robotics Cohort",
  dueAmount = 14999,
  formattedDueAmount = "₹14,999.00",
  invoiceNumber = "SYN-INV-2026-081",
  buttonText = "Pay Tuition Fee",
  variant = "primary",
  size = "sm",
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [plan, setPlan] = useState<"full" | "installment">("installment");
  const [method, setMethod] = useState<"upi" | "card" | "netbanking">("upi");
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [txnId, setTxnId] = useState("");

  const installmentAmount = Math.round(dueAmount / 3);
  const payingAmount = plan === "full" ? dueAmount : installmentAmount;
  const payingFormatted = plan === "full" ? formattedDueAmount : `₹${installmentAmount.toLocaleString("en-IN")}.00`;

  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => {
      const randomTxn = `TXN-SYN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      setTxnId(randomTxn);
      setProcessing(false);
      setCompleted(true);
    }, 1200);
  };

  const handleReset = () => {
    setCompleted(false);
    setProcessing(false);
    setIsOpen(false);
  };

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={() => setIsOpen(true)}
        className="font-semibold text-xs flex items-center gap-1.5 shadow-xs"
      >
        <CreditCard className="h-3.5 w-3.5" />
        {buttonText}
      </Button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50 duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-[#DCE4EE] p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#DCE4EE] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-gradient-to-br from-[#168B83] to-[#0D5F5A] text-white shadow-xs">
                  <Receipt className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#142541]">
                    Tuition Fee Payment Portal
                  </h3>
                  <p className="text-[11px] text-[#5F6F84]">
                    Secure encrypted checkout for {studentName} ({studentCode})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="rounded-lg p-1 text-[#5F6F84] hover:bg-[#F3F6FA] hover:text-[#142541] transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {completed ? (
              /* Success State */
              <div className="space-y-5 text-center py-2 animate-in zoom-in-95 duration-200">
                <div className="mx-auto h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10" />
                </div>

                <div className="space-y-1">
                  <Badge variant="success" className="px-3 py-1 font-bold text-xs uppercase tracking-wider">
                    Payment Successful
                  </Badge>
                  <h4 className="text-xl font-black text-[#142541] mt-1">
                    {payingFormatted} Received
                  </h4>
                  <p className="text-xs text-[#5F6F84]">
                    Official fee receipt dispatched to guardian email. Cohort seat confirmed.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#DCE4EE] text-left text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[#5F6F84]">Transaction Reference:</span>
                    <strong className="font-mono text-[#3869AD] font-bold">{txnId}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#5F6F84]">Student:</span>
                    <span className="font-semibold text-[#142541]">{studentName} ({studentCode})</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#5F6F84]">Invoice Code:</span>
                    <span className="font-mono text-[#142541]">{invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#5F6F84]">Payment Method:</span>
                    <span className="capitalize font-semibold text-[#142541]">{method.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#5F6F84]">Paid At:</span>
                    <span className="text-[#142541]">{new Date().toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 text-xs justify-center"
                    onClick={() => {
                      if (typeof window !== "undefined") window.print();
                    }}
                  >
                    <Download className="h-3.5 w-3.5 mr-1" />
                    Download Receipt PDF
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    className="flex-1 text-xs justify-center"
                    onClick={handleReset}
                  >
                    Return to Portal
                  </Button>
                </div>
              </div>
            ) : (
              /* Payment Options & Form */
              <div className="space-y-4">
                {/* Cohort & Invoice Summary */}
                <div className="p-3.5 rounded-xl bg-[#F3F6FA] border border-[#DCE4EE] text-xs space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#142541]">{courseTitle}</span>
                    <Badge variant="teal">Verified Enrolled</Badge>
                  </div>
                  <div className="text-[11px] text-[#5F6F84] flex items-center justify-between">
                    <span>Invoice Ref: <strong className="font-mono text-[#3869AD]">{invoiceNumber}</strong></span>
                    <span>Total Due: <strong className="text-[#142541] font-bold">{formattedDueAmount}</strong></span>
                  </div>
                </div>

                {/* Payment Plan Selector */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#142541]">
                    Select Payment Plan
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setPlan("installment")}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        plan === "installment"
                          ? "border-[#168B83] bg-[#E2F4F2] text-[#142541] shadow-xs"
                          : "border-[#DCE4EE] bg-white text-[#5F6F84] hover:bg-[#F3F6FA]"
                      }`}
                    >
                      <div className="font-bold text-[#142541]">Monthly Term Fee</div>
                      <div className="text-xs font-black text-[#168B83] mt-0.5">
                        ₹{installmentAmount.toLocaleString("en-IN")}.00
                      </div>
                      <div className="text-[10px] text-[#5F6F84] mt-0.5">1 of 3 Installments</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPlan("full")}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        plan === "full"
                          ? "border-[#3869AD] bg-[#E8EFF8] text-[#142541] shadow-xs"
                          : "border-[#DCE4EE] bg-white text-[#5F6F84] hover:bg-[#F3F6FA]"
                      }`}
                    >
                      <div className="font-bold text-[#142541]">Full Term Clearance</div>
                      <div className="text-xs font-black text-[#3869AD] mt-0.5">
                        {formattedDueAmount}
                      </div>
                      <div className="text-[10px] text-[#5F6F84] mt-0.5">Includes ₹1,000 Early Discount</div>
                    </button>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#142541]">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {[
                      { id: "upi", label: "UPI / QR", icon: QrCode, desc: "GPay, PhonePe" },
                      { id: "card", label: "Cards", icon: CreditCard, desc: "Debit / Credit" },
                      { id: "netbanking", label: "NetBanking", icon: Building2, desc: "Instant NEFT" },
                    ].map((item) => {
                      const Icon = item.icon;
                      const isSelected = method === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setMethod(item.id as typeof method)}
                          className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                            isSelected
                              ? "border-[#142541] bg-[#142541] text-white shadow-xs"
                              : "border-[#DCE4EE] bg-white text-[#5F6F84] hover:bg-[#F3F6FA]"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="font-bold text-[11px] block">{item.label}</span>
                          <span className={`text-[9px] ${isSelected ? "text-white/70" : "text-[#5F6F84]"}`}>
                            {item.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Method Specific Input / QR */}
                {method === "upi" && (
                  <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 text-xs text-emerald-950 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs flex items-center gap-1.5 text-emerald-900">
                        <QrCode className="h-4 w-4 text-emerald-600" />
                        Instant UPI Express Checkout
                      </span>
                      <span className="font-mono text-[10px] text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                        Zero Processing Fee
                      </span>
                    </div>
                    <div className="space-y-1">
                      <input
                        type="text"
                        placeholder="Enter UPI ID (e.g. parent@upi or 9876543210@paytm)"
                        defaultValue="parent@okhdfcbank"
                        className="w-full rounded-lg border border-emerald-300 bg-white px-3 py-2 text-xs text-[#142541] focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                    </div>
                  </div>
                )}

                {method === "card" && (
                  <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#DCE4EE] text-xs space-y-2">
                    <div className="space-y-1">
                      <input
                        type="text"
                        placeholder="Card Number (•••• •••• •••• 4242)"
                        defaultValue="4111 •••• •••• 4242"
                        className="w-full rounded-lg border border-[#DCE4EE] bg-white px-3 py-2 text-xs font-mono text-[#142541]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="MM/YY"
                        defaultValue="08/28"
                        className="w-full rounded-lg border border-[#DCE4EE] bg-white px-3 py-2 text-xs font-mono text-[#142541]"
                      />
                      <input
                        type="password"
                        placeholder="CVV"
                        defaultValue="•••"
                        maxLength={4}
                        className="w-full rounded-lg border border-[#DCE4EE] bg-white px-3 py-2 text-xs font-mono text-[#142541]"
                      />
                    </div>
                  </div>
                )}

                {method === "netbanking" && (
                  <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#DCE4EE] text-xs">
                    <select className="w-full rounded-lg border border-[#DCE4EE] bg-white px-3 py-2 text-xs text-[#142541] font-semibold">
                      <option>HDFC Bank — Corporate & Retail</option>
                      <option>ICICI Bank</option>
                      <option>State Bank of India (SBI)</option>
                      <option>Axis Bank</option>
                      <option>Kotak Mahindra Bank</option>
                    </select>
                  </div>
                )}

                {/* Security Protection Assurance */}
                <div className="flex items-center gap-2 text-[10px] text-[#5F6F84] pt-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>256-Bit SSL Encrypted & RBI Mandate Compliant • Instant Institutional Receipt</span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-[#DCE4EE]">
                  <div>
                    <span className="text-[10px] uppercase text-[#5F6F84] font-bold block">Payable Total</span>
                    <strong className="text-lg font-black text-[#142541]">{payingFormatted}</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                      disabled={processing}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={handlePay}
                      isLoading={processing}
                      className="px-5 font-bold"
                    >
                      <Sparkles className="h-3.5 w-3.5 mr-1" />
                      Authorize & Pay {payingFormatted}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
