export type Subscription<T> = (value?:T) => void


export interface Subscribable<T> {
  subscribe(callback:Subscription<T>): void
  unsubscribe(callback:Subscription<T>): void
  unsubscribeAll(): void
}


export interface Publisher<T> extends Subscribable<T> {
  publish(value:T): void
}


export interface TopicManager {
  topics: {
    [topicName:string]: Publisher<unknown>
  }
  unsubscribeAll(): void
}