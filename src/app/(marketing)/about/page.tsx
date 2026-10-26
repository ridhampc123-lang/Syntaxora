import React from "react";
import Link from "next/link";
import { ShieldCheck, Target, HeartHandshake, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

export const metadata = {
  title: "About Syntaxora — Mission & Educational Standards",
  description:
    "Learn about Syntaxora's mission to deliver rigorous, ethical, and project-based artificial intelligence education for students of all ages.",
};

export default function AboutPage() {
  return (
    <div className="bg-[#FAF8F3] min-h-screen py-12 lg:py-18 text-[#354052]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="text-xs text-[#687386]">
          <ol className="flex items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-[#17243A]">
                Home
              </Link>
            </li>
            <li>/</li>
            <li className="font-semibold text-[#17243A]">About Syntaxora</li>
          </ol>
        </nav>

        {/* Editorial Headline */}
        <div className="space-y-4 max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-wider text-gradient-ai">
            Educational Philosophy & AI Standards
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#17243A] leading-tight">
            Demystifying <span className="text-gradient-ai">Artificial Intelligence</span> through{" "}
            <span className="font-display italic font-normal text-[#355F99]">
              first-principles engineering
            </span>
            .
          </h1>
          <p className="text-base sm:text-lg text-[#687386] leading-relaxed font-normal">
            Syntaxora was founded on a straightforward pedagogical thesis: artificial intelligence literacy should not be reduced to passive consumption or superficial hype. It must be taught as an applied, rigorous discipline accessible across developmental stages.
          </p>
        </div>

        {/* 3 Core Principles */}
        <Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-[#DDE2E7] bg-white p-7 space-y-3.5 shadow-sm card-editorial group hover:border-[#355F99]/60">
              <div className="h-10 w-10 rounded-xl bg-[#EAF0F8] text-[#355F99] flex items-center justify-center transition-transform group-hover:scale-105 duration-200">
                <Target className="h-5 w-5" aria-hidden="true" />
              </div>
              <h2 className="text-lg font-bold text-[#17243A] group-hover:text-[#355F99] transition-colors">Hands-On Code Mastery</h2>
              <p className="text-xs sm:text-sm text-[#687386] leading-relaxed">
                Every theoretical concept is coupled with immediate terminal implementation. We prioritize debugging, testing, and edge deployment over passive video lectures.
              </p>
            </div>

            <div className="rounded-2xl border border-[#DDE2E7] bg-white p-7 space-y-3.5 shadow-sm card-editorial group hover:border-[#167F78]/60">
              <div className="h-10 w-10 rounded-xl bg-[#E7F5F4] text-[#167F78] flex items-center justify-center transition-transform group-hover:scale-105 duration-200">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </div>
              <h2 className="text-lg font-bold text-[#17243A] group-hover:text-[#167F78] transition-colors">Minor Safety & Privacy</h2>
              <p className="text-xs sm:text-sm text-[#687386] leading-relaxed">
                For children and teenagers, guardian oversight is paramount. We maintain zero-trust permission boundaries, cryptographically verified invitations, and zero public exposure of minor records.
              </p>
            </div>

            <div className="rounded-2xl border border-[#DDE2E7] bg-white p-7 space-y-3.5 shadow-sm card-editorial group hover:border-[#D7A66A]">
              <div className="h-10 w-10 rounded-xl bg-[#FDF6ED] text-[#9A6726] flex items-center justify-center transition-transform group-hover:scale-105 duration-200">
                <HeartHandshake className="h-5 w-5" aria-hidden="true" />
              </div>
              <h2 className="text-lg font-bold text-[#17243A] group-hover:text-[#9A6726] transition-colors">Authentic Transparency</h2>
              <p className="text-xs sm:text-sm text-[#687386] leading-relaxed">
                No fabricated testimonials, no false job guarantees, and no inflated metrics. We focus strictly on genuine instructional quality and verified learner progress.
              </p>
            </div>
          </div>
        </Reveal>

        {/* Narrative Section: Bridging Intuition, Mathematics & Code */}
        <Reveal delay={100}>
          <div className="rounded-2xl border border-[#DDE2E7] bg-white p-8 sm:p-12 space-y-6 shadow-sm card-editorial">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#355F99]">
                Pedagogical Framework
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#17243A]">
                Bridging Intuition, Mathematics & Code
              </h2>
            </div>
            <div className="space-y-4 text-sm sm:text-base text-[#354052] leading-relaxed">
              <p>
                Traditional computer science education often delays machine learning until the final years of university, presenting it as pure mathematics divorced from practical systems. Conversely, popular internet tutorials frequently encourage copying snippets without explaining loss functions, data bias, or hardware execution limits.
              </p>
              <p>
                Syntaxora charts a balanced pedagogical path across four age tracks:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl border border-[#DDE2E7] bg-[#FAF8F3] space-y-1.5 transition-colors hover:border-[#167F78]/40">
                  <div className="font-bold text-sm text-[#17243A]">Young Learners (Ages 7–11)</div>
                  <p className="text-xs text-[#687386]">
                    Build visual pattern classifiers, learn computational logic, and explore sensor feedback in a safe, guided environment.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-[#DDE2E7] bg-[#FAF8F3] space-y-1.5 transition-colors hover:border-[#355F99]/40">
                  <div className="font-bold text-sm text-[#17243A]">Teens (Ages 12–17)</div>
                  <p className="text-xs text-[#687386]">
                    Write production Python, process real camera streams with OpenCV, and train convolutional networks for rover robotics.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-[#DDE2E7] bg-[#FAF8F3] space-y-1.5 transition-colors hover:border-[#17243A]/40">
                  <div className="font-bold text-sm text-[#17243A]">College Students</div>
                  <p className="text-xs text-[#687386]">
                    Master gradient descent mathematics, custom autograd engines, and transformer attention tensors in PyTorch.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-[#DDE2E7] bg-[#FAF8F3] space-y-1.5 transition-colors hover:border-[#D7A66A]/40">
                  <div className="font-bold text-sm text-[#17243A]">Working Professionals</div>
                  <p className="text-xs text-[#687386]">
                    Architect production RAG systems with vector databases, embeddings, and tool-calling agent pipelines that do not hallucinate.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[#DDE2E7] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-[#687386]">
                Have questions regarding our academic philosophy or faculty?
              </div>
              <Link href="/contact">
                <Button variant="primary" size="md" className="font-semibold">
                  Contact Admissions Support
                  <ArrowRight className="h-4 w-4 ml-1.5 arrow-icon" aria-hidden="true" />
                </Button>
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
