import { z } from "zod";

export const submitAssignmentSchema = z.object({
  assignmentId: z.string().uuid("Invalid assignment ID"),
  content: z.string().min(5, "Submission content must be at least 5 characters").max(5000),
  attachmentUrl: z.string().url("Invalid attachment URL").optional().or(z.literal("")),
});

export type SubmitAssignmentInput = z.infer<typeof submitAssignmentSchema>;

export const markLessonCompleteSchema = z.object({
  lessonId: z.string().uuid("Invalid lesson ID"),
});

export type MarkLessonCompleteInput = z.infer<typeof markLessonCompleteSchema>;
