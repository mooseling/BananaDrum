export const instrumentCollection:InstrumentCollection = [
  {
    instrumentId: 'kick',
    displayName: 'Kick drum',
    packedNoteStyles: [
      {
        noteStyleId: 'kick',
        file: 'kick.mp3'
        // displayName, symbol
      }
    ]
  },
  {
    instrumentId: 'snare',
    displayName: 'Snare',
    packedNoteStyles: [
      {
        noteStyleId: 'accent',
        file: 'snare.mp3'
      },
      {
        noteStyleId: 'roll',
        file: 'roll.mp3'
      }
    ]
  },
  {
    instrumentId: 'hihat',
    displayName: 'Hi Hat',
    packedNoteStyles: [
      {
        noteStyleId: 'closed',
        file: 'hihat.mp3'
      }
    ]
  }
];
