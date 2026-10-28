"use client";

import React, { useState, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Trash2, BookOpen, ArrowRight, Sparkles } from "lucide-react";
import { createCourseAction, type ActionResult } from "@/server/actions/admin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

const initialState: ActionResult = {
  success: false,
  message: "",
};

interface TopicDraft {
  id: string;
  title: string;
  description: string;
}

export function CreateCourseForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createCourseAction, initialState);

  // Dynamic initial topics list
  const [topics, setTopics] = useState<TopicDraft[]>([
    {
      id: "draft-1",
      title: "Module 1: Foundations & Core Concepts",
      description: "Introduction to fundamental architectures and algorithmic thinking.",
    },
    {
      id: "draft-2",
      title: "Module 2: Practical Implementation & Capstone",
      description: "Hands-on model building, evaluation pipelines, and project deployment.",
    },
  ]);

  const addTopic = () => {
    setTopics((prev) => [
      ...prev,
      {
        id: `draft-${Date.now()}`,
        title: `Module ${prev.length + 1}: `,
        description: "",
      },
    ]);
  };

  const removeTopic = (id: string) => {
    setTopics((prev) => prev.filter((t) => t.id !== id));
  };

  const updateTopic = (id: string, field: "title" | "description", value: string) => {
    setTopics((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  useEffect(() => {
    if (state.success && state.courseId) {
      // Optional: automatically navigate to manage page after brief pause
      const timer = setTimeout(() => {
        router.push(`/admin/courses/${state.courseId}`);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [state, router]);

  // Serialize topics for server action
  const initialTopicsJson = JSON.stringify(
    topics
      .filter((t) => t.title.trim().length > 0)
      .map((t) => ({
        title: t.title.trim(),
        description: t.description.trim() || undefined,
      }))
  );

  return (
    <form action={formAction} className="space-y-5">
      {state.message && (
        <Alert variant={state.success ? "success" : "error"}>
          <div className="flex items-center justify-between">
            <span>{state.message}</span>
            {state.courseId && (
              <Button
                type="button"
                size="sm"
                variant="teal"
                onClick={() => router.push(`/admin/courses/${state.courseId}`)}
                className="gap-1 text-xs"
              >
                Open Course Manager <ArrowRight className="h-3 w-3" />
              </Button>
            )}
          </div>
        </Alert>
      )}

      {/* Hidden input carrying the dynamic topics before course creation */}
      <input type="hidden" name="initialTopicsJson" value={initialTopicsJson} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Course Title"
          name="title"
          id="courseTitle"
          required
          placeholder="e.g. Applied AI & Computer Vision Foundations"
          error={state.errors?.title?.[0]}
        />

        <Input
          label="URL Slug"
          name="slug"
          id="courseSlug"
          required
          placeholder="e.g. embedded-ai-ros2"
          helperText="Lowercase letters, numbers, and hyphens"
          error={state.errors?.slug?.[0]}
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="courseSummary"
          className="block text-xs font-semibold uppercase tracking-wider text-[#142541]"
        >
          Short Summary <span className="text-[#B91C1C] ml-1">*</span>
        </label>
        <textarea
          name="summary"
          id="courseSummary"
          rows={2}
          required
          placeholder="1-2 sentences summarizing the learning outcome..."
          className="w-full rounded-lg border border-[#DCE4EE] bg-white px-3 py-2 text-xs text-[#263449] focus:border-[#3869AD] focus:outline-none"
        />
        {state.errors?.summary?.[0] && (
          <p className="text-xs font-medium text-[#B91C1C]">{state.errors.summary[0]}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="courseDescription"
          className="block text-xs font-semibold uppercase tracking-wider text-[#142541]"
        >
          Comprehensive Description <span className="text-[#B91C1C] ml-1">*</span>
        </label>
        <textarea
          name="description"
          id="courseDescription"
          rows={3}
          required
          placeholder="Full overview of syllabus, weekly cadence, and projects..."
          className="w-full rounded-lg border border-[#DCE4EE] bg-white px-3 py-2 text-xs text-[#263449] focus:border-[#3869AD] focus:outline-none"
        />
        {state.errors?.description?.[0] && (
          <p className="text-xs font-medium text-[#B91C1C]">{state.errors.description[0]}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#142541]">
            Skill Level
          </label>
          <select
            name="level"
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
            className="w-full rounded-lg border border-[#DCE4EE] bg-white px-3 py-2 text-xs text-[#263449] focus:border-[#3869AD] focus:outline-none"
          >
            <option value="live_online">Live Online Cohort</option>
            <option value="hybrid">Hybrid</option>
            <option value="self_paced">Self-Paced</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Duration (Weeks)"
          name="durationWeeks"
          id="durationWeeks"
          type="number"
          defaultValue="8"
          min="1"
          required
        />

        <Input
          label="Tuition Fee (₹ INR)"
          name="priceInRupees"
          id="priceInRupees"
          type="number"
          defaultValue="14999"
          min="0"
          required
          helperText="Enter full course fee in Indian Rupees (₹), e.g. 14999"
        />
      </div>

      {/* Dynamic Topics Covered Builder */}
      <div className="pt-2 border-t border-[#DCE4EE] space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#142541] flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#3869AD]" />
              Course Topics Covered Before Upload ({topics.length})
            </span>
            <p className="text-[11px] text-[#5F6F84]">
              Admin can customize syllabus topics right now before uploading. You can also modify or add more later.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addTopic}
            className="gap-1 text-xs font-semibold"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            + Add Topic
          </Button>
        </div>

        <div className="space-y-2.5">
          {topics.map((topic, index) => (
            <div
              key={topic.id}
              className="rounded-xl border border-[#DCE4EE] bg-[#F3F6FA]/50 p-3 space-y-2 relative"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-[#3869AD] uppercase tracking-wider">
                  Topic {index + 1}
                </span>
                {topics.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTopic(topic.id)}
                    className="text-[#5F6F84] hover:text-[#B91C1C] p-1 text-xs flex items-center gap-1"
                    title="Remove Topic"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>

              <input
                type="text"
                placeholder="Topic Title (e.g. Module 1: Foundations of Machine Learning)"
                value={topic.title}
                onChange={(e) => updateTopic(topic.id, "title", e.target.value)}
                className="w-full rounded-md border border-[#DCE4EE] bg-white px-2.5 py-1.5 text-xs text-[#142541] focus:border-[#3869AD] focus:outline-none font-medium"
              />

              <input
                type="text"
                placeholder="Topic brief description / covered concepts (optional)"
                value={topic.description}
                onChange={(e) => updateTopic(topic.id, "description", e.target.value)}
                className="w-full rounded-md border border-[#DCE4EE] bg-white px-2.5 py-1.5 text-xs text-[#5F6F84] focus:border-[#3869AD] focus:outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="md"
        isLoading={isPending}
        className="w-full justify-center font-bold btn-gradient-ai shadow-sm"
      >
        <BookOpen className="h-4 w-4 mr-2" />
        Create Course with Topics
      </Button>
    </form>
  );
}

