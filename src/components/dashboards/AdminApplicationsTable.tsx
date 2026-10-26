"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Eye } from "lucide-react";
import { StudentApplication, ApplicationStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ApplicationReviewModal } from "@/components/forms/ApplicationReviewModal";
import type { DuplicateDetectionResult } from "@/server/services/applicationService";

interface Props {
  applications: StudentApplication[];
  duplicateMap: Record<string, DuplicateDetectionResult>;
}

export function AdminApplicationsTable({ applications, duplicateMap }: Props) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedApp, setSelectedApp] = useState<StudentApplication | null>(null);

  const filtered = applications.filter((app) => {
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      app.full_name.toLowerCase().includes(q) ||
      app.email.toLowerCase().includes(q) ||
      app.application_reference.toLowerCase().includes(q) ||
      (app.course_title && app.course_title.toLowerCase().includes(q));

    return matchesStatus && matchesSearch;
  });

  const counts = {
    all: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    under_review: applications.filter((a) => a.status === "under_review").length,
    approved: applications.filter((a) => a.status === "approved").length,
    needs_information: applications.filter((a) => a.status === "needs_information").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case "approved":
        return <Badge variant="teal">Approved</Badge>;
      case "rejected":
        return <Badge variant="error">Rejected</Badge>;
      case "under_review":
        return <Badge variant="primary">Under Review</Badge>;
      case "needs_information":
        return <Badge variant="outline">Needs Info</Badge>;
      case "pending":
      default:
        return <Badge variant="warning">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Status Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#F3F6FA] border border-[#DCE4EE]">
          {[
            { id: "all", label: "All", count: counts.all },
            { id: "pending", label: "Pending", count: counts.pending },
            { id: "under_review", label: "Under Review", count: counts.under_review },
            { id: "needs_information", label: "Needs Info", count: counts.needs_information },
            { id: "approved", label: "Approved", count: counts.approved },
            { id: "rejected", label: "Rejected", count: counts.rejected },
          ].map((tab) => {
            const isSelected = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-white text-[#142541] shadow-xs"
                    : "text-[#5F6F84] hover:text-[#142541]"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? "bg-[#E8EFF8] text-[#3869AD]" : "bg-[#DCE4EE]/70 text-[#5F6F84]"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#5F6F84]" />
          <input
            type="text"
            placeholder="Search applicant or ref..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-[#DCE4EE] bg-white pl-9 pr-3 py-1.5 text-xs text-[#142541] focus:border-[#3869AD] focus:outline-none focus:ring-1 focus:ring-[#3869AD]"
          />
        </div>
      </div>

      {/* Applications Table */}
      <div className="rounded-xl border border-[#DCE4EE] bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#DCE4EE] bg-[#F3F6FA] text-[#142541] font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">Reference</th>
                <th className="p-3.5">Applicant Details</th>
                <th className="p-3.5">Education / Track</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Submitted</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE4EE] text-[#263449]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-xs text-[#5F6F84]">
                    No student applications match the selected filter.
                  </td>
                </tr>
              ) : (
                filtered.map((app) => {
                  const dups = duplicateMap[app.id] || {
                    hasDuplicates: false,
                    matchingApplications: [],
                    matchingStudents: [],
                  };

                  return (
                    <tr key={app.id} className="hover:bg-[#F3F6FA]/50 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-[#3869AD]">
                        <div className="flex items-center gap-1.5">
                          <span>{app.application_reference}</span>
                          {dups.hasDuplicates && (
                            <span
                              title="Potential duplicate detected"
                              className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"
                            />
                          )}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-semibold text-[#142541]">{app.full_name}</div>
                        <div className="text-[#5F6F84] text-[11px]">{app.email}</div>
                        {app.phone && <div className="text-[#5F6F84] text-[11px]">{app.phone}</div>}
                      </td>

                      <td className="p-3.5">
                        <div className="font-medium text-[#142541]">
                          {app.course_title || app.course?.title || "General Cohort"}
                        </div>
                        <div className="text-[11px] text-[#5F6F84]">{app.education_level}</div>
                      </td>

                      <td className="p-3.5">
                        <div className="flex flex-col gap-1 items-start">
                          {getStatusBadge(app.status)}
                          {(app.student_code || app.student?.student_code) && (
                            <span
                              title="Permanent Student Code"
                              className="font-mono text-[10px] font-bold text-[#3869AD] bg-[#E8EFF8] px-1.5 py-0.5 rounded"
                            >
                              {app.student_code || app.student?.student_code}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-3.5 text-[#5F6F84] text-[11px]">
                        {new Date(app.created_at).toLocaleDateString()}
                      </td>

                      <td className="p-3.5 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedApp(app)}
                          className="h-7 text-xs font-medium"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Review
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Dialog */}
      {selectedApp && (
        <ApplicationReviewModal
          application={selectedApp}
          duplicates={
            duplicateMap[selectedApp.id] || {
              hasDuplicates: false,
              matchingApplications: [],
              matchingStudents: [],
            }
          }
          isOpen={true}
          onClose={() => setSelectedApp(null)}
          onSuccess={() => {
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
