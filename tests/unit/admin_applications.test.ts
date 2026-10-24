import { describe, it, expect } from "vitest";
import {
  listApplications,
  updateApplicationReview,
  detectApplicationDuplicates,
  IN_MEMORY_APPLICATIONS,
} from "@/server/services/applicationService";
import { applicationReviewSchema } from "@/lib/validation/application";

describe("Phase B: Admin Application Review & Decision Workflow", () => {
  it("lists applications with status filtering", async () => {
    const { applications: allApps } = await listApplications();
    expect(allApps.length).toBeGreaterThan(0);

    const { applications: pendingApps } = await listApplications({ status: "pending" });
    for (const app of pendingApps) {
      expect(app.status).toBe("pending");
    }
  });

  it("filters applications by search query", async () => {
    const { applications } = await listApplications({ search: "Maya" });
    expect(applications.some((a) => a.full_name.includes("Maya"))).toBe(true);
  });

  it("validates application review input schema", () => {
    const validReview = {
      applicationId: "a1000000-0000-0000-0000-000000000001",
      decision: "under_review",
      decisionReason: "Undergoing admissions committee review.",
      adminNotes: "Applicant has strong math scores.",
    };

    const result = applicationReviewSchema.safeParse(validReview);
    expect(result.success).toBe(true);
  });

  it("updates application review status and stores reviewer metadata", async () => {
    const targetApp = IN_MEMORY_APPLICATIONS[0];
    const reviewerId = "admin-user-id-001";

    const result = await updateApplicationReview(
      targetApp.id,
      reviewerId,
      "under_review",
      "Assigned to teen robotics committee",
      "Internal review notes"
    );

    expect(result.success).toBe(true);

    const updated = IN_MEMORY_APPLICATIONS.find((a) => a.id === targetApp.id);
    expect(updated?.status).toBe("under_review");
    expect(updated?.reviewed_by_profile_id).toBe(reviewerId);
    expect(updated?.decision_reason).toBe("Assigned to teen robotics committee");
    expect(updated?.admin_notes).toBe("Internal review notes");
  });

  it("detects duplicate applications sharing same email without auto-merging", async () => {
    const duplicateApp1 = {
      id: "dup-test-01",
      application_reference: "APP-TEST01",
      full_name: "John Doe",
      email: "john.duplicate@test.com",
      phone: "+1 555-0100",
      education_level: "High School",
      status: "pending" as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const duplicateApp2 = {
      id: "dup-test-02",
      application_reference: "APP-TEST02",
      full_name: "Johnathan Doe",
      email: "john.duplicate@test.com",
      phone: "+1 555-0100",
      education_level: "High School",
      status: "pending" as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    IN_MEMORY_APPLICATIONS.push(
      duplicateApp1 as unknown as import("@/types").StudentApplication,
      duplicateApp2 as unknown as import("@/types").StudentApplication
    );

    const dupResult = await detectApplicationDuplicates(
      duplicateApp1 as unknown as import("@/types").StudentApplication
    );
    expect(dupResult.hasDuplicates).toBe(true);
    expect(dupResult.matchingApplications.some((a) => a.id === "dup-test-02")).toBe(true);
  });
});

