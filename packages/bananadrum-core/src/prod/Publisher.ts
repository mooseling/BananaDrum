import { Publisher, Subscription } from './types/types.js';

export function createPublisher(): Publisher {
  const subscriptions: Subscription[] = [];

  return {
    subscribe: function(callback: Subscription) {
      subscriptions.push(callback);
    },
    unsubscribe: function(callbackToRemove: Subscription) {
      subscriptions.some((subscription, index) => {
        if (callbackToRemove === subscription) {
          subscriptions[index] = null;
          return true;
        }
      });
    },
    publish: function() {
      subscriptions.forEach(callback => callback && callback());
    }
  }
}
