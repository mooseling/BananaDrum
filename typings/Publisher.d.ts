declare namespace Banana {
  interface Publisher {
    subscribe(callback:(...args:any[]) => void): void
  }
}
