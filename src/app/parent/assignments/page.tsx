import React from "react";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  ShieldAlert,
} from "lucide-react";
import { requireRole } from "@/server/services/authService";
import { getActiveChildrenForGuardian } from "@/server/services/guardianService";
import { getStudentAssignments } from "@/server/services/studentService";
import { ParentChildSelector } from "@/components/forms/ParentChildSelector";
import { LinkStudentModal } from "@/components/forms/LinkStudentModal";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Assignments & Assessments Monitoring — Syntaxora Guardian",
  description: "Monitor your enrolled student's published assignments, project due dates, submission status, and evaluated scores.",
};

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ParentAssignmentsPage({ searchParams }: Props) {
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
          <BookOpen className="h-7 w-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-[#142541]">No Active Student Connected</h2>
          <p className="text-xs text-[#5F6F84] max-w-sm mx-auto leading-relaxed">
            Link your child using their unique student code to monitor course assignments, project submissions, and due dates.
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

  const assignments = await getStudentAssignments(activeRel.student_id);

  const submittedCount = assignments.filter((a) => a.submission).length;
  const gradedCount = assignments.filter((a) => a.submission?.status === "graded").length;
  const pendingCount = assignments.length - submittedCount;

  return (
    <div className="space-y-8">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#5F6F84] mb-1">
            <span>Parent Portal</span>
            <span>/</span>
            <span className="font-semibold text-[#142541]">Assignments & Assessments</span>
          </div>
          <h1 className="text-2xl font-black text-[#142541] tracking-tight">
            Assignments: {studentName}
          </h1>
          <p className="text-xs text-[#5F6F84] mt-0.5">
            Student Code: <strong className="font-mono text-[#3869AD]">{studentCode}</strong> • Coursework tracking, submission deadlines, and published assessment scores.
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
        </div>
      </div>

      {/* Security Invariant Notice: Submission Protection */}
      <div className="rounded-2xl border border-[#3869AD]/20 bg-[#E8EFF8]/40 p-4.5 text-xs text-[#3869AD] flex items-start gap-3">
        <ShieldAlert className="h-5 w-5 text-[#3869AD] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-[#142541] block">Guardian Oversight Boundary</strong>
          <p className="leading-relaxed text-[#263449] text-[11px]">
            To ensure academic integrity, assignment submissions and laboratory code uploads must be executed directly by the enrolled student through their learner workspace. Guardians may monitor submission status, deadlines, and released grading rubrics.
          </p>
        </div>
      </div>

      {/* 3 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#DCE4EE] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#5F6F84] text-xs font-semibold">
            <span>Published Assignments</span>
            <BookOpen className="h-4 w-4 text-[#3869AD]" />
          </div>
          <div className="text-3xl font-black text-[#142541]">{assignments.length}</div>
          <p className="text-[11px] text-[#5F6F84]">Curriculum coursework items</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#DCE4EE] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#5F6F84] text-xs font-semibold">
            <span>Submitted Coursework</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-700">{submittedCount}</div>
          <p className="text-[11px] text-[#5F6F84]">
            {gradedCount} evaluated & graded
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#DCE4EE] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#5F6F84] text-xs font-semibold">
            <span>Awaiting Submission</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-3xl font-black text-amber-700">{pendingCount}</div>
          <p className="text-[11px] text-[#5F6F84]">Pending student upload</p>
        </div>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#142541]">
            Coursework & Laboratory Projects ({assignments.length})
          </h3>
          <Link
            href={`/parent/progress?childId=${activeRel.student_id}`}
            className="text-xs font-semibold text-[#3869AD] hover:underline"
          >
            View Evaluation Rubrics &rarr;
          </Link>
        </div>

        {assignments.length > 0 ? (
          <div className="space-y-4">
            {(() => {
              const currentTimestamp = Date.now();
              return assignments.map((asn) => {
                const sub = asn.submission;
                const isGraded = sub?.status === "graded";
                const isSubmitted = Boolean(sub);
                const dueDate = new Date(asn.due_at);
                const isOverdue = !isSubmitted && dueDate.getTime() < currentTimestamp;

                return (
                  <div
                    key={asn.id}
                    className="rounded-3xl border border-[#DCE4EE] bg-white p-6 shadow-xs space-y-4 hover:shadow-sm transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-[#F0F4F8]">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-[#3869AD] bg-[#E8EFF8] px-2 py-0.5 rounded">
                          {asn.course?.title || "AI Course"}
                        </span>
                        <Badge
                          variant={
                            isGraded
                              ? "success"
                              : isSubmitted
                              ? "teal"
                              : isOverdue
                              ? "error"
                              : "warning"
                          }
                        >
                          {isGraded
                            ? "EVALUATED"
                            : isSubmitted
                            ? "SUBMITTED"
                            : isOverdue
                            ? "OVERDUE"
                            : "PENDING"}
                        </Badge>
                      </div>
                      <h4 className="text-base font-bold text-[#142541]">{asn.title}</h4>
                      <p className="text-xs text-[#5F6F84] leading-relaxed max-w-2xl">
                        {asn.description}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-[11px] text-[#5F6F84]">Maximum Score</div>
                      <div className="text-lg font-black text-[#142541]">
                        {asn.max_score} pts
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#5F6F84] pt-1">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#93A5C2] block">
                        Submission Deadline
                      </span>
                      <strong className={isOverdue ? "text-rose-700" : "text-[#142541]"}>
                        {dueDate.toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </strong>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#93A5C2] block">
                        Student Status
                      </span>
                      <strong className="text-[#142541]">
                        {sub
                          ? `Submitted on ${new Date(sub.submitted_at).toLocaleDateString()}`
                          : "Not yet submitted"}
                      </strong>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#93A5C2] block">
                        Score Awarded
                      </span>
                      {sub?.is_grade_published && sub?.score !== null ? (
                        <strong className="text-emerald-700 font-bold">
                          {sub.score} / {asn.max_score} pts
                        </strong>
                      ) : sub ? (
                        <span className="text-[#5F6F84] italic">Under faculty review</span>
                      ) : (
                        <span className="text-[#5F6F84]">—</span>
                      )}
                    </div>
                  </div>

                  {sub?.feedback && sub.is_grade_published && (
                    <div className="p-3.5 rounded-2xl bg-[#E8EFF8]/40 border border-[#3869AD]/20 text-xs text-[#142541] space-y-1">
                      <span className="text-[10px] font-bold uppercase text-[#3869AD] block">
                        Faculty Feedback
                      </span>
                      <p className="italic leading-relaxed">&ldquo;{sub.feedback}&rdquo;</p>
                    </div>
                  )}
                </div>
              );
            });
            })()}
          </div>
        ) : (
          <div className="rounded-3xl border border-[#DCE4EE] bg-white p-12 text-center space-y-3 shadow-xs">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-[#E8EFF8] text-[#3869AD] flex items-center justify-center">
              <BookOpen className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-[#142541]">No Coursework Published Yet</h4>
              <p className="text-xs text-[#5F6F84] max-w-sm mx-auto leading-relaxed">
                Assignments and hands-on laboratory projects will appear here as instructors publish them throughout the academic term.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

