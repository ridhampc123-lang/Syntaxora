import React from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Search, CheckCircle, Clock } from "lucide-react";
import { getAdminEnquiries } from "@/server/services/adminService";
import { toggleEnquiryStatusAction } from "@/server/actions/admin";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "Admissions Inquiries — Syntaxora Admin",
  description: "View and respond to prospective student and guardian contact requests.",
};

interface EnquiriesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminEnquiriesPage({ searchParams }: EnquiriesPageProps) {
  const resolved = await searchParams;
  const statusFilter =
    resolved.status === "unread" || resolved.status === "read"
      ? (resolved.status as "unread" | "read")
      : undefined;
  const search = typeof resolved.q === "string" ? resolved.q.toLowerCase().trim() : "";

  const allEnquiries = await getAdminEnquiries();

  let filtered = allEnquiries;
  if (statusFilter) {
    filtered = filtered.filter((e) => e.status === statusFilter);
  }
  if (search) {
    filtered = filtered.filter(
      (e) =>
        e.full_name.toLowerCase().includes(search) ||
        e.email.toLowerCase().includes(search) ||
        e.subject.toLowerCase().includes(search) ||
        e.message.toLowerCase().includes(search)
    );
  }

  const unreadCount = allEnquiries.filter((e) => e.status === "unread").length;
  const readCount = allEnquiries.filter((e) => e.status !== "unread").length;

  return (
    <div className="space-y-8">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#5F6F84] mb-1">
            <Link href="/admin" className="hover:text-[#3869AD] flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" />
              <span>Admin Overview</span>
            </Link>
            <span>/</span>
            <span className="font-semibold text-[#142541]">Admissions Inquiries</span>
          </div>

          <h2 className="text-2xl font-black text-[#142541] tracking-tight">
            Admissions & Contact Inquiries
          </h2>
          <p className="text-xs text-[#5F6F84] mt-0.5">
            Incoming prospective student questions and guardian contact submissions from the public website.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/contact" target="_blank" rel="noopener noreferrer">
            <button className="px-3 py-1.5 rounded-lg border border-[#DCE4EE] bg-white text-xs font-semibold text-[#142541] hover:bg-[#F3F6FA] transition-colors">
              Open Public Form &rarr;
            </button>
          </Link>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs">
          <Link
            href="/admin/enquiries"
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              !statusFilter
                ? "bg-[#142541] text-white"
                : "bg-white border border-[#DCE4EE] text-[#5F6F84] hover:bg-[#F3F6FA]"
            }`}
          >
            All Messages ({allEnquiries.length})
          </Link>
          <Link
            href="/admin/enquiries?status=unread"
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
              statusFilter === "unread"
                ? "bg-[#142541] text-white"
                : "bg-white border border-[#DCE4EE] text-[#5F6F84] hover:bg-[#F3F6FA]"
            }`}
          >
            <span>Unread</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 font-bold">
              {unreadCount}
            </span>
          </Link>
          <Link
            href="/admin/enquiries?status=read"
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              statusFilter === "read"
                ? "bg-[#142541] text-white"
                : "bg-white border border-[#DCE4EE] text-[#5F6F84] hover:bg-[#F3F6FA]"
            }`}
          >
            Resolved ({readCount})
          </Link>
        </div>
      </div>

      {/* Inquiries Table */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-[#DCE4EE] bg-white p-12 text-center space-y-3">
          <div className="mx-auto h-12 w-12 rounded-full bg-[#E8EFF8] text-[#3869AD] flex items-center justify-center">
            <Mail className="h-6 w-6" aria-hidden="true" />
          </div>
          <h3 className="text-base font-bold text-[#142541]">No Inquiries Found</h3>
          <p className="text-xs text-[#5F6F84] max-w-sm mx-auto">
            {statusFilter === "unread"
              ? "All prospective student questions have been reviewed."
              : "No contact submissions match the selected filter."}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-[#DCE4EE] bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F3F6FA] border-b border-[#DCE4EE] text-[#142541] font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Applicant Name</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Phone</th>
                  <th className="p-3.5">Subject</th>
                  <th className="p-3.5">Message Content</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE4EE] text-[#263449]">
                {filtered.map((enquiry) => (
                  <tr key={enquiry.id} className="hover:bg-[#F3F6FA]/50 transition-colors">
                    <td className="p-3.5 whitespace-nowrap text-[#5F6F84]">
                      {enquiry.created_at ? formatDate(enquiry.created_at) : "Recent"}
                    </td>
                    <td className="p-3.5 font-bold text-[#142541]">
                      {enquiry.full_name}
                    </td>
                    <td className="p-3.5 text-[#3869AD]">
                      <a href={`mailto:${enquiry.email}`} className="hover:underline font-mono text-[11px]">
                        {enquiry.email}
                      </a>
                    </td>
                    <td className="p-3.5 text-[#5F6F84]">
                      {enquiry.phone || "—"}
                    </td>
                    <td className="p-3.5 font-bold text-[#142541]">
                      {enquiry.subject}
                    </td>
                    <td className="p-3.5 text-[#5F6F84] max-w-xs line-clamp-2">
                      {enquiry.message}
                    </td>
                    <td className="p-3.5">
                      <Badge variant={enquiry.status === "unread" ? "warning" : "success"}>
                        {enquiry.status === "unread" ? "UNREAD" : "RESOLVED"}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <form
                        action={async (formData: FormData) => {
                          "use server";
                          await toggleEnquiryStatusAction(formData);
                        }}
                        className="inline"
                      >
                        <input type="hidden" name="enquiryId" value={enquiry.id} />
                        <input
                          type="hidden"
                          name="newStatus"
                          value={enquiry.status === "unread" ? "read" : "unread"}
                        />
                        <button
                          type="submit"
                          className="px-2.5 py-1 rounded-md border border-[#DCE4EE] bg-white hover:bg-[#F3F6FA] text-xs font-semibold text-[#142541] transition-colors cursor-pointer"
                        >
                          {enquiry.status === "unread" ? "Mark Read" : "Mark Unread"}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
