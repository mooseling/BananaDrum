export function Overlay({visible, children}:{visible:boolean, children:JSX.Element}): JSX.Element {
  const style = {display: visible ? 'block' : 'none'};
  return (
    <div className="overlay" style={style}>
      {children}
    </div>
  );
}
