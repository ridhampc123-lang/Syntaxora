import React from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Account Verification — Syntaxora AI Academy",
  description: "Verify your email address to activate your Syntaxora portal account.",
};

export default function VerifyPage() {
  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto h-14 w-14 rounded-full bg-[#E2F4F2] text-[#168B83] flex items-center justify-center">
        <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-[#142541]">Verification Required</h1>
        <p className="text-xs text-[#5F6F84] leading-relaxed">
          We have dispatched a verification email to your address. Please click the confirmation link in that email to activate your account.
        </p>
      </div>

      <div className="pt-4 border-t border-[#DCE4EE] space-y-3">
        <Link href="/login" className="w-full block">
          <Button variant="primary" size="md" className="w-full justify-center">
            Proceed to Sign In
            <ArrowRight className="h-4 w-4 ml-1.5" aria-hidden="true" />
          </Button>
        </Link>
        <Link href="/contact" className="text-xs text-[#5F6F84] hover:underline block">
          Did not receive an email? Contact support
        </Link>
      </div>
    </div>
  );
}
