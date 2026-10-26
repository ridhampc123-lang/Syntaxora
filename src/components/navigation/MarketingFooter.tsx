import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, ShieldCheck, GraduationCap, Users, Clock, ArrowRight } from "lucide-react";

export function MarketingFooter() {
  return (
    <footer className="border-t border-[#DDE2E7] bg-[#17243A] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-18">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12">
          {/* Brand Info */}
          <div className="md:col-span-4 space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-3 group"
              aria-label="Syntaxora AI Academy Homepage"
            >
              <div className="relative h-9 w-9 rounded-xl overflow-hidden shadow-sm border border-white/20 bg-[#03060C] shrink-0">
                <Image
                  src="/icon.png"
                  alt="Syntaxora"
                  width={36}
                  height={36}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl tracking-tight text-white leading-tight">
                  Syntaxora
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-[#DDE2E7]/70">
                  <span className="text-gradient-ai-glow font-extrabold mr-0.5">AI</span> Learning Academy
                </span>
              </div>
            </Link>

            <p className="text-sm text-[#DDE2E7]/80 leading-relaxed max-w-sm">
              Syntaxora is an online <span className="text-gradient-ai-glow font-semibold">AI</span> learning academy for children, teenagers, university students, and professionals. Live instructor-led cohorts, engineering practice, and verified skill mastery.
            </p>

            <div className="pt-2 flex items-start gap-2.5 text-xs text-[#DDE2E7]/80 bg-white/5 p-3 rounded-lg border border-white/10 max-w-sm">
              <ShieldCheck className="h-4 w-4 shrink-0 text-[#167F78] mt-0.5" aria-hidden="true" />
              <span>
                Zero-trust guardian verification. Student academic records remain protected and private.
              </span>
            </div>
          </div>

          {/* Learning Pathways */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#D7A66A]">
              Learning Paths
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-[#DDE2E7]/80">
              <li>
                <Link href="/courses?audience=young_learners" className="hover:text-white transition-colors">
                  Young Learners (7–11)
                </Link>
              </li>
              <li>
                <Link href="/courses?audience=teens" className="hover:text-white transition-colors">
                  Teens & Robotics (12–17)
                </Link>
              </li>
              <li>
                <Link href="/courses?audience=college_students" className="hover:text-white transition-colors">
                  College & Neural Nets
                </Link>
              </li>
              <li>
                <Link href="/courses?audience=adults" className="hover:text-white transition-colors">
                  Adults & Generative AI
                </Link>
              </li>
              <li>
                <Link href="/programs" className="hover:text-[#D7A66A] transition-colors font-medium inline-flex items-center gap-1 pt-1">
                  View Full Curriculum
                  <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Role Portals */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#D7A66A]">
              Portals & Admissions
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-[#DDE2E7]/80">
              <li>
                <Link href="/apply" className="text-white font-medium hover:text-[#D7A66A] transition-colors flex items-center gap-1.5">
                  Apply for Admission
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-white transition-colors">
                  How Learning Works
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Portal Sign In
                </Link>
              </li>
              <li>
                <Link href="/sign-up?role=parent" className="hover:text-white transition-colors">
                  Parent Registration
                </Link>
              </li>
              <li>
                <Link href="/student" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5 text-[#355F99]" aria-hidden="true" />
                  Student Portal
                </Link>
              </li>
              <li>
                <Link href="/parent" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-[#167F78]" aria-hidden="true" />
                  Parent & Guardian Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Legal */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#D7A66A]">
              Admissions Support
            </h4>
            <div className="space-y-2 text-xs sm:text-sm text-[#DDE2E7]/80">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#355F99] shrink-0" aria-hidden="true" />
                <a href="mailto:admissions@syntaxora.com" className="hover:text-white transition-colors">
                  admissions@syntaxora.com
                </a>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-[#167F78] shrink-0 mt-0.5" aria-hidden="true" />
                <span className="text-xs text-[#DDE2E7]/70">
                  Mon – Fri: 9:00 AM – 6:00 PM IST
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 space-y-2">
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#DDE2E7]/70">
                <Link href="/about" className="hover:text-white transition-colors">
                  About
                </Link>
                <Link href="/instructors" className="hover:text-white transition-colors">
                  Faculty
                </Link>
                <Link href="/faq" className="hover:text-white transition-colors">
                  FAQ
                </Link>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-[#DDE2E7]/60 gap-4">
          <p>© 2026 Syntaxora AI Learning Academy. All rights reserved.</p>
          <p className="text-center sm:text-right">
            Practical AI, Robotics & Systems Education for Kids, Teens, and Adults.
          </p>
        </div>
      </div>
    </footer>
  );
}
