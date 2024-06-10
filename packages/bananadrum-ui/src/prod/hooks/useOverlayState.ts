import { useContext } from "react";
import { OverlayStateContext } from "../components/Overlay";
import { useSubscription } from "./useSubscription";

interface OverlayCallbacks {
  onOpen?: () => void
  onClose?: () => void
}

export function useOverlayState({onOpen, onClose}:OverlayCallbacks) {
  const overlayState = useContext(OverlayStateContext);

  useSubscription(overlayState, () => {
    if (overlayState.visible)
      onOpen && onOpen();
    else
      onClose && onClose();
  }, [overlayState]); // In theory, if the overlayState object in context changes, we need to rejig the subscription
}
