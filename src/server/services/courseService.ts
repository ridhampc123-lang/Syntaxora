import { createPublicClient } from "@/lib/supabase/public";
import { Course } from "@/types";

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
    title: "Applied AI & Python Robotics for Teens",
    summary: "Hands-on machine learning, computer vision, and Python programming designed specifically for students ages 12 to 17.",
    description: "In this comprehensive course, teen learners transition from coding syntax to building real AI applications. Starting with Python foundations, students implement image recognition models using OpenCV, train neural networks to classify objects, and deploy intelligent agents on edge hardware.",
    level: "beginner",
    audience_group: "teens",
    delivery_mode: "live_online",
    duration_weeks: 10,
    price_in_cents: 29900,
    currency: "USD",
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
    price_in_cents: 24900,
    currency: "USD",
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
    price_in_cents: 49900,
    currency: "USD",
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
    price_in_cents: 39900,
    currency: "USD",
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

export async function getCourseBySlug(slug: string): Promise<Course | null> {
  if (!isSupabaseConfigured()) {
    const match = INITIAL_ACADEMY_COURSES.find((c) => c.slug === slug);
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
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (error || !data) {
      const match = INITIAL_ACADEMY_COURSES.find((c) => c.slug === slug);
      return match || null;
    }

    return data as Course;
  } catch {
    const match = INITIAL_ACADEMY_COURSES.find((c) => c.slug === slug);
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
