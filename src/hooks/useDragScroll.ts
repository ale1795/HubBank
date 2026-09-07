import { useRef } from 'react';

// Lets a horizontally-scrollable row be dragged with the mouse, not just
// touch/trackpad swipe — spread the returned handlers onto the scroll container.
export function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const state = useRef({ isDragging: false, startX: 0, startScrollLeft: 0, moved: false });

  const onMouseDown = (e: React.MouseEvent) => {
    if (!ref.current) return;
    state.current.isDragging = true;
    state.current.moved = false;
    state.current.startX = e.pageX;
    state.current.startScrollLeft = ref.current.scrollLeft;
  };

  const endDrag = () => {
    state.current.isDragging = false;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!state.current.isDragging || !ref.current) return;
    const delta = e.pageX - state.current.startX;
    if (Math.abs(delta) > 3) state.current.moved = true;
    ref.current.scrollLeft = state.current.startScrollLeft - delta;
  };

  // Suppress the click that would otherwise fire on a card after a drag.
  const onClickCapture = (e: React.MouseEvent) => {
    if (state.current.moved) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // A plain mouse wheel only scrolls vertically by default — redirect it to
  // this row's horizontal scroll so trackpad/wheel users can move it too.
  const onWheel = (e: React.WheelEvent) => {
    if (!ref.current) return;
    const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    if (delta === 0) return;
    ref.current.scrollLeft += delta;
    e.preventDefault();
  };

  return {
    ref,
    handlers: {
      onMouseDown,
      onMouseMove,
      onMouseUp: endDrag,
      onMouseLeave: endDrag,
      onClickCapture,
      onWheel,
    },
  };
}
