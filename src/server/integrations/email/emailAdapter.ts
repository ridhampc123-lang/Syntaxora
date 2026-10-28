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
  const resendKey = process.env.RESEND_API_KEY || process.env.EMAIL_PROVIDER_API_KEY;
  const smtpHost = process.env.SMTP_HOST;
  return Boolean(
    (resendKey && !resendKey.includes("placeholder")) ||
    (smtpHost && !smtpHost.includes("placeholder"))
  );
}

export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  const resendKey = process.env.RESEND_API_KEY || process.env.EMAIL_PROVIDER_API_KEY;

  if (!isEmailConfigured() || !resendKey) {
    // Honest unconfigured state per Section 11 of the specification
    return {
      delivered: false,
      provider: "unconfigured",
      message: `Email provider not configured (RESEND_API_KEY is not set in .env.local). Notification to ${params.to} logged in development runtime.`,
    };
  }

  try {
    let fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_FROM_ADDRESS || "Syntaxora Admissions <onboarding@resend.dev>";
    // Resend requires verified domains. For public mail domains (e.g. @gmail.com) or default dev, fallback to Resend's verified test sender
    if (/@(gmail|yahoo|outlook|hotmail)\.com/i.test(fromAddress) || !fromAddress.includes("@")) {
      fromAddress = "Syntaxora Admissions <onboarding@resend.dev>";
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress,
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      let hint = "";
      if (errBody.includes("only send testing emails to your own email address")) {
        hint = " [Resend Sandbox Restriction: On Resend free tier without a custom domain, emails can only be delivered to your registered Resend account email address. Add and verify a custom domain at resend.com/domains to send to any recipient.]";
      } else if (errBody.includes("domain is not verified")) {
        hint = " [Resend Domain Verification: Please use 'onboarding@resend.dev' as sender or verify your custom domain on https://resend.com/domains.]";
      }
      console.warn(`[Resend Email Error] Status ${res.status}: ${errBody}${hint}`);
      return {
        delivered: false,
        provider: "resend",
        message: `Provider API rejected email dispatch (${res.status}): ${errBody}${hint}`,
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
  setupUrl: string,
  temporaryPassword = "StudentPassword123!",
  batchDetails?: { batchName: string; schedule?: string; instructor?: string }
): { subject: string; html: string; text: string } {
  const batchHtml = batchDetails
    ? `
        <div style="background-color: #F0FDF4; border: 1px solid #BBF7D0; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <div style="font-size: 11px; text-transform: uppercase; color: #166534; font-weight: bold; letter-spacing: 0.05em;">Your Assigned Cohort & Live Class Schedule</div>
          <div style="font-size: 15px; font-weight: bold; color: #14532D; margin-top: 4px;">${batchDetails.batchName}</div>
          ${
            batchDetails.schedule
              ? `<div style="font-size: 13px; color: #15803D; margin-top: 4px;">Class Times: <strong>${batchDetails.schedule}</strong></div>`
              : ""
          }
          ${
            batchDetails.instructor
              ? `<div style="font-size: 12px; color: #166534; margin-top: 4px;">Faculty Mentor: <strong>${batchDetails.instructor}</strong></div>`
              : ""
          }
        </div>
      `
    : "";

  const batchText = batchDetails
    ? `\nAssigned Cohort: ${batchDetails.batchName}${batchDetails.schedule ? `\nClass Times: ${batchDetails.schedule}` : ""}${batchDetails.instructor ? `\nFaculty: ${batchDetails.instructor}` : ""}`
    : "";

  return {
    subject: `Admission Approved: Set Up Your Syntaxora Student Account (${studentCode})`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #142541;">
        <h2 style="color: #142541; margin-bottom: 8px;">Welcome to Syntaxora AI Academy</h2>
        <p style="color: #5F6F84; font-size: 14px; line-height: 1.5;">
          Congratulations <strong>${studentName}</strong>! Your application for admission has been approved by our academic faculty.
        </p>
        ${batchHtml}
        <div style="background-color: #F3F6FA; border: 1px solid #DCE4EE; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <div style="font-size: 11px; text-transform: uppercase; color: #5F6F84; font-weight: bold; letter-spacing: 0.05em;">Your Permanent Student Code</div>
          <div style="font-size: 20px; font-family: monospace; font-weight: bold; color: #3869AD; margin-top: 4px;">${studentCode}</div>
          <div style="font-size: 11px; color: #5F6F84; margin-top: 4px;">Share this code with your verified parents/guardians to enable portal monitoring.</div>
        </div>
        <div style="background-color: #F8FAFC; border: 1px dashed #CBD5E1; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <div style="font-size: 11px; text-transform: uppercase; color: #475569; font-weight: bold; letter-spacing: 0.05em;">Your Temporary Sign-In Credentials</div>
          <div style="font-size: 13px; color: #1E293B; margin-top: 6px;">
            <div>Temporary Password: <strong style="font-family: monospace; background: #E2E8F0; padding: 2px 6px; border-radius: 4px;">${temporaryPassword}</strong></div>
          </div>
          <div style="font-size: 11px; color: #64748B; margin-top: 6px;">You can change your password at any time in your student dashboard settings.</div>
        </div>
        <div style="margin: 24px 0;">
          <a href="${setupUrl}" style="background-color: #3869AD; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
            Sign In & Access Student Portal
          </a>
        </div>
        <p style="color: #5F6F84; font-size: 12px; line-height: 1.4;">
          If you have any questions or need assistance, reach out to admissions@syntaxora.com.
        </p>
      </div>
    `,
    text: `Congratulations ${studentName}! Your Syntaxora application has been approved.${batchText}\nYour Student Code is: ${studentCode}.\nTemporary Password: ${temporaryPassword}.\nSign in here: ${setupUrl}`,
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

