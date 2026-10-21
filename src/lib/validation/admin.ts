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
  priceInDollars: z.coerce.number().min(0, "Price must be non-negative"),
});

export const attendanceCorrectionSchema = z.object({
  attendanceId: z.string().uuid("Valid attendance record ID required"),
  newStatus: z.enum(["present", "absent", "late", "excused"]),
  correctionReason: z.string().min(5, "A reason of at least 5 characters is mandatory for audit trail"),
});
