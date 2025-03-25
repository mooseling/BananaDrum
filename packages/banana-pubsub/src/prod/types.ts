export type Subscription<T> = (value?:T) => void


export interface Subscribable<T> {
  subscribe(callback:Subscription<T>): void
  unsubscribe(callback:Subscription<T>): void
  unsubscribeAll(): void
}


export interface Publisher<T> extends Subscribable<T> {
  publish(value:T): void
}


export interface TopicSubscribable {
  topics: {
    [topicName:string]: Subscribable<unknown>
  }
}


export interface TopicPublisher extends TopicSubscribable {
  topics: {
    [topicName:string]: Publisher<unknown>
  }
  unsubscribeAll(): void
}