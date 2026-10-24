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

export const requestStudentLinkSchema = z.object({
  studentCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^STU-[0-9A-F]{8}$/, "Student code must be in the format STU-XXXXXXXX (8 uppercase characters)"),
  relationshipType: z.enum(["parent", "legal_guardian", "other_authorized_guardian"]).default("parent"),
});

export type RequestStudentLinkInput = z.infer<typeof requestStudentLinkSchema>;

export const adminApproveRelationshipSchema = z.object({
  relationshipId: z.string().uuid("Invalid relationship ID"),
  canViewAttendance: z.boolean().default(true),
  canViewProgress: z.boolean().default(true),
  canViewSchedule: z.boolean().default(true),
  canViewFees: z.boolean().default(true),
  canReceiveNotifications: z.boolean().default(true),
  verificationMethod: z.string().min(3, "Verification method is required").default("admin_verified_code_request"),
});

export type AdminApproveRelationshipInput = z.infer<typeof adminApproveRelationshipSchema>;

export const adminRejectRelationshipSchema = z.object({
  relationshipId: z.string().uuid("Invalid relationship ID"),
  rejectionReason: z.string().min(3, "Rejection reason must be at least 3 characters").max(500),
});

export type AdminRejectRelationshipInput = z.infer<typeof adminRejectRelationshipSchema>;

export const adminDirectConnectSchema = z.object({
  guardianEmail: z.string().email("Valid parent account email is required").transform((e) => e.toLowerCase().trim()),
  studentCode: z.string().trim().toUpperCase().regex(/^STU-[0-9A-F]{8}$/, "Invalid student code format"),
  relationshipType: z.enum(["parent", "legal_guardian", "other_authorized_guardian"]).default("parent"),
  canViewAttendance: z.boolean().default(true),
  canViewProgress: z.boolean().default(true),
  canViewSchedule: z.boolean().default(true),
  canViewFees: z.boolean().default(true),
  canReceiveNotifications: z.boolean().default(true),
  verificationMethod: z.string().min(3, "Verification method required").default("admin_assisted_connection"),
});

export type AdminDirectConnectInput = z.infer<typeof adminDirectConnectSchema>;
