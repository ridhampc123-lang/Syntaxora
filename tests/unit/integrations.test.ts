import { describe, it, expect } from "vitest";
import {
  sendEmail,
  getGuardianInvitationEmail,
  isEmailConfigured,
} from "@/server/integrations/email/emailAdapter";
import {
  createClassMeeting,
  isMeetingProviderConfigured,
} from "@/server/integrations/meeting/meetingAdapter";
import {
  createPaymentOrder,
  verifyWebhookSignature,
  processPaymentWebhookEvent,
  isPaymentConfigured,
} from "@/server/integrations/payments/paymentAdapter";
import {
  getSignedDownloadUrl,
  getSignedUploadUrl,
} from "@/server/integrations/storage/storageAdapter";
import crypto from "crypto";

describe("Phase 7: External Integrations & Honest Adapters", () => {
  describe("Email Integration Adapter", () => {
    it("reports honest unconfigured state when credentials are not present", async () => {
      // In local testing without real RESEND_API_KEY
      expect(isEmailConfigured()).toBe(false);

      const result = await sendEmail({
        to: "test.parent@example.com",
        subject: "Invitation Notice",
        html: "<p>Hello</p>",
      });

      expect(result.delivered).toBe(false);
      expect(result.provider).toBe("unconfigured");
      expect(result.message).toContain("not configured");
    });

    it("generates structured guardian invitation email with single-use link", () => {
      const email = getGuardianInvitationEmail("Liam O'Connor", "https://syntaxora.com/guardian/accept-invitation?token=abc");
      expect(email.subject).toContain("Liam O'Connor");
      expect(email.html).toContain("https://syntaxora.com/guardian/accept-invitation?token=abc");
      expect(email.text).toContain("expires in 7 days");
    });
  });

  describe("Virtual Classroom Meeting Adapter", () => {
    it("reports honest configuration state and falls back to WebRTC room", async () => {
      expect(isMeetingProviderConfigured("zoom")).toBe(false);
      expect(isMeetingProviderConfigured("google_meet")).toBe(false);

      const result = await createClassMeeting({
        sessionId: "ses-test-meeting-01",
        title: "Edge Lab",
        startsAt: "2026-10-25T14:00:00Z",
        durationMinutes: 90,
        providerPreference: "zoom",
      });

      expect(result.configured).toBe(false);
      expect(result.provider).toBe("live_webrtc");
      expect(result.meetingUrl).toContain("/live/ses-test");
      expect(result.notes).toContain("not configured");
    });
  });

  describe("Payment Adapter & Webhook Security", () => {
    it("refuses to process payments when gateway credentials are absent", async () => {
      expect(isPaymentConfigured()).toBe(false);

      const result = await createPaymentOrder({
        studentId: "s-101",
        courseId: "c-101",
        amountInCents: 29900,
        currency: "USD",
        payerEmail: "parent@example.com",
      });

      expect(result.configured).toBe(false);
      expect(result.error).toContain("credentials (STRIPE_SECRET_KEY / RAZORPAY_KEY_SECRET) are not configured");
    });

    it("rejects non-positive transaction amounts", async () => {
      const result = await createPaymentOrder({
        studentId: "s-101",
        courseId: "c-101",
        amountInCents: 0,
        currency: "USD",
        payerEmail: "parent@example.com",
      });

      expect(result.configured).toBe(false);
      expect(result.error).toContain("Invalid transaction amount");
    });

    it("verifies webhook cryptographic signatures and rejects spoofed payloads", () => {
      const secret = "whsec_test_secret_key_123456789";
      const payload = JSON.stringify({ id: "evt_test_01", type: "payment_intent.succeeded" });

      const signature = crypto.createHmac("sha256", secret).update(payload).digest("hex");

      // Valid signature succeeds
      expect(verifyWebhookSignature(payload, signature, secret)).toBe(true);

      // Tampered payload fails
      const tamperedPayload = JSON.stringify({ id: "evt_test_01", type: "tampered" });
      expect(verifyWebhookSignature(tamperedPayload, signature, secret)).toBe(false);

      // Wrong secret fails
      expect(verifyWebhookSignature(payload, signature, "whsec_wrong_secret")).toBe(false);
    });

    it("enforces idempotency on webhook event processing to prevent duplicate state mutations", async () => {
      const event = {
        id: "evt_idempotent_unique_01",
        type: "payment_intent.succeeded",
        data: {
          object: {
            id: "pi_123456",
            amount: 29900,
            currency: "usd",
            status: "succeeded",
          },
        },
      };

      // 1. First event processing: succeeds
      const first = await processPaymentWebhookEvent(event);
      expect(first.processed).toBe(true);
      expect(first.duplicate).toBe(false);

      // 2. Duplicate re-delivery: safely intercepted by idempotency check
      const second = await processPaymentWebhookEvent(event);
      expect(second.processed).toBe(false);
      expect(second.duplicate).toBe(true);
      expect(second.message).toContain("Idempotency enforced");
    });
  });

  describe("Storage Adapter & Private Document Signed URLs", () => {
    it("generates short-lived signed download URLs and never public URLs for private documents", async () => {
      const result = await getSignedDownloadUrl("submissions", "student-01/lab-01.py", 900);
      expect(result.signedUrl).toBeDefined();
      expect(result.expiresInSeconds).toBe(900);
      expect(result.signedUrl).toContain("token=");
      expect(result.signedUrl).toContain("expires=900");

      const emptyRes = await getSignedDownloadUrl("submissions", "");
      expect(emptyRes.signedUrl).toBeNull();
      expect(emptyRes.error).toBeDefined();
    });

    it("generates short-lived signed upload URLs for student deliverables", async () => {
      const result = await getSignedUploadUrl("submissions", "student-01/upload.py");
      expect(result.signedUrl).toBeDefined();
      expect(result.expiresInSeconds).toBe(900);
    });
  });
});
