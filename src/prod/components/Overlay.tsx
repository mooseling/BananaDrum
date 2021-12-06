export function Overlay({visible, children}:{visible:boolean, children:JSX.Element}): JSX.Element {
  const style = {display: visible ? 'block' : 'none'};
  return (
    <div style={style}>
      {children}
    </div>
  );
}
