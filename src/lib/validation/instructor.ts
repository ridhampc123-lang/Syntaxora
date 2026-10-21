import { z } from "zod";

export const createSessionSchema = z
  .object({
    courseId: z.string().uuid("Invalid course ID"),
    title: z.string().min(3, "Title must be at least 3 characters").max(200),
    description: z.string().max(1000).optional(),
    startsAt: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid start datetime"),
    endsAt: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid end datetime"),
    meetingProvider: z.enum(["live_webrtc", "zoom", "google_meet"]).default("live_webrtc"),
    meetingUrl: z.string().url("Invalid meeting URL").optional().or(z.literal("")),
  })
  .refine(
    (data) => new Date(data.endsAt).getTime() > new Date(data.startsAt).getTime(),
    {
      message: "End time must be chronologically after start time",
      path: ["endsAt"],
    }
  );

export type CreateSessionInput = z.infer<typeof createSessionSchema>;

export const recordAttendanceSchema = z.object({
  sessionId: z.string().uuid("Invalid session ID"),
  studentId: z.string().uuid("Invalid student ID"),
  status: z.enum(["present", "absent", "late", "excused"]),
  correctionReason: z.string().max(500).optional(),
});

export type RecordAttendanceInput = z.infer<typeof recordAttendanceSchema>;

export const createAssignmentSchema = z.object({
  courseId: z.string().uuid("Invalid course ID"),
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().min(10, "Description must be at least 10 characters"),
  dueAt: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid due datetime"),
  maxScore: z.number().int().min(1).max(1000).default(100),
});

export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;

export const gradeSubmissionSchema = z.object({
  submissionId: z.string().uuid("Invalid submission ID"),
  score: z.number().min(0, "Score cannot be negative"),
  feedback: z.string().min(2, "Feedback must be at least 2 characters").max(2000),
  isGradePublished: z.boolean().default(false),
});

export type GradeSubmissionInput = z.infer<typeof gradeSubmissionSchema>;

export const toggleGradePublicationSchema = z.object({
  submissionId: z.string().uuid("Invalid submission ID"),
  isGradePublished: z.boolean(),
});

export type ToggleGradePublicationInput = z.infer<typeof toggleGradePublicationSchema>;
