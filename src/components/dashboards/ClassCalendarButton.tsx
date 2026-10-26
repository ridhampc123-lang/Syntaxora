"use client";

import React from "react";
import { Calendar, Download } from "lucide-react";

interface Props {
  title: string;
  description?: string;
  startsAt: string;
  endsAt: string;
}

export function ClassCalendarButton({ title, description, startsAt, endsAt }: Props) {
  const handleDownloadIcs = () => {
    const formatDate = (dateStr: string) => {
      const d = new Date(dateStr);
      return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    };

    const start = formatDate(startsAt);
    const end = formatDate(endsAt);
    const now = formatDate(new Date().toISOString());

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Syntaxora AI Academy//EN",
      "BEGIN:VEVENT",
      `UID:${Date.now()}@syntaxora.com`,
      `DTSTAMP:${now}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${title} — Syntaxora AI Academy`,
      `DESCRIPTION:${(description || "Live Interactive Online Class").replace(/\n/g, " ")}`,
      "LOCATION:Syntaxora Virtual WebRTC Lab",
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${title.replace(/\s+/g, "_")}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleDownloadIcs}
      type="button"
      title="Add to Google / Apple Calendar (.ics)"
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F3F6FA] hover:bg-[#DCE4EE] text-[11px] font-semibold text-[#142541] border border-[#DCE4EE] transition-all cursor-pointer"
    >
      <Calendar className="h-3 w-3 text-[#3869AD]" />
      <span>Add to Cal</span>
    </button>
  );
}
