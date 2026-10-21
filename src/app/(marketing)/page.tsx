import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Code2,
  Cpu,
  Brain,
  Video,
  CheckCircle2,
  Sparkles,
  Users,
  Compass,
  Laptop,
  GraduationCap,
  Layers,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPublishedCourses } from "@/server/services/courseService";
import { getApprovedInstructors } from "@/server/services/instructorService";
import { formatCurrency } from "@/lib/utils";

export const metadata = {
  title: "Syntaxora — AI Learning Academy | Practical Artificial Intelligence for All Ages",
  description:
    "Master machine learning, robotics, computer vision, and neural networks through live interactive cohorts for kids, teens, university students, and adults.",
};

export default async function HomePage() {
  const [courses, instructors] = await Promise.all([
    getPublishedCourses(),
    getApprovedInstructors(),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#142541] via-[#1b3154] to-[#142541] text-white py-20 lg:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(#3869AD_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center lg:text-left">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-medium text-[#E8EFF8] backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-[#168B83]" aria-hidden="true" />
                <span>Next Cohorts Open for Spring & Summer Enrollment</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                Practical AI Education. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3869AD] via-[#60A5FA] to-[#168B83]">
                  Built for Every Generation.
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-[#DCE4EE]/90 max-w-2xl leading-relaxed">
                From playful computational logic for kids to transformer engineering for college graduates and professionals. Live instructor-led cohorts, real projects, and verified skill mastery.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link href="/courses">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto font-semibold">
                    Explore Courses
                    <ArrowRight className="h-5 w-5 ml-2" aria-hidden="true" />
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white/10 border-white/20 text-white hover:bg-white/20">
                    How Learning Works
                  </Button>
                </Link>
              </div>

              {/* Verified Trust Flags (No fake counts or ratings) */}
              <div className="pt-6 border-t border-white/10 grid grid-cols-3 gap-4 text-left">
                <div>
                  <div className="text-xs uppercase font-semibold text-[#DCE4EE]/60 tracking-wider">
                    Format
                  </div>
                  <div className="text-sm font-medium text-white flex items-center gap-1.5 mt-0.5">
                    <Video className="h-4 w-4 text-[#168B83]" aria-hidden="true" />
                    Live & Interactive
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase font-semibold text-[#DCE4EE]/60 tracking-wider">
                    Curriculum
                  </div>
                  <div className="text-sm font-medium text-white flex items-center gap-1.5 mt-0.5">
                    <Code2 className="h-4 w-4 text-[#3869AD]" aria-hidden="true" />
                    100% Project-Based
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase font-semibold text-[#DCE4EE]/60 tracking-wider">
                    Privacy
                  </div>
                  <div className="text-sm font-medium text-white flex items-center gap-1.5 mt-0.5">
                    <CheckCircle2 className="h-4 w-4 text-[#168B83]" aria-hidden="true" />
                    Verified Guardians
                  </div>
                </div>
              </div>
            </div>

            {/* Hero Interactive Showcase Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-2xl text-left">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500/80" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                    <div className="h-3 w-3 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-xs font-mono text-[#DCE4EE]/60">syntaxora-ai/model.py</span>
                </div>
                <div className="mt-4 font-mono text-xs text-[#DCE4EE]/90 space-y-2">
                  <p className="text-[#60A5FA]"># Live student cohort project</p>
                  <p><span className="text-[#F472B6]">import</span> torch</p>
                  <p><span className="text-[#F472B6]">import</span> cv2</p>
                  <p className="text-[#9CA3AF]"># Detect objects in camera stream</p>
                  <p><span className="text-[#FBBF24]">detector</span> = VisionClassifier(classes=[<span className="text-[#34D399]">&quot;robot&quot;</span>, <span className="text-[#34D399]">&quot;marker&quot;</span>])</p>
                  <p><span className="text-[#60A5FA]">prediction</span> = detector.infer(frame)</p>
                  <div className="mt-4 p-3 rounded-lg bg-[#142541]/80 border border-[#168B83]/30">
                    <div className="flex items-center justify-between text-[11px] text-[#168B83]">
                      <span>Inference Status: Active</span>
                      <span>Latency: 14ms</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-[#168B83] w-4/5 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Learning Paths by Age Group */}
      <section className="py-20 bg-white border-b border-[#DCE4EE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#3869AD]">
              Age-Tailored Curricula
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-[#142541]">
              Engineered for Every Stage of Cognitive Growth
            </h3>
            <p className="text-base text-[#5F6F84]">
              We do not treat a 9-year-old explorer like a university student. Our 4 specialized tracks adapt pedagogical style, tooling, and math depth.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Young Learners */}
            <Card className="hover:shadow-md transition-shadow border-t-4 border-t-[#168B83]">
              <CardHeader className="space-y-2">
                <div className="h-10 w-10 rounded-lg bg-[#E2F4F2] text-[#168B83] flex items-center justify-center">
                  <Compass className="h-5 w-5" aria-hidden="true" />
                </div>
                <CardTitle className="text-lg">Young Learners</CardTitle>
                <div className="text-xs font-semibold text-[#168B83]">Ages 7 – 11</div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-[#5F6F84]">
                <p>
                  Visual block programming, sensor interaction, and playful logic puzzles exploring how computers see and hear.
                </p>
                <ul className="space-y-1.5 text-xs text-[#263449]">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#168B83]" aria-hidden="true" />
                    Visual Pattern Recognition
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#168B83]" aria-hidden="true" />
                    Block-Based Algorithm Logic
                  </li>
                </ul>
                <Link href="/courses?audience=young_learners" className="inline-block text-xs font-semibold text-[#3869AD] hover:underline">
                  View Track Courses →
                </Link>
              </CardContent>
            </Card>

            {/* Teens */}
            <Card className="hover:shadow-md transition-shadow border-t-4 border-t-[#3869AD]">
              <CardHeader className="space-y-2">
                <div className="h-10 w-10 rounded-lg bg-[#E8EFF8] text-[#3869AD] flex items-center justify-center">
                  <Laptop className="h-5 w-5" aria-hidden="true" />
                </div>
                <CardTitle className="text-lg">Teens & High School</CardTitle>
                <div className="text-xs font-semibold text-[#3869AD]">Ages 12 – 17</div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-[#5F6F84]">
                <p>
                  Transitioning to real Python syntax, computer vision with OpenCV, and building interactive robotics algorithms.
                </p>
                <ul className="space-y-1.5 text-xs text-[#263449]">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#3869AD]" aria-hidden="true" />
                    Python Syntax & Data Structures
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#3869AD]" aria-hidden="true" />
                    Camera Computer Vision
                  </li>
                </ul>
                <Link href="/courses?audience=teens" className="inline-block text-xs font-semibold text-[#3869AD] hover:underline">
                  View Track Courses →
                </Link>
              </CardContent>
            </Card>

            {/* College Students */}
            <Card className="hover:shadow-md transition-shadow border-t-4 border-t-[#142541]">
              <CardHeader className="space-y-2">
                <div className="h-10 w-10 rounded-lg bg-[#F3F6FA] text-[#142541] flex items-center justify-center">
                  <GraduationCap className="h-5 w-5" aria-hidden="true" />
                </div>
                <CardTitle className="text-lg">College & University</CardTitle>
                <div className="text-xs font-semibold text-[#142541]">Undergrad & Postgrad</div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-[#5F6F84]">
                <p>
                  Mathematical foundations of deep learning, PyTorch implementation, neural loss surfaces, and transformers.
                </p>
                <ul className="space-y-1.5 text-xs text-[#263449]">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#142541]" aria-hidden="true" />
                    PyTorch Tensor Architectures
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#142541]" aria-hidden="true" />
                    Attention & Transformer Models
                  </li>
                </ul>
                <Link href="/courses?audience=college_students" className="inline-block text-xs font-semibold text-[#3869AD] hover:underline">
                  View Track Courses →
                </Link>
              </CardContent>
            </Card>

            {/* Adults */}
            <Card className="hover:shadow-md transition-shadow border-t-4 border-t-[#263449]">
              <CardHeader className="space-y-2">
                <div className="h-10 w-10 rounded-lg bg-[#F3F6FA] text-[#263449] flex items-center justify-center">
                  <Cpu className="h-5 w-5" aria-hidden="true" />
                </div>
                <CardTitle className="text-lg">Adults & Professionals</CardTitle>
                <div className="text-xs font-semibold text-[#263449]">Workplace Upskilling</div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-[#5F6F84]">
                <p>
                  Generative AI systems, prompt architecture, Retrieval-Augmented Generation (RAG), and enterprise vector stores.
                </p>
                <ul className="space-y-1.5 text-xs text-[#263449]">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#263449]" aria-hidden="true" />
                    Vector Databases & Semantic Search
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#263449]" aria-hidden="true" />
                    Enterprise RAG Engineering
                  </li>
                </ul>
                <Link href="/courses?audience=adults" className="inline-block text-xs font-semibold text-[#3869AD] hover:underline">
                  View Track Courses →
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 3. Real Course Highlights from Database */}
      <section className="py-20 bg-[#F3F6FA] border-b border-[#DCE4EE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#3869AD]">
                Featured Courses
              </h2>
              <h3 className="text-3xl font-extrabold text-[#142541]">
                Active Learning Cohorts
              </h3>
            </div>
            <Link href="/courses">
              <Button variant="outline" size="sm">
                View All Courses ({courses.length})
              </Button>
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.slice(0, 3).map((course) => (
              <Card key={course.id} className="flex flex-col justify-between hover:shadow-lg transition-all border-[#DCE4EE]">
                <div>
                  <CardHeader className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant={course.level === "beginner" ? "teal" : course.level === "advanced" ? "navy" : "primary"}>
                        {course.level}
                      </Badge>
                      <span className="text-xs text-[#5F6F84] font-medium">
                        {course.duration_weeks} Weeks
                      </span>
                    </div>
                    <CardTitle className="text-xl text-[#142541]">
                      {course.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-[#5F6F84] leading-relaxed line-clamp-3">
                      {course.summary}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-[#263449] pt-2 border-t border-[#DCE4EE]">
                      <span className="flex items-center gap-1">
                        <Video className="h-3.5 w-3.5 text-[#168B83]" aria-hidden="true" />
                        {course.delivery_mode.replace("_", " ")}
                      </span>
                      <span className="flex items-center gap-1 capitalize">
                        <Users className="h-3.5 w-3.5 text-[#3869AD]" aria-hidden="true" />
                        {course.audience_group.replace("_", " ")}
                      </span>
                    </div>
                  </CardContent>
                </div>
                <div className="p-6 pt-0 flex items-center justify-between border-t border-[#DCE4EE]/60 mt-4">
                  <div className="text-lg font-bold text-[#142541]">
                    {course.price_in_cents > 0 ? formatCurrency(course.price_in_cents, course.currency) : "Free"}
                  </div>
                  <Link href={`/courses/${course.slug}`}>
                    <Button variant="primary" size="sm">
                      Course Syllabus
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 4. What You Will Build (Project Section) */}
      <section className="py-20 bg-white border-b border-[#DCE4EE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#168B83]">
              Applied Engineering
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-[#142541]">
              What You Will Actually Build
            </h3>
            <p className="text-base text-[#5F6F84]">
              Syntaxora students do not passively consume video lectures. Every student completes real portfolio projects reviewed by instructors.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border border-[#DCE4EE] bg-[#F3F6FA] space-y-4">
              <div className="h-10 w-10 rounded-lg bg-[#3869AD] text-white flex items-center justify-center">
                <Brain className="h-5 w-5" aria-hidden="true" />
              </div>
              <h4 className="text-lg font-bold text-[#142541]">Autonomous Vision Rover Controller</h4>
              <p className="text-sm text-[#5F6F84] leading-relaxed">
                Build a computer vision system that tracks physical lane markers and maneuvers a simulated robotic chassis using edge Python algorithms.
              </p>
              <div className="text-xs font-semibold text-[#3869AD]">Stack: Python, OpenCV, NumPy</div>
            </div>

            <div className="p-6 rounded-xl border border-[#DCE4EE] bg-[#F3F6FA] space-y-4">
              <div className="h-10 w-10 rounded-lg bg-[#168B83] text-white flex items-center justify-center">
                <Layers className="h-5 w-5" aria-hidden="true" />
              </div>
              <h4 className="text-lg font-bold text-[#142541]">Custom Neural Network From Scratch</h4>
              <p className="text-sm text-[#5F6F84] leading-relaxed">
                Write a multi-layer perceptron with custom forward and backward passes, calculating gradients and cross-entropy loss without external ML libraries.
              </p>
              <div className="text-xs font-semibold text-[#168B83]">Stack: PyTorch, Pure Math, Tensor Math</div>
            </div>

            <div className="p-6 rounded-xl border border-[#DCE4EE] bg-[#F3F6FA] space-y-4">
              <div className="h-10 w-10 rounded-lg bg-[#142541] text-white flex items-center justify-center">
                <Cpu className="h-5 w-5" aria-hidden="true" />
              </div>
              <h4 className="text-lg font-bold text-[#142541]">Knowledge-Base RAG Assistant</h4>
              <p className="text-sm text-[#5F6F84] leading-relaxed">
                Build a production-grade question-answering system using vector embeddings, hybrid semantic search, and prompt containment for enterprise documents.
              </p>
              <div className="text-xs font-semibold text-[#142541]">Stack: Vector Embeddings, PostgreSQL, LLMs</div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. How Learning Works: Methodology */}
      <section id="how-it-works" className="py-20 bg-[#F3F6FA] border-b border-[#DCE4EE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#3869AD]">
              Our Pedagogy
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-[#142541]">
              How Learning Works at Syntaxora
            </h3>
            <p className="text-base text-[#5F6F84]">
              A disciplined, supportive 5-step feedback loop ensures concept mastery.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { step: "01", title: "Enroll", desc: "Select the age-appropriate cohort and secure your seat with verified guardian or student setup." },
              { step: "02", title: "Attend Live", desc: "Participate in real-time instructor sessions with live coding walkthroughs and Q&A." },
              { step: "03", title: "Hands-on Lab", desc: "Implement challenges in local lab environments with progressive automated checks." },
              { step: "04", title: "Build Projects", desc: "Synthesize concepts by engineering standalone AI systems from scratch." },
              { step: "05", title: "Expert Review", desc: "Receive individual feedback and code reviews from faculty before grades are released." },
            ].map((item) => (
              <div key={item.step} className="p-6 rounded-xl bg-white border border-[#DCE4EE] space-y-2 relative">
                <span className="text-2xl font-extrabold text-[#3869AD]/30">{item.step}</span>
                <h4 className="text-base font-bold text-[#142541]">{item.title}</h4>
                <p className="text-xs text-[#5F6F84] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Live vs. Recorded Learning Explainer */}
          <div className="mt-12 p-8 rounded-2xl bg-white border border-[#DCE4EE] grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#168B83] uppercase tracking-wider">
                <Calendar className="h-4 w-4" aria-hidden="true" />
                Live Interactive Sessions
              </div>
              <h4 className="text-xl font-bold text-[#142541]">Scheduled Cohort Sessions</h4>
              <p className="text-sm text-[#5F6F84] leading-relaxed">
                Small group sizes enable instructors to monitor student code in real time, troubleshoot bugs on the spot, and foster active team collaboration. Attendance is formally tracked and visible to parents in the Guardian Portal.
              </p>
            </div>
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3869AD] uppercase tracking-wider">
                <Video className="h-4 w-4" aria-hidden="true" />
                Private Lesson Archive
              </div>
              <h4 className="text-xl font-bold text-[#142541]">Recorded Review & Async Practice</h4>
              <p className="text-sm text-[#5F6F84] leading-relaxed">
                Enrolled students retain access to authenticated lesson archives and exercise modules to reinforce difficult algorithmic concepts at their own pace, with progress verified at each checkpoint.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Approved Faculty Section */}
      <section className="py-20 bg-white border-b border-[#DCE4EE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#3869AD]">
              Expert Mentors
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-[#142541]">
              Approved Academy Faculty
            </h3>
            <p className="text-base text-[#5F6F84]">
              Real educators and practitioners with academic credentials and industry experience.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {instructors.map((instructor) => (
              <Card key={instructor.id} className="border-[#DCE4EE]">
                <CardHeader className="space-y-2">
                  <div className="h-12 w-12 rounded-full bg-[#142541] text-white flex items-center justify-center font-bold text-lg">
                    {instructor.full_name.charAt(0)}
                  </div>
                  <CardTitle className="text-lg text-[#142541]">
                    {instructor.full_name}
                  </CardTitle>
                  <p className="text-xs font-semibold text-[#3869AD]">
                    {(instructor as { title?: string }).title || "Academy Faculty"}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-[#5F6F84] leading-relaxed">
                    {instructor.bio}
                  </p>
                  {(instructor as { specialties?: string[] }).specialties && (
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#DCE4EE]">
                      {(instructor as { specialties: string[] }).specialties.map((spec) => (
                        <span key={spec} className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#F3F6FA] text-[#263449]">
                          {spec}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Frequently Asked Questions */}
      <section className="py-20 bg-[#F3F6FA] border-b border-[#DCE4EE]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#3869AD]">
              Got Questions?
            </h2>
            <h3 className="text-3xl font-extrabold text-[#142541]">
              Frequently Asked Questions
            </h3>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "What prior programming experience is required?",
                a: "For Young Learners (ages 7–11) and introductory Teen tracks, no prior coding knowledge is required. College and adult deep learning courses assume foundational algebra and basic Python knowledge.",
              },
              {
                q: "How does the Parent / Guardian Portal work?",
                a: "Syntaxora enforces strict guardian verification. Once verified, parents can track live class attendance, review released assignment feedback, check syllabus progress, and view invoices without accessing any other family's data.",
              },
              {
                q: "What hardware is necessary for AI courses?",
                a: "A desktop or laptop running Windows, macOS, or modern Linux with webcam and microphone. Heavy neural network training for college and adult courses is handled via cloud environments, so an expensive GPU is not mandatory.",
              },
              {
                q: "What if a student misses a live class?",
                a: "All sessions are recorded and archived in the student's authenticated portal. Instructors record official attendance with audit trails, and parents are notified of absences if notification permissions are enabled.",
              },
            ].map((faq, idx) => (
              <details
                key={idx}
                className="group rounded-xl border border-[#DCE4EE] bg-white p-6 transition-colors open:border-[#3869AD]"
              >
                <summary className="flex cursor-pointer items-center justify-between font-semibold text-[#142541] focus-visible:outline-none">
                  <span>{faq.q}</span>
                  <span className="ml-4 text-xs font-bold text-[#3869AD] group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <p className="mt-3 text-sm text-[#5F6F84] leading-relaxed">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Final CTA */}
      <section className="py-16 bg-[#142541] text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold">
            Ready to Begin Practical AI Mastery?
          </h2>
          <p className="text-base text-[#DCE4EE]/80 max-w-xl mx-auto">
            Explore our curriculum or contact admissions to discuss the best learning track for you or your child.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/courses">
              <Button variant="primary" size="lg" className="w-full sm:w-auto font-semibold">
                View All Courses
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent border-white/20 text-white hover:bg-white/10">
                Contact Admissions
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
