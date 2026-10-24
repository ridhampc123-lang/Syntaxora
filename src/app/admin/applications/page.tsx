import React from "react";
import Link from "next/link";
import { ArrowLeft, PlusCircle } from "lucide-react";
import { requireRole } from "@/server/services/authService";
import {
  listApplications,
  detectApplicationDuplicates,
  type DuplicateDetectionResult,
} from "@/server/services/applicationService";
import { AdminApplicationsTable } from "@/components/dashboards/AdminApplicationsTable";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Student Applications — Admin Portal | Syntaxora",
  description: "Review, evaluate, and approve prospective student admission applications.",
};

export default async function AdminApplicationsPage() {
  await requireRole(["admin"]);

  const { applications } = await listApplications({ limit: 100 });

  // Pre-compute duplicate detection for all displayed applications
  const duplicatePairs = await Promise.all(
    applications.map(async (app) => {
      const dups = await detectApplicationDuplicates(app);
      return [app.id, dups] as [string, DuplicateDetectionResult];
    })
  );

  const duplicateMap = Object.fromEntries(duplicatePairs);

  return (
    <div className="space-y-8">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#5F6F84] mb-1">
            <Link href="/admin" className="hover:text-[#3869AD] flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" />
              <span>Admin Overview</span>
            </Link>
            <span>/</span>
            <span className="font-semibold text-[#142541]">Admissions Review</span>
          </div>

          <h2 className="text-2xl font-extrabold text-[#142541] tracking-tight">
            Student Admissions Applications
          </h2>
          <p className="text-xs text-[#5F6F84] mt-0.5">
            Evaluate prospective academy applicants, detect duplicate records, and issue audited admission decisions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/apply" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">
              <PlusCircle className="h-4 w-4 mr-1.5" />
              View Public Form
            </Button>
          </Link>
        </div>
      </div>

      {/* Applications Table */}
      <AdminApplicationsTable
        applications={applications}
        duplicateMap={duplicateMap}
      />
    </div>
  );
}
