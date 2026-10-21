import React from "react";
import Link from "next/link";
import { Sparkles, Mail, ShieldCheck, BookOpen, GraduationCap, Users } from "lucide-react";

export function MarketingFooter() {
  return (
    <footer className="border-t border-[#DCE4EE] bg-[#142541] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-white">
              <div className="h-8 w-8 rounded-lg bg-[#3869AD] flex items-center justify-center text-white">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              </div>
              <span>Syntaxora</span>
            </Link>
            <p className="text-sm text-[#DCE4EE]/80 leading-relaxed max-w-sm">
              Syntaxora is an online AI learning academy for kids, teens, university students, and professionals. Live classes, hands-on engineering, and verified skill development.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-[#168B83] bg-[#0d192d] p-2.5 rounded-lg border border-[#3869AD]/30 w-fit">
              <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Verified guardian-student privacy & security standards</span>
            </div>
          </div>

          {/* Learning Pathways */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#DCE4EE]/60">
              Learning Paths
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/courses?audience=young_learners" className="text-[#DCE4EE]/80 hover:text-white transition-colors">
                  Young Learners (Ages 7–11)
                </Link>
              </li>
              <li>
                <Link href="/courses?audience=teens" className="text-[#DCE4EE]/80 hover:text-white transition-colors">
                  Teens Robotics & Python (12–17)
                </Link>
              </li>
              <li>
                <Link href="/courses?audience=college_students" className="text-[#DCE4EE]/80 hover:text-white transition-colors">
                  College Deep Learning & PyTorch
                </Link>
              </li>
              <li>
                <Link href="/courses?audience=adults" className="text-[#DCE4EE]/80 hover:text-white transition-colors">
                  Adult Generative AI & Systems
                </Link>
              </li>
            </ul>
          </div>

          {/* Role Portals */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#DCE4EE]/60">
              Portals
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/student" className="text-[#DCE4EE]/80 hover:text-white transition-colors flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
                  Student Portal
                </Link>
              </li>
              <li>
                <Link href="/parent" className="text-[#DCE4EE]/80 hover:text-white transition-colors flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" aria-hidden="true" />
                  Parent & Guardian Portal
                </Link>
              </li>
              <li>
                <Link href="/instructor" className="text-[#DCE4EE]/80 hover:text-white transition-colors flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                  Instructor Portal
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-[#DCE4EE]/80 hover:text-white transition-colors">
                  Sign In / Register
                </Link>
              </li>
            </ul>
          </div>

          {/* Academy & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#DCE4EE]/60">
              Academy & Legal
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-[#DCE4EE]/80 hover:text-white transition-colors">
                  About Syntaxora
                </Link>
              </li>
              <li>
                <Link href="/instructors" className="text-[#DCE4EE]/80 hover:text-white transition-colors">
                  Faculty & Mentors
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-[#DCE4EE]/80 hover:text-white transition-colors flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                  Admissions Support
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-[#DCE4EE]/80 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-[#DCE4EE]/80 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-[#DCE4EE]/60 gap-4">
          <p>© 2026 Syntaxora. All rights reserved.</p>
          <p>Practical AI, Robotics, and Computer Science Education.</p>
        </div>
      </div>
    </footer>
  );
}
