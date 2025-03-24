import { TopicPublisher } from './types';


export function createTopicalPublisher(): TopicPublisher {
  return {
    topics: {},
    unsubscribeAll(): void {
      for (const topicName in this.topics)
        this.topics[topicName].unsubscribeAll();
    }
  }
}