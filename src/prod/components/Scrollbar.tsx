export function Scrollbar({thumbWidth}:{thumbWidth:number}): JSX.Element {
  return (
    <div className="custom-scrollbar">
      <div className="track" />
      <div className="thumb" style={{width:thumbWidth + 'px'}} />
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
