"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import {
  UserPlus,
  Mail,
  Trash2,
  Edit2,
  Upload,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  Sparkles,
  Loader2,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  createInstructorAction,
  updateInstructorAction,
  deleteInstructorAction,
} from "@/server/actions/admin";
import { Profile } from "@/types";

export type InstructorItem = Profile & {
  title?: string;
  specialties?: string[];
};

interface AdminInstructorsManagerProps {
  initialInstructors: InstructorItem[];
}

export function AdminInstructorsManager({
  initialInstructors,
}: AdminInstructorsManagerProps) {
  const [instructors, setInstructors] = useState<InstructorItem[]>(initialInstructors);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<InstructorItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [specialties, setSpecialties] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredInstructors = instructors.filter((inst) => {
    const q = searchQuery.toLowerCase();
    const nameMatch = inst.full_name.toLowerCase().includes(q);
    const emailMatch = inst.email.toLowerCase().includes(q);
    const titleMatch = (inst.title || "").toLowerCase().includes(q);
    const specMatch = (inst.specialties || []).some((s) => s.toLowerCase().includes(q));
    return nameMatch || emailMatch || titleMatch || specMatch;
  });

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setTitle("");
    setBio("");
    setSpecialties("");
    setAvatarUrl("");
    setUploadError(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setEditingInstructor(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (instructor: InstructorItem) => {
    setEditingInstructor(instructor);
    setFullName(instructor.full_name);
    setEmail(instructor.email);
    setTitle(instructor.title || "");
    setBio(instructor.bio || "");
    setSpecialties((instructor.specialties || []).join(", "));
    setAvatarUrl(instructor.avatar_url || "");
    setUploadError(null);
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingInstructor(null);
    resetForm();
  };

  // Cloudinary / File Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload/cloudinary", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to upload image");
      }

      setAvatarUrl(data.url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Image upload failed";
      setUploadError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  // Form Submit Handler (Add or Edit)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("email", email);
      formData.append("title", title);
      formData.append("bio", bio);
      formData.append("specialties", specialties);
      formData.append("avatarUrl", avatarUrl);

      if (editingInstructor) {
        formData.append("instructorId", editingInstructor.id);
        const res = await updateInstructorAction(null, formData);

        if (res.success) {
          const specList = specialties
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);

          setInstructors((prev) =>
            prev.map((inst) =>
              inst.id === editingInstructor.id
                ? {
                    ...inst,
                    full_name: fullName,
                    email,
                    title,
                    bio,
                    avatar_url: avatarUrl || null,
                    specialties: specList,
                  }
                : inst
            )
          );
          setFeedback({ type: "success", message: "Faculty member updated successfully." });
          handleCloseModal();
        } else {
          setFeedback({
            type: "error",
            message: res.message || "Failed to update faculty member.",
          });
        }
      } else {
        const res = await createInstructorAction(null, formData);
        if (res.success) {
          const specList = specialties
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);

          const newInst: InstructorItem = {
            id: "temp-" + Date.now(),
            role: "instructor",
            full_name: fullName,
            email,
            title,
            bio,
            avatar_url: avatarUrl || null,
            specialties: specList,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          setInstructors((prev) => [newInst, ...prev]);
          setFeedback({ type: "success", message: "Faculty member registered successfully." });
          handleCloseModal();
        } else {
          setFeedback({
            type: "error",
            message: res.message || "Failed to add faculty member.",
          });
        }
      }
    });
  };

  // Delete Handler
  const handleDelete = (id: string) => {
    setFeedback(null);
    startTransition(async () => {
      const res = await deleteInstructorAction(id);
      if (res.success) {
        setInstructors((prev) => prev.filter((inst) => inst.id !== id));
        setFeedback({
          type: "success",
          message: "Faculty member removed from active roster.",
        });
      } else {
        setFeedback({
          type: "error",
          message: res.message || "Failed to remove faculty member.",
        });
      }
      setDeletingId(null);
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#DCE4EE]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold text-[#142541] tracking-tight">
              Academy Faculty & Mentors
            </h2>
            <Badge variant="teal" className="text-xs">
              {instructors.length} Active
            </Badge>
          </div>
          <p className="text-xs text-[#5F6F84] mt-0.5">
            Add, update, or remove instructors. Upload official Cloudinary profile images displayed on the public faculty directory.
          </p>
        </div>

        <Button
          onClick={handleOpenAddModal}
          size="md"
          className="font-bold btn-gradient-ai shrink-0"
        >
          <UserPlus className="h-4 w-4 mr-1.5" />
          Add Faculty Member
        </Button>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-xs font-semibold ${
            feedback.type === "success"
              ? "bg-[#EAF5F4] text-[#167F78] border border-[#167F78]/30"
              : "bg-[#FDF2F2] text-[#B91C1C] border border-[#B91C1C]/30"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="p-1 hover:opacity-75 transition-opacity"
            aria-label="Dismiss message"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5F6F84]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search faculty by name, email, title, or specialty (e.g. PyTorch, Computer Vision)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DCE4EE] bg-white text-xs text-[#142541] placeholder-[#5F6F84] focus:outline-none focus:ring-2 focus:ring-[#355F99]"
          />
        </div>
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchQuery("")}
            className="text-xs text-[#5F6F84]"
          >
            Clear
          </Button>
        )}
      </div>

      {/* Faculty Cards Grid */}
      {filteredInstructors.length === 0 ? (
        <div className="rounded-2xl border border-[#DCE4EE] bg-white p-12 text-center space-y-3">
          <div className="mx-auto h-12 w-12 rounded-full bg-[#EAF0F8] text-[#355F99] flex items-center justify-center">
            <UserPlus className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-[#142541]">No faculty members found</h3>
          <p className="text-xs text-[#5F6F84] max-w-sm mx-auto">
            {searchQuery
              ? "Try adjusting your search criteria or clear the query to view all instructors."
              : "No instructors are registered currently. Click 'Add Faculty Member' to register the first instructor."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInstructors.map((instructor) => (
            <Card
              key={instructor.id}
              className="border-[#DCE4EE] bg-white card-editorial card-ai-glow flex flex-col justify-between"
            >
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  {instructor.avatar_url ? (
                    <div className="relative h-14 w-14 rounded-2xl overflow-hidden shadow-sm border border-[#DCE4EE] bg-[#03060C] shrink-0">
                      <Image
                        src={instructor.avatar_url}
                        alt={instructor.full_name}
                        width={56}
                        height={56}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-14 w-14 rounded-2xl bg-[#17243A] text-[#D7A66A] flex items-center justify-center font-bold text-xl font-display italic shadow-sm shrink-0">
                      {instructor.full_name.charAt(0)}
                    </div>
                  )}

                  <div className="flex items-center gap-1.5">
                    <Badge variant="teal" className="text-[10px] tracking-wider uppercase">
                      Verified Faculty
                    </Badge>
                  </div>
                </div>

                <div>
                  <CardTitle className="text-lg text-[#142541] font-bold">
                    {instructor.full_name}
                  </CardTitle>
                  <p className="text-xs text-[#355F99] font-semibold mt-0.5">
                    {instructor.title || "Academy Faculty Member"}
                  </p>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-xs text-[#5F6F84] leading-relaxed line-clamp-3">
                  {instructor.bio}
                </p>

                {instructor.specialties && instructor.specialties.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-[#DCE4EE]">
                    <span className="text-[10px] font-bold text-[#142541] uppercase tracking-wider block">
                      Specialties:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {instructor.specialties.map((spec) => (
                        <span
                          key={spec}
                          className="px-2 py-0.5 rounded-md bg-[#F0F2F4] text-[#142541] text-[10px] font-medium"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-[#DCE4EE] flex items-center justify-between text-xs text-[#5F6F84]">
                  <div className="flex items-center gap-1 truncate max-w-[180px]">
                    <Mail className="h-3.5 w-3.5 text-[#355F99] shrink-0" />
                    <span className="truncate">{instructor.email}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleOpenEditModal(instructor)}
                      className="p-1.5 rounded-lg text-[#355F99] hover:bg-[#EAF0F8] transition-colors"
                      title="Edit Faculty"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeletingId(instructor.id)}
                      className="p-1.5 rounded-lg text-[#B91C1C] hover:bg-[#FDF2F2] transition-colors"
                      title="Remove Faculty"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#142541]/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl border border-[#DCE4EE] p-6 max-w-sm w-full space-y-4 shadow-xl animate-fade-in-up">
            <div className="h-10 w-10 rounded-full bg-[#FDF2F2] text-[#B91C1C] flex items-center justify-center">
              <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#142541]">
                Remove Faculty Member?
              </h3>
              <p className="text-xs text-[#5F6F84] mt-1 leading-relaxed">
                This will unregister the instructor from the public faculty catalog and active teaching rosters.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeletingId(null)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(deletingId)}
                disabled={isPending}
              >
                {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                Confirm Removal
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Faculty Modal */}
      {isAddModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#142541]/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-2xl border border-[#DCE4EE] p-6 sm:p-8 max-w-xl w-full space-y-5 shadow-2xl animate-fade-in-up my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE4EE]">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-[#EAF0F8] text-[#355F99] flex items-center justify-center">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#142541]">
                    {editingInstructor ? "Edit Faculty Member" : "Add New Faculty Member"}
                  </h3>
                  <p className="text-xs text-[#5F6F84]">
                    Instructor information and Cloudinary profile photo.
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1 rounded-lg text-[#5F6F84] hover:bg-[#F0F2F4] transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#142541] block mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Dr. Elena Vance"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#DCE4EE] text-xs text-[#142541] focus:outline-none focus:ring-2 focus:ring-[#355F99]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#142541] block mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="elena.vance@syntaxora.com"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#DCE4EE] text-xs text-[#142541] focus:outline-none focus:ring-2 focus:ring-[#355F99]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#142541] block mb-1">
                  Academic / Professional Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Lead AI & Computer Vision Faculty"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DCE4EE] text-xs text-[#142541] focus:outline-none focus:ring-2 focus:ring-[#355F99]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#142541] block mb-1">
                  Domain Specialties (Comma Separated)
                </label>
                <input
                  type="text"
                  value={specialties}
                  onChange={(e) => setSpecialties(e.target.value)}
                  placeholder="Computer Vision, PyTorch, ROS 2, Youth Pedagogy"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DCE4EE] text-xs text-[#142541] focus:outline-none focus:ring-2 focus:ring-[#355F99]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#142541] block mb-1">
                  Biography & Qualifications <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Describe academic credentials, research background, and engineering industry experience..."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DCE4EE] text-xs text-[#142541] focus:outline-none focus:ring-2 focus:ring-[#355F99]"
                />
              </div>

              {/* Cloudinary Profile Photo Section */}
              <div className="space-y-2 pt-2 border-t border-[#DCE4EE]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#142541] flex items-center gap-1.5">
                    <ImageIcon className="h-4 w-4 text-[#355F99]" />
                    <span>Faculty Photo (Cloudinary Image)</span>
                  </label>
                  <div className="flex items-center gap-1 text-[11px] font-semibold bg-[#F0F2F4] p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setUploadMode("file")}
                      className={`px-2 py-0.5 rounded-md transition-colors ${
                        uploadMode === "file"
                          ? "bg-white text-[#142541] shadow-xs"
                          : "text-[#5F6F84] hover:text-[#142541]"
                      }`}
                    >
                      <Upload className="h-3 w-3 inline mr-1" />
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadMode("url")}
                      className={`px-2 py-0.5 rounded-md transition-colors ${
                        uploadMode === "url"
                          ? "bg-white text-[#142541] shadow-xs"
                          : "text-[#5F6F84] hover:text-[#142541]"
                      }`}
                    >
                      <LinkIcon className="h-3 w-3 inline mr-1" />
                      Cloudinary URL
                    </button>
                  </div>
                </div>

                {uploadMode === "file" ? (
                  <div className="space-y-2">
                    <div className="border-2 border-dashed border-[#DCE4EE] hover:border-[#355F99]/60 rounded-xl p-4 text-center cursor-pointer transition-colors bg-[#FAF8F3]">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                        id="cloudinary-file-input"
                        className="hidden"
                      />
                      <label htmlFor="cloudinary-file-input" className="cursor-pointer space-y-1 block">
                        <Upload className="h-6 w-6 text-[#355F99] mx-auto" />
                        <span className="text-xs font-semibold text-[#142541] block">
                          {isUploading ? "Uploading to Cloudinary..." : "Click to browse image to upload"}
                        </span>
                        <span className="text-[10px] text-[#5F6F84] block">
                          PNG, JPG, or WebP up to 5MB
                        </span>
                      </label>
                    </div>
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://res.cloudinary.com/your-cloud/image/upload/v.../avatar.jpg"
                      className="w-full px-3.5 py-2 rounded-xl border border-[#DCE4EE] text-xs text-[#142541] focus:outline-none focus:ring-2 focus:ring-[#355F99]"
                    />
                  </div>
                )}

                {uploadError && (
                  <p className="text-[11px] text-[#B91C1C] flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{uploadError}</span>
                  </p>
                )}

                {/* Live Preview */}
                {avatarUrl && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FAF8F3] border border-[#DCE4EE]">
                    <div className="relative h-12 w-12 rounded-xl overflow-hidden border border-[#DCE4EE] bg-[#03060C] shrink-0">
                      <Image
                        src={avatarUrl}
                        alt="Preview"
                        width={48}
                        height={48}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-[#142541] block">Image Ready</span>
                      <span className="text-[10px] text-[#5F6F84] truncate block">
                        {avatarUrl}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAvatarUrl("")}
                      className="text-xs text-[#B91C1C] hover:underline font-semibold shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#DCE4EE]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCloseModal}
                  disabled={isPending || isUploading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isPending || isUploading}
                  className="font-bold btn-gradient-ai"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                      Saving Faculty...
                    </>
                  ) : editingInstructor ? (
                    "Save Changes"
                  ) : (
                    "Register Faculty Member"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
