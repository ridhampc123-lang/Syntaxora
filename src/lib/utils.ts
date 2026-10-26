import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amountInCents: number, currency = "INR"): string {
  const normCurrency = (currency || "INR").toUpperCase();
  // Default to INR currency symbol (₹) and Indian numbering system (e.g. ₹14,999)
  const isINR = normCurrency === "INR" || normCurrency === "USD";
  if (isINR) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: amountInCents % 100 === 0 ? 0 : 2,
    }).format(amountInCents / 100);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: normCurrency,
  }).format(amountInCents / 100);
}

export function formatDate(dateString: string | Date): string {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(dateString: string | Date): string {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
