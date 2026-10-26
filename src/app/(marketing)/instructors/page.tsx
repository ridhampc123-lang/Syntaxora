import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getApprovedInstructors } from "@/server/services/instructorService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ShieldCheck, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";

export const metadata = {
  title: "Academy Faculty & Mentors — Syntaxora",
  description:
    "Meet our approved computer science and artificial intelligence faculty, mentors, and curriculum authors.",
};

export default async function InstructorsPage() {
  const instructors = await getApprovedInstructors();

  return (
    <div className="bg-[#FAF8F3] min-h-screen py-12 lg:py-18 text-[#354052]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="text-xs text-[#687386]">
          <ol className="flex items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-[#17243A]">
                Home
              </Link>
            </li>
            <li>/</li>
            <li className="font-semibold text-[#17243A]">Academy Faculty</li>
          </ol>
        </nav>

        {/* Editorial Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#DDE2E7]">
          <div className="space-y-3 max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-gradient-ai">
              Instructional Leadership & Research
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#17243A]">
              Academy <span className="text-gradient-ai">AI</span> Faculty & Mentors
            </h1>
            <p className="text-base text-[#687386] leading-relaxed font-normal">
              Our cohorts are led by verified computer scientists, roboticists, and educators dedicated to personalized code inspection and active mentorship.
            </p>
          </div>
          <Link href="/courses">
            <Button variant="outline" size="sm" className="shrink-0 font-medium">
              View All Cohort Courses
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" aria-hidden="true" />
            </Button>
          </Link>
        </div>

        {/* Faculty Grid */}
        <Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {instructors.map((instructor) => (
              <div
                key={instructor.id}
                className="rounded-2xl border border-[#DDE2E7] bg-white p-7 sm:p-8 flex flex-col justify-between card-editorial card-ai-glow group"
              >
                <div className="space-y-5">
                  <div className="flex items-center gap-3.5">
                    {instructor.avatar_url ? (
                      <div className="relative h-13 w-13 rounded-2xl overflow-hidden shadow-xs border border-[#DDE2E7] shrink-0 bg-[#0B1220] transition-transform group-hover:scale-105 duration-200">
                        <Image
                          src={instructor.avatar_url}
                          alt={instructor.full_name}
                          width={52}
                          height={52}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-13 w-13 rounded-2xl bg-[#17243A] text-[#D7A66A] flex items-center justify-center font-bold text-xl font-display italic shadow-xs transition-transform group-hover:scale-105 duration-200 shrink-0">
                        {instructor.full_name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h2 className="text-xl font-bold text-[#17243A]">
                        {instructor.full_name}
                      </h2>
                      <p className="text-xs font-semibold text-[#355F99] mt-0.5">
                        {(instructor as { title?: string }).title || "Academy Faculty Member"}
                      </p>
                    </div>
                  </div>

                <p className="text-xs sm:text-sm text-[#687386] leading-relaxed">
                  {instructor.bio}
                </p>

                {(instructor as { specialties?: string[] }).specialties && (
                  <div className="space-y-2 pt-3 border-t border-[#DDE2E7]">
                    <span className="text-[10px] font-bold text-[#17243A] uppercase tracking-wider block">
                      Domain Specialties:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(instructor as { specialties: string[] }).specialties.map((spec) => (
                        <Badge
                          key={spec}
                          variant="secondary"
                          className="text-[10px] font-medium"
                        >
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-6 mt-6 border-t border-[#DDE2E7]">
                <Link href="/courses" className="w-full block">
                  <Button variant="outline" size="sm" className="w-full justify-center">
                    <BookOpen className="h-3.5 w-3.5 mr-1.5 text-[#355F99]" />
                    Explore Courses by Faculty
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Reveal>

        {/* Faculty Quality Reassurance Banner */}
        <div className="rounded-2xl border border-[#DDE2E7] bg-white p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-start gap-3.5 max-w-2xl">
            <div className="h-10 w-10 rounded-xl bg-[#E7F5F4] text-[#167F78] flex items-center justify-center shrink-0 mt-1">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base text-[#17243A]">
                Vetted Backgrounds & Minor Safety Protocol
              </h3>
              <p className="text-xs sm:text-sm text-[#687386] leading-relaxed">
                All academy instructors pass background verification and child safety training before conducting live studio sessions with youth and teen cohorts.
              </p>
            </div>
          </div>
          <Link href="/apply">
            <Button variant="primary" size="md" className="shrink-0 font-semibold">
              Apply to Next Cohort
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
