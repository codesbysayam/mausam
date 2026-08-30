import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface AgrometTooltipProps {
  term: string;
  explanation: string;
  children?: React.ReactNode;
}

export const AgrometTooltip: React.FC<AgrometTooltipProps> = ({ term, explanation, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span className="relative inline-flex items-center gap-1 group cursor-help">
      {children || <span className="underline decoration-dotted decoration-[#4FA8E0]/60 underline-offset-2">{term}</span>}
      <button
        type="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={(e) => {
          e.stopPropagation();
          setIsVisible(!isVisible);
        }}
        className="text-[#93A4B8] hover:text-[#4FA8E0] transition-colors focus:outline-none"
        aria-label={`Explanation of ${term}`}
      >
        <HelpCircle className="w-3 h-3 inline-block" />
      </button>

      {isVisible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2.5 bg-[#0F141A] border border-[#334155] rounded-lg shadow-2xl z-50 text-[11px] text-[#D7DEE8] leading-relaxed pointer-events-none animate-in fade-in zoom-in-95 duration-150">
          <div className="font-bold text-[#4FA8E0] mb-0.5 flex items-center justify-between">
            <span>{term}</span>
            <span className="text-[9px] uppercase tracking-wider text-[#2ECC71] font-mono">Agro-Met Term</span>
          </div>
          <p className="text-[#93A4B8]">{explanation}</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#0F141A]" />
        </div>
      )}
    </span>
  );
};
