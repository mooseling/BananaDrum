import { useEffect } from "react";



export function useMouseEvent(target:EventTarget, eventName:string, callback:(event:MouseEvent)=>void) {
  useEffect(() => {
    target.addEventListener(eventName, callback);
    return () => target.removeEventListener(eventName, callback);
  });
}
