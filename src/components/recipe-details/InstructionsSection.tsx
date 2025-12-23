import React, { useMemo } from "react";
import DOMPurify from "dompurify";
import { BookOpenIcon } from "@heroicons/react/24/outline";
import type { InstructionsSectionProps } from "@/types/recipe-details";

/**
 * Allowed HTML tags for recipe instructions
 */
const ALLOWED_TAGS = [
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "br",
  "hr",
  "ul",
  "ol",
  "li",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "span",
  "div",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
];

/**
 * Allowed HTML attributes
 */
const ALLOWED_ATTR = ["class", "id"];

/**
 * Sekcja prezentująca instrukcje przygotowania przepisu
 * Instrukcje są w formacie HTML i są bezpiecznie sanityzowane
 */
export const InstructionsSection: React.FC<InstructionsSectionProps> = ({ instructions }) => {
  /**
   * Sanitize HTML content to prevent XSS attacks
   */
  const sanitizedHtml = useMemo(() => {
    if (!instructions) return "";

    // Configure DOMPurify
    const clean = DOMPurify.sanitize(instructions, {
      ALLOWED_TAGS,
      ALLOWED_ATTR,
      KEEP_CONTENT: true,
    });

    return clean;
  }, [instructions]);

  // Empty state
  if (!instructions || instructions.trim() === "") {
    return (
      <section className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 bg-gray-50">
          <BookOpenIcon className="w-5 h-5 text-gray-600" />
          <h2 className="font-semibold text-gray-900">Przygotowanie</h2>
        </div>
        <div className="p-4">
          <p className="text-gray-500 text-center py-4">Brak instrukcji dla tego przepisu.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Section header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 bg-gray-50">
        <BookOpenIcon className="w-5 h-5 text-gray-600" />
        <h2 className="font-semibold text-gray-900">Przygotowanie</h2>
      </div>

      {/* Instructions content */}
      <div
        className="p-4 prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-gray-900 prose-ol:list-decimal prose-ul:list-disc"
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    </section>
  );
};
