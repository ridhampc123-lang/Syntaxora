import { z } from "zod";

export const createBatchSchema = z.object({
  courseId: z.string().uuid("A valid course ID is required"),
  name: z.string().min(3, "Batch name must be at least 3 characters").max(100),
  batchCode: z.string().min(3, "Batch code must be at least 3 characters").max(30).regex(/^[A-Z0-9_-]+$/i, "Batch code can only contain letters, numbers, hyphens, and underscores"),
  primaryInstructorId: z.string().uuid("A valid primary instructor must be selected"),
  capacity: z.coerce.number().int().min(1, "Capacity must be at least 1 student").max(200, "Maximum batch capacity is 200"),
  startAt: z.string().refine((val) => !isNaN(Date.parse(val)), "Valid start date is required"),
  endAt: z.string().refine((val) => !isNaN(Date.parse(val)), "Valid end date is required"),
  timezone: z.string().min(2, "Timezone is required").default("Asia/Kolkata"),
  waitlistEnabled: z.boolean().default(false),
  waitlistCapacity: z.coerce.number().int().min(0).default(0),
}).refine(
  (data) => new Date(data.endAt) > new Date(data.startAt),
  {
    message: "End date must be strictly after start date",
    path: ["endAt"],
  }
);

export const updateBatchSchema = z.object({
  batchId: z.string().uuid("A valid batch ID is required"),
  name: z.string().min(3).max(100).optional(),
  status: z.enum(["draft", "upcoming", "active", "paused", "completed", "cancelled"]).optional(),
  capacity: z.coerce.number().int().min(1).max(200).optional(),
  primaryInstructorId: z.string().uuid().optional(),
  waitlistEnabled: z.boolean().optional(),
  waitlistCapacity: z.coerce.number().int().min(0).optional(),
});

export const assignStudentSchema = z.object({
  studentId: z.string().uuid("A valid student ID is required"),
  courseId: z.string().uuid("A valid course ID is required"),
  batchId: z.string().uuid("A valid batch ID is required").optional().nullable(),
  admissionSource: z.string().default("direct_admission"),
  paymentStatus: z.string().default("verified"),
});

export const transferBatchSchema = z.object({
  enrollmentId: z.string().uuid("A valid enrollment ID is required"),
  destinationBatchId: z.string().uuid("A destination batch must be selected"),
  reason: z.string().min(5, "A transfer reason is required for audit compliance"),
});

export const createScheduleTemplateSchema = z.object({
  batchId: z.string().uuid("A valid batch ID is required"),
  weekday: z.coerce.number().int().min(0).max(6),
  startTimeLocal: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/, "Valid start time (HH:MM) required"),
  endTimeLocal: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/, "Valid end time (HH:MM) required"),
  timezone: z.string().default("Asia/Kolkata"),
  effectiveStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Effective start date (YYYY-MM-DD) required"),
  effectiveEndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Effective end date (YYYY-MM-DD) required"),
  instructorProfileId: z.string().uuid().optional().nullable(),
}).refine(
  (data) => data.endTimeLocal > data.startTimeLocal,
  {
    message: "End time must be after start time",
    path: ["endTimeLocal"],
  }
);

export const startClassSchema = z.object({
  sessionId: z.string().uuid("A valid class session ID is required"),
});
