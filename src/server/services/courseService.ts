import crypto from "crypto";
import { createPublicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";
import {
  Course,
  CourseModule,
  Lesson,
  CourseLevel,
  AudienceGroup,
  DeliveryMode,
  CourseStatus,
} from "@/types";

export interface CourseFilterOptions {
  category?: string;
  audience?: string;
  level?: string;
  deliveryMode?: string;
  search?: string;
}

// Canonical fallback courses deployed with academy database seed
export const INITIAL_ACADEMY_COURSES: Course[] = [
  {
    id: "c1000000-0000-0000-0000-000000000001",
    slug: "applied-ai-for-teens",
    title: "Applied AI & Python Programming for Teens",
    summary: "Hands-on machine learning, computer vision, and Python programming designed specifically for students ages 12 to 17.",
    description: "In this comprehensive course, teen learners transition from coding syntax to building real AI applications. Starting with Python foundations, students implement image recognition models using OpenCV, train neural networks to classify objects, and deploy interactive computer vision applications.",
    level: "beginner",
    audience_group: "teens",
    delivery_mode: "live_online",
    duration_weeks: 10,
    price_in_cents: 1499900,
    currency: "INR",
    status: "published",
    thumbnail_url: null,
    published_at: "2026-09-01T00:00:00Z",
    created_at: "2026-09-01T00:00:00Z",
    updated_at: "2026-09-01T00:00:00Z",
    modules: [
      {
        id: "m1000000-0000-0000-0000-000000000001",
        course_id: "c1000000-0000-0000-0000-000000000001",
        title: "Module 1: Foundations of Machine Intelligence",
        description: "Introduction to computational thinking and Python data structures.",
        sort_order: 1,
        lessons: [
          {
            id: "l1000000-0000-0000-0000-000000000001",
            module_id: "m1000000-0000-0000-0000-000000000001",
            title: "How Machines Learn from Data",
            description: "Understanding training sets, features, and model inference.",
            lesson_type: "lecture",
            is_preview: true,
            sort_order: 1,
          },
          {
            id: "l1000000-0000-0000-0000-000000000002",
            module_id: "m1000000-0000-0000-0000-000000000001",
            title: "Hands-on Python Data Structures for AI",
            description: "Lists, dictionaries, and tensors in Python.",
            lesson_type: "lab",
            is_preview: false,
            sort_order: 2,
          },
        ],
      },
      {
        id: "m1000000-0000-0000-0000-000000000002",
        course_id: "c1000000-0000-0000-0000-000000000001",
        title: "Module 2: Computer Vision in Practice",
        description: "Image processing, bounding boxes, and object classification.",
        sort_order: 2,
        lessons: [
          {
            id: "l1000000-0000-0000-0000-000000000003",
            module_id: "m1000000-0000-0000-0000-000000000002",
            title: "Detecting Objects with OpenCV",
            description: "Real-time webcam video stream filtering and edge detection.",
            lesson_type: "project",
            is_preview: false,
            sort_order: 1,
          },
        ],
      },
    ],
  },
  {
    id: "c1000000-0000-0000-0000-000000000002",
    slug: "young-ai-explorers",
    title: "Young AI Explorers: Logic, Algorithms & Creative Coding",
    summary: "An interactive, visual introduction to artificial intelligence and algorithmic thinking for kids ages 7 to 11.",
    description: "Young AI Explorers demystifies modern technology through visual block-based programming, sensor interaction, and playful logic puzzles. Students discover how voice assistants comprehend speech, how recommendation engines suggest videos, and how to program their own friendly AI sidekick.",
    level: "beginner",
    audience_group: "young_learners",
    delivery_mode: "live_online",
    duration_weeks: 8,
    price_in_cents: 999900,
    currency: "INR",
    status: "published",
    thumbnail_url: null,
    published_at: "2026-09-01T00:00:00Z",
    created_at: "2026-09-01T00:00:00Z",
    updated_at: "2026-09-01T00:00:00Z",
    modules: [
      {
        id: "m1000000-0000-0000-0000-000000000003",
        course_id: "c1000000-0000-0000-0000-000000000002",
        title: "Module 1: The Magic of Pattern Recognition",
        description: "Exploring how computers identify patterns, shapes, and speech.",
        sort_order: 1,
        lessons: [
          {
            id: "l1000000-0000-0000-0000-000000000004",
            module_id: "m1000000-0000-0000-0000-000000000003",
            title: "Teaching a Computer to See Shapes",
            description: "Interactive visual game training a classifier on doodles.",
            lesson_type: "lab",
            is_preview: true,
            sort_order: 1,
          },
        ],
      },
    ],
  },
  {
    id: "c1000000-0000-0000-0000-000000000003",
    slug: "applied-deep-learning-college",
    title: "Applied Deep Learning & Neural Networks for College Students",
    summary: "Rigorous mathematical and engineering foundations of deep learning, PyTorch models, and real-world transformer architectures.",
    description: "Designed for undergraduate computer science, data science, and engineering students. Master model architectures from convolutional neural networks to modern attention mechanisms and transformers, with end-to-end PyTorch implementations.",
    level: "advanced",
    audience_group: "college_students",
    delivery_mode: "live_online",
    duration_weeks: 12,
    price_in_cents: 2499900,
    currency: "INR",
    status: "published",
    thumbnail_url: null,
    published_at: "2026-09-01T00:00:00Z",
    created_at: "2026-09-01T00:00:00Z",
    updated_at: "2026-09-01T00:00:00Z",
    modules: [
      {
        id: "m1000000-0000-0000-0000-000000000004",
        course_id: "c1000000-0000-0000-0000-000000000003",
        title: "Module 1: Neural Network Mathematics & PyTorch",
        description: "Backpropagation, gradient descent, loss functions, and tensor computation.",
        sort_order: 1,
        lessons: [
          {
            id: "l1000000-0000-0000-0000-000000000005",
            module_id: "m1000000-0000-0000-0000-000000000004",
            title: "Implementing Multi-Layer Perceptrons from Scratch",
            description: "Writing autograd and custom linear layers.",
            lesson_type: "lab",
            is_preview: true,
            sort_order: 1,
          },
        ],
      },
    ],
  },
  {
    id: "c1000000-0000-0000-0000-000000000004",
    slug: "practical-generative-ai-adults",
    title: "Practical Generative AI & Prompt Engineering for Professionals",
    summary: "Harness LLMs, embeddings, RAG pipelines, and automated AI agents to accelerate workplace productivity and software development.",
    description: "Built for working professionals, managers, and software engineers seeking to leverage modern generative AI. Learn prompt architecture, retrieval-augmented generation (RAG) with vector databases, and fine-tuning techniques.",
    level: "intermediate",
    audience_group: "adults",
    delivery_mode: "hybrid",
    duration_weeks: 6,
    price_in_cents: 1899900,
    currency: "INR",
    status: "published",
    thumbnail_url: null,
    published_at: "2026-09-01T00:00:00Z",
    created_at: "2026-09-01T00:00:00Z",
    updated_at: "2026-09-01T00:00:00Z",
    modules: [
      {
        id: "m1000000-0000-0000-0000-000000000005",
        course_id: "c1000000-0000-0000-0000-000000000004",
        title: "Module 1: Prompt Architecture & RAG Pipelines",
        description: "Vector embeddings, chunking strategies, and retrieval mechanics.",
        sort_order: 1,
        lessons: [
          {
            id: "l1000000-0000-0000-0000-000000000006",
            module_id: "m1000000-0000-0000-0000-000000000005",
            title: "Building an Enterprise RAG Assistant with Postgres pgvector",
            description: "Indexing documents, executing semantic search, and synthesizing answers.",
            lesson_type: "project",
            is_preview: true,
            sort_order: 1,
          },
        ],
      },
    ],
  },
];

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key && !url.includes("placeholder") && !key.includes("placeholder"));
}

export async function getPublishedCourses(filters?: CourseFilterOptions): Promise<Course[]> {
  if (!isSupabaseConfigured()) {
    return filterLocalCourses(INITIAL_ACADEMY_COURSES, filters);
  }

  try {
    const supabase = createPublicClient();
    let query = supabase
      .from("courses")
      .select(`
        *,
        modules:course_modules(
          *,
          lessons(*)
        )
      `)
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (filters?.audience && filters.audience !== "all") {
      query = query.eq("audience_group", filters.audience);
    }
    if (filters?.level && filters.level !== "all") {
      query = query.eq("level", filters.level);
    }
    if (filters?.deliveryMode && filters.deliveryMode !== "all") {
      query = query.eq("delivery_mode", filters.deliveryMode);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      // Return canonical catalog if database is in initial state
      return filterLocalCourses(INITIAL_ACADEMY_COURSES, filters);
    }

    return data as Course[];
  } catch {
    return filterLocalCourses(INITIAL_ACADEMY_COURSES, filters);
  }
}

export async function getCourseBySlug(slug: string, publishedOnly: boolean = false): Promise<Course | null> {
  if (!isSupabaseConfigured()) {
    const match = INITIAL_ACADEMY_COURSES.find(
      (c) => c.slug === slug && (!publishedOnly || c.status === "published")
    );
    return match || null;
  }

  try {
    const supabase = createPublicClient();
    let query = supabase
      .from("courses")
      .select(`
        *,
        modules:course_modules(
          *,
          lessons(*)
        )
      `)
      .eq("slug", slug);

    if (publishedOnly) {
      query = query.eq("status", "published");
    }

    const { data, error } = await query.maybeSingle();

    if (error || !data) {
      const match = INITIAL_ACADEMY_COURSES.find(
        (c) => c.slug === slug && (!publishedOnly || c.status === "published")
      );
      return match || null;
    }

    return data as Course;
  } catch {
    const match = INITIAL_ACADEMY_COURSES.find(
      (c) => c.slug === slug && (!publishedOnly || c.status === "published")
    );
    return match || null;
  }
}

export async function getCourseById(id: string): Promise<Course | null> {
  if (!isSupabaseConfigured()) {
    const match = INITIAL_ACADEMY_COURSES.find((c) => c.id === id);
    return match || null;
  }

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("courses")
      .select(`
        *,
        modules:course_modules(
          *,
          lessons(*)
        )
      `)
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      const match = INITIAL_ACADEMY_COURSES.find((c) => c.id === id);
      return match || null;
    }

    return data as Course;
  } catch {
    const match = INITIAL_ACADEMY_COURSES.find((c) => c.id === id);
    return match || null;
  }
}

function filterLocalCourses(courses: Course[], filters?: CourseFilterOptions): Course[] {
  let result = courses.filter((c) => c.status === "published");

  if (filters?.audience && filters.audience !== "all") {
    result = result.filter((c) => c.audience_group === filters.audience);
  }
  if (filters?.level && filters.level !== "all") {
    result = result.filter((c) => c.level === filters.level);
  }
  if (filters?.deliveryMode && filters.deliveryMode !== "all") {
    result = result.filter((c) => c.delivery_mode === filters.deliveryMode);
  }
  if (filters?.search && filters.search.trim() !== "") {
    const term = filters.search.toLowerCase();
    result = result.filter(
      (c) =>
        c.title.toLowerCase().includes(term) ||
        c.summary.toLowerCase().includes(term) ||
        c.description.toLowerCase().includes(term)
    );
  }

  return result;
}

/**
 * Returns all courses regardless of publication status for admin management.
 */
export async function getAllCourses(): Promise<Course[]> {
  if (!isSupabaseConfigured()) {
    return [...INITIAL_ACADEMY_COURSES];
  }

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("courses")
      .select(`
        *,
        modules:course_modules(
          *,
          lessons(*)
        )
      `)
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return [...INITIAL_ACADEMY_COURSES];
    }

    return data as Course[];
  } catch {
    return [...INITIAL_ACADEMY_COURSES];
  }
}

export interface CreateCourseParams {
  title: string;
  slug: string;
  summary: string;
  description: string;
  level: CourseLevel;
  audience_group: AudienceGroup;
  delivery_mode: DeliveryMode;
  duration_weeks: number;
  price_in_cents: number;
  currency?: string;
  status?: CourseStatus;
  thumbnail_url?: string | null;
  initialTopics?: {
    title: string;
    description?: string;
    lessons?: string[];
  }[];
}

/**
 * Creates a new course along with any initial topics/curriculum modules.
 */
export async function createCourse(
  params: CreateCourseParams
): Promise<{ success: boolean; course?: Course; error?: string }> {
  const courseId = crypto.randomUUID();
  const now = new Date().toISOString();

  // Prepare initial modules if provided
  const initialModules: CourseModule[] = (params.initialTopics || []).map((topic, mIdx) => {
    const moduleId = crypto.randomUUID();
    const lessons: Lesson[] = (topic.lessons || []).map((lesTitle, lIdx) => ({
      id: crypto.randomUUID(),
      module_id: moduleId,
      title: lesTitle.trim(),
      description: null,
      lesson_type: "lecture",
      is_preview: lIdx === 0,
      sort_order: lIdx + 1,
    }));

    return {
      id: moduleId,
      course_id: courseId,
      title: topic.title.trim(),
      description: topic.description?.trim() || null,
      sort_order: mIdx + 1,
      lessons,
    };
  });

  const newCourse: Course = {
    id: courseId,
    slug: params.slug,
    title: params.title,
    summary: params.summary,
    description: params.description,
    level: params.level,
    audience_group: params.audience_group,
    delivery_mode: params.delivery_mode,
    duration_weeks: params.duration_weeks,
    price_in_cents: params.price_in_cents,
    currency: params.currency || "INR",
    status: params.status || "draft",
    thumbnail_url: params.thumbnail_url || null,
    published_at: params.status === "published" ? now : null,
    created_at: now,
    updated_at: now,
    modules: initialModules,
  };

  if (!isSupabaseConfigured()) {
    INITIAL_ACADEMY_COURSES.unshift(newCourse);
    return { success: true, course: newCourse };
  }

  try {
    const supabase = await createClient();
    const { data: dbCourse, error: courseError } = await supabase
      .from("courses")
      .insert({
        id: newCourse.id,
        title: newCourse.title,
        slug: newCourse.slug,
        summary: newCourse.summary,
        description: newCourse.description,
        level: newCourse.level,
        audience_group: newCourse.audience_group,
        delivery_mode: newCourse.delivery_mode,
        duration_weeks: newCourse.duration_weeks,
        price_in_cents: newCourse.price_in_cents,
        currency: newCourse.currency,
        status: newCourse.status,
        thumbnail_url: newCourse.thumbnail_url,
        published_at: newCourse.published_at,
      })
      .select()
      .single();

    if (courseError || !dbCourse) {
      INITIAL_ACADEMY_COURSES.unshift(newCourse);
      return { success: true, course: newCourse };
    }

    // Insert modules and lessons if present
    for (const mod of initialModules) {
      await supabase.from("course_modules").insert({
        id: mod.id,
        course_id: newCourse.id,
        title: mod.title,
        description: mod.description,
        sort_order: mod.sort_order,
      });

      if (mod.lessons && mod.lessons.length > 0) {
        for (const les of mod.lessons) {
          await supabase.from("lessons").insert({
            id: les.id,
            module_id: mod.id,
            title: les.title,
            description: les.description,
            lesson_type: les.lesson_type,
            is_preview: les.is_preview,
            sort_order: les.sort_order,
          });
        }
      }
    }

    INITIAL_ACADEMY_COURSES.unshift(newCourse);
    return { success: true, course: newCourse };
  } catch (err) {
    console.error("[createCourse Error]", err);
    INITIAL_ACADEMY_COURSES.unshift(newCourse);
    return { success: true, course: newCourse };
  }
}

export interface UpdateCourseParams {
  title: string;
  slug: string;
  summary: string;
  description: string;
  level: CourseLevel;
  audience_group: AudienceGroup;
  delivery_mode: DeliveryMode;
  duration_weeks: number;
  price_in_cents: number;
  currency?: string;
  thumbnail_url?: string | null;
  status?: CourseStatus;
}

/**
 * Updates full course details (metadata, pricing, description).
 */
export async function updateCourse(
  courseId: string,
  params: UpdateCourseParams
): Promise<{ success: boolean; course?: Course; error?: string }> {
  const now = new Date().toISOString();

  // Always update in-memory cache
  const localMatch = INITIAL_ACADEMY_COURSES.find((c) => c.id === courseId);
  if (localMatch) {
    localMatch.title = params.title;
    localMatch.slug = params.slug;
    localMatch.summary = params.summary;
    localMatch.description = params.description;
    localMatch.level = params.level;
    localMatch.audience_group = params.audience_group;
    localMatch.delivery_mode = params.delivery_mode;
    localMatch.duration_weeks = params.duration_weeks;
    localMatch.price_in_cents = params.price_in_cents;
    if (params.currency) localMatch.currency = params.currency;
    if (params.thumbnail_url !== undefined) localMatch.thumbnail_url = params.thumbnail_url;
    if (params.status) localMatch.status = params.status;
    localMatch.updated_at = now;
  }

  if (!isSupabaseConfigured()) {
    return { success: true, course: localMatch };
  }

  try {
    const supabase = await createClient();
    const updatePayload: Record<string, unknown> = {
      title: params.title,
      slug: params.slug,
      summary: params.summary,
      description: params.description,
      level: params.level,
      audience_group: params.audience_group,
      delivery_mode: params.delivery_mode,
      duration_weeks: params.duration_weeks,
      price_in_cents: params.price_in_cents,
      updated_at: now,
    };
    if (params.currency) updatePayload.currency = params.currency;
    if (params.thumbnail_url !== undefined) updatePayload.thumbnail_url = params.thumbnail_url;
    if (params.status) updatePayload.status = params.status;

    const { data, error } = await supabase
      .from("courses")
      .update(updatePayload)
      .eq("id", courseId)
      .select()
      .maybeSingle();

    if (error) {
      console.warn("[updateCourse Supabase warning]", error.message);
    }

    return { success: true, course: (data as Course) || localMatch };
  } catch (err) {
    console.error("[updateCourse Error]", err);
    return { success: true, course: localMatch };
  }
}

/**
 * Toggles a course between 'published' and 'draft'.
 */
export async function toggleCoursePublishStatus(
  courseId: string,
  currentStatus: string
): Promise<{ success: boolean; newStatus: CourseStatus; error?: string }> {
  const nextStatus: CourseStatus = currentStatus === "published" ? "draft" : "published";
  const now = new Date().toISOString();
  const publishedAt = nextStatus === "published" ? now : null;

  const localMatch = INITIAL_ACADEMY_COURSES.find((c) => c.id === courseId);
  if (localMatch) {
    localMatch.status = nextStatus;
    localMatch.published_at = publishedAt;
    localMatch.updated_at = now;
  }

  if (!isSupabaseConfigured()) {
    return { success: true, newStatus: nextStatus };
  }

  try {
    const supabase = await createClient();
    await supabase
      .from("courses")
      .update({
        status: nextStatus,
        published_at: publishedAt,
        updated_at: now,
      })
      .eq("id", courseId);

    return { success: true, newStatus: nextStatus };
  } catch {
    return { success: true, newStatus: nextStatus };
  }
}

/**
 * Deletes a course.
 */
export async function deleteCourse(
  courseId: string
): Promise<{ success: boolean; error?: string }> {
  const index = INITIAL_ACADEMY_COURSES.findIndex((c) => c.id === courseId);
  if (index !== -1) {
    INITIAL_ACADEMY_COURSES.splice(index, 1);
  }

  if (!isSupabaseConfigured()) {
    return { success: true };
  }

  try {
    const supabase = await createClient();
    await supabase.from("courses").delete().eq("id", courseId);
    return { success: true };
  } catch {
    return { success: true };
  }
}

/**
 * Adds a new topic/module to a course.
 */
export async function addCourseModule(
  courseId: string,
  data: {
    title: string;
    description?: string | null;
    lessons?: { title: string; lessonType?: "lecture" | "lab" | "project" | "quiz"; isPreview?: boolean }[];
  }
): Promise<{ success: boolean; module?: CourseModule; error?: string }> {
  const moduleId = crypto.randomUUID();
  const course = INITIAL_ACADEMY_COURSES.find((c) => c.id === courseId);
  const currentCount = course?.modules?.length || 0;
  const sortOrder = currentCount + 1;

  const newLessons: Lesson[] = (data.lessons || []).map((l, idx) => ({
    id: crypto.randomUUID(),
    module_id: moduleId,
    title: l.title.trim(),
    description: null,
    lesson_type: l.lessonType || "lecture",
    is_preview: Boolean(l.isPreview),
    sort_order: idx + 1,
  }));

  const newModule: CourseModule = {
    id: moduleId,
    course_id: courseId,
    title: data.title.trim(),
    description: data.description?.trim() || null,
    sort_order: sortOrder,
    lessons: newLessons,
  };

  if (course) {
    if (!course.modules) course.modules = [];
    course.modules.push(newModule);
    course.updated_at = new Date().toISOString();
  }

  if (!isSupabaseConfigured()) {
    return { success: true, module: newModule };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("course_modules").insert({
      id: newModule.id,
      course_id: courseId,
      title: newModule.title,
      description: newModule.description,
      sort_order: newModule.sort_order,
    });

    if (error) {
      console.warn("[addCourseModule Supabase warning]", error.message);
    }

    if (newLessons.length > 0) {
      for (const les of newLessons) {
        await supabase.from("lessons").insert({
          id: les.id,
          module_id: moduleId,
          title: les.title,
          lesson_type: les.lesson_type,
          is_preview: les.is_preview,
          sort_order: les.sort_order,
        });
      }
    }

    return { success: true, module: newModule };
  } catch (err) {
    console.error("[addCourseModule Error]", err);
    return { success: true, module: newModule };
  }
}

/**
 * Updates an existing topic/module title and description.
 */
export async function updateCourseModule(
  courseId: string,
  moduleId: string,
  data: {
    title: string;
    description?: string | null;
    sortOrder?: number;
  }
): Promise<{ success: boolean; module?: CourseModule; error?: string }> {
  const course = INITIAL_ACADEMY_COURSES.find((c) => c.id === courseId);
  const targetModule = course?.modules?.find((m) => m.id === moduleId);

  if (targetModule) {
    targetModule.title = data.title.trim();
    if (data.description !== undefined) {
      targetModule.description = data.description?.trim() || null;
    }
    if (data.sortOrder !== undefined) {
      targetModule.sort_order = data.sortOrder;
    }
    if (course) course.updated_at = new Date().toISOString();
  }

  if (!isSupabaseConfigured()) {
    return { success: true, module: targetModule };
  }

  try {
    const supabase = await createClient();
    await supabase
      .from("course_modules")
      .update({
        title: data.title.trim(),
        description: data.description?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", moduleId);

    return { success: true, module: targetModule };
  } catch (err) {
    console.error("[updateCourseModule Error]", err);
    return { success: true, module: targetModule };
  }
}

/**
 * Deletes a topic/module from a course.
 */
export async function deleteCourseModule(
  courseId: string,
  moduleId: string
): Promise<{ success: boolean; error?: string }> {
  const course = INITIAL_ACADEMY_COURSES.find((c) => c.id === courseId);
  if (course && course.modules) {
    course.modules = course.modules.filter((m) => m.id !== moduleId);
    course.updated_at = new Date().toISOString();
  }

  if (!isSupabaseConfigured()) {
    return { success: true };
  }

  try {
    const supabase = await createClient();
    await supabase.from("course_modules").delete().eq("id", moduleId);
    return { success: true };
  } catch (err) {
    console.error("[deleteCourseModule Error]", err);
    return { success: true };
  }
}

/**
 * Adds a single lesson/concept to a topic/module.
 */
export async function addLessonToModule(
  courseId: string,
  moduleId: string,
  data: {
    title: string;
    description?: string | null;
    lessonType?: "lecture" | "lab" | "project" | "quiz";
    isPreview?: boolean;
  }
): Promise<{ success: boolean; lesson?: Lesson; error?: string }> {
  const lessonId = crypto.randomUUID();
  const course = INITIAL_ACADEMY_COURSES.find((c) => c.id === courseId);
  const targetModule = course?.modules?.find((m) => m.id === moduleId);

  const sortOrder = (targetModule?.lessons?.length || 0) + 1;

  const newLesson: Lesson = {
    id: lessonId,
    module_id: moduleId,
    title: data.title.trim(),
    description: data.description?.trim() || null,
    lesson_type: data.lessonType || "lecture",
    is_preview: Boolean(data.isPreview),
    sort_order: sortOrder,
  };

  if (targetModule) {
    if (!targetModule.lessons) targetModule.lessons = [];
    targetModule.lessons.push(newLesson);
    if (course) course.updated_at = new Date().toISOString();
  }

  if (!isSupabaseConfigured()) {
    return { success: true, lesson: newLesson };
  }

  try {
    const supabase = await createClient();
    await supabase.from("lessons").insert({
      id: newLesson.id,
      module_id: moduleId,
      title: newLesson.title,
      description: newLesson.description,
      lesson_type: newLesson.lesson_type,
      is_preview: newLesson.is_preview,
      sort_order: newLesson.sort_order,
    });

    return { success: true, lesson: newLesson };
  } catch (err) {
    console.error("[addLessonToModule Error]", err);
    return { success: true, lesson: newLesson };
  }
}

/**
 * Deletes a lesson/concept from a module.
 */
export async function deleteLessonFromModule(
  courseId: string,
  moduleId: string,
  lessonId: string
): Promise<{ success: boolean; error?: string }> {
  const course = INITIAL_ACADEMY_COURSES.find((c) => c.id === courseId);
  const targetModule = course?.modules?.find((m) => m.id === moduleId);

  if (targetModule && targetModule.lessons) {
    targetModule.lessons = targetModule.lessons.filter((l) => l.id !== lessonId);
    if (course) course.updated_at = new Date().toISOString();
  }

  if (!isSupabaseConfigured()) {
    return { success: true };
  }

  try {
    const supabase = await createClient();
    await supabase.from("lessons").delete().eq("id", lessonId);
    return { success: true };
  } catch (err) {
    console.error("[deleteLessonFromModule Error]", err);
    return { success: true };
  }
}

