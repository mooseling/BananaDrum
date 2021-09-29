export function promiseTimeout(callback, time) {
  return new Promise(resolve => setTimeout(() => {
    callback();
    resolve();
  }, time));
}
