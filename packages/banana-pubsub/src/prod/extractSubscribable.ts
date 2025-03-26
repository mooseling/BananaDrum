import { Publisher, Subscribable } from './types';


export function extractSubscribable<T>(publisher:Publisher<T>): Subscribable<T> {
  return {
    subscribe: publisher.subscribe,
    unsubscribe: publisher.unsubscribe
  }
}