"use client";

import React, { useActionState } from "react";
import { createCourseAction, type ActionResult } from "@/server/actions/admin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

const initialState: ActionResult = {
  success: false,
  message: "",
};

export function CreateCourseForm() {
  const [state, formAction, isPending] = useActionState(createCourseAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {state.message && (
        <Alert variant={state.success ? "success" : "error"}>
          {state.message}
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Course Title"
          name="title"
          id="courseTitle"
          required
          placeholder="e.g. Embedded AI & ROS 2 Robotics"
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
          rows={4}
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
          label="Tuition Fee (USD)"
          name="priceInDollars"
          id="priceInDollars"
          type="number"
          defaultValue="299"
          min="0"
          required
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="md"
        isLoading={isPending}
        className="w-full justify-center"
      >
        Create Draft Course
      </Button>
    </form>
  );
}
