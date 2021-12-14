export const exampleArrangement:Banana.PackedArrangement = {
  timeParams: {
    timeSignature: '4/4',
    tempo: 120,
    length: 1, // bars
  },
  packedTracks: [
    {
      instrumentId: 'hihat',
      packedNotes: [{noteStyleId:'closed', timing:'1.1.1'},{noteStyleId:'closed', timing:'1.1.3'},{noteStyleId:'closed', timing:'1.2.1'},{noteStyleId:'closed', timing:'1.2.3'},{noteStyleId:'closed', timing:'1.3.1'},{noteStyleId:'closed', timing:'1.3.3'},{noteStyleId:'closed', timing:'1.4.1'},{noteStyleId:'closed', timing:'1.4.3'}]
    },
    {
      instrumentId: 'snare',
      packedNotes: [{noteStyleId:'accent', timing:'1.2.1'},{noteStyleId:'accent', timing:'1.4.1'}]
    },
    {
      instrumentId: 'kick',
      packedNotes: [{noteStyleId:'accent', timing:'1.1.1'},{noteStyleId:'accent', timing:'1.3.1'}]
    }
  ]
};
