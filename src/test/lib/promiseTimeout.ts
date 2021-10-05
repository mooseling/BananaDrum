export function promiseTimeout(callback:Function, time:number) {
  return new Promise<void>(resolve => setTimeout(() => {
    callback();
    resolve();
  }, time));
}
