import { useEffect, useRef } from 'react';
import { triggerHaptic } from '../utils/haptics';

interface SwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number; // Minimum horizontal pixel delta
  maxVerticalRatio?: number; // Max vertical movement ratio relative to horizontal
  disabled?: boolean;
}

export function useSwipeGesture<T extends HTMLElement = HTMLElement>({
  onSwipeLeft,
  onSwipeRight,
  threshold = 60,
  maxVerticalRatio = 0.8,
  disabled = false,
}: SwipeGestureOptions) {
  const elementRef = useRef<T | null>(null);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchStartTime = useRef<number>(0);

  useEffect(() => {
    const el = elementRef.current;
    if (!el || disabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      // Do not trigger swipe if touching map canvas, sliders, or scrollable tables
      const target = e.target as HTMLElement | null;
      if (
        target?.closest(
          '.leaflet-container, canvas, input[type="range"], .overflow-x-auto, .recharts-responsive-container, [data-no-swipe]'
        )
      ) {
        return;
      }

      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      touchStartTime.current = Date.now();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartTime.current === 0) return;
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaX = touchEndX - touchStartX.current;
      const deltaY = touchEndY - touchStartY.current;
      const timeElapsed = Date.now() - touchStartTime.current;

      touchStartTime.current = 0;

      // Ensure gesture was reasonably fast (< 600ms) and primarily horizontal
      if (timeElapsed > 650) return;

      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      if (absDeltaX > threshold && absDeltaY < absDeltaX * maxVerticalRatio) {
        if (deltaX < 0 && onSwipeLeft) {
          triggerHaptic('medium');
          onSwipeLeft();
        } else if (deltaX > 0 && onSwipeRight) {
          triggerHaptic('medium');
          onSwipeRight();
        }
      }
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight, threshold, maxVerticalRatio, disabled]);

  return elementRef;
}
