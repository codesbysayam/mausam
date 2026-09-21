// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Canonical Markdown Renderer for Meteorological Assistant
// Sanitizes output, eliminates literal asterisks, styles lists & values
// ====================================================================

import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Normalizes malformed LLM markdown before passing to the parser
 */
export function normalizeMarkdown(text: string): string {
  if (!text) return '';

  let normalized = text;

  // 1. Remove quadrupled or quintupled asterisks like ****text**** -> **text**
  normalized = normalized.replace(/\*{4,}([^*]+)\*{4,}/g, '**$1**');

  // 2. Fix spaced bold markers like ** text ** -> **text**
  normalized = normalized.replace(/\*\*\s+([^*]+?)\s+\*\*/g, '**$1**');

  // 3. Remove orphaned or empty heading tags like "### ###" or "## #"
  normalized = normalized.replace(/^(#{1,6})\s*(#{1,6})\s*$/gm, '');

  // 4. Ensure space after heading hashes if missing (e.g. "###Forecast" -> "### Forecast")
  normalized = normalized.replace(/^(#{1,6})([A-Za-z0-9])/gm, '$1 $2');

  // 5. Fix bullet points with missing space (e.g. "•Today" -> "• Today" or "*Today" -> "* Today")
  normalized = normalized.replace(/^([•\-\*])([A-Za-z0-9])/gm, '$1 $2');

  // 6. Convert literal bullet characters "•" at start of line into standard markdown "- "
  normalized = normalized.replace(/^•\s*/gm, '- ');

  // 7. Ensure clean line breaks between lists and paragraphs
  normalized = normalized.replace(/([^\n])\n(- |\d+\. )/g, '$1\n\n$2');

  return normalized.trim();
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = '',
}) => {
  const cleanContent = useMemo(() => normalizeMarkdown(content), [content]);

  return (
    <div className={`text-xs sm:text-sm leading-relaxed text-[#D7DEE8] space-y-2 select-text ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Strong bold styling for meteorological measurements & keywords
          strong: ({ children }) => (
            <strong className="font-semibold text-white tracking-wide">
              {children}
            </strong>
          ),
          // Italic emphasis
          em: ({ children }) => (
            <em className="italic text-[#94A3B8]">{children}</em>
          ),
          // Headings
          h1: ({ children }) => (
            <h1 className="text-base sm:text-lg font-bold text-white mt-3 mb-1 border-b border-[#1F2C3F] pb-1">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm sm:text-base font-bold text-[#38BDF8] mt-2.5 mb-1">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs sm:text-sm font-semibold text-[#F1F5F9] mt-2 mb-0.5">
              {children}
            </h3>
          ),
          // Paragraphs
          p: ({ children }) => (
            <p className="my-1.5 leading-relaxed text-[#CBD5E1]">{children}</p>
          ),
          // Lists
          ul: ({ children }) => (
            <ul className="list-disc list-outside pl-4 my-1.5 space-y-1 text-[#CBD5E1]">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside pl-4 my-1.5 space-y-1 text-[#CBD5E1]">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-snug text-[#CBD5E1] pl-0.5">{children}</li>
          ),
          // Inline code for station codes or units
          code: ({ children }) => (
            <code className="px-1.5 py-0.5 rounded bg-[#162234] border border-[#1F2C3F] text-[#38BDF8] font-mono text-[11px]">
              {children}
            </code>
          ),
          // Blockquotes for official advisories / alerts
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-[#0284C7] pl-3 py-1 my-2 bg-[#0284C7]/10 rounded-r text-[#94A3B8] italic">
              {children}
            </blockquote>
          ),
          // Tables
          table: ({ children }) => (
            <div className="overflow-x-auto my-2 rounded-lg border border-[#1F2C3F]">
              <table className="min-w-full divide-y divide-[#1F2C3F] text-left text-[11px]">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-[#0F172A] text-white font-semibold">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-[#1F2C3F] bg-[#0A101D] text-[#CBD5E1]">
              {children}
            </tbody>
          ),
          tr: ({ children }) => <tr>{children}</tr>,
          th: ({ children }) => (
            <th className="px-2.5 py-1.5 font-medium">{children}</th>
          ),
          td: ({ children }) => (
            <td className="px-2.5 py-1.5 whitespace-nowrap">{children}</td>
          ),
          // Links
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#38BDF8] hover:underline"
            >
              {children}
            </a>
          ),
        }}
      >
        {cleanContent}
      </ReactMarkdown>
    </div>
  );
};
