import { Subscribable } from 'bananadrum-core';
import { useEffect } from 'react';

export function useSubscription(subscribable:Subscribable, callback:() => void, dependencyList:React.DependencyList = []) {
  useEffect(() => {
    subscribable.subscribe(callback);
    return () => subscribable.unsubscribe(callback);
  }, dependencyList);
}