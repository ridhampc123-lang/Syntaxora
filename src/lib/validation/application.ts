import { z } from "zod";

export const EDUCATION_LEVELS = [
  "Primary / Elementary (Ages 7–11)",
  "Middle School (Ages 12–14)",
  "High School / Secondary (Ages 15–18)",
  "Undergraduate / University Student",
  "Working Professional / Adult Learner",
] as const;

export const studentApplicationSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must not exceed 100 characters"),
  email: z
    .string()
    .trim()
    .email("Please provide a valid email address")
    .toLowerCase(),
  phone: z
    .string()
    .trim()
    .max(25, "Phone number must not exceed 25 characters")
    .optional()
    .or(z.literal("")),
  dateOfBirth: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date of birth must be YYYY-MM-DD")
    .optional()
    .or(z.literal("")),
  courseId: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),
  educationLevel: z
    .string()
    .trim()
    .min(1, "Please select your current education level"),
  guardianName: z
    .string()
    .trim()
    .max(100, "Guardian name must not exceed 100 characters")
    .optional()
    .or(z.literal("")),
  guardianEmail: z
    .string()
    .trim()
    .email("Please provide a valid guardian email address")
    .toLowerCase()
    .optional()
    .or(z.literal("")),
  guardianPhone: z
    .string()
    .trim()
    .max(25, "Guardian phone must not exceed 25 characters")
    .optional()
    .or(z.literal("")),
  statementOfInterest: z
    .string()
    .trim()
    .max(1000, "Statement must not exceed 1,000 characters")
    .optional()
    .or(z.literal("")),
  consent: z
    .boolean()
    .refine((val) => val === true, "You must agree to the academy admissions terms"),
});

export type StudentApplicationInput = z.infer<typeof studentApplicationSchema>;

export const applicationReviewSchema = z.object({
  applicationId: z.string().min(1, "Invalid application ID"),
  decision: z.enum(["approved", "rejected", "needs_information", "under_review"]),
  decisionReason: z.string().trim().max(500, "Reason must not exceed 500 characters").optional(),
  adminNotes: z.string().trim().max(1000, "Notes must not exceed 1,000 characters").optional(),
});

export type ApplicationReviewInput = z.infer<typeof applicationReviewSchema>;
