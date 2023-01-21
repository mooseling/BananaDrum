import { Note } from "../../prod/types";

export function MockNote(): Note {
  return {
    id: '0',
    timing: null,
    track: null,
    noteStyle: null,
    subscribe() {},
    unsubscribe() {}
  };
}
