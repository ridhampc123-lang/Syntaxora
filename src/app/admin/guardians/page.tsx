import React from "react";
import { Badge } from "@/components/ui/badge";
import { getAdminStudents } from "@/server/services/adminService";
import {
  IN_MEMORY_RELATIONSHIPS,
  IN_MEMORY_INVITATIONS,
} from "@/server/services/guardianService";
import { CreateGuardianInvitationModal } from "@/components/forms/CreateGuardianInvitationModal";
import { CreateDirectRelationshipModal } from "@/components/forms/CreateDirectRelationshipModal";
import { PendingGuardianRequestsTable } from "@/components/dashboards/PendingGuardianRequestsTable";
import { RevokeRelationshipModal } from "@/components/forms/RevokeRelationshipModal";
import { createClient } from "@/lib/supabase/server";
import { GuardianStudentRelationship, GuardianInvitation } from "@/types";

export const metadata = {
  title: "Guardian Verification & Oversight — Syntaxora Admin",
  description: "Verify, activate, and manage guardian-student relationship permission boundaries.",
};

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
      key &&
      !url.includes("placeholder") &&
      !url.includes("example.supabase.co") &&
      !key.includes("placeholder")
  );
}

async function getAdminRelationships(): Promise<GuardianStudentRelationship[]> {
  if (!isSupabaseConfigured()) {
    return IN_MEMORY_RELATIONSHIPS;
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("guardian_student_relationships").select(`
      *,
      student:students (
        id,
        student_code,
        status,
        profile:profiles (
          full_name,
          email
        )
      ),
      guardian:profiles!guardian_student_relationships_guardian_profile_id_fkey (
        id,
        full_name,
        email
      )
    `);

    if (error || !data) {
      return IN_MEMORY_RELATIONSHIPS;
    }
    return data as unknown as GuardianStudentRelationship[];
  } catch {
    return IN_MEMORY_RELATIONSHIPS;
  }
}

async function getAdminPendingInvitations(): Promise<GuardianInvitation[]> {
  if (!isSupabaseConfigured()) {
    return IN_MEMORY_INVITATIONS.filter((i) => i.status === "pending");
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("guardian_invitations")
      .select(`
        *,
        student:students (
          id,
          student_code,
          profile:profiles (
            full_name
          )
        )
      `)
      .eq("status", "pending");

    if (error || !data) {
      return IN_MEMORY_INVITATIONS.filter((i) => i.status === "pending");
    }
    return data as unknown as GuardianInvitation[];
  } catch {
    return IN_MEMORY_INVITATIONS.filter((i) => i.status === "pending");
  }
}

export default async function AdminGuardiansPage() {
  const [students, allRelationships, pendingInvitations] = await Promise.all([
    getAdminStudents(),
    getAdminRelationships(),
    getAdminPendingInvitations(),
  ]);

  const pendingRequests = allRelationships.filter((r) => r.status === "pending");
  const verifiedOrHistorical = allRelationships.filter((r) => r.status !== "pending");

  return (
    <div className="space-y-8">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#142541] tracking-tight">
            Guardian–Student Authorization Boundary
          </h2>
          <p className="text-xs text-[#5F6F84] mt-0.5">
            Explicit, verified guardian relationships. Never matched from names or email similarities.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CreateDirectRelationshipModal students={students} />
          <CreateGuardianInvitationModal students={students} />
        </div>
      </div>

      {/* Pending Parent Link Requests (Submitted via Student Code) */}
      <PendingGuardianRequestsTable pendingRequests={pendingRequests} />

      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-amber-200 bg-amber-100/50 flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              Pending Single-Use Invitations ({pendingInvitations.length})
            </span>
            <span className="text-[11px] text-amber-700 font-medium">
              Awaiting Guardian Verification & Redemption
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-amber-200 text-amber-900 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5">Intended Guardian Email</th>
                  <th className="p-3.5">Target Student</th>
                  <th className="p-3.5">Relationship</th>
                  <th className="p-3.5">Expires</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-200 text-[#263449]">
                {pendingInvitations.map((inv) => (
                  <tr key={inv.id} className="hover:bg-amber-100/30 transition-colors">
                    <td className="p-3.5 font-medium text-[#142541]">
                      {inv.intended_guardian_email}
                    </td>
                    <td className="p-3.5">
                      {inv.student?.profile?.full_name || "Enrolled Student"}{" "}
                      <span className="text-[#3869AD] font-mono text-[11px]">
                        ({inv.student?.student_code})
                      </span>
                    </td>
                    <td className="p-3.5 capitalize text-[#5F6F84]">
                      {inv.relationship_type.replace("_", " ")}
                    </td>
                    <td className="p-3.5 text-[#5F6F84]">
                      {new Date(inv.expires_at).toLocaleDateString()}
                    </td>
                    <td className="p-3.5">
                      <Badge variant="warning">pending</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Active Verified Relationships */}
      <div className="rounded-xl border border-[#DCE4EE] bg-white overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#DCE4EE] bg-[#F3F6FA] text-xs font-semibold text-[#142541] flex items-center justify-between">
          <span>Active & Historical Guardian Relationships ({verifiedOrHistorical.length})</span>
          <span className="text-[11px] text-[#5F6F84]">
            Enforced by PostgreSQL Row Level Security (RLS)
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#DCE4EE] text-[#142541] font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">Guardian</th>
                <th className="p-3.5">Linked Student</th>
                <th className="p-3.5">Student Code</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Permissions Granted</th>
                <th className="p-3.5">Verification</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE4EE] text-[#263449]">
              {verifiedOrHistorical.map((rel) => {
                const guardianName = rel.guardian?.full_name || "Authorized Guardian";
                const guardianEmail = rel.guardian?.email || "—";
                const studentName = rel.student?.profile?.full_name || "Academy Learner";
                const studentCode = rel.student?.student_code || "STU-CODE";

                return (
                  <tr key={rel.id} className="hover:bg-[#F3F6FA]/50 transition-colors">
                    <td className="p-3.5">
                      <div className="font-medium text-[#142541]">{guardianName}</div>
                      <div className="text-[11px] text-[#5F6F84]">{guardianEmail}</div>
                    </td>
                    <td className="p-3.5 font-medium text-[#142541]">
                      {studentName}
                    </td>
                    <td className="p-3.5 font-mono text-[#3869AD]">
                      {studentCode}
                    </td>
                    <td className="p-3.5">
                      {rel.status === "active" ? (
                        <Badge variant="success">active</Badge>
                      ) : (
                        <Badge variant="error">{rel.status}</Badge>
                      )}
                    </td>
                    <td className="p-3.5">
                      <div className="flex flex-wrap gap-1">
                        {rel.can_view_attendance && <Badge variant="teal">Attendance</Badge>}
                        {rel.can_view_progress && <Badge variant="primary">Progress</Badge>}
                        {rel.can_view_schedule && <Badge variant="outline">Schedule</Badge>}
                        {rel.can_view_fees && <Badge variant="navy">Fees</Badge>}
                      </div>
                    </td>
                    <td className="p-3.5 text-[#5F6F84] whitespace-nowrap text-[11px]">
                      <div>{rel.verification_method || "admin_verified"}</div>
                      {rel.verified_at && (
                        <div className="text-[10px] text-[#5F6F84]">
                          {new Date(rel.verified_at).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      {rel.status === "active" && (
                        <RevokeRelationshipModal
                          relationshipId={rel.id}
                          guardianName={guardianName}
                          studentName={studentName}
                        />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
