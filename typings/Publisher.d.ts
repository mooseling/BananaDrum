declare namespace Banana {
  type Subscription = (...args:any[]) => void

  interface Subscribable {
    subscribe(callback:Subscription): void
    unsubscribe(callback:Subscription): void
  }

  interface Publisher extends Subscribable {
    publish(): void
  }
}
