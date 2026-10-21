import { z } from "zod";

export const createGuardianInvitationSchema = z.object({
  studentId: z.string().uuid("Invalid student record ID"),
  intendedGuardianEmail: z
    .string()
    .trim()
    .email("A valid email address is required for the intended guardian")
    .transform((e) => e.toLowerCase()),
  relationshipType: z.enum(["parent", "legal_guardian", "other_authorized_guardian"], {
    message: "Valid relationship type is required",
  }),
  canViewAttendance: z.boolean().default(true),
  canViewProgress: z.boolean().default(true),
  canViewSchedule: z.boolean().default(true),
  canViewFees: z.boolean().default(true),
  canReceiveNotifications: z.boolean().default(true),
});

export type CreateGuardianInvitationInput = z.infer<typeof createGuardianInvitationSchema>;

export const redeemGuardianInvitationSchema = z.object({
  token: z
    .string()
    .min(32, "Invalid or malformed invitation token")
    .transform((t) => t.trim()),
});

export type RedeemGuardianInvitationInput = z.infer<typeof redeemGuardianInvitationSchema>;

export const updateGuardianPermissionsSchema = z.object({
  relationshipId: z.string().uuid("Invalid relationship ID"),
  canViewAttendance: z.boolean(),
  canViewProgress: z.boolean(),
  canViewSchedule: z.boolean(),
  canViewFees: z.boolean(),
  canReceiveNotifications: z.boolean(),
});

export type UpdateGuardianPermissionsInput = z.infer<typeof updateGuardianPermissionsSchema>;

export const revokeGuardianRelationshipSchema = z.object({
  relationshipId: z.string().uuid("Invalid relationship ID"),
  revocationReason: z
    .string()
    .min(5, "Revocation reason must be at least 5 characters for compliance audit trail")
    .max(500, "Reason is too long"),
});

export type RevokeGuardianRelationshipInput = z.infer<typeof revokeGuardianRelationshipSchema>;
