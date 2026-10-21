import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Syntaxora — AI Learning Academy | Practical Artificial Intelligence for All Ages",
    template: "%s | Syntaxora AI Academy",
  },
  description:
    "Professional online AI learning academy for children, teenagers, university students, and adults. Live classes, projects, and verified skill mastery.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  openGraph: {
    title: "Syntaxora — AI Learning Academy",
    description: "Practical artificial intelligence and robotics education for kids, teens, and adults.",
    siteName: "Syntaxora",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans bg-[#F3F6FA] text-[#263449]">
        {children}
      </body>
    </html>
  );
}
