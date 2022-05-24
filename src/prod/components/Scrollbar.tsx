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
        onMouseDown={event => handleTrackMousedown(event, wrapperRef.current, updateThumbLeft)}
      />
      <div className="thumb"
        style={{width:thumbWidth + 'px', left: thumbLeft + 'px'}}
        onMouseDown={event => handleThumbMouseDown(event, wrapperRef.current, thumbWidth, updateThumbLeft)}
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


function handleThumbMouseDown(event: React.MouseEvent, wrapper:HTMLElement, thumbWidth:number, callback:()=>void) {
  const scrollbarWidth = wrapper?.getElementsByClassName('custom-scrollbar')[0]?.clientWidth;
  if (scrollbarWidth) {
    const noteLineWidth = wrapper.getElementsByClassName('note-line')[0]?.clientWidth;
    if (noteLineWidth) {
      const scrollableWidth = noteLineWidth + 113;
      const scrollableDistance = scrollableWidth - wrapper.clientWidth;
      const scrollbarScrollableDistance = scrollbarWidth - thumbWidth;
      let lastX = event.clientX;

      function mouseMove(moveEvent: MouseEvent) {
        const newX = moveEvent.clientX;
        const moveRatio = (newX - lastX) / scrollbarScrollableDistance;
        wrapper.scrollLeft += moveRatio * scrollableDistance;
        callback();
        lastX = newX;
      }

      const removeListeners = () => {
        window.removeEventListener('mousemove', mouseMove);
        window.removeEventListener('mouseup', removeListeners);
        window.removeEventListener('blur', removeListeners);
      }

      window.addEventListener('mousemove', mouseMove);
      window.addEventListener('mouseup', removeListeners);
      window.addEventListener('blur', removeListeners);
    }
  }
}


function handleTrackMousedown(event:React.MouseEvent, wrapper:HTMLElement, callback:()=>void) {
  const x = event.nativeEvent.offsetX;
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
