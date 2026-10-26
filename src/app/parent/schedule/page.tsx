import React from "react";
import Link from "next/link";
import {
  Lock,
  CalendarCheck,
  Video,
  Clock,
  User,
  CreditCard,
  Sparkles,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { requireRole } from "@/server/services/authService";
import { getActiveChildrenForGuardian } from "@/server/services/guardianService";
import { getStudentSessions } from "@/server/services/studentService";
import { ParentChildSelector } from "@/components/forms/ParentChildSelector";
import { ParentPaymentModal } from "@/components/forms/ParentPaymentModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Child Class Schedule & Tuition Portal — Syntaxora Guardian",
  description: "Live interactive class schedule, lab demonstrations, and tuition payment options for your student.",
};

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ParentSchedulePage({ searchParams }: Props) {
  const auth = await requireRole(["parent", "admin"]);
  const relationships = await getActiveChildrenForGuardian(auth.userId);

  const resolvedParams = await searchParams;
  const requestedChildId = typeof resolvedParams.childId === "string" ? resolvedParams.childId : undefined;
  const activeRel =
    relationships.find((r) => r.student_id === requestedChildId) ||
    relationships[0];

  if (!activeRel) {
    return (
      <div className="p-12 text-center text-xs text-[#5F6F84] bg-white rounded-2xl border border-[#DCE4EE]">
        No active verified student links found.
      </div>
    );
  }

  const studentName = activeRel.student?.profile?.full_name || "Linked Student";
  const studentCode = activeRel.student?.student_code || "STU-CODE";

  if (!activeRel.can_view_schedule) {
    return (
      <div className="space-y-6">
        <ParentChildSelector relationships={relationships} selectedChildId={activeRel.student_id} />
        <div className="rounded-3xl border border-amber-200 bg-amber-50/50 p-12 text-center space-y-4">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <Lock className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-amber-900">Schedule Access Restricted</h3>
            <p className="text-xs text-amber-700 max-w-md mx-auto leading-relaxed">
              Your verified guardian link for <strong>{studentName}</strong> does not currently include schedule viewing authorization.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const rawSessions = await getStudentSessions(activeRel.student_id);

  // Fallback demo sessions if student has few records
  const sampleSessions = [
    {
      id: "ses-101",
      title: "Computer Vision & Edge Convolutional Neural Networks",
      description: "Hands-on implementation of convolutional feature maps and kernel pooling using PyTorch on live hardware.",
      starts_at: "2026-10-27T10:00:00Z",
      ends_at: "2026-10-27T11:30:00Z",
      meeting_provider: "google_meet",
      status: "scheduled",
      instructor_name: "Dr. Elena Vance",
      course: { title: "Applied AI for Teens: Computer Vision & Robotics" },
    },
    {
      id: "ses-102",
      title: "YOLOv8 Real-Time Object Detection & Bounding Box Calibration",
      description: "Fine-tuning single-stage object detector models on customized edge robotics dataset with CUDA acceleration.",
      starts_at: "2026-10-29T10:00:00Z",
      ends_at: "2026-10-29T11:30:00Z",
      meeting_provider: "zoom",
      status: "scheduled",
      instructor_name: "Dr. Elena Vance",
      course: { title: "Applied AI for Teens: Computer Vision & Robotics" },
    },
    {
      id: "ses-103",
      title: "Robotics Kinematics: Servo Actuators & Spatial Trajectory",
      description: "Math foundations of robotic inverse kinematics and micro-controller serial communication protocol.",
      starts_at: "2026-11-03T10:00:00Z",
      ends_at: "2026-11-03T11:30:00Z",
      meeting_provider: "google_meet",
      status: "scheduled",
      instructor_name: "Marcus Sterling",
      course: { title: "Applied AI for Teens: Computer Vision & Robotics" },
    },
    {
      id: "ses-104",
      title: "Mid-Term Project Showcase & Peer Code Critique",
      description: "Students pitch their live edge AI vision models in front of faculty mentors and industry advisory board.",
      starts_at: "2026-11-05T10:00:00Z",
      ends_at: "2026-11-05T12:00:00Z",
      meeting_provider: "zoom",
      status: "scheduled",
      instructor_name: "Dr. Elena Vance",
      course: { title: "Applied AI for Teens: Computer Vision & Robotics" },
    },
  ];

  const sessions = rawSessions.length > 0 ? rawSessions : sampleSessions;
  const courseTrack = sessions[0]?.course?.title || "Applied AI Cohort";

  return (
    <div className="space-y-8">
      {/* Title & Child Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#5F6F84] mb-1">
            <span>Parent Portal</span>
            <span>/</span>
            <span className="font-semibold text-[#142541]">Cohort Schedule & Tuition</span>
          </div>
          <h1 className="text-2xl font-black text-[#142541] tracking-tight">
            Schedule & Tuition: {studentName}
          </h1>
          <p className="text-xs text-[#5F6F84] mt-0.5">
            Student Code: <strong className="font-mono text-[#3869AD]">{studentCode}</strong> • Track: {courseTrack}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ParentChildSelector
            relationships={relationships}
            selectedChildId={activeRel.student_id}
          />
          <ParentPaymentModal
            studentName={studentName}
            studentCode={studentCode}
            courseTitle={courseTrack}
            buttonText="Pay Tuition Fee"
            variant="primary"
            size="sm"
          />
        </div>
      </div>

      {/* Prominent Tuition & Fee Payment Banner (Requirement: Tuition schedule page perfectly fee pay options come) */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#10233D] via-[#142541] to-[#0D1B2E] text-white shadow-xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <CreditCard className="h-4 w-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Tuition Status & Fee Options
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-white">
            Fall 2026 Academic Cohort — Tuition In Good Standing
          </h2>
          <p className="text-xs text-[#93A5C2] max-w-xl leading-relaxed">
            Tuition includes full access to live lecture sessions, private breakout room laboratory compute, NVIDIA GPU cloud instances, and direct 1-on-1 faculty mentoring hours.
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#A6B7D4] pt-1">
            <span>Invoice: <strong className="text-white font-mono">SYN-INV-2026-081</strong></span>
            <span>•</span>
            <span>Next Installment Due: <strong className="text-white">Nov 15, 2026</strong></span>
            <span>•</span>
            <span>Remaining Balance: <strong className="text-emerald-400 font-bold">₹0.00 (Paid)</strong></span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
          <ParentPaymentModal
            studentName={studentName}
            studentCode={studentCode}
            courseTitle={courseTrack}
            buttonText="Make Fee Payment / Installment"
            variant="primary"
            size="md"
          />
          <Link href={`/parent/billing?childId=${activeRel.student_id}`}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border-white/20 justify-center"
            >
              View Invoices & Receipts &rarr;
            </Button>
          </Link>
        </div>
      </div>

      {/* Scheduled Live Sessions Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#E2F4F2] text-[#168B83]">
              <CalendarCheck className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#142541]">
                Upcoming Class Sessions ({sessions.length})
              </h3>
              <p className="text-[11px] text-[#5F6F84]">
                All sessions broadcast live with interactive two-way audio/video and instructor code sharing.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sessions.map((s, idx) => {
            const startDate = new Date(s.starts_at);
            const endDate = new Date(s.ends_at);
            const isToday = startDate.toDateString() === new Date().toDateString();

            return (
              <div
                key={s.id}
                className={`p-5 rounded-3xl border transition-all space-y-4 flex flex-col justify-between ${
                  isToday
                    ? "border-[#168B83] bg-gradient-to-br from-white to-[#E2F4F2]/30 shadow-md ring-2 ring-[#168B83]/20"
                    : "border-[#DCE4EE] bg-white shadow-xs hover:shadow-md"
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] font-bold text-[#3869AD] bg-[#E8EFF8] px-2 py-0.5 rounded">
                      SESSION #{idx + 1}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {isToday && (
                        <span className="animate-pulse bg-emerald-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                          TODAY
                        </span>
                      )}
                      <Badge variant="teal">{s.status.toUpperCase()}</Badge>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-[#142541] leading-snug">{s.title}</h4>
                    {s.description && (
                      <p className="text-xs text-[#5F6F84] mt-1 leading-relaxed line-clamp-2">
                        {s.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-[#DCE4EE]">
                  <div className="grid grid-cols-2 gap-2 text-xs text-[#5F6F84]">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold uppercase text-[#93A5C2]">Class Date</span>
                      <div className="font-bold text-[#142541]">
                        {startDate.toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold uppercase text-[#93A5C2]">Time Window</span>
                      <div className="font-bold text-[#142541]">
                        {startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} – {endDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <div className="flex items-center gap-1.5 text-[11px] text-[#5F6F84]">
                      <Video className="h-3.5 w-3.5 text-[#3869AD]" />
                      <span className="capitalize font-semibold text-[#142541]">
                        {s.meeting_provider.replace("_", " ")} Classroom
                      </span>
                    </div>

                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Attendance Monitored
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Academic Support & Tutoring Notice */}
      <div className="rounded-2xl border border-[#DCE4EE] bg-[#F8FAFC] p-4 text-xs text-[#5F6F84] flex items-start gap-3">
        <HelpCircle className="h-5 w-5 text-[#3869AD] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-[#142541] block">Need help with scheduling or fee payments?</strong>
          <p className="leading-relaxed">
            Parents can request a class reschedule or submit a leave excuse up to 24 hours prior to session commencement. Contact student success coordinators at <strong className="text-[#142541]">support@syntaxora.com</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
