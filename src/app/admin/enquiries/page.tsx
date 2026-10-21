import React from "react";
import { Mail } from "lucide-react";
import { getAdminEnquiries } from "@/server/services/adminService";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "Admissions Inquiries — Syntaxora Admin",
  description: "View and respond to prospective student and guardian contact requests.",
};

export default async function AdminEnquiriesPage() {
  const enquiries = await getAdminEnquiries();

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold text-[#142541] tracking-tight">
          Admissions Enquiries Inbox
        </h2>
        <p className="text-xs text-[#5F6F84] mt-0.5">
          Incoming enquiries submitted through the public website contact form.
        </p>
      </div>

      {enquiries.length === 0 ? (
        <div className="rounded-xl border border-[#DCE4EE] bg-white p-12 text-center space-y-3">
          <div className="mx-auto h-12 w-12 rounded-full bg-[#E8EFF8] text-[#3869AD] flex items-center justify-center">
            <Mail className="h-6 w-6" aria-hidden="true" />
          </div>
          <h3 className="text-base font-bold text-[#142541]">No New Enquiries</h3>
          <p className="text-xs text-[#5F6F84] max-w-sm mx-auto">
            All prospective student questions and admissions contact messages have been reviewed.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-[#DCE4EE] bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F3F6FA] border-b border-[#DCE4EE] text-[#142541] font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Name</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Phone</th>
                  <th className="p-3.5">Subject</th>
                  <th className="p-3.5">Message</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE4EE] text-[#263449]">
                {enquiries.map((enquiry) => (
                  <tr key={enquiry.id} className="hover:bg-[#F3F6FA]/50 transition-colors">
                    <td className="p-3.5 whitespace-nowrap text-[#5F6F84]">
                      {enquiry.created_at ? formatDate(enquiry.created_at) : "Recent"}
                    </td>
                    <td className="p-3.5 font-medium text-[#142541]">
                      {enquiry.full_name}
                    </td>
                    <td className="p-3.5 text-[#3869AD]">
                      <a href={`mailto:${enquiry.email}`} className="hover:underline">
                        {enquiry.email}
                      </a>
                    </td>
                    <td className="p-3.5 text-[#5F6F84]">
                      {enquiry.phone || "—"}
                    </td>
                    <td className="p-3.5 font-medium text-[#142541]">
                      {enquiry.subject}
                    </td>
                    <td className="p-3.5 text-[#5F6F84] max-w-xs truncate">
                      {enquiry.message}
                    </td>
                    <td className="p-3.5">
                      <Badge variant={enquiry.status === "unread" ? "warning" : "success"}>
                        {enquiry.status || "unread"}
                      </Badge>
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
