import { describe, it, expect } from "vitest";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

describe("Utility functions", () => {
  it("merges class names correctly with twMerge and clsx", () => {
    const result = cn("px-4 py-2", "px-6", { "bg-blue-500": true, "text-red-500": false });
    expect(result).toBe("py-2 px-6 bg-blue-500");
  });

  it("formats currency in cents to Indian Rupee (INR) string", () => {
    expect(formatCurrency(49900, "INR")).toBe("₹499");
    expect(formatCurrency(0, "INR")).toBe("₹0");
    expect(formatCurrency(1499900)).toBe("₹14,999");
  });

  it("formats dates into readable format", () => {
    const date = new Date("2026-10-21T12:00:00Z");
    const formatted = formatDate(date);
    expect(formatted).toContain("2026");
    expect(formatted).toContain("Oct");
  });
});
