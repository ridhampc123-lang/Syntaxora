import { z } from "zod";

export const createStudentSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Valid email required"),
  dateOfBirth: z.string().optional().or(z.literal("")),
  emergencyPhone: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export const createCourseSchema = z.object({
  title: z.string().min(3, "Course title must be at least 3 characters"),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and dashes"),
  summary: z.string().min(10, "Summary must be at least 10 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  level: z.enum(["beginner", "intermediate", "advanced", "all_levels"]),
  audienceGroup: z.enum(["young_learners", "teens", "college_students", "adults"]),
  deliveryMode: z.enum(["live_online", "self_paced", "hybrid"]),
  durationWeeks: z.coerce.number().int().positive("Duration must be a positive integer"),
  priceInDollars: z.coerce.number().min(0, "Price must be non-negative").default(0),
  priceInRupees: z.coerce.number().min(0, "Price must be non-negative").optional(),
  initialTopicsJson: z.string().optional().or(z.literal("")),
});

export const updateCourseDetailsSchema = z.object({
  courseId: z.string().min(1, "Course ID required"),
  title: z.string().min(3, "Course title must be at least 3 characters"),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and dashes"),
  summary: z.string().min(10, "Summary must be at least 10 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  level: z.enum(["beginner", "intermediate", "advanced", "all_levels"]),
  audienceGroup: z.enum(["young_learners", "teens", "college_students", "adults"]),
  deliveryMode: z.enum(["live_online", "self_paced", "hybrid"]),
  durationWeeks: z.coerce.number().int().positive("Duration must be a positive integer"),
  priceInDollars: z.coerce.number().min(0, "Price must be non-negative").default(0),
  priceInRupees: z.coerce.number().min(0, "Price must be non-negative").optional(),
  status: z.enum(["draft", "published"]).optional(),
});

export const addCourseModuleSchema = z.object({
  courseId: z.string().min(1, "Course ID required"),
  title: z.string().min(2, "Topic title must be at least 2 characters"),
  description: z.string().optional().or(z.literal("")),
  lessonsRaw: z.string().optional().or(z.literal("")),
});

export const updateCourseModuleSchema = z.object({
  courseId: z.string().min(1, "Course ID required"),
  moduleId: z.string().min(1, "Module ID required"),
  title: z.string().min(2, "Topic title must be at least 2 characters"),
  description: z.string().optional().or(z.literal("")),
});

export const addLessonSchema = z.object({
  courseId: z.string().min(1, "Course ID required"),
  moduleId: z.string().min(1, "Module ID required"),
  title: z.string().min(2, "Lesson title must be at least 2 characters"),
  lessonType: z.enum(["lecture", "lab", "project", "quiz"]).default("lecture"),
  description: z.string().optional().or(z.literal("")),
  isPreview: z.coerce.boolean().default(false),
});


export const attendanceCorrectionSchema = z.object({
  attendanceId: z.string().uuid("Valid attendance record ID required"),
  newStatus: z.enum(["present", "absent", "late", "excused"]),
  correctionReason: z.string().min(5, "A reason of at least 5 characters is mandatory for audit trail"),
});

export const createInstructorSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Valid email required"),
  title: z.string().min(2, "Title must be at least 2 characters"),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  specialties: z.string().optional().or(z.literal("")),
  avatarUrl: z.string().optional().or(z.literal("")),
});

export const updateInstructorSchema = z.object({
  instructorId: z.string().min(1, "Instructor ID required"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Valid email required"),
  title: z.string().min(2, "Title must be at least 2 characters"),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  specialties: z.string().optional().or(z.literal("")),
  avatarUrl: z.string().optional().or(z.literal("")),
});
