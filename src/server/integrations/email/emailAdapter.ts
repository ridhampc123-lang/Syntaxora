export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
  category?: "invitation" | "attendance" | "evaluation" | "general";
}

export interface SendEmailResult {
  delivered: boolean;
  provider: "resend" | "smtp" | "unconfigured";
  id?: string;
  message: string;
}

export function isEmailConfigured(): boolean {
  const resendKey = process.env.RESEND_API_KEY;
  const smtpHost = process.env.SMTP_HOST;
  return Boolean(
    (resendKey && !resendKey.includes("placeholder")) ||
    (smtpHost && !smtpHost.includes("placeholder"))
  );
}

export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  const resendKey = process.env.RESEND_API_KEY;

  if (!isEmailConfigured() || !resendKey) {
    // Honest unconfigured state per Section 11 of the specification
    return {
      delivered: false,
      provider: "unconfigured",
      message: `Email provider not configured. Notification to ${params.to} logged in development runtime.`,
    };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "Syntaxora Admissions <admissions@syntaxora.com>",
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      return {
        delivered: false,
        provider: "resend",
        message: `Provider API rejected email dispatch: ${errBody}`,
      };
    }

    const data = (await res.json()) as { id: string };
    return {
      delivered: true,
      provider: "resend",
      id: data.id,
      message: "Email successfully dispatched via Resend.",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Network error during email dispatch";
    return {
      delivered: false,
      provider: "resend",
      message: msg,
    };
  }
}

export function getGuardianInvitationEmail(studentName: string, invitationUrl: string): { subject: string; html: string; text: string } {
  return {
    subject: `Authorize Guardian Link for ${studentName} — Syntaxora AI Academy`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #142541;">
        <h2 style="color: #142541; margin-bottom: 8px;">Authorized Guardian Invitation</h2>
        <p style="color: #5F6F84; font-size: 14px; line-height: 1.5;">
          You have been invited to link your Parent account with student <strong>${studentName}</strong> on the Syntaxora AI Learning Platform.
        </p>
        <div style="margin: 24px 0;">
          <a href="${invitationUrl}" style="background-color: #168B83; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
            Verify & Link Student
          </a>
        </div>
        <p style="color: #5F6F84; font-size: 12px;">
          This link contains a single-use cryptographic token that expires in 7 days. If you did not request this invitation, please disregard this email.
        </p>
      </div>
    `,
    text: `You have been invited to link as guardian for ${studentName}. Click here to accept: ${invitationUrl}. This link expires in 7 days.`,
  };
}

export function getStudentAdmissionSetupEmail(
  studentName: string,
  studentCode: string,
  setupUrl: string
): { subject: string; html: string; text: string } {
  return {
    subject: `Admission Approved: Set Up Your Syntaxora Student Account (${studentCode})`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #142541;">
        <h2 style="color: #142541; margin-bottom: 8px;">Welcome to Syntaxora AI Academy</h2>
        <p style="color: #5F6F84; font-size: 14px; line-height: 1.5;">
          Congratulations <strong>${studentName}</strong>! Your application for admission has been approved by our academic faculty.
        </p>
        <div style="background-color: #F3F6FA; border: 1px solid #DCE4EE; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <div style="font-size: 11px; text-transform: uppercase; color: #5F6F84; font-weight: bold; letter-spacing: 0.05em;">Your Permanent Student Code</div>
          <div style="font-size: 20px; font-family: monospace; font-weight: bold; color: #3869AD; margin-top: 4px;">${studentCode}</div>
          <div style="font-size: 11px; color: #5F6F84; margin-top: 4px;">Share this code with your verified parents/guardians to enable portal monitoring.</div>
        </div>
        <div style="margin: 24px 0;">
          <a href="${setupUrl}" style="background-color: #3869AD; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
            Complete Account Setup & Access Portal
          </a>
        </div>
        <p style="color: #5F6F84; font-size: 12px; line-height: 1.4;">
          This secure setup link is expiring and single-use. If you need any assistance, reach out to admissions@syntaxora.com.
        </p>
      </div>
    `,
    text: `Congratulations ${studentName}! Your Syntaxora application has been approved. Your Student Code is: ${studentCode}. Click to set up your password: ${setupUrl}`,
  };
}

export function getApplicationStatusUpdateEmail(
  applicantName: string,
  reference: string,
  status: string,
  message: string
): { subject: string; html: string; text: string } {
  return {
    subject: `Admissions Update: Application ${reference} — Syntaxora AI Academy`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #142541;">
        <h2 style="color: #142541; margin-bottom: 8px;">Admissions Status Update</h2>
        <p style="color: #5F6F84; font-size: 14px; line-height: 1.5;">
          Hello <strong>${applicantName}</strong>,
        </p>
        <p style="color: #5F6F84; font-size: 14px; line-height: 1.5;">
          The status of your application <strong>${reference}</strong> is now: <strong>${status.toUpperCase()}</strong>.
        </p>
        <div style="background-color: #F3F6FA; border: 1px solid #DCE4EE; padding: 16px; border-radius: 8px; margin: 20px 0; font-size: 13px; color: #263449;">
          ${message}
        </div>
        <p style="color: #5F6F84; font-size: 12px;">
          Syntaxora Admissions Committee • admissions@syntaxora.com
        </p>
      </div>
    `,
    text: `Admissions Update for ${applicantName} (${reference}): Your application status is now ${status}. ${message}`,
  };
}

