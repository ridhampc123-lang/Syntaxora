import React from "react";
import { getApprovedInstructors } from "@/server/services/instructorService";
import { AdminInstructorsManager } from "@/components/dashboards/admin/AdminInstructorsManager";

export const metadata = {
  title: "Faculty Roster & Workload — Syntaxora Admin",
  description: "Manage academy instructors, course assignments, and teaching responsibilities.",
};

export default async function AdminInstructorsPage() {
  const instructors = await getApprovedInstructors();

  return <AdminInstructorsManager initialInstructors={instructors} />;
}

