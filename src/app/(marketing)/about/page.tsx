import React from "react";
import Link from "next/link";
import { ShieldCheck, Target, HeartHandshake, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "About Syntaxora — Mission & Educational Standards",
  description:
    "Learn about Syntaxora's mission to deliver rigorous, ethical, and project-based artificial intelligence education for students of all ages.",
};

export default function AboutPage() {
  return (
    <div className="bg-[#F3F6FA] min-h-screen py-12 lg:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#142541] tracking-tight">
            Our Mission & Educational Philosophy
          </h1>
          <p className="text-base text-[#5F6F84] leading-relaxed">
            Syntaxora was founded on a simple conviction: artificial intelligence literacy should not be limited to passive consumption or superficial hype. It should be taught as an applied, rigorous engineering discipline.
          </p>
        </div>

        {/* Core Principles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl border border-[#DCE4EE] bg-white p-6 space-y-3">
            <div className="h-10 w-10 rounded-lg bg-[#E8EFF8] text-[#3869AD] flex items-center justify-center">
              <Target className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-bold text-[#142541]">Hands-On Mastery</h2>
            <p className="text-xs text-[#5F6F84] leading-relaxed">
              Every concept is coupled with immediate code implementation. We prioritize debugging, testing, and edge deployment over passive slideshows.
            </p>
          </div>

          <div className="rounded-xl border border-[#DCE4EE] bg-white p-6 space-y-3">
            <div className="h-10 w-10 rounded-lg bg-[#E2F4F2] text-[#168B83] flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-bold text-[#142541]">Minor Safety & Privacy</h2>
            <p className="text-xs text-[#5F6F84] leading-relaxed">
              For young learners and teens, guardian oversight is paramount. We maintain strict permission boundaries, verified relationships, and zero public exposure of minor records.
            </p>
          </div>

          <div className="rounded-xl border border-[#DCE4EE] bg-white p-6 space-y-3">
            <div className="h-10 w-10 rounded-lg bg-[#F3F6FA] text-[#142541] flex items-center justify-center">
              <HeartHandshake className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-bold text-[#142541]">Authentic Transparency</h2>
            <p className="text-xs text-[#5F6F84] leading-relaxed">
              No fabricated testimonials, no false placement promises, and no inflated metrics. We focus on genuine pedagogical quality and verified student progress.
            </p>
          </div>
        </div>

        {/* Narrative Section */}
        <div className="rounded-2xl border border-[#DCE4EE] bg-white p-8 sm:p-12 space-y-6">
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#3869AD]">
              How We Teach
            </span>
            <h2 className="text-2xl font-bold text-[#142541]">
              Bridging Intuition, Mathematics & Code
            </h2>
          </div>
          <div className="space-y-4 text-sm text-[#263449] leading-relaxed">
            <p>
              Traditional computer science education often delays artificial intelligence until late in undergraduate study, treating it as esoteric theory. Conversely, introductory tutorials frequently skip core concepts entirely, encouraging students to paste snippets without comprehending the underlying loss functions or data distributions.
            </p>
            <p>
              Syntaxora charts a balanced pedagogical path:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#5F6F84]">
              <li>
                <strong className="text-[#142541]">Young Learners (Ages 7–11)</strong> explore how machines see and make decisions using visual block models and sensor labs.
              </li>
              <li>
                <strong className="text-[#142541]">Teens (Ages 12–17)</strong> write authentic Python, processing camera streams with OpenCV and training real classifiers.
              </li>
              <li>
                <strong className="text-[#142541]">University Students</strong> dissect gradient descent, neural loss surfaces, PyTorch autograd, and transformer attention mechanisms.
              </li>
              <li>
                <strong className="text-[#142541]">Working Adults</strong> build retrieval-augmented generation (RAG) architectures and manage vector embeddings for real workplace software.
              </li>
            </ul>
          </div>

          <div className="pt-6 border-t border-[#DCE4EE] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-[#5F6F84]">
              Have questions about our academic standards or faculty?
            </div>
            <Link href="/contact">
              <Button variant="primary" size="md">
                Get in Touch with Admissions
                <ArrowRight className="h-4 w-4 ml-1.5" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
