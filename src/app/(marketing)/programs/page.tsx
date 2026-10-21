import React from "react";
import Link from "next/link";
import { Compass, Laptop, GraduationCap, Cpu, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata = {
  title: "Academic Programs & Learning Tracks — Syntaxora",
  description:
    "Explore our age-specialized curriculum tracks in machine learning, robotics, and applied artificial intelligence.",
};

const PROGRAMS = [
  {
    id: "young-learners",
    audience: "Young Learners (Ages 7–11)",
    tagline: "Cultivating Computational Intuition & Visual Logic",
    icon: Compass,
    color: "#168B83",
    bg: "#E2F4F2",
    description:
      "A joyful, interactive entry point to how computers perceive the world. Students build pattern classifiers, solve algorithmic mazes, and learn the fundamental concept that software learns from examples.",
    milestones: [
      "Visual pattern matching and sensor comprehension",
      "Block-based algorithmic flow and conditional thinking",
      "Building a friendly doodle-recognition AI sidekick",
    ],
    audienceKey: "young_learners",
  },
  {
    id: "teens",
    audience: "Teens & High School (Ages 12–17)",
    tagline: "Python Robotics, Computer Vision & Edge Intelligence",
    icon: Laptop,
    color: "#3869AD",
    bg: "#E8EFF8",
    description:
      "Bridging block programming to professional syntax. High school students write production-ready Python, process real camera streams with OpenCV, and train convolutional networks to classify objects in real time.",
    milestones: [
      "Core Python syntax, list comprehensions, and data structures",
      "Live computer vision, bounding boxes, and image filters",
      "Autonomous rover obstacle detection and lane following",
    ],
    audienceKey: "teens",
  },
  {
    id: "college",
    audience: "College & University (Undergrads & Postgrads)",
    tagline: "Deep Learning Foundations, PyTorch & Transformers",
    icon: GraduationCap,
    color: "#142541",
    bg: "#F3F6FA",
    description:
      "Rigorous mathematical grounding paired with hands-on systems engineering. Students dissect loss landscapes, write custom autograd engines, and implement multi-head attention mechanisms from scratch.",
    milestones: [
      "Gradient descent, backpropagation, and custom tensor math",
      "Convolutional and recurrent neural architectures in PyTorch",
      "Transformer self-attention and fine-tuning foundations",
    ],
    audienceKey: "college_students",
  },
  {
    id: "adults",
    audience: "Adults & Working Professionals",
    tagline: "Enterprise Generative AI, RAG Systems & Model Deployment",
    icon: Cpu,
    color: "#263449",
    bg: "#F3F6FA",
    description:
      "Engineered for software developers, product leaders, and analysts. Learn how to architect robust retrieval-augmented generation pipelines, manage vector embeddings, and automate complex workflows with LLM agents.",
    milestones: [
      "Vector embeddings, hybrid semantic retrieval, and chunking strategies",
      "Building enterprise RAG assistants with PostgreSQL and pgvector",
      "Agent orchestration, tool invocation, and security guardrails",
    ],
    audienceKey: "adults",
  },
];

export default function ProgramsPage() {
  return (
    <div className="bg-[#F3F6FA] min-h-screen py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#142541] tracking-tight">
            Academic Programs & Pathways
          </h1>
          <p className="text-base text-[#5F6F84]">
            Four specialized educational tracks structured around developmental stages, ensuring students learn with peers at their cognitive level.
          </p>
        </div>

        {/* Programs List */}
        <div className="space-y-8">
          {PROGRAMS.map((program) => {
            const Icon = program.icon;
            return (
              <Card key={program.id} className="border-[#DCE4EE] bg-white overflow-hidden shadow-sm">
                <div className="p-8 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-8 space-y-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: program.bg, color: program.color }}
                      >
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-[#142541]">{program.audience}</h2>
                        <p className="text-xs font-semibold text-[#5F6F84]">{program.tagline}</p>
                      </div>
                    </div>
                    <p className="text-sm text-[#263449] leading-relaxed">
                      {program.description}
                    </p>
                    <div className="space-y-2 pt-2">
                      <div className="text-xs font-semibold text-[#142541] uppercase tracking-wider">
                        Core Program Milestones:
                      </div>
                      <ul className="space-y-1.5 text-xs text-[#5F6F84]">
                        {program.milestones.map((m, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-[#168B83] shrink-0" aria-hidden="true" />
                            <span>{m}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="lg:col-span-4 flex flex-col justify-center items-start lg:items-end border-t lg:border-t-0 lg:border-l border-[#DCE4EE] pt-6 lg:pt-0 lg:pl-8 space-y-3">
                    <Link href={`/courses?audience=${program.audienceKey}`} className="w-full">
                      <Button variant="primary" size="md" className="w-full justify-center">
                        Explore Track Courses
                        <ArrowRight className="h-4 w-4 ml-1.5" aria-hidden="true" />
                      </Button>
                    </Link>
                    <Link href="/contact" className="w-full">
                      <Button variant="outline" size="sm" className="w-full justify-center">
                        Speak with Track Advisor
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
