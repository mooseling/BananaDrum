export function MockTrack(): Banana.Track {
  return {
    id: '0',
    arrangement: null,
    instrument: null,
    notes: [],
    getNoteAt: timing => null,
    colour: 'blue',
    clear: () => {},
    subscribe: () => {},
    unsubscribe: () => {}
  };
}
