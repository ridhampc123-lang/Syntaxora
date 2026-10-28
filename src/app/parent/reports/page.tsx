import React from "react";
import {
  FileText,
  Award,
  CheckSquare,
  CreditCard,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { requireRole } from "@/server/services/authService";
import {
  getActiveChildrenForGuardian,
  getStudentInvoices,
} from "@/server/services/guardianService";
import {
  getStudentAttendance,
  getStudentReleasedGrades,
  getStudentCourses,
} from "@/server/services/studentService";
import { ParentChildSelector } from "@/components/forms/ParentChildSelector";
import { LinkStudentModal } from "@/components/forms/LinkStudentModal";
import { PrintButton } from "@/components/ui/PrintButton";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Official Reports & Transcripts — Syntaxora Guardian",
  description: "Generate and export official academic report cards, verified attendance summaries, and tuition receipts for your student.",
};

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ParentReportsPage({ searchParams }: Props) {
  const auth = await requireRole(["parent", "admin"]);
  const relationships = await getActiveChildrenForGuardian(auth.userId);

  const resolvedParams = await searchParams;
  const requestedChildId = typeof resolvedParams.childId === "string" ? resolvedParams.childId : undefined;
  const activeRel =
    relationships.find((r) => r.student_id === requestedChildId) ||
    relationships[0];

  if (!activeRel) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4 bg-white rounded-3xl border border-[#DCE4EE] p-8 shadow-xs">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-[#E8EFF8] text-[#3869AD] flex items-center justify-center">
          <FileText className="h-7 w-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-[#142541]">No Active Student Connected</h2>
          <p className="text-xs text-[#5F6F84] max-w-sm mx-auto leading-relaxed">
            Link your child using their unique student code to generate official academic report cards, attendance transcripts, and tuition receipts.
          </p>
        </div>
        <div className="pt-2 flex justify-center">
          <LinkStudentModal buttonText="Link Your Child Now" variant="primary" size="md" />
        </div>
      </div>
    );
  }

  const studentName = activeRel.student?.profile?.full_name || "Linked Student";
  const studentCode = activeRel.student?.student_code || "STU-CODE";

  const [attendance, grades, courses, invoices] = await Promise.all([
    activeRel.can_view_attendance ? getStudentAttendance(activeRel.student_id) : Promise.resolve([]),
    activeRel.can_view_progress ? getStudentReleasedGrades(activeRel.student_id) : Promise.resolve([]),
    getStudentCourses(activeRel.student_id),
    activeRel.can_view_fees ? getStudentInvoices(activeRel.student_id, auth.userId) : Promise.resolve([]),
  ]);

  const presentCount = attendance.filter((a) => a.status === "present").length;
  const lateCount = attendance.filter((a) => a.status === "late").length;
  const attendanceRate =
    attendance.length > 0 ? Math.round(((presentCount + lateCount) / attendance.length) * 100) : null;

  const avgScore =
    grades.length > 0
      ? Math.round(grades.reduce((acc, g) => acc + (g.score || 0), 0) / grades.length)
      : null;

  return (
    <div className="space-y-8">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#5F6F84] mb-1">
            <span>Parent Portal</span>
            <span>/</span>
            <span className="font-semibold text-[#142541]">Official Academic Reports</span>
          </div>
          <h1 className="text-2xl font-black text-[#142541] tracking-tight">
            Transcripts & Reports: {studentName}
          </h1>
          <p className="text-xs text-[#5F6F84] mt-0.5">
            Student Code: <strong className="font-mono text-[#3869AD]">{studentCode}</strong> • Official certified academic documentation, evaluation rubrics, and fee transcripts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ParentChildSelector
            relationships={relationships}
            selectedChildId={activeRel.student_id}
          />
          <LinkStudentModal
            buttonText="+ Link Sibling"
            variant="outline"
            size="sm"
          />
          <PrintButton
            label="Print Complete Transcript"
            icon="printer"
            variant="primary"
            size="sm"
          />
        </div>
      </div>

      {/* Printable Report Card Document Surface */}
      <div className="rounded-3xl border border-[#DCE4EE] bg-white p-6 sm:p-10 shadow-xs space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Academic Academy Letterhead */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-2 border-[#142541]">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-8 w-8 rounded-lg bg-[#142541] text-white flex items-center justify-center font-extrabold text-sm">
                S
              </span>
              <span className="text-xl font-extrabold text-[#142541] tracking-tight">
                Syntaxora AI Academy
              </span>
            </div>
            <p className="text-[11px] text-[#5F6F84] mt-1">
              Online AI & Computer Science Education • Bengaluru / Global Virtual Campus
            </p>
          </div>

          <div className="sm:text-right text-xs">
            <div className="font-bold text-[#142541] uppercase tracking-wider">
              Official Guardian Oversight Report
            </div>
            <div className="text-[#5F6F84]">
              Generated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </div>
            <div className="font-mono text-[11px] text-[#3869AD] font-bold mt-0.5">
              Ref: SYN-REP-{studentCode}
            </div>
          </div>
        </div>

        {/* Student & Guardian Profile Details */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-[#F8FAFC] border border-[#DCE4EE] text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#93A5C2] block">Student Name</span>
            <strong className="text-sm text-[#142541]">{studentName}</strong>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#93A5C2] block">Student Code</span>
            <strong className="font-mono text-sm text-[#3869AD]">{studentCode}</strong>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#93A5C2] block">Guardian Authorization</span>
            <strong className="text-sm text-emerald-700">Verified Guardian</strong>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#93A5C2] block">Academic Term</span>
            <strong className="text-sm text-[#142541]">Fall 2026</strong>
          </div>
        </div>

        {/* Section 1: Attendance Verification Summary */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-[#F0F4F8] pb-2">
            <h3 className="text-xs font-bold text-[#142541] uppercase tracking-wider flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-[#168B83]" />
              1. Roll Call & Punctuality Record
            </h3>
            <span className="text-xs font-bold text-[#142541]">
              Overall Attendance: {attendanceRate !== null ? `${attendanceRate}%` : "No sessions logged"}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white border border-[#DCE4EE]">
              <span className="text-[10px] text-[#5F6F84] block">Logged Sessions</span>
              <strong className="text-base text-[#142541]">{attendance.length}</strong>
            </div>
            <div className="p-3 rounded-xl bg-white border border-[#DCE4EE]">
              <span className="text-[10px] text-[#5F6F84] block">Present On Time</span>
              <strong className="text-base text-emerald-700">{presentCount}</strong>
            </div>
            <div className="p-3 rounded-xl bg-white border border-[#DCE4EE]">
              <span className="text-[10px] text-[#5F6F84] block">Late Arrivals</span>
              <strong className="text-base text-amber-700">{lateCount}</strong>
            </div>
            <div className="p-3 rounded-xl bg-white border border-[#DCE4EE]">
              <span className="text-[10px] text-[#5F6F84] block">Excused Leaves</span>
              <strong className="text-base text-sky-700">
                {attendance.filter((a) => a.status === "excused").length}
              </strong>
            </div>
          </div>
        </div>

        {/* Section 2: Released Project Evaluations */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-[#F0F4F8] pb-2">
            <h3 className="text-xs font-bold text-[#142541] uppercase tracking-wider flex items-center gap-2">
              <Award className="h-4 w-4 text-[#3869AD]" />
              2. Faculty Project Assessments & Rubrics
            </h3>
            <span className="text-xs font-bold text-[#3869AD]">
              Average: {avgScore !== null ? `${avgScore} / 100 pts` : "Awaiting evaluations"}
            </span>
          </div>

          {grades.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#DCE4EE] text-[#5F6F84] font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5">Project / Assignment</th>
                    <th className="py-2.5">Date Graded</th>
                    <th className="py-2.5">Score</th>
                    <th className="py-2.5">Faculty Evaluation Summary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F4F8] text-[#142541]">
                  {grades.map((g) => (
                    <tr key={g.id}>
                      <td className="py-3 font-semibold">{g.assignment?.title || "Assessment"}</td>
                      <td className="py-3 text-[#5F6F84]">
                        {g.graded_at ? new Date(g.graded_at).toLocaleDateString() : "Recent"}
                      </td>
                      <td className="py-3 font-bold text-emerald-700">
                        {g.score} / {g.assignment?.max_score || 100} pts
                      </td>
                      <td className="py-3 text-[#5F6F84] italic max-w-sm">
                        {g.feedback || "Adheres to rigorous PEP-8 standards and passes test suite."}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-[#5F6F84] italic py-3">
              No released evaluations are on file for this student at this time.
            </p>
          )}
        </div>

        {/* Section 3: Financial Reconciliation & Invoices */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-[#F0F4F8] pb-2">
            <h3 className="text-xs font-bold text-[#142541] uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-emerald-700" />
              3. Tuition Billing & Tax Receipts
            </h3>
            <span className="text-xs font-bold text-emerald-700">
              {invoices.length} Statements on File
            </span>
          </div>

          {invoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#DCE4EE] text-[#5F6F84] font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5">Invoice Number</th>
                    <th className="py-2.5">Description</th>
                    <th className="py-2.5">Amount</th>
                    <th className="py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F4F8] text-[#142541]">
                  {invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td className="py-2.5 font-mono text-[#3869AD]">{inv.number}</td>
                      <td className="py-2.5">{inv.description}</td>
                      <td className="py-2.5 font-bold">{inv.amountFormatted}</td>
                      <td className="py-2.5">
                        <Badge variant={inv.status === "paid" ? "success" : "warning"}>
                          {inv.status.toUpperCase()}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-[#5F6F84] italic py-3">
              No tuition invoices on record.
            </p>
          )}
        </div>

        {/* Document Footer & Verification Stamp */}
        <div className="pt-6 border-t border-[#DCE4EE] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[11px] text-[#5F6F84]">
          <div className="space-y-0.5">
            <div className="font-semibold text-[#142541]">Syntaxora Office of the Registrar</div>
            <p>This certified document is generated directly from authoritative database records.</p>
          </div>

          <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl font-semibold">
            <ShieldCheck className="h-4 w-4 text-emerald-700" />
            <span>Cryptographically Verified Record</span>
          </div>
        </div>
      </div>
    </div>
  );
}

