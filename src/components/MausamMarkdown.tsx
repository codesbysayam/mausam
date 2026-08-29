import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MausamMarkdownProps {
  content: string;
}

/**
 * Pre-processes and sanitizes markdown strings to ensure clean typography,
 * eliminating accidental raw markdown artifacts, double-bold tags, or stray characters.
 */
function cleanMarkdownText(raw: string): string {
  if (!raw) return '';
  let text = raw;

  // Fix doubled/stacked asterisks like ****text**** -> **text**
  text = text.replace(/\*{4,}([^*]+)\*{4,}/g, '**$1**');
  // Fix cases where a colon is surrounded by asterisks like :** -> : **
  text = text.replace(/:\*\*/g, ': **');
  // Fix asterisks right before spaces
  text = text.replace(/\*\*\s+/g, '** ');
  text = text.replace(/\s+\*\*/g, ' **');

  return text;
}

export const MausamMarkdown: React.FC<MausamMarkdownProps> = ({ content }) => {
  const cleaned = cleanMarkdownText(content);

  return (
    <div className="mausam-markdown text-xs sm:text-[13px] leading-relaxed text-[#D7DEE8] select-text">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="block text-base font-bold text-white mb-2.5 mt-1.5 border-b border-[#202B3B] pb-1.5">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="block text-sm font-bold text-[#4FA8E0] mb-2 mt-2 border-b border-[#202B3B]/60 pb-1">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="block text-xs sm:text-sm font-bold text-[#4FA8E0] mb-2 mt-1.5 tracking-wide">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="block text-xs font-semibold text-white mb-1.5 mt-2">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="mb-2 last:mb-0 leading-relaxed text-[#D7DEE8]">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-white tracking-tight">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="text-[#94A3B8] italic font-serif">
              {children}
            </em>
          ),
          ul: ({ children }) => (
            <ul className="space-y-1.5 my-2 pl-4 list-disc marker:text-[#0B72B9]">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="space-y-1.5 my-2 pl-4 list-decimal marker:text-[#0B72B9] font-medium">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed pl-0.5 text-[#CBD5E1]">
              {children}
            </li>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-2.5 rounded-lg border border-[#202B3B] shadow-inner bg-[#0B1017]">
              <table className="w-full text-left text-xs border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-[#17212B] border-b border-[#202B3B] text-white">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="p-2 font-semibold text-white border-b border-[#202B3B] text-[11px] uppercase tracking-wider">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="p-2 border-b border-[#202B3B]/40 text-[#CBD5E1] text-[11px]">
              {children}
            </td>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-[#0B72B9] pl-3 py-1.5 my-2 bg-[#0B72B9]/10 text-xs text-[#93C5FD] rounded-r-md">
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code className="px-1.5 py-0.5 rounded bg-[#1A2533] text-[#4FA8E0] font-mono text-[11px] border border-[#202B3B]">
              {children}
            </code>
          ),
          hr: () => <hr className="my-3 border-[#202B3B]" />,
        }}
      >
        {cleaned}
      </ReactMarkdown>
    </div>
  );
};
