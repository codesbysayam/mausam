/**
 * Safe haptic feedback utility for mobile devices
 * Invokes navigator.vibrate() when supported and active.
 */

export type HapticType =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'selection'
  | 'success'
  | 'warning'
  | 'error'
  | 'tap';

export function triggerHaptic(type: HapticType = 'light'): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  if (!('vibrate' in navigator) || typeof navigator.vibrate !== 'function') {
    return false;
  }

  try {
    switch (type) {
      case 'light':
      case 'tap':
        return navigator.vibrate(8);
      case 'selection':
        return navigator.vibrate(12);
      case 'medium':
        return navigator.vibrate(20);
      case 'heavy':
        return navigator.vibrate(35);
      case 'success':
        return navigator.vibrate([15, 30, 15]);
      case 'warning':
        return navigator.vibrate([25, 40, 25]);
      case 'error':
        return navigator.vibrate([40, 40, 40]);
      default:
        return navigator.vibrate(10);
    }
  } catch {
    // Silently ignore if blocked by browser policy (e.g. user gesture requirement)
    return false;
  }
}
