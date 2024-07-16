import { Subscribable } from "bananadrum-core";
import { useState } from "react";
import { useSubscription } from "./useSubscription";

export function useStateSubscription<T extends Subscribable, Y>(subscribable: T, extractState:(subscribable:T)=>Y) {
  const [state, setState] = useState(extractState(subscribable));
  useSubscription(subscribable, () => setState(extractState(subscribable)));

  return state;
}
