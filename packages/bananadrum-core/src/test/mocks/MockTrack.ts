import { Track } from "../../prod/types.js";

export function MockTrack(): Track {
  return {
    id: '0',
    arrangement: null,
    instrument: null,
    notes: [],
    polyrhythms: [],
    getNoteAt: timing => null,
    colour: 'blue',
    clear: () => {},
    subscribe: () => {},
    unsubscribe: () => {}
  };
}
