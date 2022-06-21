export function Publisher(): Banana.Publisher {
  const subscriptions: Banana.Subscription[] = [];

  return {
    subscribe: function(callback: Banana.Subscription) {
      subscriptions.push(callback);
    },
    unsubscribe: function(callbackToRemove: Banana.Subscription) {
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
