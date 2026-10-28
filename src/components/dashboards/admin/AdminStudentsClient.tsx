"use client";

import React, { useState, useTransition } from "react";
import {
  GraduationCap,
  Search,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  X,
  ExternalLink,
  Shield,
  BookOpen,
  Calendar,
  AlertCircle,
  Loader2,
  Users,
} from "lucide-react";
import { Student, Batch, Course } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { CreateStudentForm } from "@/components/forms/CreateStudentForm";
import { AssignStudentModal } from "@/components/forms/AssignStudentModal";
import { updateStudentStatusAction } from "@/server/actions/admin";

interface AdminStudentsClientProps {
  initialStudents: Student[];
  courses: Course[];
  batches: Batch[];
}

export function AdminStudentsClient({
  initialStudents,
  courses,
  batches,
}: AdminStudentsClientProps) {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filter students based on search and status
  const filteredStudents = students.filter((s) => {
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      s.student_code.toLowerCase().includes(q) ||
      (s.profile?.full_name && s.profile.full_name.toLowerCase().includes(q)) ||
      (s.profile?.email && s.profile.email.toLowerCase().includes(q)) ||
      (s.emergency_contact_phone && s.emergency_contact_phone.includes(q)) ||
      (s.notes && s.notes.toLowerCase().includes(q));

    return matchesStatus && matchesSearch;
  });

  const counts = {
    all: students.length,
    active: students.filter((s) => s.status === "active").length,
    pending: students.filter((s) => s.status === "pending").length,
    paused: students.filter((s) => s.status === "paused").length,
    archived: students.filter((s) => s.status === "archived").length,
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleStatusChange = (newStatus: string) => {
    if (!selectedStudent) return;
    setActionMessage(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.append("studentId", selectedStudent.id);
      formData.append("status", newStatus);

      const res = await updateStudentStatusAction(formData);
      if (res.success) {
        setStudents((prev) =>
          prev.map((s) =>
            s.id === selectedStudent.id ? { ...s, status: newStatus as any } : s
          )
        );
        setSelectedStudent((prev) => prev ? { ...prev, status: newStatus as any } : null);
        setActionMessage({ type: "success", text: res.message });
      } else {
        setActionMessage({ type: "error", text: res.message });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Creation Drawer Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#142541] tracking-tight">
            Canonical <span className="text-gradient-ai">AI Student</span> Directory
          </h2>
          <p className="text-xs text-[#5F6F84] mt-0.5">
            Every enrolled student possesses a single authoritative academy record, unique student code, and assigned cohorts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={showCreateForm ? "outline" : "ai"}
            size="sm"
            onClick={() => setShowCreateForm(!showCreateForm)}
            className={showCreateForm ? "" : "font-bold shadow-xs"}
          >
            <GraduationCap className="h-4 w-4 mr-1.5" />
            <span>{showCreateForm ? "Close Form" : "Enroll New Student"}</span>
            {showCreateForm ? (
              <ChevronUp className="h-3.5 w-3.5 ml-1" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 ml-1" />
            )}
          </Button>
        </div>
      </div>

      {/* Creation Drawer / Card */}
      {showCreateForm && (
        <div className="rounded-xl border border-[#DCE4EE] bg-white p-6 shadow-md space-y-4 animate-fade-in-up">
          <div className="flex items-center justify-between pb-3 border-b border-[#DCE4EE]">
            <h3 className="text-sm font-bold text-[#142541] uppercase tracking-wider flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-[#3869AD]" />
              Manual Student Enrollment Form
            </h3>
            <button
              onClick={() => setShowCreateForm(false)}
              className="text-[#5F6F84] hover:text-[#142541]"
              aria-label="Close form"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <CreateStudentForm />
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#F3F6FA] border border-[#DCE4EE]">
          {[
            { id: "all", label: "All", count: counts.all },
            { id: "active", label: "Active", count: counts.active },
            { id: "pending", label: "Pending", count: counts.pending },
            { id: "paused", label: "Paused", count: counts.paused },
            { id: "archived", label: "Archived", count: counts.archived },
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
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#5F6F84]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student code, name, email, or emergency contact..."
            className="w-full pl-9 pr-8 py-2 rounded-xl border border-[#DCE4EE] bg-white text-xs text-[#142541] placeholder-[#5F6F84] focus:outline-none focus:ring-2 focus:ring-[#3869AD]"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5F6F84] hover:text-[#142541]"
              aria-label="Clear search"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Student Roster Table */}
      <div className="rounded-xl border border-[#DCE4EE] bg-white overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#DCE4EE] bg-[#F3F6FA] text-xs font-semibold text-[#142541] flex items-center justify-between">
          <span>Authoritative Academy Directory ({filteredStudents.length} of {students.length})</span>
          <span className="text-[11px] text-[#5F6F84]">
            Enforces strict per-student authentication & guardian relationship isolation
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#DCE4EE] text-[#142541] font-semibold uppercase tracking-wider text-[11px] bg-[#F3F6FA]/50">
              <tr>
                <th className="p-3.5">Student Code</th>
                <th className="p-3.5">Student Name</th>
                <th className="p-3.5">Account / Email</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Emergency Contact</th>
                <th className="p-3.5">Registered</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE4EE] text-[#263449]">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-[#5F6F84]">
                    <GraduationCap className="h-8 w-8 text-[#5F6F84]/40 mx-auto mb-2" />
                    <p className="font-semibold text-sm text-[#142541]">No student records match</p>
                    <p className="text-xs text-[#5F6F84] mt-0.5">
                      {search ? "Try adjusting your search criteria" : "Click 'Enroll New Student' to register an academy learner."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const studentName = student.profile?.full_name || "Unattached Profile";
                  const studentEmail = student.profile?.email || "No account attached";

                  return (
                    <tr key={student.id} className="hover:bg-[#F3F6FA]/50 transition-colors">
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 font-mono font-bold text-[#3869AD] bg-[#E8EFF8] px-2 py-0.5 rounded-md">
                          <span>{student.student_code}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(student.student_code)}
                            className="text-[#3869AD] hover:text-[#142541] p-0.5"
                            title="Copy student code"
                          >
                            {copiedCode === student.student_code ? (
                              <Check className="h-3 w-3 text-emerald-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="p-3.5 font-bold text-[#142541]">
                        {studentName}
                      </td>
                      <td className="p-3.5 text-[#5F6F84]">
                        {studentEmail}
                      </td>
                      <td className="p-3.5">
                        <Badge
                          variant={
                            student.status === "active"
                              ? "success"
                              : student.status === "pending"
                              ? "warning"
                              : student.status === "paused"
                              ? "teal"
                              : "secondary"
                          }
                        >
                          {student.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-[#5F6F84]">
                        {student.emergency_contact_phone || "—"}
                      </td>
                      <td className="p-3.5 text-[#5F6F84] whitespace-nowrap">
                        {formatDate(student.created_at)}
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap space-x-2">
                        <AssignStudentModal
                          students={students}
                          courses={courses}
                          batches={batches}
                          preselectedStudentId={student.id}
                          triggerButtonText="Assign Cohort"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedStudent(student)}
                        >
                          Details &rarr;
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

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#142541]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedStudent(null)}
        >
          <div
            className="bg-white rounded-2xl border border-[#DCE4EE] p-6 max-w-lg w-full space-y-5 shadow-2xl animate-fade-in-up my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE4EE]">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-xl bg-[#E8EFF8] text-[#3869AD] flex items-center justify-center">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#142541]">
                    {selectedStudent.profile?.full_name || "Student Record"}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-xs font-bold text-[#3869AD] bg-[#E8EFF8] px-1.5 py-0.2 rounded">
                      {selectedStudent.student_code}
                    </span>
                    <Badge variant={selectedStudent.status === "active" ? "success" : "warning"}>
                      {selectedStudent.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1 rounded-lg text-[#5F6F84] hover:bg-[#F3F6FA] transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {actionMessage && (
              <div
                className={`p-3 rounded-lg text-xs font-semibold ${
                  actionMessage.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {actionMessage.text}
              </div>
            )}

            {/* Profile Fields */}
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#F3F6FA] border border-[#DCE4EE]">
                <div>
                  <span className="text-[#5F6F84] block text-[11px]">Account Email</span>
                  <span className="font-bold text-[#142541] truncate block">
                    {selectedStudent.profile?.email || "No account attached"}
                  </span>
                </div>
                <div>
                  <span className="text-[#5F6F84] block text-[11px]">Emergency Phone</span>
                  <span className="font-bold text-[#142541] block">
                    {selectedStudent.emergency_contact_phone || "Not recorded"}
                  </span>
                </div>
                <div>
                  <span className="text-[#5F6F84] block text-[11px]">Date of Birth</span>
                  <span className="font-medium text-[#142541] block">
                    {selectedStudent.date_of_birth ? formatDate(selectedStudent.date_of_birth) : "Not specified"}
                  </span>
                </div>
                <div>
                  <span className="text-[#5F6F84] block text-[11px]">Registered Date</span>
                  <span className="font-medium text-[#142541] block">
                    {formatDate(selectedStudent.created_at)}
                  </span>
                </div>
              </div>

              {selectedStudent.notes && (
                <div className="p-3 rounded-xl bg-[#FAF8F3] border border-[#DCE4EE]">
                  <span className="text-[11px] font-bold text-[#142541] block mb-0.5">Admissions / Academic Notes:</span>
                  <p className="text-[#5F6F84] text-[11px] leading-relaxed">
                    {selectedStudent.notes}
                  </p>
                </div>
              )}

              {/* Status Controls */}
              <div className="space-y-2 pt-2 border-t border-[#DCE4EE]">
                <label className="font-bold text-[#142541] text-xs block">
                  Update Account Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {["active", "pending", "paused", "archived"].map((st) => (
                    <Button
                      key={st}
                      type="button"
                      variant={selectedStudent.status === st ? "primary" : "outline"}
                      size="sm"
                      disabled={isPending || selectedStudent.status === st}
                      onClick={() => handleStatusChange(st)}
                      className="capitalize text-xs"
                    >
                      {isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                      Mark {st}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="pt-3 border-t border-[#DCE4EE] flex items-center justify-between">
                <AssignStudentModal
                  students={students}
                  courses={courses}
                  batches={batches}
                  preselectedStudentId={selectedStudent.id}
                  triggerButtonText="Assign to Cohort Batch"
                />

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedStudent(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

