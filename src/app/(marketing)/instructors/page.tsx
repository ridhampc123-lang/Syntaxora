import React from "react";
import Link from "next/link";
import { getApprovedInstructors } from "@/server/services/instructorService";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

export const metadata = {
  title: "Academy Faculty & Mentors — Syntaxora",
  description:
    "Meet our approved computer science and artificial intelligence faculty, mentors, and curriculum authors.",
};

export default async function InstructorsPage() {
  const instructors = await getApprovedInstructors();

  return (
    <div className="bg-[#F3F6FA] min-h-screen py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#142541] tracking-tight">
            Academy Faculty & Mentors
          </h1>
          <p className="text-base text-[#5F6F84]">
            Our courses are designed and taught by verified computer scientists, roboticists, and educators dedicated to personalized feedback.
          </p>
        </div>

        {/* Faculty Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {instructors.map((instructor) => (
            <Card key={instructor.id} className="border-[#DCE4EE] bg-white flex flex-col justify-between">
              <div>
                <CardHeader className="space-y-3">
                  <div className="h-14 w-14 rounded-full bg-[#142541] text-white flex items-center justify-center font-bold text-xl shadow-sm">
                    {instructor.full_name.charAt(0)}
                  </div>
                  <div>
                    <CardTitle className="text-xl text-[#142541]">
                      {instructor.full_name}
                    </CardTitle>
                    <p className="text-xs font-semibold text-[#3869AD] mt-1">
                      {(instructor as { title?: string }).title || "Academy Faculty Member"}
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-xs sm:text-sm text-[#5F6F84] leading-relaxed">
                    {instructor.bio}
                  </p>

                  {(instructor as { specialties?: string[] }).specialties && (
                    <div className="space-y-1.5 pt-3 border-t border-[#DCE4EE]">
                      <div className="text-[11px] font-semibold text-[#142541] uppercase tracking-wider">
                        Domain Specialties:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(instructor as { specialties: string[] }).specialties.map((spec) => (
                          <span
                            key={spec}
                            className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#E8EFF8] text-[#3869AD]"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </div>

              <div className="p-6 pt-0 border-t border-[#DCE4EE] mt-4">
                <Link href="/courses" className="w-full block">
                  <Button variant="outline" size="sm" className="w-full justify-center">
                    <BookOpen className="h-3.5 w-3.5 mr-1.5" />
                    View Courses by Faculty
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
