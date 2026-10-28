import React from "react";
import Link from "next/link";
import {
  Compass,
  Laptop,
  GraduationCap,
  Cpu,
  ArrowRight,
  CheckCircle2,
  Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/ui/reveal";
import { AIHighlight } from "@/components/ui/ai-highlight";

export const metadata = {
  title: "Academic Programs & Learning Tracks — Syntaxora",
  description:
    "Explore our four age-specialized curriculum tracks in machine learning, computer vision, and applied artificial intelligence.",
};

const PROGRAMS = [
  {
    id: "young-learners",
    audience: "Young Learners",
    ageRange: "Ages 7–11",
    tagline: "Cultivating Computational Intuition & Visual Logic",
    icon: Compass,
    accent: "#167F78",
    badgeVariant: "teal" as const,
    description:
      "A joyful, interactive entry into how machines perceive the physical world. Young learners train visual classifiers, solve algorithmic logic puzzles, and discover the core concept that software learns from examples rather than static rules.",
    milestones: [
      "Visual pattern matching and sensor comprehension",
      "Block-based algorithmic flow and conditional thinking",
      "Training a friendly doodle-recognition AI sidekick",
      "Understanding camera pixels as numeric matrices",
    ],
    audienceKey: "young_learners",
    featuredCourseSlug: "young-ai-explorers",
    deliverable: "Custom Visual Classifier & Interactive Logic Game",
  },
  {
    id: "teens",
    audience: "Teens & High School",
    ageRange: "Ages 12–17",
    tagline: "Python Foundations, Computer Vision & Applied Machine Learning",
    icon: Laptop,
    accent: "#355F99",
    badgeVariant: "primary" as const,
    description:
      "Transitioning from visual blocks to authentic Python engineering. High school students write clean syntax, stream camera feeds through OpenCV, and train models to classify objects and detect patterns in real time.",
    milestones: [
      "Core Python syntax, data structures, and algorithmic logic",
      "Real-time webcam video stream filtering and edge detection",
      "Object classification with practical neural network models",
      "Interactive computer vision applications and smart filters",
    ],
    audienceKey: "teens",
    featuredCourseSlug: "applied-ai-for-teens",
    deliverable: "Interactive Computer Vision & Classification App in Python",
  },
  {
    id: "college",
    audience: "College & University",
    ageRange: "Undergrads & Postgrads",
    tagline: "Deep Learning Foundations, PyTorch & Transformers",
    icon: GraduationCap,
    accent: "#17243A",
    badgeVariant: "navy" as const,
    description:
      "Rigorous mathematical grounding paired with hands-on systems code. Undergraduates dissect loss landscapes, implement custom autograd engines from scratch, and build multi-head attention mechanisms in PyTorch.",
    milestones: [
      "Vector calculus, loss functions, backprop math, and autograd",
      "PyTorch convolutional architectures, residual blocks, and dataloaders",
      "Transformer self-attention, query-key-value tensor operations",
      "Fine-tuning open weights on specialized domain datasets",
    ],
    audienceKey: "college_students",
    featuredCourseSlug: "applied-deep-learning-college",
    deliverable: "Custom Multi-Head Attention Architecture in PyTorch",
  },
  {
    id: "adults",
    audience: "Adults & Working Professionals",
    ageRange: "Engineers & Tech Leaders",
    tagline: "Enterprise Generative AI, RAG Systems & Model Deployment",
    icon: Cpu,
    accent: "#9A6726",
    badgeVariant: "warm" as const,
    description:
      "Engineered for software engineers, product architects, and engineering managers. Learn to architect production RAG systems, manage pgvector embeddings, and orchestrate autonomous agents with strict evaluation benchmarks.",
    milestones: [
      "Vector embeddings, hybrid semantic retrieval, and chunking strategies",
      "Building enterprise RAG assistants with PostgreSQL and pgvector",
      "Agent orchestration, tool invocation, and security guardrails",
      "Evaluating latency, cost, and hallucination rates in production",
    ],
    audienceKey: "adults",
    featuredCourseSlug: "practical-generative-ai-adults",
    deliverable: "Production-Ready Enterprise RAG Pipeline with Tool Calling",
  },
];

export default function ProgramsPage() {
  return (
    <div className="bg-[#FAF8F3] min-h-screen py-12 lg:py-18 text-[#354052]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header Breadcrumbs & Intro */}
        <div className="space-y-3">
          <nav aria-label="Breadcrumb" className="text-xs text-[#687386]">
            <ol className="flex items-center gap-1.5">
              <li>
                <Link href="/" className="hover:text-[#17243A]">
                  Home
                </Link>
              </li>
              <li>/</li>
              <li className="font-semibold text-[#17243A]">Academic Programs</li>
            </ol>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#DDE2E7]">
            <div className="space-y-2 max-w-3xl">
              <span className="text-xs font-bold uppercase tracking-wider text-gradient-ai">
                Specialized AI Curricula & Masterclasses
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#17243A]">
                Academic <span className="text-gradient-ai">Artificial Intelligence</span> Programs & Pathways
              </h1>
              <p className="text-base text-[#687386] leading-relaxed">
                Four distinct educational tracks designed around cognitive developmental stages. Every learner works with age peers in small, interactive cohorts.
              </p>
            </div>
            <Link href="/apply">
              <Button variant="ai" size="md" className="shrink-0 font-bold shadow-sm">
                Apply for Admission
                <ArrowRight className="h-4 w-4 ml-1.5 arrow-icon" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Programs List */}
        <Reveal>
          <div className="space-y-8">
            {PROGRAMS.map((program) => {
              const Icon = program.icon;
              return (
                <div
                  key={program.id}
                  className="rounded-2xl border border-[#DDE2E7] bg-white p-7 sm:p-10 card-editorial card-ai-glow group"
                >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left Column: Track Details */}
                  <div className="lg:col-span-8 space-y-5">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <div
                        className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${program.accent}15`, color: program.accent }}
                      >
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl sm:text-2xl font-bold text-[#17243A]">
                            <AIHighlight text={program.audience} />
                          </h2>
                          <Badge variant={program.badgeVariant} className="text-[10px] uppercase font-bold">
                            {program.ageRange}
                          </Badge>
                        </div>
                        <p className="text-xs font-semibold mt-0.5" style={{ color: program.accent }}>
                          <AIHighlight text={program.tagline} />
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-[#354052] leading-relaxed">
                      {program.description}
                    </p>

                    {/* Milestones */}
                    <div className="pt-3 border-t border-[#DDE2E7] space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#687386] block">
                        Core Program Milestones:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#354052]">
                        {program.milestones.map((m, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <CheckCircle2
                              className="h-3.5 w-3.5 shrink-0 mt-0.5"
                              style={{ color: program.accent }}
                              aria-hidden="true"
                            />
                            <span>{m}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Capstone Deliverable Note */}
                    <div className="bg-[#FAF8F3] border border-[#DDE2E7] rounded-xl p-3 flex items-center gap-2.5 text-xs">
                      <Terminal className="h-4 w-4 shrink-0 text-[#17243A]" aria-hidden="true" />
                      <span className="text-[#687386]">
                        Capstone Deliverable:{" "}
                        <strong className="text-[#17243A] font-semibold">{program.deliverable}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="lg:col-span-4 flex flex-col justify-center items-start lg:items-end border-t lg:border-t-0 lg:border-l border-[#DDE2E7] pt-6 lg:pt-0 lg:pl-8 space-y-3 w-full">
                    <span className="text-[10px] uppercase font-bold text-[#687386] tracking-wider self-start lg:self-end">
                      Cohort Exploration
                    </span>
                    <Link
                      href={`/courses?audience=${program.audienceKey}`}
                      className="w-full block"
                    >
                      <Button variant="primary" size="md" className="w-full justify-center font-semibold">
                        View Track Courses
                        <ArrowRight className="h-4 w-4 ml-1.5 arrow-icon" aria-hidden="true" />
                      </Button>
                    </Link>
                    <Link
                      href={`/courses/${program.featuredCourseSlug}`}
                      className="w-full block"
                    >
                      <Button variant="outline" size="sm" className="w-full justify-center">
                        Detailed Syllabus
                      </Button>
                    </Link>
                    <Link
                      href="/contact"
                      className="text-xs text-[#355F99] font-medium hover:underline self-center lg:self-end pt-1"
                    >
                      Speak with Track Advisor &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Reveal>
      </div>
    </div>
  );
}
