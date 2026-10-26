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

  it("dynamically creates a new course with custom topics and lessons", async () => {
    const { createCourse, getCourseById } = await import("@/server/services/courseService");
    const result = await createCourse({
      title: "Autonomous AI Agents & Multi-Agent Swarms",
      slug: "autonomous-ai-agents-swarms",
      summary: "Learn to build multi-agent AI systems with LangGraph, AutoGen, and tool calling.",
      description: "Comprehensive curriculum covering agent reasoning loops, persistent memory, tool execution, and deployment.",
      level: "advanced",
      audience_group: "adults",
      delivery_mode: "live_online",
      duration_weeks: 6,
      price_in_cents: 45000,
      currency: "USD",
      status: "published",
      initialTopics: [
        {
          title: "Topic 1: ReAct & Agent Reasoning Loops",
          description: "Understanding prompt engineering for autonomous goal decomposition.",
          lessons: ["Reasoning vs Generation", "Hands-on ReAct Implementation"],
        },
        {
          title: "Topic 2: Multi-Agent Collaboration",
          description: "Designing supervisor-worker agent architectures.",
          lessons: ["State Graph Design", "Inter-Agent Messaging Protocol"],
        },
      ],
    });

    expect(result.success).toBe(true);
    expect(result.course).toBeDefined();
    expect(result.course?.title).toBe("Autonomous AI Agents & Multi-Agent Swarms");
    expect(result.course?.modules?.length).toBe(2);
    expect(result.course?.modules?.[0].lessons?.length).toBe(2);

    const retrieved = await getCourseById(result.course!.id);
    expect(retrieved?.id).toBe(result.course!.id);
  });

  it("dynamically adds, updates, and deletes topics in an existing course", async () => {
    const {
      addCourseModule,
      updateCourseModule,
      deleteCourseModule,
      addLessonToModule,
      deleteLessonFromModule,
      INITIAL_ACADEMY_COURSES,
    } = await import("@/server/services/courseService");

    const targetCourse = INITIAL_ACADEMY_COURSES[0];
    const initialModulesCount = targetCourse.modules?.length || 0;

    // 1. Add Topic
    const addResult = await addCourseModule(targetCourse.id, {
      title: "Topic X: Generative Diffusion Models",
      description: "Latent diffusion, UNet architectures, and noise scheduling.",
      lessons: [
        { title: "Forward Diffusion Process", lessonType: "lecture" },
        { title: "Training a Denoising UNet", lessonType: "lab" },
      ],
    });

    expect(addResult.success).toBe(true);
    expect(addResult.module).toBeDefined();
    expect(targetCourse.modules?.length).toBe(initialModulesCount + 1);

    const newModuleId = addResult.module!.id;

    // 2. Update Topic
    const updateResult = await updateCourseModule(targetCourse.id, newModuleId, {
      title: "Topic X: Advanced Generative Diffusion & Stable Diffusion",
      description: "Updated deep dive into cross-attention mechanisms.",
    });

    expect(updateResult.success).toBe(true);
    expect(targetCourse.modules?.find((m) => m.id === newModuleId)?.title).toContain("Advanced Generative Diffusion");

    // 3. Add Lesson to Topic
    const lessonAddResult = await addLessonToModule(targetCourse.id, newModuleId, {
      title: "LoRA Fine-Tuning Hands-On",
      lessonType: "project",
      isPreview: true,
    });

    expect(lessonAddResult.success).toBe(true);
    const mod = targetCourse.modules?.find((m) => m.id === newModuleId);
    expect(mod?.lessons?.some((l) => l.title === "LoRA Fine-Tuning Hands-On")).toBe(true);

    // 4. Delete Lesson from Topic
    const lessonId = lessonAddResult.lesson!.id;
    const lessonDelResult = await deleteLessonFromModule(targetCourse.id, newModuleId, lessonId);
    expect(lessonDelResult.success).toBe(true);
    expect(mod?.lessons?.some((l) => l.id === lessonId)).toBe(false);

    // 5. Delete Topic
    const delResult = await deleteCourseModule(targetCourse.id, newModuleId);
    expect(delResult.success).toBe(true);
    expect(targetCourse.modules?.length).toBe(initialModulesCount);
  });

  it("updates course metadata and tuition pricing dynamically", async () => {
    const { updateCourse, INITIAL_ACADEMY_COURSES } = await import("@/server/services/courseService");
    const targetCourse = INITIAL_ACADEMY_COURSES[0];

    const updateRes = await updateCourse(targetCourse.id, {
      title: targetCourse.title,
      slug: targetCourse.slug,
      summary: targetCourse.summary,
      description: targetCourse.description,
      level: "advanced",
      audience_group: targetCourse.audience_group,
      delivery_mode: targetCourse.delivery_mode,
      duration_weeks: 14,
      price_in_cents: 34900,
    });

    expect(updateRes.success).toBe(true);
    expect(targetCourse.duration_weeks).toBe(14);
    expect(targetCourse.price_in_cents).toBe(34900);
    expect(targetCourse.level).toBe("advanced");
  });
});
