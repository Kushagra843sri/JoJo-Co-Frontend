import { useRef } from 'react';

// Horizontal swipe detection for touch screens. Deliberately ignores anything
// that isn't a plain one-finger horizontal flick, because the same touches are
// also how people zoom and pan:
//  - a pinch (two fingers) must never flip the photo, even though one finger's
//    position changes by more than the threshold during the gesture;
//  - while the page is zoomed in, a one-finger drag is panning, not swiping;
//  - a mostly-vertical drag is a scroll.
const SWIPE_DISTANCE = 50;

const useSwipe = (onSwipe) => {
  const start = useRef(null);
  const gestureCancelled = useRef(false);

  const isPageZoomed = () => (window.visualViewport?.scale ?? 1) > 1.01;

  return {
    onTouchStart: (e) => {
      if (e.touches.length > 1) {
        gestureCancelled.current = true;
        start.current = null;
        return;
      }
      gestureCancelled.current = false;
      start.current = isPageZoomed() ? null : { x: e.touches[0].clientX, y: e.touches[0].clientY };
    },
    onTouchEnd: (e) => {
      if (e.touches.length > 0) return; // other fingers still down — gesture not finished
      const wasCancelled = gestureCancelled.current;
      const begin = start.current;
      gestureCancelled.current = false;
      start.current = null;
      if (wasCancelled || !begin || isPageZoomed()) return;
      const dx = e.changedTouches[0].clientX - begin.x;
      const dy = e.changedTouches[0].clientY - begin.y;
      if (Math.abs(dx) > SWIPE_DISTANCE && Math.abs(dx) > Math.abs(dy) * 1.5) onSwipe(dx < 0 ? 1 : -1);
    },
    onTouchCancel: () => {
      gestureCancelled.current = false;
      start.current = null;
    },
  };
};

export default useSwipe;
