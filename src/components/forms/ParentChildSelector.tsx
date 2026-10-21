"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { GuardianStudentRelationship } from "@/types";

interface Props {
  relationships: GuardianStudentRelationship[];
  selectedChildId: string;
}

export function ParentChildSelector({ relationships, selectedChildId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (relationships.length <= 1) {
    const single = relationships[0];
    if (!single) return null;
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#E8EFF8] border border-[#DCE4EE] text-xs">
        <GraduationCap className="h-4 w-4 text-[#3869AD]" />
        <span className="text-[#5F6F84]">Viewing Learner:</span>
        <strong className="text-[#142541]">
          {single.student?.profile?.full_name || "Linked Student"}
        </strong>
        <span className="font-mono text-[11px] text-[#3869AD]">
          ({single.student?.student_code})
        </span>
      </div>
    );
  }

  function handleSelect(studentId: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("childId", studentId);
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="font-semibold text-[#5F6F84] flex items-center gap-1.5">
        <GraduationCap className="h-4 w-4 text-[#3869AD]" />
        Select Student:
      </span>
      <select
        value={selectedChildId}
        onChange={(e) => handleSelect(e.target.value)}
        className="rounded-lg border border-[#DCE4EE] bg-white p-2 text-xs text-[#142541] font-semibold focus:outline-none focus:ring-2 focus:ring-[#3869AD]"
      >
        {relationships.map((rel) => (
          <option key={rel.student_id} value={rel.student_id}>
            {rel.student?.profile?.full_name || "Student"} ({rel.student?.student_code})
          </option>
        ))}
      </select>
    </div>
  );
}
