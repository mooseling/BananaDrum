import {useState, useEffect} from 'react';

export function Scrollbar({wrapperRef, widthPublisherRef, scrollPublisherRef}:
  {
    wrapperRef:React.MutableRefObject<HTMLDivElement>,
    widthPublisherRef:React.MutableRefObject<Banana.Publisher>,
    scrollPublisherRef:React.MutableRefObject<Banana.Publisher>
  }
): JSX.Element {
  const [thumbWidth, setThumbWidth] = useState(0);
  const [thumbLeft, setThumbLeft] = useState(0);
  const updateThumbWidth = () => setThumbWidth(calculateThumbWidth(wrapperRef.current));
  const updateThumbLeft = () => setThumbLeft(calculateThumbLeft(wrapperRef.current));


  useEffect(() => {
    widthPublisherRef.current.subscribe(updateThumbWidth);
    return () => widthPublisherRef.current.unsubscribe(updateThumbWidth);
  }, []);

  useEffect(() => {
    scrollPublisherRef.current.subscribe(updateThumbLeft);
    return () => scrollPublisherRef.current.unsubscribe(updateThumbLeft);
  }, []);

  return (
    <div className="custom-scrollbar">
      <div className="track"
        onMouseDown={event => handleTrackMousedown(event, wrapperRef.current, thumbWidth, updateThumbLeft)}
        onTouchStart={event => handleTrackTouchStart(event, wrapperRef.current, thumbWidth, updateThumbLeft)}
      />
      <div className="thumb"
        style={{width:thumbWidth + 'px', left: thumbLeft + 'px'}}
        onMouseDown={event => handleThumbMouseDown(event, wrapperRef.current, thumbWidth, updateThumbLeft)}
        onTouchStart={event => handleThumbTouchStart(event, wrapperRef.current, thumbWidth, updateThumbLeft)}
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

function handleThumbTouchStart(event:React.TouchEvent, wrapper:HTMLElement, thumbWidth:number, callback:()=>void) {
  event.stopPropagation();
  if (event.touches.length > 1)
    return;
  startThumbDrag(event.touches[0].clientX, wrapper, thumbWidth, callback, true);
}


function handleThumbMouseDown(event:React.MouseEvent, wrapper:HTMLElement, thumbWidth:number, callback:()=>void) {
  startThumbDrag(event.clientX, wrapper, thumbWidth, callback, false);
}


function handleTrackMousedown(event:React.MouseEvent, wrapper:HTMLElement, thumbWidth:number, callback:()=>void) {
  const x = event.nativeEvent.offsetX;
  scrollFromTrackClick(x, wrapper, callback);
  callback();
  startThumbDrag(x, wrapper, thumbWidth, callback, false);
}


function handleTrackTouchStart(event:React.TouchEvent, wrapper:HTMLElement, thumbWidth:number, callback:()=>void) {
  event.stopPropagation();
  if (event.touches.length > 1)
    return;
  const x = event.touches[0].clientX;
  scrollFromTrackClick(x, wrapper, callback);
  callback();
  startThumbDrag(x, wrapper, thumbWidth, callback, true);
}


function scrollFromTrackClick(x:number, wrapper:HTMLElement, callback:()=>void) {
  const scrollbar = wrapper?.getElementsByClassName('custom-scrollbar')[0];
  if (scrollbar) {
    const noteLine = wrapper.getElementsByClassName('note-line')[0];
    if (noteLine) {
      const scrollableWidth = noteLine.clientWidth + 113;
      const tapRatio = x / scrollbar.clientWidth;
      const wrapperWidth = wrapper.clientWidth;
      wrapper.scrollLeft = (scrollableWidth * tapRatio) - (wrapperWidth / 2);
      callback();
    }
  }
}


function startThumbDrag(startX:number, wrapper:HTMLElement, thumbWidth:number, callback:()=>void, touch:boolean) {
  const scrollbarWidth = wrapper?.getElementsByClassName('custom-scrollbar')[0]?.clientWidth;
  if (scrollbarWidth) {
    const noteLineWidth = wrapper.getElementsByClassName('note-line')[0]?.clientWidth;
    if (noteLineWidth) {
      const scrollableWidth = noteLineWidth + 113;
      const scrollableDistance = scrollableWidth - wrapper.clientWidth;
      const scrollbarScrollableDistance = scrollbarWidth - thumbWidth;
      let lastX = startX;

      const getX = touch ?
        (moveEvent:TouchEvent) => moveEvent.touches[0].clientX :
        (moveEvent:MouseEvent) => moveEvent.clientX;

      function touchmove(moveEvent) {
        const newX = getX(moveEvent);
        const moveRatio = (newX - lastX) / scrollbarScrollableDistance;
        wrapper.scrollLeft += moveRatio * scrollableDistance;
        callback();
        lastX = newX;
      }

      const removeListeners = () => {
        window.removeEventListener(touch ? 'touchmove' : 'mousemove', touchmove);
        window.removeEventListener(touch ? 'touchend' : 'mouseup', removeListeners);
        window.removeEventListener('blur', removeListeners);
      }

      window.addEventListener(touch ? 'touchmove' : 'mousemove', touchmove);
      window.addEventListener(touch ? 'touchend' : 'mouseup', removeListeners);
      window.addEventListener('blur', removeListeners);
    }
  }
}
