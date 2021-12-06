declare namespace Banana {
  type Subscription = (...args:any[]) => void

  interface Publisher {
    subscribe(callback:Subscription): void
  }
}
