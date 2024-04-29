import { useEffect } from "react";



export function useKeyboardEvent(target:EventTarget, eventName:string, callback:(event:KeyboardEvent)=>void) {
  useEffect(() => {
    target.addEventListener(eventName, callback);
    return () => target.removeEventListener(eventName, callback);
  });
}
