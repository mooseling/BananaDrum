import { TopicManager } from './types';


export function createTopicManager(): TopicManager {
  return {
    topics: {},
    unsubscribeAll(): void {
      for (const topicName in this.topics)
        this.topics[topicName].unsubscribeAll();
    }
  }
}