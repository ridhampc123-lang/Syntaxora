import { describe, it, expect } from "vitest";
import {
  INITIAL_ACADEMY_COURSES,
  getCourseBySlug,
  getPublishedCourses,
} from "@/server/services/courseService";

describe("Course Service & Filtering", () => {
  it("provides initial published academy courses", () => {
    expect(INITIAL_ACADEMY_COURSES.length).toBeGreaterThan(0);
    const allPublished = INITIAL_ACADEMY_COURSES.every((c) => c.status === "published");
    expect(allPublished).toBe(true);
  });

  it("filters courses by audience group", async () => {
    const teenCourses = await getPublishedCourses({ audience: "teens" });
    expect(teenCourses.length).toBeGreaterThan(0);
    expect(teenCourses.every((c) => c.audience_group === "teens")).toBe(true);
  });

  it("filters courses by skill level", async () => {
    const advancedCourses = await getPublishedCourses({ level: "advanced" });
    expect(advancedCourses.length).toBeGreaterThan(0);
    expect(advancedCourses.every((c) => c.level === "advanced")).toBe(true);
  });

  it("finds a course by valid slug", async () => {
    const course = await getCourseBySlug("applied-ai-for-teens");
    expect(course).not.toBeNull();
    expect(course?.slug).toBe("applied-ai-for-teens");
    expect(course?.title).toContain("Teens");
  });

  it("returns null for non-existent slug", async () => {
    const course = await getCourseBySlug("non-existent-course-slug-12345");
    expect(course).toBeNull();
  });
});
