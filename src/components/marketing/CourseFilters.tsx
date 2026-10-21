"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function CourseFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentAudience = searchParams.get("audience") || "all";
  const currentLevel = searchParams.get("level") || "all";
  const currentMode = searchParams.get("mode") || "all";
  const currentSearch = searchParams.get("q") || "";

  const [searchTerm, setSearchTerm] = React.useState(currentSearch);

  function updateQuery(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all" || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/courses?${params.toString()}`);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateQuery("q", searchTerm);
  }

  function handleReset() {
    setSearchTerm("");
    router.push("/courses");
  }

  return (
    <div className="rounded-xl border border-[#DCE4EE] bg-white p-6 shadow-sm space-y-4">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by course title, keywords, or topics..."
            className="pl-9"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#5F6F84]" aria-hidden="true" />
        </div>
        <Button type="submit" variant="primary" size="md">
          Search
        </Button>
      </form>

      {/* Filter Options */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        {/* Audience Filter */}
        <div className="space-y-1.5">
          <label htmlFor="filter-audience" className="block text-xs font-semibold text-[#142541] uppercase tracking-wider">
            Age / Audience Group
          </label>
          <select
            id="filter-audience"
            value={currentAudience}
            onChange={(e) => updateQuery("audience", e.target.value)}
            className="w-full rounded-lg border border-[#DCE4EE] bg-white px-3 py-2 text-sm text-[#263449] focus:border-[#3869AD] focus:outline-none"
          >
            <option value="all">All Audiences</option>
            <option value="young_learners">Young Learners (Ages 7–11)</option>
            <option value="teens">Teens & High School (Ages 12–17)</option>
            <option value="college_students">College & University</option>
            <option value="adults">Adults & Professionals</option>
          </select>
        </div>

        {/* Level Filter */}
        <div className="space-y-1.5">
          <label htmlFor="filter-level" className="block text-xs font-semibold text-[#142541] uppercase tracking-wider">
            Skill Level
          </label>
          <select
            id="filter-level"
            value={currentLevel}
            onChange={(e) => updateQuery("level", e.target.value)}
            className="w-full rounded-lg border border-[#DCE4EE] bg-white px-3 py-2 text-sm text-[#263449] focus:border-[#3869AD] focus:outline-none"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        {/* Delivery Mode Filter */}
        <div className="space-y-1.5">
          <label htmlFor="filter-mode" className="block text-xs font-semibold text-[#142541] uppercase tracking-wider">
            Delivery Mode
          </label>
          <select
            id="filter-mode"
            value={currentMode}
            onChange={(e) => updateQuery("mode", e.target.value)}
            className="w-full rounded-lg border border-[#DCE4EE] bg-white px-3 py-2 text-sm text-[#263449] focus:border-[#3869AD] focus:outline-none"
          >
            <option value="all">All Modes</option>
            <option value="live_online">Live Online Cohort</option>
            <option value="hybrid">Hybrid</option>
            <option value="self_paced">Self-Paced / Async</option>
          </select>
        </div>
      </div>

      {(currentAudience !== "all" || currentLevel !== "all" || currentMode !== "all" || currentSearch !== "") && (
        <div className="flex items-center justify-between pt-2 border-t border-[#DCE4EE] text-xs text-[#5F6F84]">
          <span>Filters applied</span>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 font-semibold text-[#3869AD] hover:underline"
          >
            <RotateCcw className="h-3 w-3" />
            Reset all filters
          </button>
        </div>
      )}
    </div>
  );
}
