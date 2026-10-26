import React from "react";
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  FileCode2,
  AlertTriangle,
  Award,
} from "lucide-react";
import { requireRole } from "@/server/services/authService";
import {
  getStudentByProfileId,
  getStudentAssignments,
} from "@/server/services/studentService";
import { SubmitAssignmentModal } from "@/components/forms/SubmitAssignmentModal";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Assignments & Labs — Syntaxora",
  description: "View project requirements, upload solutions, and inspect faculty evaluation feedback.",
};

export default async function StudentAssignmentsPage() {
  const auth = await requireRole(["student", "admin"]);
  const student = await getStudentByProfileId(auth.userId);

  const assignments = student ? await getStudentAssignments(student.id) : [];

  const pendingCount = assignments.filter((a) => !a.submission).length;
  const submittedCount = assignments.filter(
    (a) => a.submission && (!a.submission.status || a.submission.status === "submitted")
  ).length;
  const gradedCount = assignments.filter(
    (a) => a.submission?.status === "graded" && a.submission.is_grade_published
  ).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#142541]/5 text-[#3869AD] text-xs font-bold mb-2">
            <ClipboardList className="h-3.5 w-3.5" />
            <span>Deliverables & Benchmarks</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142541] tracking-tight">
            Assignments & Laboratory Projects
          </h1>
          <p className="text-xs sm:text-sm text-[#5F6F84] mt-1 max-w-2xl">
            Submit your algorithmic models, code repositories, and laboratory deliverables for instructor evaluation and peer benchmarking.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-[#DCE4EE] bg-white shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-[#5F6F84] uppercase tracking-wider">
              Pending Submissions
            </CardTitle>
            <div className="h-8 w-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-[#142541]">{pendingCount}</div>
            <p className="text-[11px] text-amber-700 font-semibold mt-1">
              {pendingCount === 0 ? "All assignments submitted!" : "Action required this week"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#DCE4EE] bg-white shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-[#5F6F84] uppercase tracking-wider">
              Under Faculty Review
            </CardTitle>
            <div className="h-8 w-8 rounded-xl bg-blue-50 text-[#3869AD] flex items-center justify-center">
              <ClipboardList className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-[#142541]">{submittedCount}</div>
            <p className="text-[11px] text-[#5F6F84] mt-1">Awaiting mentor audit & scoring</p>
          </CardContent>
        </Card>

        <Card className="border-[#DCE4EE] bg-white shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-[#5F6F84] uppercase tracking-wider">
              Evaluated & Published
            </CardTitle>
            <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-emerald-700">{gradedCount}</div>
            <p className="text-[11px] text-[#5F6F84] mt-1">Scores available in Released Grades</p>
          </CardContent>
        </Card>
      </div>

      {/* Deliverables Table */}
      <div className="rounded-2xl border border-[#DCE4EE] bg-white overflow-hidden shadow-sm">
        <div className="p-5 border-b border-[#DCE4EE] bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#142541]">
              Active Project Deliverables ({assignments.length})
            </h3>
            <p className="text-[11px] text-[#5F6F84] mt-0.5">
              Paste GitHub repository URL or solution code in the submission form
            </p>
          </div>
          <span className="text-[11px] text-[#5F6F84]">
            Evaluations appear in Released Grades after faculty review
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#DCE4EE] bg-[#F8FAFC]/50 text-[#142541] font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-4">Deliverable Title & Objective</th>
                <th className="p-4">Course Track</th>
                <th className="p-4">Due Date</th>
                <th className="p-4">Max Points</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Submission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE4EE] text-[#263449]">
              {assignments.map((asn) => {
                const sub = asn.submission;
                const isGraded = sub?.status === "graded" && sub.is_grade_published;

                return (
                  <tr key={asn.id} className="hover:bg-[#F8FAFC]/80 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-sm text-[#142541] flex items-center gap-2">
                        <FileCode2 className="h-4 w-4 text-[#3869AD] shrink-0" />
                        <span>{asn.title}</span>
                      </div>
                      <div className="text-[11px] text-[#5F6F84] line-clamp-2 max-w-md mt-1 pl-6 leading-relaxed">
                        {asn.description}
                      </div>
                    </td>
                    <td className="p-4 text-[#5F6F84] whitespace-nowrap">
                      {asn.course?.title || "Applied AI Track"}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="font-bold text-[#142541]">
                        {new Date(asn.due_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="text-[10px] text-[#5F6F84]">
                        23:59 IST Standard
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap font-mono font-bold text-[#142541]">
                      {asn.max_score} pts
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {isGraded ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[11px]">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          <span>Graded ({sub.score}/{asn.max_score})</span>
                        </div>
                      ) : sub ? (
                        <Badge variant="teal" className="text-[11px] font-bold">
                          Submitted (In Review)
                        </Badge>
                      ) : (
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[11px]">
                          <AlertTriangle className="h-3 w-3 text-amber-600" />
                          <span>Pending Submission</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <SubmitAssignmentModal
                        assignmentId={asn.id}
                        assignmentTitle={asn.title}
                        maxScore={asn.max_score}
                        existingContent={sub?.content}
                      />
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
