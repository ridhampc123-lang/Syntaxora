"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  PlusCircle,
  Pencil,
  Trash2,
  CheckCircle,
  Clock,
  Video,
  IndianRupee,
  AlertCircle,
  Layers,
  Sparkles,
  X,
  Settings,
} from "lucide-react";
import { Course, CourseModule } from "@/types";
import {
  addCourseModuleAction,
  updateCourseModuleAction,
  deleteCourseModuleAction,
  addLessonAction,
  deleteLessonAction,
  updateCourseDetailsAction,
  deleteCourseAction,
} from "@/server/actions/admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { formatCurrency } from "@/lib/utils";

interface Props {
  course: Course;
}

export function AdminCourseModulesManager({ course }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Local state for interactive instant updates
  const [currentCourse, setCurrentCourse] = useState<Course>(course);
  const [modules, setModules] = useState<CourseModule[]>(course.modules || []);

  // Modals state
  const [isCourseEditOpen, setIsCourseEditOpen] = useState(false);
  const [isAddModuleOpen, setIsAddModuleOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<CourseModule | null>(null);
  const [deleteModuleConfirmId, setDeleteModuleConfirmId] = useState<string | null>(null);
  const [isDeleteCourseOpen, setIsDeleteCourseOpen] = useState(false);

  // Quick inline lesson creation state per module: { [moduleId]: { title: string, lessonType: string, isPreview: boolean } }
  const [inlineLessons, setInlineLessons] = useState<
    Record<string, { title: string; lessonType: "lecture" | "lab" | "project" | "quiz"; isPreview: boolean }>
  >({});

  // Feedback notifications
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Helper to show temporary feedback
  const showFeedback = (type: "success" | "error", text: string) => {
    setFeedback({ type, text });
    setTimeout(() => {
      setFeedback(null);
    }, 4500);
  };

  /* -------------------------------------------------------------
   * COURSE METADATA & PRICING UPDATE
   * ------------------------------------------------------------- */
  const handleUpdateCourseDetails = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("courseId", currentCourse.id);

    startTransition(async () => {
      const res = await updateCourseDetailsAction(null, formData);
      if (res.success) {
        showFeedback("success", res.message);
        setIsCourseEditOpen(false);

        // Optimistically update currentCourse
        setCurrentCourse((prev) => ({
          ...prev,
          title: formData.get("title")?.toString() || prev.title,
          slug: formData.get("slug")?.toString() || prev.slug,
          summary: formData.get("summary")?.toString() || prev.summary,
          description: formData.get("description")?.toString() || prev.description,
          level: (formData.get("level")?.toString() as Course["level"]) || prev.level,
          audience_group: (formData.get("audienceGroup")?.toString() as Course["audience_group"]) || prev.audience_group,
          delivery_mode: (formData.get("deliveryMode")?.toString() as Course["delivery_mode"]) || prev.delivery_mode,
          duration_weeks: Number(formData.get("durationWeeks")) || prev.duration_weeks,
          price_in_cents: Math.round((Number(formData.get("priceInRupees") || formData.get("priceInDollars")) || 0) * 100),
        }));
        router.refresh();
      } else {
        showFeedback("error", res.message || "Failed to update course details");
      }
    });
  };

  /* -------------------------------------------------------------
   * DELETE ENTIRE COURSE
   * ------------------------------------------------------------- */
  const handleDeleteCourse = async () => {
    startTransition(async () => {
      const res = await deleteCourseAction(currentCourse.id);
      if (res.success) {
        router.push("/admin/courses");
      } else {
        showFeedback("error", res.message || "Failed to delete course");
      }
    });
  };

  /* -------------------------------------------------------------
   * ADD NEW TOPIC / MODULE
   * ------------------------------------------------------------- */
  const handleAddModule = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("courseId", currentCourse.id);

    startTransition(async () => {
      const res = await addCourseModuleAction(null, formData);
      if (res.success) {
        showFeedback("success", res.message);
        setIsAddModuleOpen(false);
        form.reset();
        router.refresh();
      } else {
        showFeedback("error", res.message || "Failed to add topic module");
      }
    });
  };

  /* -------------------------------------------------------------
   * UPDATE EXISTING TOPIC / MODULE
   * ------------------------------------------------------------- */
  const handleUpdateModule = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingModule) return;
    const formData = new FormData(e.currentTarget);
    formData.set("courseId", currentCourse.id);
    formData.set("moduleId", editingModule.id);

    startTransition(async () => {
      const res = await updateCourseModuleAction(null, formData);
      if (res.success) {
        showFeedback("success", res.message);
        setModules((prev) =>
          prev.map((m) =>
            m.id === editingModule.id
              ? {
                  ...m,
                  title: formData.get("title")?.toString() || m.title,
                  description: formData.get("description")?.toString() || m.description,
                }
              : m
          )
        );
        setEditingModule(null);
        router.refresh();
      } else {
        showFeedback("error", res.message || "Failed to update topic");
      }
    });
  };

  /* -------------------------------------------------------------
   * DELETE TOPIC / MODULE
   * ------------------------------------------------------------- */
  const handleDeleteModule = async (moduleId: string) => {
    startTransition(async () => {
      const res = await deleteCourseModuleAction(currentCourse.id, moduleId);
      if (res.success) {
        showFeedback("success", res.message);
        setModules((prev) => prev.filter((m) => m.id !== moduleId));
        setDeleteModuleConfirmId(null);
        router.refresh();
      } else {
        showFeedback("error", res.message || "Failed to delete topic");
      }
    });
  };

  /* -------------------------------------------------------------
   * QUICK INLINE ADD LESSON TO TOPIC
   * ------------------------------------------------------------- */
  const handleAddInlineLesson = async (moduleId: string) => {
    const draft = inlineLessons[moduleId];
    if (!draft || !draft.title.trim()) return;

    const formData = new FormData();
    formData.set("courseId", currentCourse.id);
    formData.set("moduleId", moduleId);
    formData.set("title", draft.title.trim());
    formData.set("lessonType", draft.lessonType);
    if (draft.isPreview) formData.set("isPreview", "true");

    startTransition(async () => {
      const res = await addLessonAction(null, formData);
      if (res.success) {
        showFeedback("success", res.message);
        // Clear draft
        setInlineLessons((prev) => ({
          ...prev,
          [moduleId]: { title: "", lessonType: "lecture", isPreview: false },
        }));
        router.refresh();
      } else {
        showFeedback("error", res.message || "Failed to add lesson");
      }
    });
  };

  /* -------------------------------------------------------------
   * DELETE LESSON FROM TOPIC
   * ------------------------------------------------------------- */
  const handleDeleteLesson = async (moduleId: string, lessonId: string) => {
    startTransition(async () => {
      const res = await deleteLessonAction(currentCourse.id, moduleId, lessonId);
      if (res.success) {
        showFeedback("success", res.message);
        setModules((prev) =>
          prev.map((m) =>
            m.id === moduleId
              ? {
                  ...m,
                  lessons: m.lessons?.filter((l) => l.id !== lessonId),
                }
              : m
          )
        );
        router.refresh();
      } else {
        showFeedback("error", res.message || "Failed to remove lesson");
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Feedback Banner */}
      {feedback && (
        <Alert variant={feedback.type === "success" ? "success" : "error"} className="animate-fade-in-up">
          {feedback.text}
        </Alert>
      )}

      {/* Course Summary & Action Bar */}
      <div className="rounded-2xl border border-[#DCE4EE] bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#3869AD] flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-[#FF994B]" />
                Dynamic Course Customizer
              </span>
              <Badge variant="outline" className="text-[10px] uppercase font-bold">
                {currentCourse.status}
              </Badge>
            </div>
            <h3 className="text-lg font-bold text-[#142541] mt-0.5">{currentCourse.title}</h3>
            <p className="text-xs text-[#5F6F84] mt-1 max-w-2xl leading-relaxed">
              {currentCourse.summary}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCourseEditOpen(true)}
              className="gap-1.5 font-semibold"
            >
              <Settings className="h-3.5 w-3.5 text-[#3869AD]" />
              Edit Course & Pricing
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setIsDeleteCourseOpen(true)}
              className="gap-1.5 font-semibold text-xs"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Course
            </Button>
          </div>
        </div>

        {/* Course quick metadata pill badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#DCE4EE] text-xs">
          <div className="flex items-center gap-2 text-[#263449]">
            <IndianRupee className="h-4 w-4 text-[#168B83] shrink-0" />
            <div>
              <span className="text-[10px] text-[#5F6F84] block uppercase font-bold">Tuition Price (INR)</span>
              <strong className="text-[#142541]">
                {currentCourse.price_in_cents > 0
                  ? formatCurrency(currentCourse.price_in_cents, currentCourse.currency)
                  : "Free / Included"}
              </strong>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[#263449]">
            <Clock className="h-4 w-4 text-[#3869AD] shrink-0" />
            <div>
              <span className="text-[10px] text-[#5F6F84] block uppercase font-bold">Duration</span>
              <strong className="text-[#142541]">{currentCourse.duration_weeks} Weeks</strong>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[#263449]">
            <Layers className="h-4 w-4 text-[#FF994B] shrink-0" />
            <div>
              <span className="text-[10px] text-[#5F6F84] block uppercase font-bold">Skill Level</span>
              <strong className="text-[#142541] capitalize">{currentCourse.level}</strong>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[#263449]">
            <Video className="h-4 w-4 text-[#168B83] shrink-0" />
            <div>
              <span className="text-[10px] text-[#5F6F84] block uppercase font-bold">Delivery Mode</span>
              <strong className="text-[#142541] capitalize">{currentCourse.delivery_mode.replace("_", " ")}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Curriculum Topics / Syllabus Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-extrabold text-[#142541] tracking-tight">
              Curriculum Topics & Syllabus
            </h3>
            <Badge variant="teal" className="text-xs font-bold">
              {modules.length} {modules.length === 1 ? "Topic" : "Topics"}
            </Badge>
          </div>
          <p className="text-xs text-[#5F6F84] mt-0.5">
            Admin can add, remove, and modify the exact topics and lessons covered in this course. Changes immediately reflect on the public course page.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsAddModuleOpen(true)}
          className="gap-2 font-bold shadow-xs btn-gradient-ai shrink-0"
        >
          <PlusCircle className="h-4 w-4" />
          Add Course Topic
        </Button>
      </div>

      {/* Topics List or Empty State */}
      {modules.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-[#DCE4EE] bg-white p-12 text-center space-y-4 shadow-xs">
          <div className="mx-auto h-12 w-12 rounded-full bg-[#E8EFF8] text-[#3869AD] flex items-center justify-center">
            <BookOpen className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-[#142541]">No topics added to this course yet</h4>
            <p className="text-xs text-[#5F6F84] max-w-md mx-auto">
              Add the key topics, modules, and hands-on concepts covered in this curriculum so prospective students know exactly what they will master.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModuleOpen(true)}
            className="gap-1.5 font-bold"
          >
            <PlusCircle className="h-4 w-4" />
            Add First Topic
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {modules.map((mod, idx) => {
            const inlineDraft = inlineLessons[mod.id] || {
              title: "",
              lessonType: "lecture",
              isPreview: false,
            };

            return (
              <div
                key={mod.id}
                className="rounded-2xl border border-[#DCE4EE] bg-white p-6 shadow-sm space-y-5 transition-all hover:border-[#3869AD]/40"
              >
                {/* Topic Card Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-[#DCE4EE]">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#E8EFF8] text-[#3869AD] text-[11px] font-bold">
                        Topic {idx + 1}
                      </span>
                      <h4 className="text-base font-bold text-[#142541]">{mod.title}</h4>
                      <Badge variant="outline" className="text-[11px]">
                        {mod.lessons?.length || 0} Lessons / Concepts
                      </Badge>
                    </div>
                    {mod.description && (
                      <p className="text-xs text-[#5F6F84] leading-relaxed pt-1">
                        {mod.description}
                      </p>
                    )}
                  </div>

                  {/* Topic Action Controls */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setEditingModule(mod)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-[#3869AD] hover:bg-[#E8EFF8] transition-colors"
                      title="Edit Topic Title & Description"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit Topic
                    </button>

                    {deleteModuleConfirmId === mod.id ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleDeleteModule(mod.id)}
                          disabled={isPending}
                          className="px-2 py-1 rounded-md bg-[#B91C1C] text-white text-[11px] font-bold hover:bg-[#991B1B] transition-colors"
                        >
                          Confirm Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteModuleConfirmId(null)}
                          className="px-2 py-1 rounded-md border border-[#DCE4EE] text-[11px] font-semibold text-[#5F6F84] hover:bg-[#F3F6FA]"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeleteModuleConfirmId(mod.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-[#B91C1C] hover:bg-[#FEE2E2] transition-colors"
                        title="Delete Topic"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {/* Lessons / Concepts Covered in this Topic */}
                <div className="space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#5F6F84] block">
                    Lessons & Concepts Covered:
                  </span>

                  {(!mod.lessons || mod.lessons.length === 0) ? (
                    <p className="text-xs text-[#5F6F84] italic bg-[#F3F6FA] p-3 rounded-xl border border-dashed border-[#DCE4EE]">
                      No individual lessons or concepts added yet. Use the quick-add bar below to add lessons covered in this topic.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                      {mod.lessons.map((les) => (
                        <div
                          key={les.id}
                          className="flex items-center justify-between rounded-xl bg-[#F3F6FA]/70 border border-[#DCE4EE] px-3.5 py-2.5 text-xs transition-colors hover:bg-white hover:border-[#3869AD]/40"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <CheckCircle className="h-4 w-4 text-[#168B83] shrink-0" />
                            <span className="font-semibold text-[#142541] truncate">{les.title}</span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <Badge variant="outline" className="text-[10px] uppercase font-bold text-[#5F6F84]">
                              {les.lesson_type}
                            </Badge>
                            {les.is_preview && (
                              <Badge variant="teal" className="text-[10px]">
                                Free Preview
                              </Badge>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteLesson(mod.id, les.id)}
                              disabled={isPending}
                              className="p-1 text-[#5F6F84] hover:text-[#B91C1C] rounded transition-colors"
                              title="Delete Lesson"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Inline Quick-Add Lesson Bar */}
                  <div className="pt-2">
                    <div className="flex flex-col sm:flex-row items-center gap-2 bg-[#F3F6FA] p-2.5 rounded-xl border border-[#DCE4EE]">
                      <input
                        type="text"
                        placeholder="Add lesson or concept (e.g. Backpropagation Math & Visuals)..."
                        value={inlineDraft.title}
                        onChange={(e) =>
                          setInlineLessons((prev) => ({
                            ...prev,
                            [mod.id]: { ...inlineDraft, title: e.target.value },
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddInlineLesson(mod.id);
                          }
                        }}
                        className="flex-1 w-full bg-white border border-[#DCE4EE] rounded-lg px-3 py-1.5 text-xs text-[#142541] focus:outline-none focus:border-[#3869AD]"
                      />

                      <select
                        value={inlineDraft.lessonType}
                        onChange={(e) =>
                          setInlineLessons((prev) => ({
                            ...prev,
                            [mod.id]: {
                              ...inlineDraft,
                              lessonType: e.target.value as "lecture" | "lab" | "project" | "quiz",
                            },
                          }))
                        }
                        className="w-full sm:w-auto bg-white border border-[#DCE4EE] rounded-lg px-2.5 py-1.5 text-xs text-[#263449] focus:outline-none"
                      >
                        <option value="lecture">Lecture</option>
                        <option value="lab">Hands-on Lab</option>
                        <option value="project">Project</option>
                        <option value="quiz">Assessment</option>
                      </select>

                      <label className="flex items-center gap-1.5 text-xs text-[#5F6F84] cursor-pointer whitespace-nowrap px-1">
                        <input
                          type="checkbox"
                          checked={inlineDraft.isPreview}
                          onChange={(e) =>
                            setInlineLessons((prev) => ({
                              ...prev,
                              [mod.id]: { ...inlineDraft, isPreview: e.target.checked },
                            }))
                          }
                          className="rounded text-[#3869AD] focus:ring-0"
                        />
                        <span>Preview</span>
                      </label>

                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        disabled={!inlineDraft.title.trim() || isPending}
                        onClick={() => handleAddInlineLesson(mod.id)}
                        className="w-full sm:w-auto shrink-0 font-bold"
                      >
                        + Add Concept
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* -------------------------------------------------------------
       * MODAL 1: ADD NEW TOPIC / MODULE
       * ------------------------------------------------------------- */}
      {isAddModuleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-[#DCE4EE] space-y-5 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE4EE]">
              <div>
                <h3 className="text-lg font-bold text-[#142541] flex items-center gap-2">
                  <PlusCircle className="h-5 w-5 text-[#3869AD]" />
                  Add Course Topic
                </h3>
                <p className="text-xs text-[#5F6F84]">
                  Define a new syllabus module covered in this curriculum track.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModuleOpen(false)}
                className="text-[#5F6F84] hover:text-[#142541] p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddModule} className="space-y-4">
              <Input
                label="Topic Title"
                name="title"
                required
                placeholder="e.g. Module 3: Deep Neural Networks & Transformer Foundations"
                helperText="Clear module title visible on student syllabus"
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#142541]">
                  Topic Overview / Objectives
                </label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Explain what concepts, techniques, or real-world frameworks students learn in this module..."
                  className="w-full rounded-lg border border-[#DCE4EE] bg-white px-3 py-2 text-xs text-[#263449] focus:border-[#3869AD] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#142541]">
                  Lessons / Concepts Covered (Optional)
                </label>
                <textarea
                  name="lessonsRaw"
                  rows={3}
                  placeholder="Enter one lesson per line:
- Backpropagation & Gradient Descent
- PyTorch Tensor Operations Lab
- Capstone Sentiment Analysis Project"
                  className="w-full rounded-lg border border-[#DCE4EE] bg-white px-3 py-2 text-xs text-[#263449] focus:border-[#3869AD] focus:outline-none font-mono"
                />
                <p className="text-[11px] text-[#5F6F84]">
                  Each non-empty line will become a distinct lesson in this topic. You can also add more anytime later!
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#DCE4EE]">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setIsAddModuleOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isPending}
                  className="font-bold btn-gradient-ai"
                >
                  Create Topic
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
       * MODAL 2: EDIT TOPIC / MODULE
       * ------------------------------------------------------------- */}
      {editingModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-[#DCE4EE] space-y-5 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE4EE]">
              <div>
                <h3 className="text-lg font-bold text-[#142541] flex items-center gap-2">
                  <Pencil className="h-5 w-5 text-[#3869AD]" />
                  Edit Topic Details
                </h3>
                <p className="text-xs text-[#5F6F84]">
                  Modify topic name or syllabus description.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingModule(null)}
                className="text-[#5F6F84] hover:text-[#142541] p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateModule} className="space-y-4">
              <Input
                label="Topic Title"
                name="title"
                required
                defaultValue={editingModule.title}
                placeholder="Topic Title"
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#142541]">
                  Topic Overview / Objectives
                </label>
                <textarea
                  name="description"
                  rows={4}
                  defaultValue={editingModule.description || ""}
                  placeholder="Explain what concepts, techniques, or real-world frameworks students learn in this module..."
                  className="w-full rounded-lg border border-[#DCE4EE] bg-white px-3 py-2 text-xs text-[#263449] focus:border-[#3869AD] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#DCE4EE]">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setEditingModule(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isPending}
                  className="font-bold"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
       * MODAL 3: EDIT COURSE METADATA & PRICING
       * ------------------------------------------------------------- */}
      {isCourseEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-[#DCE4EE] space-y-5 my-8 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE4EE]">
              <div>
                <h3 className="text-lg font-bold text-[#142541] flex items-center gap-2">
                  <Settings className="h-5 w-5 text-[#3869AD]" />
                  Customize Course & Tuition Pricing
                </h3>
                <p className="text-xs text-[#5F6F84]">
                  Update tuition pricing, title, description, level, and delivery format.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCourseEditOpen(false)}
                className="text-[#5F6F84] hover:text-[#142541] p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateCourseDetails} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Course Title"
                  name="title"
                  required
                  defaultValue={currentCourse.title}
                  placeholder="e.g. Applied AI & Python for Teens"
                />

                <Input
                  label="URL Slug"
                  name="slug"
                  required
                  defaultValue={currentCourse.slug}
                  placeholder="e.g. applied-ai-python-teens"
                  helperText="Lowercase, numbers, and dashes"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Tuition Fee (₹ INR)"
                  name="priceInRupees"
                  type="number"
                  min="0"
                  required
                  defaultValue={Math.round(currentCourse.price_in_cents / 100)}
                  helperText="Tuition in Indian Rupees (₹), enter 0 for free courses"
                />

                <Input
                  label="Duration (Weeks)"
                  name="durationWeeks"
                  type="number"
                  min="1"
                  required
                  defaultValue={currentCourse.duration_weeks}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#142541]">
                    Skill Level
                  </label>
                  <select
                    name="level"
                    defaultValue={currentCourse.level}
                    className="w-full rounded-lg border border-[#DCE4EE] bg-white px-3 py-2 text-xs text-[#263449] focus:border-[#3869AD] focus:outline-none"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="all_levels">All Levels</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#142541]">
                    Audience Track
                  </label>
                  <select
                    name="audienceGroup"
                    defaultValue={currentCourse.audience_group}
                    className="w-full rounded-lg border border-[#DCE4EE] bg-white px-3 py-2 text-xs text-[#263449] focus:border-[#3869AD] focus:outline-none"
                  >
                    <option value="young_learners">Young Learners (7–11)</option>
                    <option value="teens">Teens (12–17)</option>
                    <option value="college_students">College Students</option>
                    <option value="adults">Adults & Professionals</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#142541]">
                    Delivery Mode
                  </label>
                  <select
                    name="deliveryMode"
                    defaultValue={currentCourse.delivery_mode}
                    className="w-full rounded-lg border border-[#DCE4EE] bg-white px-3 py-2 text-xs text-[#263449] focus:border-[#3869AD] focus:outline-none"
                  >
                    <option value="live_online">Live Online Cohort</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="self_paced">Self-Paced</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#142541]">
                  Short Summary
                </label>
                <textarea
                  name="summary"
                  rows={2}
                  required
                  defaultValue={currentCourse.summary}
                  placeholder="1-2 sentences summarizing learning outcome..."
                  className="w-full rounded-lg border border-[#DCE4EE] bg-white px-3 py-2 text-xs text-[#263449] focus:border-[#3869AD] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#142541]">
                  Comprehensive Description
                </label>
                <textarea
                  name="description"
                  rows={4}
                  required
                  defaultValue={currentCourse.description}
                  placeholder="Full overview of syllabus, weekly cadence, and projects..."
                  className="w-full rounded-lg border border-[#DCE4EE] bg-white px-3 py-2 text-xs text-[#263449] focus:border-[#3869AD] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#DCE4EE]">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setIsCourseEditOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isPending}
                  className="font-bold btn-gradient-ai"
                >
                  Save Course Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
       * MODAL 4: DELETE COURSE CONFIRMATION
       * ------------------------------------------------------------- */}
      {isDeleteCourseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-[#DCE4EE] space-y-4 animate-scale-in">
            <div className="flex items-center gap-3 text-[#B91C1C]">
              <div className="p-2.5 rounded-full bg-[#FEE2E2]">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#142541]">Delete Course</h3>
                <p className="text-xs text-[#5F6F84]">This action is permanent and cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-[#263449] leading-relaxed">
              Are you sure you want to permanently delete <strong>{currentCourse.title}</strong>? All associated syllabus topics, lessons, and batch relationships will be removed.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#DCE4EE]">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setIsDeleteCourseOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                size="md"
                isLoading={isPending}
                onClick={handleDeleteCourse}
                className="font-bold"
              >
                Permanently Delete Course
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
