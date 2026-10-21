import React from "react";
import { Mail } from "lucide-react";
import { getApprovedInstructors } from "@/server/services/instructorService";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Faculty Roster & Workload — Syntaxora Admin",
  description: "Manage academy instructors, course assignments, and teaching responsibilities.",
};

export default async function AdminInstructorsPage() {
  const instructors = await getApprovedInstructors();

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold text-[#142541] tracking-tight">
          Academy Faculty & Mentors
        </h2>
        <p className="text-xs text-[#5F6F84] mt-0.5">
          Instructors possess teaching access strictly scoped to their assigned courses and cohorts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {instructors.map((instructor) => (
          <Card key={instructor.id} className="border-[#DCE4EE] bg-white">
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-full bg-[#142541] text-white flex items-center justify-center font-bold">
                  {instructor.full_name.charAt(0)}
                </div>
                <Badge variant="teal">Verified Faculty</Badge>
              </div>
              <div>
                <CardTitle className="text-lg text-[#142541]">
                  {instructor.full_name}
                </CardTitle>
                <div className="text-xs text-[#3869AD] font-semibold">
                  {(instructor as { title?: string }).title || "Instructor"}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-[#5F6F84] leading-relaxed">
                {instructor.bio}
              </p>
              <div className="pt-2 border-t border-[#DCE4EE] flex items-center gap-1.5 text-xs text-[#5F6F84]">
                <Mail className="h-3.5 w-3.5 text-[#3869AD]" />
                <span className="truncate">{instructor.email}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
