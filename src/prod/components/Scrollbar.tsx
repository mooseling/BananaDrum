import {useState, useEffect} from 'react';

export function Scrollbar({wrapperRef, widthPublisher, scrollPublisher}:
  {wrapperRef:React.MutableRefObject<HTMLDivElement>,
    widthPublisher:Banana.Publisher,
    scrollPublisher:Banana.Publisher,
  }): JSX.Element {
  const [thumbWidth, setThumbWidth] = useState(0);
  const [thumbLeft, setThumbLeft] = useState(0);
  const updateThumbWidth = () => setThumbWidth(calculateThumbWidth(wrapperRef.current));
  const updateThumbLeft = () => setThumbLeft(calculateThumbLeft(wrapperRef.current));

  useEffect(() => {
    widthPublisher.subscribe(updateThumbWidth);
    return () => widthPublisher.unsubscribe(updateThumbWidth);
  }, []);

  useEffect(() => {
    scrollPublisher.subscribe(updateThumbLeft);
    return () => scrollPublisher.unsubscribe(updateThumbLeft);
  }, []);

  const thumbMoveCallback = (distance:number) => {
    const scrollbar = wrapperRef.current?.getElementsByClassName('custom-scrollbar')[0];
    if (scrollbar) {
      const noteLine = wrapperRef.current.getElementsByClassName('note-line')[0];
      if (noteLine) {
        const moveRatio = distance / (scrollbar.clientWidth - thumbWidth);
        const scrollableWidth = noteLine.clientWidth + 113;
        const scrollableDistance = scrollableWidth - wrapperRef.current.clientWidth;
        wrapperRef.current.scrollLeft += moveRatio * scrollableDistance;
        updateThumbLeft();
      }
    }
  }

  const trackMousedownCallback = (x:number) => {
    const scrollbar = wrapperRef.current?.getElementsByClassName('custom-scrollbar')[0];
    if (scrollbar) {
      const noteLine = wrapperRef.current.getElementsByClassName('note-line')[0];
      if (noteLine) {
        const scrollableWidth = noteLine.clientWidth + 113;
        const tapRatio = x / scrollbar.clientWidth;
        const wrapperWidth = wrapperRef.current.clientWidth;
        wrapperRef.current.scrollLeft = (scrollableWidth * tapRatio) - (wrapperWidth / 2);
        updateThumbLeft();
      }
    }
  }

  return (
    <div className="custom-scrollbar">
      <div className="track"
        onMouseDown={event => handleTrackMousedown(event, trackMousedownCallback)}
      />
      <div className="thumb"
        style={{width:thumbWidth + 'px', left: thumbLeft + 'px'}}
        onMouseDown={event => handleThumbMouseDown(event, thumbMoveCallback)}
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


function handleThumbMouseDown(event: React.MouseEvent, moveCallback:(distance:number) => void) {
  let lastX = event.clientX;
  function mouseMove(moveEvent: MouseEvent) {
    const newX = moveEvent.clientX;
    moveCallback(newX - lastX);
    lastX = newX;
  }

  window.addEventListener('mousemove', mouseMove);
  window.addEventListener('mouseup', () => {
    window.removeEventListener('mousemove',mouseMove)
  })
}


function handleTrackMousedown(event: React.MouseEvent, mousedownCallback:(x:number) => void) {
  const x = event.nativeEvent.offsetX;
  mousedownCallback(x);
}
