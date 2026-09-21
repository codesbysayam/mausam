// ====================================================================
// MAUSAM - Atmospheric Intelligence Platform
// Interactive Message Bubble with Markdown Rendering & Grounded Facts
// ====================================================================

import React from 'react';
import { AskMausamMessage } from '../../types/askMausam';
import { MarkdownRenderer } from './MarkdownRenderer';
import { ComparisonAnswer } from './ComparisonAnswer';

interface MessageBubbleProps {
  message: AskMausamMessage;
  onSelectPrompt: (prompt: string) => void;
  onSelectLocation?: (locationName: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onSelectPrompt,
  onSelectLocation,
}) => {
  const isUser = message.sender === 'user';
  const time = new Date(message.timestamp).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  if (isUser) {
    return (
      <div className="flex justify-end mb-3">
        <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-[#0284C7] text-white px-3.5 py-2.5 shadow-sm">
          <p className="text-xs sm:text-sm leading-relaxed">{message.text}</p>
          <span className="block text-[10px] text-white/70 text-right mt-1 font-mono">{time}</span>
        </div>
      </div>
    );
  }

  const structured = message.structured;
  const context = message.contextSnapshot;
  const intent = structured?.intent || 'CURRENT_WEATHER';
  const facts = structured?.facts || [];
  const followUps = structured?.suggestedFollowUps || [];
  const sourceName = context?.sources?.[0]?.provider || 'Atmospheric Telemetry';

  return (
    <div className="flex flex-col gap-1.5 mb-4">
      {/* Sender Header */}
      <div className="flex items-center justify-between text-xs text-[#94A3B8] px-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
          <span className="font-semibold text-white tracking-wide">Ask MAUSAM</span>
          <span className="text-[10px] text-[#64748B]">•</span>
          <span className="text-[10px] font-mono text-[#94A3B8] truncate max-w-[160px]">
            {sourceName}
          </span>
        </div>
        <span className="text-[10px] font-mono text-[#64748B]">{time}</span>
      </div>

      {/* Main Bubble Content */}
      <div className="rounded-2xl rounded-tl-sm bg-[#0F172A] border border-[#1E293B] p-3.5 sm:p-4 text-[#D7DEE8] shadow-sm flex flex-col gap-3">
        {/* Safe, Sanitized Markdown Narrative */}
        <MarkdownRenderer content={message.text} />

        {/* Specialized Multi-Location Comparison Widget (when applicable) */}
        {intent === 'MULTI_LOCATION_COMPARISON' && structured?.comparison && (
          <div className="pt-2 border-t border-[#1E293B]">
            <ComparisonAnswer comparison={structured.comparison} />
          </div>
        )}

        {/* Fact Chips / Verified Grounding Context */}
        {facts.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#1E293B]">
            {facts.map((fact, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-[#162234] border border-[#1F2C3F] text-[11px] text-[#94A3B8]"
              >
                <strong className="text-white font-medium">{fact.label}:</strong> {fact.value}
              </span>
            ))}
          </div>
        )}

        {/* Switch Location Quick Action */}
        {context?.location && onSelectLocation && (
          <div className="flex items-center justify-between pt-2 border-t border-[#1E293B] text-[11px]">
            <span className="text-[#94A3B8] truncate">Grounded in: {context.location.name}</span>
            <button
              onClick={() => onSelectLocation(context.location.name)}
              className="text-[#38BDF8] hover:underline font-medium shrink-0 ml-2"
            >
              Switch Location
            </button>
          </div>
        )}

        {/* Suggested Follow-up Prompts */}
        {followUps.length > 0 && (
          <div className="pt-2 border-t border-[#1E293B] flex flex-col gap-1.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#64748B]">
              Suggested Inquiries
            </span>
            <div className="flex flex-wrap gap-1.5">
              {followUps.map((promptText, i) => (
                <button
                  key={i}
                  onClick={() => onSelectPrompt(promptText)}
                  className="px-2.5 py-1 rounded-lg text-xs bg-[#1E293B] hover:bg-[#334155] text-[#CBD5E1] hover:text-white border border-[#334155] transition-colors text-left"
                >
                  {promptText}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
