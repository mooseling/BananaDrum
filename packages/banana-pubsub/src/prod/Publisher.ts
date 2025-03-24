import { Publisher, Subscription } from './types.js';


export function createPublisher<T>(): Publisher<T> {
  const subscriptions: Subscription<T>[] = [];

  return {
    subscribe(callback: Subscription<T>) {
      subscriptions.push(callback);
    },
    unsubscribe(callbackToRemove: Subscription<T>) {
      subscriptions.some((subscription, index) => {
        if (callbackToRemove === subscription) {
          subscriptions[index] = null;
          return true;
        }
      });
    },
    unsubscribeAll() {
      subscriptions.splice(0);
    },
    publish(value: T) {
      subscriptions.forEach(callback => callback && callback(value));
    }
  }
}
