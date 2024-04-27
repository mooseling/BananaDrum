import { createPublisher, Subscribable } from "bananadrum-core";

export interface ModeManager extends Subscribable {
  deletePolyrhythmMode: boolean
}


export function createModeManager(): ModeManager {
  let deletePolyrhythmMode = false;

  const publisher = createPublisher();

  return {
    get deletePolyrhythmMode() {
      return deletePolyrhythmMode;
    },
    set deletePolyrhythmMode(newValue:boolean) {
      if (newValue !== deletePolyrhythmMode) {
        deletePolyrhythmMode = newValue;
        publisher.publish();
      }
    },
    subscribe: publisher.subscribe,
    unsubscribe: publisher.unsubscribe
  };
}
