const log = {};

export function set(key:string, value:any) {
  log[key] = value;
  return value;
}

export function get(key:string) {
  return log[key];
}
