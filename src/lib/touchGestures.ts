// Touch gesture utilities for mobile support

export interface TouchGestureHandlers {
  onPinchZoom?: (scale: number, center: { x: number; y: number }) => void;
  onPan?: (delta: { x: number; y: number }) => void;
  onLongPress?: (position: { x: number; y: number }) => void;
}

export function setupTouchGestures(
  element: HTMLElement,
  handlers: TouchGestureHandlers
): () => void {
  let touchStartDistance = 0;
  let touchStartPos = { x: 0, y: 0 };
  let longPressTimer: NodeJS.Timeout | null = null;
  let isPinching = false;
  let isPanning = false;

  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      // Two-finger pinch zoom
      isPinching = true;
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      touchStartDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
    } else if (e.touches.length === 1) {
      // Single finger - could be pan or long press
      const touch = e.touches[0];
      touchStartPos = { x: touch.clientX, y: touch.clientY };
      
      // Setup long press detection
      if (handlers.onLongPress) {
        longPressTimer = setTimeout(() => {
          handlers.onLongPress?.({ x: touch.clientX, y: touch.clientY });
          longPressTimer = null;
        }, 500);
      }
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    // Cancel long press if finger moves
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }

    if (e.touches.length === 2 && isPinching && handlers.onPinchZoom) {
      // Pinch zoom
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      const scale = distance / touchStartDistance;
      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;
      
      handlers.onPinchZoom(scale, { x: centerX, y: centerY });
    } else if (e.touches.length === 1 && !isPinching && handlers.onPan) {
      // Single finger pan
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartPos.x;
      const deltaY = touch.clientY - touchStartPos.y;
      
      // Only start panning if moved more than 10px
      if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
        if (!isPanning) {
          isPanning = true;
        }
        handlers.onPan({ x: deltaX, y: deltaY });
        touchStartPos = { x: touch.clientX, y: touch.clientY };
      }
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
    isPinching = false;
    isPanning = false;
  };

  element.addEventListener('touchstart', handleTouchStart, { passive: false });
  element.addEventListener('touchmove', handleTouchMove, { passive: false });
  element.addEventListener('touchend', handleTouchEnd);
  element.addEventListener('touchcancel', handleTouchEnd);

  // Cleanup function
  return () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
    }
    element.removeEventListener('touchstart', handleTouchStart);
    element.removeEventListener('touchmove', handleTouchMove);
    element.removeEventListener('touchend', handleTouchEnd);
    element.removeEventListener('touchcancel', handleTouchEnd);
  };
}
