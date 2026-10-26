import React from "react";

interface AIHighlightProps {
  text: string;
  className?: string;
  glow?: boolean;
}

/**
 * AIHighlight wraps occurrences of AI, Artificial Intelligence, and Machine Learning
 * with the signature Dhruv Rathee AI Masterclass gradient text highlighting system.
 */
export function AIHighlight({ text, className = "", glow = false }: AIHighlightProps) {
  if (!text) return null;
  const parts = text.split(/\b(AI|Artificial Intelligence|Machine Learning)\b/gi);
  const gradientClass = glow ? "text-gradient-ai-glow" : "text-gradient-ai";

  return (
    <span className={className}>
      {parts.map((part, i) => {
        const lower = part.toLowerCase();
        if (
          lower === "ai" ||
          lower === "artificial intelligence" ||
          lower === "machine learning"
        ) {
          return (
            <span key={i} className={`${gradientClass} font-bold`}>
              {part}
            </span>
          );
        }
        return part;
      })}
    </span>
  );
}
