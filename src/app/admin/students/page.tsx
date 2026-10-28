import React from "react";
import { getAdminStudents } from "@/server/services/adminService";
import { getAllCourses } from "@/server/services/courseService";
import { getBatches } from "@/server/services/batchService";
import { AdminStudentsClient } from "@/components/dashboards/admin/AdminStudentsClient";

export const metadata = {
  title: "Student Roster Management — Syntaxora Admin",
  description: "Canonical student record management, code generation, and status controls.",
};

interface StudentsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminStudentsPage({ searchParams }: StudentsPageProps) {
  const resolvedParams = await searchParams;
  const search = typeof resolvedParams.q === "string" ? resolvedParams.q : "";
  const status = typeof resolvedParams.status === "string" ? resolvedParams.status : undefined;

  const [students, courses, batches] = await Promise.all([
    getAdminStudents(search, status),
    getAllCourses(),
    getBatches(),
  ]);

  return (
    <AdminStudentsClient
      initialStudents={students}
      courses={courses}
      batches={batches}
    />
  );
}
