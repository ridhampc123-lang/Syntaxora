import React from "react";
import { cn } from "@/lib/utils";

interface AIHighlightProps {
  text?: string;
  children?: React.ReactNode;
  className?: string;
  glow?: boolean;
}

const AI_KEYWORDS = [
  "Artificial Intelligence",
  "Machine Learning",
  "Deep Learning",
  "Generative AI",
  "Neural Networks",
  "Neural Network",
  "Neural Architectures",
  "Computer Vision",
  "Applied AI",
  "AI Explorers",
  "PyTorch",
  "OpenCV",
  "LLMs",
  "LLM",
  "RAG",
  "AI",
];

// Match longest keywords first so "Artificial Intelligence" matches before "AI"
const AI_REGEX = new RegExp(
  `\\b(${[...AI_KEYWORDS].sort((a, b) => b.length - a.length).join("|")})\\b`,
  "gi"
);

/**
 * AIHighlight wraps occurrences of Artificial Intelligence, AI, Machine Learning,
 * Deep Learning, Neural Networks, Computer Vision, etc. with the signature
 * interactive dual-gradient system that transforms into a vibrant new gradient on hover.
 */
export function AIHighlight({
  text,
  children,
  className = "",
  glow = false,
}: AIHighlightProps) {
  const gradientClass = glow ? "text-gradient-ai-glow" : "text-gradient-ai";

  const content = text ?? (typeof children === "string" ? children : null);

  if (content) {
    const parts = content.split(AI_REGEX);
    return (
      <span className={className}>
        {parts.map((part, i) => {
          const isMatch = AI_KEYWORDS.some(
            (k) => k.toLowerCase() === part.toLowerCase()
          );
          if (isMatch) {
            return (
              <span
                key={i}
                className={cn(gradientClass, "font-bold inline cursor-default transition-all duration-300")}
              >
                {part}
              </span>
            );
          }
          return part;
        })}
      </span>
    );
  }

  if (children) {
    return (
      <span
        className={cn(gradientClass, "font-bold inline cursor-default transition-all duration-300", className)}
      >
        {children}
      </span>
    );
  }

  return null;
}
