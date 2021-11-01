declare interface Publisher {
  subscribe(callback:(...args:any[]) => void): void
}
