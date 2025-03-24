import { TopicPublisher } from './types';


export function createTopicPublisher(): TopicPublisher {
  return {
    topics: {},
    unsubscribeAll(): void {
      for (const topicName in this.topics)
        this.topics[topicName].unsubscribeAll();
    }
  }
}