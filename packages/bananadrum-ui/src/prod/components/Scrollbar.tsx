import { useState, useEffect } from 'react';
import { Publisher } from 'bananadrum-core';
import { useSubscription } from '../hooks/useSubscription';


type ScrollbarCallbacks = {
  onGrab: () => void
}


export function Scrollbar({wrapperRef, contentWidthPublisher, callbacks}:
  {wrapperRef:React.MutableRefObject<HTMLDivElement>, contentWidthPublisher:Publisher, callbacks:ScrollbarCallbacks}
): JSX.Element {
  const [thumbWidth, setThumbWidth] = useState(0);
  const [thumbLeft, setThumbLeft] = useState(0);
  const updateThumbWidth = () => setThumbWidth(calculateThumbWidth(wrapperRef.current));
  const updateThumbLeft = () => setThumbLeft(calculateThumbLeft(wrapperRef.current));
  const updateAll = () => {
    updateThumbLeft();
    updateThumbWidth();
  };

  const resizeObserver = new ResizeObserver(updateAll);
  useSubscription(contentWidthPublisher, updateAll);

  useEffect(() => {
    wrapperRef.current.addEventListener('scroll', updateThumbLeft);
    resizeObserver.observe(wrapperRef.current);
    return () => {
      wrapperRef.current?.removeEventListener('scroll', updateThumbLeft);
      resizeObserver.disconnect()
    }
  }, []);

  return (
    <div className="custom-scrollbar">
      <div className="track"
        onMouseDown={event => handleTrackMousedown(event, wrapperRef.current, thumbWidth)}
        onTouchStart={event => handleTrackTouchStart(event, wrapperRef.current, thumbWidth, callbacks.onGrab)}
      />
      <div className="thumb"
        style={{width:thumbWidth + 'px', left: thumbLeft + 'px'}}
        onMouseDown={event => handleThumbMouseDown(event, wrapperRef.current, thumbWidth)}
        onTouchStart={event => handleThumbTouchStart(event, wrapperRef.current, thumbWidth, callbacks.onGrab)}
      />
    </div>
  );
}


function calculateThumbWidth(wrapper:HTMLElement): number {
  if (!wrapper || !wrapper.scrollWidth)
    return 0;

  // offsetWidth includes borders, clientWidth does not. Not important in this case anyway.
  const ratio = wrapper.offsetWidth / wrapper.scrollWidth; // Not accounting for track-meta but maybe that's fine?
  const scrollbar = wrapper.getElementsByClassName('custom-scrollbar')[0]; // Let's pass this directly if possible
  return ratio * scrollbar.clientWidth;
}


function calculateThumbLeft(wrapper:HTMLElement): number {
  if (!wrapper || !wrapper.scrollWidth)
    return 0;

  const scrollLeft = wrapper.scrollLeft;
  const scrollbarWidth = wrapper.getElementsByClassName('custom-scrollbar')[0].clientWidth;

  return (scrollLeft * scrollbarWidth) / wrapper.scrollWidth;
}


function handleThumbTouchStart(event:React.TouchEvent, wrapper:HTMLElement, thumbWidth:number, onGrab:() => void) {
  event.stopPropagation();
  if (event.touches.length > 1)
    return;
  ScrollHandler(wrapper, thumbWidth, true).startThumbDrag(event.touches[0].clientX);
  if (onGrab)
    onGrab();
}


function handleThumbMouseDown(event:React.MouseEvent, wrapper:HTMLElement, thumbWidth:number) {
  ScrollHandler(wrapper, thumbWidth, false).startThumbDrag(event.clientX);
}


function handleTrackMousedown(event:React.MouseEvent, wrapper:HTMLElement, thumbWidth:number) {
  const startX = event.nativeEvent.offsetX;
  const scrollHandler = ScrollHandler(wrapper, thumbWidth, false);
  scrollHandler.scrollFromTrackClick(startX);
  scrollHandler.startThumbDrag(startX);
}


function handleTrackTouchStart(event:React.TouchEvent, wrapper:HTMLElement, thumbWidth:number, onGrab:() => void) {
  event.stopPropagation();
  if (event.touches.length > 1)
    return;
  const startX = event.touches[0].clientX;
  const scrollHandler = ScrollHandler(wrapper, thumbWidth, true);
  scrollHandler.scrollFromTrackClick(startX);
  scrollHandler.startThumbDrag(startX);

  if (onGrab)
    onGrab();
}


type ScrollHandler = {
  startThumbDrag: (startX:number) => void
  scrollFromTrackClick: (startX:number) => void
}


function ScrollHandler(wrapper:HTMLElement, thumbWidth:number, touch:boolean) : ScrollHandler {
  if (!wrapper?.scrollWidth)
    return fakeScrollHandler;

  const scrollbar = wrapper.getElementsByClassName('custom-scrollbar')[0];
  const scrollbarWidth = scrollbar.clientWidth;
  if (!scrollbarWidth)
    return fakeScrollHandler;

  const scroll = (distance:number) => {
    wrapper.scrollLeft += distance;
    wrapper.dispatchEvent(new Event('scroll'));
  };

  return {
    startThumbDrag(startX:number): void {
      const scrollableDistance = wrapper.scrollWidth - wrapper.clientWidth;
      const scrollbarScrollableDistance = scrollbarWidth - thumbWidth;

      const getX = touch ?
        (moveEvent:TouchEvent) => moveEvent.touches[0].clientX :
        (moveEvent:MouseEvent) => moveEvent.clientX;
      const moveEventName = touch ? 'touchmove' : 'mousemove';
      const endEventName = touch ? 'touchend' : 'mouseup';

      function touchmove(moveEvent:(TouchEvent & MouseEvent)) {
        const newX = getX(moveEvent);
        const moveRatio = (newX - startX) / scrollbarScrollableDistance;
        scroll(moveRatio * scrollableDistance);
        startX = newX;
      }

      const removeListeners = () => {
        window.removeEventListener(moveEventName, touchmove);
        window.removeEventListener(endEventName, removeListeners);
        window.removeEventListener('blur', removeListeners);
      }

      window.addEventListener(moveEventName, touchmove);
      window.addEventListener(endEventName, removeListeners);
      window.addEventListener('blur', removeListeners);
    },
    scrollFromTrackClick(startX:number) {
      const tapRatio = startX / scrollbarWidth;
      const wrapperWidth = wrapper.clientWidth;
      scroll((wrapper.scrollWidth * tapRatio) - (wrapperWidth / 2) - wrapper.scrollLeft);
    }
  };
}


const fakeScrollHandler:ScrollHandler = {
  startThumbDrag: () => {},
  scrollFromTrackClick: () => {}
};
