import { describe, it, expect } from "vitest";
import {
  createStudentSchema,
  createCourseSchema,
  attendanceCorrectionSchema,
} from "@/lib/validation/admin";

describe("Admin Form Validation & Audit Schemas", () => {
  it("validates compliant student creation payload", () => {
    const valid = {
      fullName: "Maya Lin",
      email: "maya.lin@example.com",
      dateOfBirth: "2012-05-14",
      emergencyPhone: "+1 (555) 901-2345",
      notes: "Advanced math background",
    };
    const res = createStudentSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it("rejects student with invalid email or too short name", () => {
    const invalid = {
      fullName: "M",
      email: "not-an-email",
    };
    const res = createStudentSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });

  it("validates compliant course creation payload", () => {
    const valid = {
      title: "Generative AI Agent Systems",
      slug: "generative-ai-agent-systems",
      summary: "Build autonomous multi-agent systems using Python and modern tool calls.",
      description: "A comprehensive hands-on engineering course on LLM agents, planning loops, and tool execution.",
      level: "advanced",
      audienceGroup: "adults",
      deliveryMode: "live_online",
      durationWeeks: 8,
      priceInDollars: 499,
    };
    const res = createCourseSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it("rejects uppercase or invalid characters in course slug", () => {
    const invalidSlug = {
      title: "Course Title",
      slug: "Invalid_Slug_With_Upper!",
      summary: "A summary that is at least 10 chars.",
      description: "A description that is at least 20 characters long.",
      level: "beginner",
      audienceGroup: "teens",
      deliveryMode: "live_online",
      durationWeeks: 8,
      priceInDollars: 200,
    };
    const res = createCourseSchema.safeParse(invalidSlug);
    expect(res.success).toBe(false);
  });

  it("rejects negative price or duration in course schema", () => {
    const invalidPrice = {
      title: "Course Title",
      slug: "course-slug",
      summary: "A summary that is at least 10 chars.",
      description: "A description that is at least 20 characters long.",
      level: "beginner",
      audienceGroup: "teens",
      deliveryMode: "live_online",
      durationWeeks: -2,
      priceInDollars: -50,
    };
    const res = createCourseSchema.safeParse(invalidPrice);
    expect(res.success).toBe(false);
  });

  it("mandates a non-empty audit reason for attendance corrections", () => {
    const validCorrection = {
      attendanceId: "c1000000-0000-4000-8000-000000000001",
      newStatus: "excused",
      correctionReason: "Student medical certificate submitted and verified by admin",
    };
    expect(attendanceCorrectionSchema.safeParse(validCorrection).success).toBe(true);

    const invalidShortReason = {
      attendanceId: "c1000000-0000-4000-8000-000000000001",
      newStatus: "present",
      correctionReason: "fix", // Too short for mandatory audit trail
    };
    expect(attendanceCorrectionSchema.safeParse(invalidShortReason).success).toBe(false);
  });
});
