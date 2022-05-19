export function Scrollbar({thumbWidth, thumbLeft}:{thumbWidth:number, thumbLeft:number}): JSX.Element {
  return (
    <div className="custom-scrollbar">
      <div className="track" />
      <div className="thumb" style={{width:thumbWidth + 'px', left: thumbLeft + 'px'}} />
    </div>
  );
}


export function calculateThumbWidth(wrapper:HTMLElement): number {
  const scrollableWidth =
    wrapper.getElementsByClassName('note-line-wrapper')[0].clientWidth
    + 113; // hard-coded note-meta width for performance
  const ratio = wrapper.offsetWidth / scrollableWidth;
  const scrollbar = wrapper.getElementsByClassName('custom-scrollbar')[0];
  return ratio * scrollbar.clientWidth;
}


export function calculateThumbLeft(wrapper:HTMLElement): number {
  const scrollLeft = wrapper.scrollLeft;
  const scrollbarWidth = wrapper.getElementsByClassName('custom-scrollbar')[0].clientWidth;
  const scrollableWidth =
    wrapper.getElementsByClassName('note-line-wrapper')[0].clientWidth
    + 113; // hard-coded note-meta width for performance
  return (scrollLeft * scrollbarWidth) / scrollableWidth;
}
