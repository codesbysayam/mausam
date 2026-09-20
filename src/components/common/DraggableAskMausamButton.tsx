import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, GripVertical } from 'lucide-react';

interface DraggableAskMausamButtonProps {
  onClick: () => void;
  isVisible: boolean;
}

const STORAGE_KEY = 'mausam_ask_btn_coords';
const PADDING = 16;
const DRAG_THRESHOLD = 5; // px moved to distinguish drag from click

export const DraggableAskMausamButton: React.FC<DraggableAskMausamButtonProps> = ({
  onClick,
  isVisible,
}) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Tracking drag state in ref to avoid lag in pointer event listeners
  const dragInfoRef = useRef({
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
    hasMoved: false,
    pointerId: -1,
  });

  // Calculate default position at bottom-right of viewport
  const getDefaultPosition = useCallback(() => {
    if (typeof window === 'undefined') return { x: 0, y: 0 };
    const btnWidth = buttonRef.current?.offsetWidth || 160;
    const btnHeight = buttonRef.current?.offsetHeight || 44;
    return {
      x: Math.max(PADDING, window.innerWidth - btnWidth - PADDING),
      y: Math.max(PADDING, window.innerHeight - btnHeight - PADDING - 8),
    };
  }, []);

  // Clamp coordinates within screen viewport
  const clampPosition = useCallback((x: number, y: number) => {
    if (typeof window === 'undefined') return { x, y };
    const btnWidth = buttonRef.current?.offsetWidth || 160;
    const btnHeight = buttonRef.current?.offsetHeight || 44;
    const minX = PADDING;
    const maxX = Math.max(PADDING, window.innerWidth - btnWidth - PADDING);
    const minY = PADDING;
    const maxY = Math.max(PADDING, window.innerHeight - btnHeight - PADDING);

    return {
      x: Math.min(Math.max(x, minX), maxX),
      y: Math.min(Math.max(y, minY), maxY),
    };
  }, []);

  // Snapping utility: automatically aligns to closest screen edge (left, right, top, or bottom)
  const snapToEdge = useCallback((x: number, y: number) => {
    if (typeof window === 'undefined') return { x, y };
    const btnWidth = buttonRef.current?.offsetWidth || 160;
    const btnHeight = buttonRef.current?.offsetHeight || 44;
    const minX = PADDING;
    const maxX = Math.max(PADDING, window.innerWidth - btnWidth - PADDING);
    const minY = PADDING;
    const maxY = Math.max(PADDING, window.innerHeight - btnHeight - PADDING);

    const distLeft = Math.abs(x - minX);
    const distRight = Math.abs(maxX - x);
    const distTop = Math.abs(y - minY);
    const distBottom = Math.abs(maxY - y);

    const minDist = Math.min(distLeft, distRight, distTop, distBottom);

    let targetX = x;
    let targetY = y;

    if (minDist === distLeft) {
      targetX = minX;
    } else if (minDist === distRight) {
      targetX = maxX;
    } else if (minDist === distTop) {
      targetY = minY;
    } else {
      targetY = maxY;
    }

    return {
      x: Math.min(Math.max(targetX, minX), maxX),
      y: Math.min(Math.max(targetY, minY), maxY),
    };
  }, []);

  // Initialize position from localStorage or default to bottom-right
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          setPosition(clampPosition(parsed.x, parsed.y));
          return;
        }
      }
    } catch {
      // Fallback to default
    }
    setPosition(getDefaultPosition());
  }, [clampPosition, getDefaultPosition]);

  // Keep button within screen on window resize
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => {
        if (!prev) return getDefaultPosition();
        return clampPosition(prev.x, prev.y);
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [clampPosition, getDefaultPosition]);

  // Pointer Down Handler
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only respond to primary button (left-click or touch)
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    const currentPos = position || getDefaultPosition();
    dragInfoRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      originX: currentPos.x,
      originY: currentPos.y,
      hasMoved: false,
      pointerId: e.pointerId,
    };

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture fails
    }
  };

  // Pointer Move Handler
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragInfoRef.current.pointerId !== e.pointerId) return;

    const deltaX = e.clientX - dragInfoRef.current.startX;
    const deltaY = e.clientY - dragInfoRef.current.startY;
    const distance = Math.hypot(deltaX, deltaY);

    if (!dragInfoRef.current.hasMoved && distance > DRAG_THRESHOLD) {
      dragInfoRef.current.hasMoved = true;
      setIsDragging(true);
    }

    if (dragInfoRef.current.hasMoved) {
      const targetX = dragInfoRef.current.originX + deltaX;
      const targetY = dragInfoRef.current.originY + deltaY;
      setPosition(clampPosition(targetX, targetY));
    }
  };

  // Pointer Up Handler
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragInfoRef.current.pointerId !== e.pointerId) return;

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }

    const wasDragging = dragInfoRef.current.hasMoved;
    dragInfoRef.current.pointerId = -1;
    setIsDragging(false);

    if (wasDragging) {
      // Snap to nearest edge when released
      const current = position || getDefaultPosition();
      const snapped = snapToEdge(current.x, current.y);
      setPosition(snapped);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(snapped));
      } catch {
        // Ignore storage errors
      }
    } else {
      // Trigger click if it was a tap/click without drag
      onClick();
    }
  };

  // Pointer Cancel Handler
  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragInfoRef.current.pointerId === e.pointerId) {
      dragInfoRef.current.pointerId = -1;
      setIsDragging(false);
      if (dragInfoRef.current.hasMoved && position) {
        const snapped = snapToEdge(position.x, position.y);
        setPosition(snapped);
      }
    }
  };

  // Double click resets to bottom-right
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const def = getDefaultPosition();
    setPosition(def);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  const currentStyle: React.CSSProperties = {
    position: 'fixed',
    left: position ? `${position.x}px` : undefined,
    top: position ? `${position.y}px` : undefined,
    right: position ? 'auto' : '16px',
    bottom: position ? 'auto' : '16px',
    touchAction: 'none',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    transition: isDragging
      ? 'none'
      : 'left 0.25s cubic-bezier(0.16, 1, 0.3, 1), top 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease',
  };

  return (
    <div
      ref={buttonRef}
      id="floating-ask-mausam-container"
      style={currentStyle}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDoubleClick={handleDoubleClick}
      className={`mausam-draggable-ask-button z-50 select-none group transition-opacity duration-200 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      role="button"
      tabIndex={0}
      aria-label="Ask MAUSAM AI Weather & Advisory - Drag anywhere to reposition"
      title="Ask MAUSAM (Drag anywhere on screen to move • Double-click to reset)"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div
        className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-full bg-[#0B72B9] hover:bg-[#095991] active:bg-[#074773] text-white border border-[#38BDF8] shadow-2xl transition-all select-none ${
          isDragging
            ? 'scale-105 shadow-[0_12px_32px_rgba(11,114,185,0.65)] ring-2 ring-[#38BDF8] cursor-grabbing'
            : 'cursor-grab hover:shadow-[0_8px_24px_rgba(11,114,185,0.45)]'
        }`}
      >
        {/* Visual Drag Handle Indicator */}
        <span
          className="text-[#93C5FD] opacity-70 group-hover:opacity-100 transition-opacity flex items-center"
          title="Drag to move"
        >
          <GripVertical className="w-3.5 h-3.5" aria-hidden="true" />
        </span>

        {/* Sparkles / AI Icon */}
        <Sparkles className="w-4 h-4 text-[#38BDF8] shrink-0" aria-hidden="true" />

        {/* Label */}
        <span className="font-bold tracking-wide text-[11px] sm:text-xs whitespace-nowrap">
          Ask MAUSAM
        </span>

        {/* Live Pulse Dot */}
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2ECC71] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2ECC71]" />
        </span>
      </div>

      {/* Floating Drag Hint on Hover */}
      {isHovered && !isDragging && (
        <div
          className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-[#0D1E33] border border-[#1E3A5F] text-[10px] text-[#93C5FD] whitespace-nowrap shadow pointer-events-none transition-all"
          aria-hidden="true"
        >
          Drag to move anywhere
        </div>
      )}
    </div>
  );
};
