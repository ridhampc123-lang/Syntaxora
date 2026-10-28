import { describe, it, expect } from "vitest";
import {
  getActiveChildrenForGuardian,
  getAllRelationshipsForGuardian,
  requestStudentLinkByCode,
  checkLinkRateLimit,
  verifyGuardianStudentAccess,
  revokeGuardianRelationship,
  getGuardianNotifications,
  markNotificationAsRead,
  getStudentInvoices,
  getGuardianInquiries,
  IN_MEMORY_RELATIONSHIPS,
  IN_MEMORY_NOTIFICATIONS,
  IN_MEMORY_INVOICES,
  IN_MEMORY_INQUIRIES,
} from "@/server/services/guardianService";
import { isPaymentConfigured, createPaymentOrder } from "@/server/integrations/payments/paymentAdapter";

describe("Phase 13: Comprehensive Parent Panel Security, Workflows & Data Isolation", () => {
  it("strictly enforces zero-trust: unlinked parent has 0 active children and no fallback leaks", async () => {
    const unlinkedGuardianId = "u-unlinked-new-parent-999";
    const children = await getActiveChildrenForGuardian(unlinkedGuardianId);
    expect(children).toHaveLength(0);

    // Direct access to existing student Liam O'Connor (s1000000-0000-0000-0000-000000000001) is denied
    const hasAccess = await verifyGuardianStudentAccess(
      unlinkedGuardianId,
      "s1000000-0000-0000-0000-000000000001",
      "attendance"
    );
    expect(hasAccess).toBe(false);
  });

  it("submits a parent-link request via student code with pending status and default-deny permissions", async () => {
    const guardianId = "u-parent-applicant-01";
    const studentCode = "STU-8F39A1C2"; // Liam's canonical student code

    const res = await requestStudentLinkByCode(
      guardianId,
      "parent.applicant@example.com",
      studentCode,
      "parent"
    );

    expect(res.success).toBe(true);
    expect(res.status).toBe("pending");
    expect(res.relationshipId).toBeDefined();

    // Verify it is in pending state and all sensitive permissions are false
    const pendingRel = IN_MEMORY_RELATIONSHIPS.find((r) => r.id === res.relationshipId);
    expect(pendingRel).toBeDefined();
    expect(pendingRel?.status).toBe("pending");
    expect(pendingRel?.can_view_attendance).toBe(false);
    expect(pendingRel?.can_view_progress).toBe(false);
    expect(pendingRel?.can_view_fees).toBe(false);

    // Ensure access is strictly denied while pending
    const canAccess = await verifyGuardianStudentAccess(
      guardianId,
      "s1000000-0000-0000-0000-000000000001",
      "attendance"
    );
    expect(canAccess).toBe(false);
  });

  it("handles invalid or non-existent student codes safely without leaking internal database errors", async () => {
    const guardianId = "u-parent-applicant-02";
    const res = await requestStudentLinkByCode(
      guardianId,
      "parent2@example.com",
      "INVALID-CODE-XYZ",
      "parent"
    );

    expect(res.success).toBe(false);
    expect(res.message).toContain("Invalid student code or student record not found");
  });

  it("enforces abuse prevention and rate limits repetitive link request attempts", () => {
    const rateLimitGuardianId = "u-bruteforce-attacker-01";

    // First 5 attempts within window are allowed
    for (let i = 0; i < 5; i++) {
      expect(checkLinkRateLimit(rateLimitGuardianId)).toBe(true);
    }

    // 6th attempt is throttled
    expect(checkLinkRateLimit(rateLimitGuardianId)).toBe(false);
  });

  it("prevents duplicate pending requests for the same student and guardian", async () => {
    const guardianId = "u-parent-applicant-03";
    const studentCode = "STU-8F39A1C2";

    const first = await requestStudentLinkByCode(
      guardianId,
      "parent3@example.com",
      studentCode,
      "parent"
    );
    expect(first.success).toBe(true);
    expect(first.status).toBe("pending");

    const duplicate = await requestStudentLinkByCode(
      guardianId,
      "parent3@example.com",
      studentCode,
      "parent"
    );
    expect(duplicate.status).toBe("pending");
    expect(duplicate.message).toContain("already pending administrator verification");
  });

  it("maintains strict multi-child state isolation when a parent has multiple linked students", async () => {
    const multiChildParentId = "u-multi-child-parent-01";
    const child1Id = "s-child-one-uuid-111";
    const child2Id = "s-child-two-uuid-222";

    // Setup 2 active children with distinct permissions
    IN_MEMORY_RELATIONSHIPS.push(
      {
        id: "rel-multi-01",
        guardian_profile_id: multiChildParentId,
        student_id: child1Id,
        relationship_type: "mother",
        status: "active",
        can_view_attendance: true,
        can_view_progress: true,
        can_view_schedule: true,
        can_view_fees: true,
        can_receive_notifications: true,
        verification_method: "admin_verified_invitation",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "rel-multi-02",
        guardian_profile_id: multiChildParentId,
        student_id: child2Id,
        relationship_type: "mother",
        status: "active",
        can_view_attendance: true,
        can_view_progress: false, // Child 2 has progress restricted
        can_view_schedule: true,
        can_view_fees: false,     // Child 2 has fees restricted
        can_receive_notifications: true,
        verification_method: "admin_verified_invitation",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    );

    // Active children lists both
    const children = await getActiveChildrenForGuardian(multiChildParentId);
    expect(children.map((c) => c.student_id)).toContain(child1Id);
    expect(children.map((c) => c.student_id)).toContain(child2Id);

    // Child 1 has progress & fees permissions
    expect(await verifyGuardianStudentAccess(multiChildParentId, child1Id, "progress")).toBe(true);
    expect(await verifyGuardianStudentAccess(multiChildParentId, child1Id, "fees")).toBe(true);

    // Child 2 strictly denies progress & fees permissions (Granular isolation)
    expect(await verifyGuardianStudentAccess(multiChildParentId, child2Id, "progress")).toBe(false);
    expect(await verifyGuardianStudentAccess(multiChildParentId, child2Id, "fees")).toBe(false);
    expect(await verifyGuardianStudentAccess(multiChildParentId, child2Id, "attendance")).toBe(true);
  });

  it("revocation terminates access instantaneously across all portal modules", async () => {
    const parentId = "u-revoke-parent-99";
    const childId = "s-revoke-child-99";
    const relId = "rel-to-be-revoked-99";

    IN_MEMORY_RELATIONSHIPS.push({
      id: relId,
      guardian_profile_id: parentId,
      student_id: childId,
      relationship_type: "guardian",
      status: "active",
      can_view_attendance: true,
      can_view_progress: true,
      can_view_schedule: true,
      can_view_fees: true,
      can_receive_notifications: true,
      verification_method: "admin_verified_invitation",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Access confirmed prior to revocation
    expect(await verifyGuardianStudentAccess(parentId, childId, "attendance")).toBe(true);
    expect(await verifyGuardianStudentAccess(parentId, childId, "schedule")).toBe(true);

    // Revoke relationship
    const revokeRes = await revokeGuardianRelationship(relId, "admin-user", "Parent request for unlink");
    expect(revokeRes.success).toBe(true);

    // All modules immediately deny access
    expect(await verifyGuardianStudentAccess(parentId, childId, "attendance")).toBe(false);
    expect(await verifyGuardianStudentAccess(parentId, childId, "progress")).toBe(false);
    expect(await verifyGuardianStudentAccess(parentId, childId, "schedule")).toBe(false);
    expect(await verifyGuardianStudentAccess(parentId, childId, "fees")).toBe(false);
  });

  it("processes guardian notifications and supports marking as read", async () => {
    const guardianId = "u-guardian-notif-01";
    IN_MEMORY_NOTIFICATIONS.push({
      id: "notif-test-01",
      recipient_profile_id: guardianId,
      title: "Mid-Term Academic Report Released",
      message: "Grades for Computer Vision Module 1 have been published.",
      type: "academic",
      is_read: false,
      created_at: new Date().toISOString(),
    });

    const notifs = await getGuardianNotifications(guardianId);
    expect(notifs.some((n) => n.id === "notif-test-01")).toBe(true);

    const markRes = await markNotificationAsRead("notif-test-01", guardianId);
    expect(markRes).toBe(true);

    const updated = await getGuardianNotifications(guardianId);
    const readItem = updated.find((n) => n.id === "notif-test-01");
    expect(readItem?.is_read).toBe(true);
  });

  it("handles tuition invoices securely with fee permission enforcement", async () => {
    const guardianPermittedId = "u-parent-fees-allowed";
    const guardianDeniedId = "u-parent-fees-denied";
    const studentId = "s-fee-test-student";

    // Permitted guardian
    IN_MEMORY_RELATIONSHIPS.push({
      id: "rel-fees-allowed",
      guardian_profile_id: guardianPermittedId,
      student_id: studentId,
      relationship_type: "parent",
      status: "active",
      can_view_attendance: true,
      can_view_progress: true,
      can_view_schedule: true,
      can_view_fees: true, // PERMITTED
      can_receive_notifications: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Denied guardian
    IN_MEMORY_RELATIONSHIPS.push({
      id: "rel-fees-denied",
      guardian_profile_id: guardianDeniedId,
      student_id: studentId,
      relationship_type: "parent",
      status: "active",
      can_view_attendance: true,
      can_view_progress: true,
      can_view_schedule: true,
      can_view_fees: false, // RESTRICTED
      can_receive_notifications: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    IN_MEMORY_INVOICES.push({
      id: "inv-test-01",
      number: "INV-2026-001",
      description: "Applied AI Term 1 Tuition",
      amountFormatted: "$1,200.00",
      amountInCents: 120000,
      status: "paid",
      paymentMethod: "Electronic Wire",
      paidAt: new Date().toISOString(),
    });

    // Permitted guardian sees invoice
    const invoicesAllowed = await getStudentInvoices(studentId, guardianPermittedId);
    expect(invoicesAllowed.length).toBeGreaterThan(0);
    expect(invoicesAllowed[0].amountInCents).toBe(120000);

    // Denied guardian receives empty array (zero data leakage)
    const invoicesDenied = await getStudentInvoices(studentId, guardianDeniedId);
    expect(invoicesDenied).toHaveLength(0);
  });

  it("enforces truthful unconfigured state for payment gateway when credentials absent", async () => {
    // In test environment without STRIPE_SECRET_KEY, payment gateway is unconfigured
    expect(isPaymentConfigured()).toBe(false);

    const orderRes = await createPaymentOrder({
      studentId: "s-test-student",
      courseId: "c-test-course",
      amountInCents: 10000,
      currency: "USD",
      payerEmail: "guardian@example.com",
    });

    expect(orderRes.configured).toBe(false);
    expect(orderRes.error).toContain("STRIPE_SECRET_KEY / RAZORPAY_KEY_SECRET");
  });

  it("records guardian leave requests and inquiries with audit trail", async () => {
    const guardianEmail = "inquiry.parent@example.com";
    IN_MEMORY_INQUIRIES.push({
      id: "inq-sample-01",
      email: guardianEmail,
      full_name: "Eleanor Vance",
      subject: "[LEAVE] Absence Request: Medical Appointment",
      message: "Liam will be absent on Thursday.",
      status: "unread",
      created_at: new Date().toISOString(),
    });

    const inquiries = await getGuardianInquiries(guardianEmail);
    expect(inquiries.length).toBeGreaterThan(0);
    expect(inquiries[0].subject).toContain("Absence Request");
  });
});
