"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, RotateCcw, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const AUDIENCE_PILLS = [
  { label: "All Audiences", value: "all" },
  { label: "Young Learners (7–11)", value: "young_learners" },
  { label: "Teens & Robotics (12–17)", value: "teens" },
  { label: "College & University", value: "college_students" },
  { label: "Adults & Professionals", value: "adults" },
];

export function CourseFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentAudience = searchParams.get("audience") || "all";
  const currentLevel = searchParams.get("level") || "all";
  const currentMode = searchParams.get("mode") || "all";
  const currentSearch = searchParams.get("q") || "";

  const [searchTerm, setSearchTerm] = useState(currentSearch);

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

  const hasActiveFilters =
    currentAudience !== "all" ||
    currentLevel !== "all" ||
    currentMode !== "all" ||
    currentSearch !== "";

  return (
    <div className="rounded-2xl border border-[#DDE2E7] bg-white p-6 shadow-sm space-y-5">
      {/* Search Input Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2.5">
        <div className="relative flex-1">
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search courses by topic, technology (e.g. OpenCV, PyTorch, RAG), or level..."
            className="w-full rounded-lg border border-[#DDE2E7] bg-[#FAF8F3] px-3.5 py-2.5 pl-10 text-sm text-[#17243A] placeholder:text-[#687386] transition-colors focus:border-[#355F99] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#355F99]/15"
          />
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#687386]" aria-hidden="true" />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                updateQuery("q", "");
              }}
              className="absolute right-3 top-3 text-[#687386] hover:text-[#17243A]"
              aria-label="Clear search input"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button type="submit" variant="primary" size="md" className="shrink-0 font-semibold px-5">
          Search
        </Button>
      </form>

      {/* Audience Quick Pills */}
      <div className="space-y-2">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#687386]">
          Filter by Track / Audience
        </label>
        <div className="flex flex-wrap gap-2">
          {AUDIENCE_PILLS.map((pill) => {
            const isSelected = currentAudience === pill.value;
            return (
              <button
                key={pill.value}
                type="button"
                onClick={() => updateQuery("audience", pill.value)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#17243A] text-white border-[#17243A] shadow-xs"
                    : "bg-[#FAF8F3] text-[#354052] border-[#DDE2E7] hover:border-[#355F99] hover:text-[#17243A]"
                }`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Secondary Dropdown Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#DDE2E7]">
        {/* Level Filter */}
        <div className="space-y-1.5">
          <label htmlFor="filter-level" className="block text-[11px] font-bold uppercase tracking-wider text-[#687386]">
            Prerequisite Level
          </label>
          <select
            id="filter-level"
            value={currentLevel}
            onChange={(e) => updateQuery("level", e.target.value)}
            className="w-full rounded-lg border border-[#DDE2E7] bg-white px-3 py-2 text-xs font-medium text-[#17243A] focus:border-[#355F99] focus:outline-none"
          >
            <option value="all">All Difficulty Levels</option>
            <option value="beginner">Beginner (No prior ML experience)</option>
            <option value="intermediate">Intermediate (Python foundations required)</option>
            <option value="advanced">Advanced (Calculus & PyTorch math)</option>
          </select>
        </div>

        {/* Delivery Mode Filter */}
        <div className="space-y-1.5">
          <label htmlFor="filter-mode" className="block text-[11px] font-bold uppercase tracking-wider text-[#687386]">
            Instruction Format
          </label>
          <select
            id="filter-mode"
            value={currentMode}
            onChange={(e) => updateQuery("mode", e.target.value)}
            className="w-full rounded-lg border border-[#DDE2E7] bg-white px-3 py-2 text-xs font-medium text-[#17243A] focus:border-[#355F99] focus:outline-none"
          >
            <option value="all">All Formats</option>
            <option value="live_online">Live Interactive Video Cohort</option>
            <option value="hybrid">Hybrid (Live Sessions + Self-Paced Labs)</option>
            <option value="self_paced">Self-Paced / Asynchronous</option>
          </select>
        </div>
      </div>

      {/* Reset Bar */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between pt-3 border-t border-[#DDE2E7] text-xs text-[#687386]">
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-[#355F99]" aria-hidden="true" />
            <span>Active filters narrowing course catalog</span>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 font-semibold text-[#355F99] hover:underline cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
