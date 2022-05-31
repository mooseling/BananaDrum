import {useState, useEffect} from 'react';

export function Scrollbar({wrapperRef, contentWidthPublisher}:
  {wrapperRef:React.MutableRefObject<HTMLDivElement>, contentWidthPublisher:Banana.Publisher}
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

  useEffect(() => {
    wrapperRef.current.addEventListener('scroll', updateThumbLeft);
    resizeObserver.observe(wrapperRef.current);
    contentWidthPublisher.subscribe(updateAll);
    return () => {
      wrapperRef.current.removeEventListener('scroll', updateThumbLeft);
      resizeObserver.unobserve(wrapperRef.current);
      contentWidthPublisher.unsubscribe(updateAll);
    }
  }, []);

  return (
    <div className="custom-scrollbar">
      <div className="track"
        onMouseDown={event => handleTrackMousedown(event, wrapperRef.current, thumbWidth)}
        onTouchStart={event => handleTrackTouchStart(event, wrapperRef.current, thumbWidth)}
      />
      <div className="thumb"
        style={{width:thumbWidth + 'px', left: thumbLeft + 'px'}}
        onMouseDown={event => handleThumbMouseDown(event, wrapperRef.current, thumbWidth)}
        onTouchStart={event => handleThumbTouchStart(event, wrapperRef.current, thumbWidth)}
      />
    </div>
  );
}


function calculateThumbWidth(wrapper:HTMLElement): number {
  const scrollableWidth =
    wrapper.getElementsByClassName('note-line-wrapper')[0].clientWidth
    + 113; // hard-coded note-meta width for performance
  const ratio = wrapper.offsetWidth / scrollableWidth;
  const scrollbar = wrapper.getElementsByClassName('custom-scrollbar')[0];
  return ratio * scrollbar.clientWidth;
}


function calculateThumbLeft(wrapper:HTMLElement): number {
  const scrollLeft = wrapper.scrollLeft;
  const scrollbarWidth = wrapper.getElementsByClassName('custom-scrollbar')[0].clientWidth;
  const scrollableWidth =
    wrapper.getElementsByClassName('note-line-wrapper')[0].clientWidth
    + 113; // hard-coded note-meta width for performance
  return (scrollLeft * scrollbarWidth) / scrollableWidth;
}

function handleThumbTouchStart(event:React.TouchEvent, wrapper:HTMLElement, thumbWidth:number) {
  event.stopPropagation();
  if (event.touches.length > 1)
    return;
  ScrollHandler(wrapper, thumbWidth, true).startThumbDrag(event.touches[0].clientX);
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


function handleTrackTouchStart(event:React.TouchEvent, wrapper:HTMLElement, thumbWidth:number) {
  event.stopPropagation();
  if (event.touches.length > 1)
    return;
  const startX = event.touches[0].clientX;
  const scrollHandler = ScrollHandler(wrapper, thumbWidth, true);
  scrollHandler.scrollFromTrackClick(startX);
  scrollHandler.startThumbDrag(startX);
}

type ScrollHandler = {
  startThumbDrag: (startX:number) => void
  scrollFromTrackClick: (startX:number) => void
}

function ScrollHandler(wrapper:HTMLElement, thumbWidth:number, touch:boolean) : ScrollHandler {
  if (!wrapper)
    return fakeScrollHandler;
  const scrollbar = wrapper.getElementsByClassName('custom-scrollbar')[0];
  const noteLine = scrollbar && wrapper.getElementsByClassName('note-line')[0];
  if (!noteLine)
    return fakeScrollHandler;
  const scrollbarWidth = scrollbar.clientWidth;
  const noteLineWidth = noteLine.clientWidth;
  if (!scrollbarWidth || !noteLineWidth)
    return fakeScrollHandler;

  const scrollableWidth = noteLineWidth + 113;

  const scroll = (distance:number) => {
    wrapper.scrollLeft += distance;
    wrapper.dispatchEvent(new Event('scroll'));
  };

  return {
    startThumbDrag(startX:number): void {
      const scrollableDistance = scrollableWidth - wrapper.clientWidth;
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
      scroll((scrollableWidth * tapRatio) - (wrapperWidth / 2) - wrapper.scrollLeft);
    }
  };
}

const fakeScrollHandler:ScrollHandler = {
  startThumbDrag: (startX:number) => {},
  scrollFromTrackClick: (startX:number) => {}
};
