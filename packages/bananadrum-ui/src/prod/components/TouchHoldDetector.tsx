import { useCallback, useRef } from "react";
import { isMobile } from "../isMobile";

export function TouchHoldDetector(
  {callback, holdLength, children}:{callback:()=>void, holdLength:number, children:JSX.Element}
): JSX.Element {
  const timeoutIdRef = useRef<number>(null);
  const onTouchStart = useCallback(() => timeoutIdRef.current = setTimeout(callback, holdLength), []);
  const cancel = useCallback(() => clearTimeout(timeoutIdRef.current), []);

  return (
    <div
      className="hold-detector"
      onTouchStart={onTouchStart}
      onTouchMove={cancel}
      onTouchEnd={cancel}
      onContextMenu={preventDefault}
      style={{width:"100%", height:"100%"}} // This may not work well in some cases. The approach can be changed if not.
    >
      {children}
    </div>
  );
}


function preventDefault(event:React.MouseEvent) {
  if (isMobile)
    event.preventDefault();
}
