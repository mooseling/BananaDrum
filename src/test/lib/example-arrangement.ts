export const exampleArrangement:Banana.PackedArrangement = {
  timeParams: {
    timeSignature: '4/4',
    tempo: 120,
    length: 2, // bars
  },
  packedTracks: [
    {
      instrumentId: 'hihat',
      packedNotes: [{noteStyleId:'closed', timing:'1.1.1'},{noteStyleId:'closed', timing:'1.1.3'},{noteStyleId:'closed', timing:'1.2.1'},{noteStyleId:'closed', timing:'1.2.3'},{noteStyleId:'closed', timing:'1.3.1'},{noteStyleId:'closed', timing:'1.3.3'},{noteStyleId:'closed', timing:'1.4.1'},{noteStyleId:'closed', timing:'1.4.3'},{noteStyleId:'closed', timing:'2.1.1'},{noteStyleId:'closed', timing:'2.1.3'},{noteStyleId:'closed', timing:'2.2.1'},{noteStyleId:'closed', timing:'2.2.3'},{noteStyleId:'closed', timing:'2.3.1'},{noteStyleId:'closed', timing:'2.3.3'},{noteStyleId:'closed', timing:'2.4.1'},{noteStyleId:'closed', timing:'2.4.3'}]
    },
    {
      instrumentId: 'snare',
      packedNotes: [{noteStyleId:'accent', timing:'1.2.1'},{noteStyleId:'ghost', timing:'1.3.2'},{noteStyleId:'accent', timing:'1.4.3'},{noteStyleId:'ghost', timing:'2.1.2'},{noteStyleId:'rimshot', timing:'2.2.1'},{noteStyleId:'accent', timing:'2.4.1'}],
    },
    {
      instrumentId: 'kick',
      packedNotes: [{noteStyleId:'accent', timing:'1.1.1'},{noteStyleId:'ghost', timing:'1.2.4'},{noteStyleId:'accent', timing:'1.3.1'},{noteStyleId:'accent', timing:'1.3.3'},{noteStyleId:'accent', timing:'2.1.3'},{noteStyleId:'accent', timing:'2.2.4'},{noteStyleId:'accent', timing:'2.3.3'},{noteStyleId:'ghost', timing:'2.4.4'}]
    }
  ]
};
