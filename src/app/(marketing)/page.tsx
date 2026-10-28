import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Cpu,
  Video,
  ShieldCheck,
  Terminal,
  BookOpen,
  Compass,
  Laptop,
  GraduationCap,
  Sparkles,
  ChevronRight,
  Check,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getPublishedCourses } from "@/server/services/courseService";
import { getApprovedInstructors } from "@/server/services/instructorService";
import { formatCurrency } from "@/lib/utils";
import { Reveal } from "@/components/ui/reveal";

export const metadata = {
  title: "Syntaxora — AI Learning Academy | Applied Artificial Intelligence for All Ages",
  description:
    "An editorial, rigorous online academy teaching machine learning, computer vision, Python programming, and neural architectures to children, teenagers, university students, and professionals.",
};

export default async function HomePage() {
  const [courses, instructors] = await Promise.all([
    getPublishedCourses(),
    getApprovedInstructors(),
  ]);

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F3] text-[#354052]">
      {/* =========================================================================
          1. HERO SECTION — Editorial Composition
          ========================================================================= */}
      <section className="relative pt-12 pb-20 lg:pt-16 lg:pb-28 border-b border-[#DDE2E7] overflow-hidden">
        {/* Soft background grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#17243A 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
          aria-hidden="true"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
            {/* Left Column: Editorial Headline & Actions */}
            <div className="lg:col-span-7 space-y-6 text-left animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full badge-ai-gradient text-xs font-semibold text-[#17243A] transition-all">
                <span className="w-1.5 h-1.5 rounded-full bg-[#167F78] animate-pulse-dot" />
                <span>Now Enrolling Spring & Summer 2026 • <span className="text-gradient-ai font-bold">Live Cohorts</span></span>
              </div>

              <div className="space-y-3">
                <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-[#17243A] leading-[1.12]">
                  Where <span className="text-gradient-ai">Artificial Intelligence</span> is taught as an{" "}
                  <span className="font-display italic font-normal text-[#355F99]">
                    applied engineering craft
                  </span>
                  .
                </h1>
                <p className="text-base sm:text-lg text-[#687386] leading-relaxed max-w-2xl font-normal">
                  Syntaxora teaches genuine <span className="text-gradient-ai font-semibold">Computer Vision</span>, applied <span className="text-gradient-ai font-semibold">Artificial Intelligence</span>, and deep <span className="text-gradient-ai font-semibold">Neural Architectures</span> through small, instructor-led cohorts. From visual algorithmic foundations for young minds to production transformers for engineers.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <Link href="/apply">
                  <Button variant="ai" size="lg" className="w-full sm:w-auto font-bold shadow-md">
                    Apply for Admission
                    <ArrowRight className="h-4 w-4 ml-2 arrow-icon" aria-hidden="true" />
                  </Button>
                </Link>
                <Link href="/courses">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Explore All Courses
                  </Button>
                </Link>
                <Link href="/how-it-works">
                  <Button variant="ghost" size="lg" className="w-full sm:w-auto text-[#17243A] font-medium">
                    How Learning Works
                  </Button>
                </Link>
              </div>

              {/* Verified Trust Strip */}
              <div className="pt-8 border-t border-[#DDE2E7] grid grid-cols-3 gap-6">
                <div className="space-y-1">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#687386]">
                    Cohort Size
                  </div>
                  <div className="text-sm font-bold text-[#17243A] flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-[#355F99]" aria-hidden="true" />
                    <span>8–14 Students</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#687386]">
                    Format
                  </div>
                  <div className="text-sm font-bold text-[#17243A] flex items-center gap-1.5">
                    <Video className="h-4 w-4 text-[#167F78]" aria-hidden="true" />
                    <span>Live Interactive</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#687386]">
                    Privacy Standard
                  </div>
                  <div className="text-sm font-bold text-[#17243A] flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-[#17243A]" aria-hidden="true" />
                    <span>Guardian Verified</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Educational Artifact Composition */}
            <div className="lg:col-span-5 animate-fade-in-up animation-delay-150">
              <div className="rounded-2xl border border-[#DDE2E7] bg-white p-5 sm:p-7 shadow-[0_8px_30px_rgba(23,36,58,0.06)] space-y-5 card-editorial">
                {/* Simulated Interactive Code Studio */}
                <div className="flex items-center justify-between pb-3 border-b border-[#DDE2E7]">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#E57373]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#FFB74D]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#81C784]" />
                    </div>
                    <span className="text-xs font-mono text-[#687386] ml-2">
                      vision_classifier.py
                    </span>
                  </div>
                  <Badge variant="teal" className="text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#167F78] animate-pulse-dot" />
                    <span>Live Vision Studio Active</span>
                  </Badge>
                </div>

                {/* Annotated Code Block */}
                <div className="bg-[#17243A] text-white p-4 rounded-xl font-mono text-xs leading-relaxed overflow-x-auto shadow-inner">
                  <div className="text-[#687386]"># Syntaxora Vision Lab: Real-time edge detection</div>
                  <div className="mt-1">
                    <span className="text-[#D7A66A]">import</span> torch
                  </div>
                  <div>
                    <span className="text-[#D7A66A]">import</span> cv2
                  </div>
                  <div className="mt-2 text-[#90CAF9]">
                    model = torch.hub.load(<span className="text-[#A5D6A7]">&apos;syntaxora/edge-net&apos;</span>)
                  </div>
                  <div className="text-[#E0E0E0]">
                    stream = cv2.VideoCapture(device_id=0)
                  </div>
                  <div className="mt-2 text-[#D7A66A]">while</div>
                  <div className="pl-4 text-[#E0E0E0]">
                    frame = stream.read()
                  </div>
                  <div className="pl-4 text-[#A5D6A7]">
                    boxes, confidence = model.predict(frame)
                  </div>
                  <div className="mt-2 text-[#90CAF9] flex items-center">
                    <span className="text-[#D7A66A] mr-1.5">&gt;</span>
                    <span className="text-[#A5D6A7]">tensor(128, 128, 3) initialized</span>
                    <span className="inline-block w-1.5 h-3.5 bg-[#D7A66A] ml-1.5 animate-cursor" />
                  </div>
                </div>

                {/* Annotation Note */}
                <div className="bg-[#FAF8F3] border border-[#DDE2E7] rounded-xl p-3.5 flex items-start gap-3">
                  <div className="h-6 w-6 rounded bg-[#EAF0F8] text-[#355F99] flex items-center justify-center shrink-0 mt-0.5">
                    <Terminal className="h-3.5 w-3.5" aria-hidden="true" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-[#17243A]">
                      Instructor Live Review
                    </div>
                    <p className="text-xs text-[#687386] leading-snug">
                      Students run and debug code on their local environment during every live cohort session.
                    </p>
                  </div>
                </div>

                {/* Course Cohort Indicator */}
                <div className="flex items-center justify-between text-xs pt-2 text-[#687386]">
                  <span>Track: Teens Python & Applied AI (Ages 12–17)</span>
                  <Link
                    href="/courses/applied-ai-for-teens"
                    className="text-[#355F99] font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    View Syllabus
                    <ChevronRight className="h-3 w-3" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. LEARNING PATHWAYS — Distinct Editorial Architecture
          ========================================================================= */}
      <section className="py-18 lg:py-24 border-b border-[#DDE2E7]">
        <Reveal>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#DDE2E7]">
              <div className="space-y-2 max-w-2xl">
                <span className="text-xs font-bold uppercase tracking-wider text-gradient-ai">
                  Distinct Age-Specific AI Curricula
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#17243A]">
                  Structured for cognitive readiness.
                </h2>
                <p className="text-base text-[#687386]">
                  Children learn differently from undergraduates. Each pathway features custom pedagogical tooling, real-world projects, and strict age-appropriate safety.
                </p>
              </div>
              <Link href="/programs">
                <Button variant="outline" size="sm" className="shrink-0 font-medium">
                  Compare All 4 Tracks
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5 arrow-icon" aria-hidden="true" />
                </Button>
              </Link>
            </div>

            {/* Asymmetrical 4 Pathways Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Pathway 1: Young Learners (Ages 7–11) */}
              <div className="lg:col-span-6 rounded-2xl border border-[#DDE2E7] bg-white p-7 sm:p-9 space-y-6 flex flex-col justify-between card-editorial card-ai-glow group">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-11 w-11 rounded-xl bg-[#E7F5F4] text-[#167F78] flex items-center justify-center transition-transform group-hover:scale-105 duration-200">
                      <Compass className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <Badge variant="teal">Ages 7–11</Badge>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#17243A]">
                      Young <span className="text-gradient-ai">AI</span> Explorers
                    </h3>
                    <p className="text-xs font-semibold text-[#167F78] mt-0.5">
                      Visual Logic, Algorithms & Creative Coding
                    </p>
                  </div>
                  <p className="text-sm text-[#687386] leading-relaxed">
                    A playful, visual entry into how machines comprehend the world. Students build pattern classifiers, solve algorithmic logic puzzles, and learn that software learns from examples.
                  </p>
                  <div className="pt-2 border-t border-[#DDE2E7] space-y-2 text-xs text-[#354052]">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#167F78] shrink-0" aria-hidden="true" />
                      <span>Doodle recognition & image classifiers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#167F78] shrink-0" aria-hidden="true" />
                      <span>Interactive sensors & audio pattern puzzles</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#167F78] shrink-0" aria-hidden="true" />
                      <span>Parent visibility on class attendance & activities</span>
                    </div>
                  </div>
                </div>
                <div className="pt-4">
                  <Link href="/courses/young-ai-explorers" className="block">
                    <Button variant="outline" size="sm" className="w-full justify-between font-semibold border-[#DDE2E7] hover:border-[#355F99]/60 hover:bg-[#FAF8F3] text-[#17243A]">
                      <span>Explore Young Explorers Syllabus</span>
                      <ArrowRight className="h-4 w-4 ml-1 text-[#355F99] arrow-icon" aria-hidden="true" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Pathway 2: Teens Python & Applied AI (Ages 12–17) */}
              <div className="lg:col-span-6 rounded-2xl border border-[#DDE2E7] bg-white p-7 sm:p-9 space-y-6 flex flex-col justify-between card-editorial card-ai-glow group">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-11 w-11 rounded-xl bg-[#EAF0F8] text-[#355F99] flex items-center justify-center transition-transform group-hover:scale-105 duration-200">
                      <Laptop className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <Badge variant="primary">Ages 12–17</Badge>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#17243A]">
                      Teens Python & <span className="text-gradient-ai">Applied AI</span>
                    </h3>
                    <p className="text-xs font-semibold text-[#355F99] mt-0.5">
                      Computer Vision, OpenCV & Machine Learning Basics
                    </p>
                  </div>
                  <p className="text-sm text-[#687386] leading-relaxed">
                    Moving past drag-and-drop into real Python engineering. Teenagers write clean syntax, interact with live webcam video streams via OpenCV, and train models to classify objects in real time.
                  </p>
                  <div className="pt-2 border-t border-[#DDE2E7] space-y-2 text-xs text-[#354052]">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#355F99] shrink-0" aria-hidden="true" />
                      <span>Python lists, dictionaries, functions & OOP basics</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#355F99] shrink-0" aria-hidden="true" />
                      <span>Webcam bounding boxes & color segmentations</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#355F99] shrink-0" aria-hidden="true" />
                      <span>Interactive computer vision & practical AI models</span>
                    </div>
                  </div>
                </div>
                <div className="pt-4">
                  <Link href="/courses/applied-ai-for-teens" className="block">
                    <Button variant="outline" size="sm" className="w-full justify-between font-semibold border-[#DDE2E7] hover:border-[#355F99]/60 hover:bg-[#FAF8F3] text-[#17243A]">
                      <span>Explore Teens Python & AI Syllabus</span>
                      <ArrowRight className="h-4 w-4 ml-1 text-[#355F99] arrow-icon" aria-hidden="true" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Pathway 3: College & University */}
              <div className="lg:col-span-6 rounded-2xl border border-[#DDE2E7] bg-white p-7 sm:p-9 space-y-6 flex flex-col justify-between card-editorial card-ai-glow group">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-11 w-11 rounded-xl bg-[#F0F2F4] text-[#17243A] flex items-center justify-center transition-transform group-hover:scale-105 duration-200">
                      <GraduationCap className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <Badge variant="navy">Undergrads & Postgrads</Badge>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#17243A]">
                      <span className="text-gradient-ai">Deep Learning</span> & PyTorch
                    </h3>
                    <p className="text-xs font-semibold text-[#17243A] mt-0.5">
                      Mathematical Foundations, Convolutions & Transformers
                    </p>
                  </div>
                  <p className="text-sm text-[#687386] leading-relaxed">
                    Rigorous vector calculus and gradient descent paired with hands-on systems code. Implement multi-head attention mechanisms from scratch and debug training loss curves.
                  </p>
                  <div className="pt-2 border-t border-[#DDE2E7] space-y-2 text-xs text-[#354052]">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#17243A] shrink-0" aria-hidden="true" />
                      <span>Loss functions, backprop math & custom autograd</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#17243A] shrink-0" aria-hidden="true" />
                      <span>PyTorch CNNs, residual blocks & data loaders</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#17243A] shrink-0" aria-hidden="true" />
                      <span>Self-attention tensors & BERT/GPT architectural builds</span>
                    </div>
                  </div>
                </div>
                <div className="pt-4">
                  <Link href="/courses/applied-deep-learning-college" className="block">
                    <Button variant="outline" size="sm" className="w-full justify-between font-semibold border-[#DDE2E7] hover:border-[#355F99]/60 hover:bg-[#FAF8F3] text-[#17243A]">
                      <span>Explore Deep Learning & PyTorch Syllabus</span>
                      <ArrowRight className="h-4 w-4 ml-1 text-[#355F99] arrow-icon" aria-hidden="true" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Pathway 4: Adults & Working Professionals */}
              <div className="lg:col-span-6 rounded-2xl border border-[#DDE2E7] bg-white p-7 sm:p-9 space-y-6 flex flex-col justify-between card-editorial card-ai-glow group">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-11 w-11 rounded-xl bg-[#FDF6ED] text-[#9A6726] flex items-center justify-center transition-transform group-hover:scale-105 duration-200">
                      <Cpu className="h-5 w-5 text-[#9A6726]" aria-hidden="true" />
                    </div>
                    <Badge variant="warm">Working Professionals</Badge>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#17243A]">
                      Generative <span className="text-gradient-ai">AI</span> Systems & RAG
                    </h3>
                    <p className="text-xs font-semibold text-[#9A6726] mt-0.5">
                      Vector Databases, Embeddings & Production LLM Pipelines
                    </p>
                  </div>
                  <p className="text-sm text-[#687386] leading-relaxed">
                    Engineering real LLM pipelines that do not hallucinate. Vector search, chunking strategies, prompt engineering patterns, and autonomous tool calling agents.
                  </p>
                  <div className="pt-2 border-t border-[#DDE2E7] space-y-2 text-xs text-[#354052]">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#9A6726] shrink-0" aria-hidden="true" />
                      <span>Retrieval-Augmented Generation (RAG) architecture</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#9A6726] shrink-0" aria-hidden="true" />
                      <span>Vector indexing with pgvector & semantic retrieval</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#9A6726] shrink-0" aria-hidden="true" />
                      <span>Agentic function-calling & structured JSON output</span>
                    </div>
                  </div>
                </div>
                <div className="pt-4">
                  <Link href="/courses/practical-generative-ai-adults" className="block">
                    <Button variant="outline" size="sm" className="w-full justify-between font-semibold border-[#DDE2E7] hover:border-[#355F99]/60 hover:bg-[#FAF8F3] text-[#17243A]">
                      <span>Explore Generative AI Systems Syllabus</span>
                      <ArrowRight className="h-4 w-4 ml-1 text-[#355F99] arrow-icon" aria-hidden="true" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* =========================================================================
          3. FEATURED COURSES CATALOG (Real Database Content)
          ========================================================================= */}
      <section className="py-18 lg:py-24 border-b border-[#DDE2E7] bg-white">
        <Reveal>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gradient-ai">
                  Live Interactive AI Masterclasses
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#17243A]">
                  Published academy <span className="text-gradient-ai">Artificial Intelligence</span> courses.
                </h2>
                <p className="text-base text-[#687386] max-w-xl">
                  Every course is taught by approved academy faculty with real live video studio sessions, weekly labs, and private code reviews.
                </p>
              </div>
              <Link href="/courses">
                <Button variant="ai" size="sm" className="font-bold shadow-xs">
                  Browse Full Course Catalog
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5 arrow-icon" aria-hidden="true" />
                </Button>
              </Link>
            </div>

            {courses.length === 0 ? (
              <div className="rounded-2xl border border-[#DDE2E7] bg-[#FAF8F3] p-12 text-center space-y-4">
                <BookOpen className="h-10 w-10 mx-auto text-[#687386]" aria-hidden="true" />
                <h3 className="text-lg font-bold text-[#17243A]">No Courses Currently Open</h3>
                <p className="text-sm text-[#687386] max-w-md mx-auto">
                  Next cohorts are being finalized by academy administration. Contact admissions to be placed on the priority registration list.
                </p>
                <Link href="/contact">
                  <Button variant="outline" size="sm">
                    Contact Admissions Support
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="rounded-2xl border border-[#DDE2E7] bg-[#FAF8F3] p-7 sm:p-8 flex flex-col justify-between card-editorial group hover:border-[#355F99]/60"
                  >
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Badge variant="primary" className="uppercase text-[10px] tracking-wider">
                          {course.audience_group.replace("_", " ")}
                        </Badge>
                        <div className="text-xs font-semibold text-[#167F78] flex items-center gap-1">
                          <Video className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Live Online Studio</span>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold text-[#17243A] leading-snug group-hover:text-[#355F99] transition-colors">
                          {course.title}
                        </h3>
                        <p className="text-sm text-[#687386] mt-2 line-clamp-3 leading-relaxed">
                          {course.summary}
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[#DDE2E7] text-xs text-[#354052]">
                        <div>
                          <span className="text-[#687386] block text-[11px]">Duration</span>
                          <span className="font-semibold text-[#17243A]">{course.duration_weeks} Weeks</span>
                        </div>
                        <div>
                          <span className="text-[#687386] block text-[11px]">Level</span>
                          <span className="font-semibold text-[#17243A] capitalize">{course.level}</span>
                        </div>
                        <div>
                          <span className="text-[#687386] block text-[11px]">Tuition</span>
                          <span className="font-bold text-[#167F78]">
                            {formatCurrency(course.price_in_cents, course.currency)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 mt-4 border-t border-[#DDE2E7] flex items-center justify-between gap-3">
                      <Link href={`/courses/${course.slug}`} className="text-xs font-semibold text-[#355F99] hover:underline flex items-center gap-1">
                        <span>View Detailed Modules</span>
                        <ArrowRight className="h-3 w-3 arrow-icon" aria-hidden="true" />
                      </Link>
                      <Link href={`/apply?course=${course.id}`}>
                        <Button variant="primary" size="sm">
                          Apply to Cohort
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Reveal>
      </section>

      {/* =========================================================================
          4. METHODOLOGY — Visual Studio Workflow
          ========================================================================= */}
      <section className="py-18 lg:py-24 border-b border-[#DDE2E7]">
        <Reveal>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gradient-ai">
                The Pedagogical Architecture
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#17243A]">
                How authentic <span className="text-gradient-ai">AI Systems</span> are mastered.
              </h2>
              <p className="text-base text-[#687386]">
                We reject passive video-watching. Every student builds software with live faculty guidance, verifiable code repositories, and individual debugging sessions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="rounded-xl border border-[#DDE2E7] bg-white p-6 space-y-3 card-editorial">
                <div className="h-10 w-10 rounded-lg bg-[#EAF0F8] text-[#355F99] flex items-center justify-center font-bold text-sm">
                  01
                </div>
                <h3 className="text-lg font-bold text-[#17243A]">Live Studio Cohorts</h3>
                <p className="text-xs sm:text-sm text-[#687386] leading-relaxed">
                  Small interactive classes where faculty inspect learner terminals, guide architectural design, and answer questions live.
                </p>
              </div>

              <div className="rounded-xl border border-[#DDE2E7] bg-white p-6 space-y-3 card-editorial">
                <div className="h-10 w-10 rounded-lg bg-[#E7F5F4] text-[#167F78] flex items-center justify-center font-bold text-sm">
                  02
                </div>
                <h3 className="text-lg font-bold text-[#17243A]">Hands-On Labs</h3>
                <p className="text-xs sm:text-sm text-[#687386] leading-relaxed">
                  Structured assignments focused on training loss curves, <span className="text-gradient-ai font-semibold">Computer Vision</span> stream processing, and <span className="text-gradient-ai font-semibold">Neural Network</span> fine-tuning.
                </p>
              </div>

              <div className="rounded-xl border border-[#DDE2E7] bg-white p-6 space-y-3 card-editorial">
                <div className="h-10 w-10 rounded-lg bg-[#FDF6ED] text-[#9A6726] flex items-center justify-center font-bold text-sm">
                  03
                </div>
                <h3 className="text-lg font-bold text-[#17243A]">Personalized Review</h3>
                <p className="text-xs sm:text-sm text-[#687386] leading-relaxed">
                  Instructors provide detailed inline feedback on submissions, grading for code clarity, algorithmic correctness, and test coverage.
                </p>
              </div>

              <div className="rounded-xl border border-[#DDE2E7] bg-white p-6 space-y-3 card-editorial">
                <div className="h-10 w-10 rounded-lg bg-[#F0F2F4] text-[#17243A] flex items-center justify-center font-bold text-sm">
                  04
                </div>
                <h3 className="text-lg font-bold text-[#17243A]">Verified Progress</h3>
                <p className="text-xs sm:text-sm text-[#687386] leading-relaxed">
                  Attendance and milestones are logged securely to the Student and Guardian portals, giving families transparent oversight.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* =========================================================================
          5. LEARNER ADMISSION JOURNEY (How It Works)
          ========================================================================= */}
      <section id="how-it-works" className="py-18 lg:py-24 border-b border-[#DDE2E7] bg-white">
        <Reveal>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#DDE2E7]">
              <div className="space-y-2 max-w-2xl">
                <span className="text-xs font-bold uppercase tracking-wider text-[#355F99]">
                  Admissions Policy & Enrollment
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#17243A]">
                  The six-step learner journey.
                </h2>
                <p className="text-base text-[#687386]">
                  To maintain small cohorts and child safety, student accounts cannot be self-registered. Every learner undergoes faculty placement.
                </p>
              </div>
              <Link href="/how-it-works">
                <Button variant="outline" size="sm">
                  Read Detailed Guide
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5 arrow-icon" aria-hidden="true" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-6 rounded-xl border border-[#DDE2E7] bg-[#FAF8F3] space-y-2.5 card-editorial">
                <div className="text-xs font-bold text-[#355F99] uppercase tracking-wider">Step 01</div>
                <h4 className="text-lg font-bold text-[#17243A]">Explore Programs</h4>
                <p className="text-xs sm:text-sm text-[#687386] leading-relaxed">
                  Inspect age-tailored pathways in Young Explorers, Teens Python & AI, College Deep Learning, or Generative AI.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-[#DDE2E7] bg-[#FAF8F3] space-y-2.5 card-editorial">
                <div className="text-xs font-bold text-[#355F99] uppercase tracking-wider">Step 02</div>
                <h4 className="text-lg font-bold text-[#17243A]">Submit Application</h4>
                <p className="text-xs sm:text-sm text-[#687386] leading-relaxed">
                  Complete the admission form with student background and preferred track at <span className="font-mono text-xs font-semibold">/apply</span>.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-[#DDE2E7] bg-[#FAF8F3] space-y-2.5 card-editorial">
                <div className="text-xs font-bold text-[#355F99] uppercase tracking-wider">Step 03</div>
                <h4 className="text-lg font-bold text-[#17243A]">Faculty Review</h4>
                <p className="text-xs sm:text-sm text-[#687386] leading-relaxed">
                  Admissions coordinators evaluate cognitive level, ensure cohort fit, and assign eligible candidates.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-[#DDE2E7] bg-[#FAF8F3] space-y-2.5 card-editorial">
                <div className="text-xs font-bold text-[#167F78] uppercase tracking-wider">Step 04</div>
                <h4 className="text-lg font-bold text-[#17243A]">Account Activation</h4>
                <p className="text-xs sm:text-sm text-[#687386] leading-relaxed">
                  Approved students receive their secure Student Code and password creation invitation via verified email.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-[#DDE2E7] bg-[#FAF8F3] space-y-2.5 card-editorial">
                <div className="text-xs font-bold text-[#167F78] uppercase tracking-wider">Step 05</div>
                <h4 className="text-lg font-bold text-[#17243A]">Live Class Participation</h4>
                <p className="text-xs sm:text-sm text-[#687386] leading-relaxed">
                  Students access live video studio sessions directly linked from the Student Portal with real-time mentor code review.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-[#DDE2E7] bg-[#FAF8F3] space-y-2.5 card-editorial">
                <div className="text-xs font-bold text-[#167F78] uppercase tracking-wider">Step 06</div>
                <h4 className="text-lg font-bold text-[#17243A]">Verified Mastery & Portfolio</h4>
                <p className="text-xs sm:text-sm text-[#687386] leading-relaxed">
                  Learners build working projects. Parents monitor verified attendance and assignment feedback through the Guardian Portal.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* =========================================================================
          6. ACADEMY FACULTY HIGHLIGHT (Real Verified Profiles)
          ========================================================================= */}
      {instructors.length > 0 && (
        <section className="py-18 lg:py-24 border-b border-[#DDE2E7]">
          <Reveal>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gradient-ai">
                    Verified Mentors & Authors
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#17243A]">
                    Taught by practicing <span className="text-gradient-ai">Artificial Intelligence</span> scientists.
                  </h2>
                  <p className="text-base text-[#687386] max-w-xl">
                    Our instructors combine university research backgrounds with passionate youth and adult pedagogy.
                  </p>
                </div>
                <Link href="/instructors">
                  <Button variant="outline" size="sm">
                    View Full Faculty
                    <ArrowRight className="h-3.5 w-3.5 ml-1.5 arrow-icon" aria-hidden="true" />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {instructors.slice(0, 3).map((inst) => (
                  <div
                    key={inst.id}
                    className="rounded-2xl border border-[#DDE2E7] bg-white p-6 space-y-4 shadow-sm card-editorial group hover:border-[#17243A]/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-[#17243A] text-[#D7A66A] flex items-center justify-center font-bold text-lg font-display italic transition-transform group-hover:scale-105 duration-200">
                        {inst.full_name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-[#17243A] group-hover:text-[#355F99] transition-colors">
                          {inst.full_name}
                        </h3>
                        <p className="text-xs text-[#355F99] font-medium">
                          {(inst as { title?: string }).title || "Academy Faculty Member"}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-[#687386] leading-relaxed line-clamp-3">
                      {inst.bio}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {/* =========================================================================
          7. FINAL CALL TO ACTION — Editorial & Restrained
          ========================================================================= */}
      <section className="py-20 lg:py-28 bg-[#17243A] text-white">
        <Reveal>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-[#DDE2E7]">
              <Sparkles className="h-3.5 w-3.5 text-[#D7A66A]" aria-hidden="true" />
              <span>Selective Cohort Admissions • Fixed Class Sizes</span>
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
                Begin your education in{" "}
                <span className="text-gradient-ai-glow">
                  authentic machine intelligence
                </span>
                .
              </h2>
              <p className="text-base sm:text-lg text-[#DDE2E7]/80 max-w-2xl mx-auto leading-relaxed font-normal">
                Join students, teenagers, and professionals learning to engineer <span className="text-gradient-ai-glow font-bold">neural networks</span> and applied AI systems. Applications are reviewed on a rolling basis.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/apply">
                <Button
                  variant="ai"
                  size="lg"
                  className="w-full sm:w-auto font-bold px-8 shadow-md"
                >
                  Apply for Admission
                  <ArrowRight className="h-4 w-4 ml-2 arrow-icon" aria-hidden="true" />
                </Button>
              </Link>
              <Link href="/courses">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto bg-transparent border-white/30 text-white hover:bg-white/10 hover:border-white hover:text-white"
                >
                  Browse All Courses
                </Button>
              </Link>
            </div>

            <div className="pt-6 border-t border-white/10 text-xs text-[#DDE2E7]/60">
              Questions before applying? Email admissions at{" "}
              <a href="mailto:admissions@syntaxora.com" className="text-white underline hover:text-[#D7A66A]">
                admissions@syntaxora.com
              </a>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
