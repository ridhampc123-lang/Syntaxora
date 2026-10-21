"use client";

import React, { useState } from "react";
import { CalendarPlus, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Course } from "@/types";
import { createClassSessionAction } from "@/server/actions/instructor";

interface Props {
  courses: Course[];
}

export function CreateSessionModal({ courses }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [courseId, setCourseId] = useState(courses[0]?.id || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [meetingProvider, setMeetingProvider] = useState("live_webrtc");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.set("courseId", courseId);
      formData.set("title", title);
      formData.set("description", description);
      formData.set("startsAt", new Date(startsAt).toISOString());
      formData.set("endsAt", new Date(endsAt).toISOString());
      formData.set("meetingProvider", meetingProvider);

      const res = await createClassSessionAction(formData);
      if (!res.success) {
        setError(res.error || "Failed to schedule session");
      } else {
        setIsOpen(false);
        setTitle("");
        setDescription("");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-[#142541] hover:bg-[#1f3760] text-white text-xs flex items-center gap-2 shadow-sm"
      >
        <CalendarPlus className="h-4 w-4" />
        Schedule Class Session
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-[#DCE4EE] space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE4EE]">
              <div className="flex items-center gap-2 text-[#142541] font-bold text-base">
                <CalendarPlus className="h-5 w-5 text-[#168B83]" />
                Schedule Live Class Session
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[#5F6F84] hover:text-[#142541] p-1 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <Alert variant="error">
                <AlertCircle className="h-4 w-4" />
                <span className="text-xs">{error}</span>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Course Selector */}
              <div className="space-y-1">
                <label htmlFor="session-course-select" className="font-semibold text-[#142541]">
                  Target Course <span className="text-rose-500">*</span>
                </label>
                <select
                  id="session-course-select"
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  required
                  className="w-full rounded-lg border border-[#DCE4EE] bg-white p-2.5 text-xs text-[#263449] focus:outline-none focus:ring-2 focus:ring-[#3869AD]"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label htmlFor="session-title-input" className="font-semibold text-[#142541]">
                  Session Title <span className="text-rose-500">*</span>
                </label>
                <Input
                  id="session-title-input"
                  placeholder="e.g. Lab 03: Computer Vision Object Tracking"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="text-xs"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label htmlFor="session-desc-input" className="font-semibold text-[#142541]">
                  Topic & Prerequisites
                </label>
                <textarea
                  id="session-desc-input"
                  rows={2}
                  placeholder="Outline key concepts, code repos, and edge device requirements."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-[#DCE4EE] p-2.5 text-xs text-[#263449] focus:outline-none focus:ring-2 focus:ring-[#3869AD]"
                />
              </div>

              {/* Start & End Times */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="session-start-input" className="font-semibold text-[#142541]">
                    Starts At <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    id="session-start-input"
                    type="datetime-local"
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                    required
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="session-end-input" className="font-semibold text-[#142541]">
                    Ends At <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    id="session-end-input"
                    type="datetime-local"
                    value={endsAt}
                    onChange={(e) => setEndsAt(e.target.value)}
                    required
                    className="text-xs"
                  />
                </div>
              </div>

              {/* Meeting Provider */}
              <div className="space-y-1">
                <label htmlFor="session-provider-select" className="font-semibold text-[#142541]">
                  Meeting Provider
                </label>
                <select
                  id="session-provider-select"
                  value={meetingProvider}
                  onChange={(e) => setMeetingProvider(e.target.value)}
                  className="w-full rounded-lg border border-[#DCE4EE] bg-white p-2.5 text-xs text-[#263449] focus:outline-none focus:ring-2 focus:ring-[#3869AD]"
                >
                  <option value="live_webrtc">Syntaxora Live WebRTC Classroom</option>
                  <option value="zoom">Zoom Video</option>
                  <option value="google_meet">Google Meet</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#DCE4EE]">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !title || !startsAt || !endsAt}
                  className="bg-[#142541] hover:bg-[#1f3760] text-white text-xs"
                >
                  {loading ? "Scheduling..." : "Schedule Session"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
