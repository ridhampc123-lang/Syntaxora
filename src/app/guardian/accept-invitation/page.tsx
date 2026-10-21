import React from "react";
import Link from "next/link";
import { ShieldAlert, ShieldCheck, AlertCircle, ArrowRight } from "lucide-react";
import { inspectInvitationToken } from "@/server/services/guardianService";
import { getCurrentUser } from "@/server/services/authService";
import { Card, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { AcceptInvitationButton } from "@/components/forms/AcceptInvitationButton";

export const metadata = {
  title: "Accept Guardian Invitation — Syntaxora",
  description: "Secure, audited guardian-student authorization verification portal.",
};

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AcceptInvitationPage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const rawToken = typeof resolvedParams.token === "string" ? resolvedParams.token : null;

  if (!rawToken) {
    return (
      <div className="min-h-screen bg-[#F3F6FA] flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-[#DCE4EE] bg-white shadow-xl text-center p-8 space-y-4">
          <div className="mx-auto h-12 w-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl font-bold text-[#142541]">
            Missing Invitation Token
          </CardTitle>
          <p className="text-xs text-[#5F6F84] leading-relaxed">
            No invitation token was provided in the link. Please check the URL sent to you by the academy administration.
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3869AD] hover:underline"
            >
              Go to Login <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const [inspection, currentUser] = await Promise.all([
    inspectInvitationToken(rawToken),
    getCurrentUser(),
  ]);

  if (!inspection.valid || !inspection.invitation) {
    let title = "Invalid Invitation";
    let message = "This invitation link is not valid or has been removed.";

    if (inspection.reason === "already_consumed") {
      title = "Invitation Already Used";
      message = "This single-use cryptographic token has already been redeemed. If you have already linked your student, you can proceed to the Parent Portal.";
    } else if (inspection.reason === "expired") {
      title = "Invitation Expired";
      message = "This invitation was time-limited and has expired. Please contact academy administration for an updated invitation.";
    } else if (inspection.reason === "revoked") {
      title = "Invitation Revoked";
      message = "This invitation link was revoked by the academy administrator.";
    }

    return (
      <div className="min-h-screen bg-[#F3F6FA] flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-[#DCE4EE] bg-white shadow-xl text-center p-8 space-y-4">
          <div className="mx-auto h-12 w-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
            <AlertCircle className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl font-bold text-[#142541]">{title}</CardTitle>
          <p className="text-xs text-[#5F6F84] leading-relaxed">{message}</p>
          <div className="pt-4 flex flex-col gap-2">
            <Link
              href="/parent"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-[#142541] text-white text-xs font-semibold hover:bg-[#1f3760] transition-colors"
            >
              Go to Parent Portal
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-[#3869AD] hover:underline"
            >
              Contact Academy Support
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const invitation = inspection.invitation;
  const student = invitation.student;
  const studentName = student?.profile?.full_name || "Enrolled Student";
  const studentCode = student?.student_code || "STU-RECORD";
  const intendedEmail = invitation.intended_guardian_email;

  const currentEmail = currentUser?.email?.toLowerCase().trim();
  const isEmailMatch = currentEmail === intendedEmail.toLowerCase().trim();
  const isParentRole = currentUser?.profile.role === "parent" || currentUser?.profile.role === "admin";

  return (
    <div className="min-h-screen bg-[#F3F6FA] flex items-center justify-center p-4">
      <Card className="max-w-lg w-full border-[#DCE4EE] bg-white shadow-xl overflow-hidden">
        <div className="bg-[#142541] p-6 text-white text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-full bg-white/10 flex items-center justify-center text-[#168B83]">
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>
          <CardTitle className="text-xl font-extrabold tracking-tight">
            Verify Guardian Authorization
          </CardTitle>
          <p className="text-xs text-[#F3F6FA]/80">
            Official Syntaxora Student Record Connection
          </p>
        </div>

        <CardContent className="p-6 space-y-6">
          {/* Student & Invitation Context */}
          <div className="rounded-xl border border-[#DCE4EE] bg-[#F3F6FA] p-4 space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#5F6F84]">
              Target Academy Record
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-[#142541]">{studentName}</h3>
                <span className="text-xs font-mono text-[#3869AD]">{studentCode}</span>
              </div>
              <Badge variant="teal" className="capitalize">
                {invitation.relationship_type.replace("_", " ")}
              </Badge>
            </div>
            <div className="pt-2 border-t border-[#DCE4EE] flex items-center justify-between text-xs text-[#5F6F84]">
              <span>Authorized Recipient:</span>
              <strong className="text-[#142541]">{intendedEmail}</strong>
            </div>
          </div>

          {/* Session check logic */}
          {!currentUser ? (
            <div className="space-y-4">
              <Alert variant="warning">
                <AlertCircle className="h-4 w-4" />
                <span className="text-xs">
                  You must be signed in with your Parent account to complete this authorization.
                </span>
              </Alert>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link
                  href={`/login?redirect=/guardian/accept-invitation?token=${rawToken}`}
                  className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-[#142541] text-white text-xs font-semibold hover:bg-[#1f3760] transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href={`/sign-up?redirect=/guardian/accept-invitation?token=${rawToken}`}
                  className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg border border-[#DCE4EE] bg-white text-xs font-semibold text-[#142541] hover:bg-[#F3F6FA] transition-colors"
                >
                  Create Parent Account
                </Link>
              </div>
            </div>
          ) : !isParentRole ? (
            <Alert variant="error">
              <AlertCircle className="h-4 w-4" />
              <span className="text-xs">
                Your currently active session has role <strong>{currentUser.profile.role}</strong>. Only accounts registered as Parent/Guardian can link students. Please sign out and log in with your parent credentials.
              </span>
            </Alert>
          ) : !isEmailMatch ? (
            <Alert variant="error">
              <AlertCircle className="h-4 w-4" />
              <span className="text-xs">
                Identity Boundary Check: You are currently signed in as <strong>{currentUser.email}</strong>, but this invitation was issued strictly for <strong>{intendedEmail}</strong>. Please switch to the invited account.
              </span>
            </Alert>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-[#5F6F84] leading-relaxed">
                By clicking below, you activate your guardian permissions for <strong className="text-[#142541]">{studentName}</strong>. You will be able to monitor session attendance, learning progress, class schedules, and fee invoices directly from your Parent Portal.
              </p>
              <AcceptInvitationButton token={rawToken} />
            </div>
          )}

          <div className="text-center pt-2">
            <p className="text-[11px] text-[#5F6F84]">
              Syntaxora strictly prohibits inferred relationships. Every link is verified, single-use, and auditable.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
