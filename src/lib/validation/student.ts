import { z } from "zod";

// Validates either standard RFC 4122 UUID or canonical repository entity IDs (e.g. l1000000-..., asn-1000000-...)
// Strictly rejects arbitrary strings like "not-a-uuid"
const entityIdSchema = z.string().refine(
  (val) => {
    if (!val || typeof val !== "string") return false;
    // Standard RFC UUID
    const isStandardUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);
    if (isStandardUuid) return true;
    // Canonical prefixed or hybrid UUIDs used in LMS fixtures
    const isLmsEntityId = /^([a-z]{1,4}-)?[a-z0-9]{7,8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}$/i.test(val);
    return isLmsEntityId;
  },
  { message: "Invalid ID format" }
);

export const submitAssignmentSchema = z.object({
  assignmentId: entityIdSchema,
  content: z.string().min(5, "Submission content must be at least 5 characters").max(5000),
  attachmentUrl: z.string().url("Invalid attachment URL").optional().or(z.literal("")),
});

export type SubmitAssignmentInput = z.infer<typeof submitAssignmentSchema>;

export const markLessonCompleteSchema = z.object({
  lessonId: entityIdSchema,
});

export type MarkLessonCompleteInput = z.infer<typeof markLessonCompleteSchema>;

