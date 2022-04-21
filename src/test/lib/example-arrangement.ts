export const exampleArrangement:Banana.PackedArrangement = {
  timeParams: {
    timeSignature: '4/4',
    tempo: 120,
    length: 2, // bars
    pulse: '1/4',
    stepResolution: 16
  },
  packedTracks: [
    {
      instrumentId: 'hihat',
      packedNotes: [{noteStyleId:'closed', timing:'1:1'},{noteStyleId:'closed', timing:'1:3'},{noteStyleId:'closed', timing:'1:5'},{noteStyleId:'closed', timing:'1:7'},{noteStyleId:'closed', timing:'1:9'},{noteStyleId:'closed', timing:'1:11'},{noteStyleId:'closed', timing:'1:13'},{noteStyleId:'closed', timing:'1:15'},{noteStyleId:'closed', timing:'2:1'},{noteStyleId:'closed', timing:'2:3'},{noteStyleId:'closed', timing:'2:5'},{noteStyleId:'closed', timing:'2:7'},{noteStyleId:'closed', timing:'2:9'},{noteStyleId:'closed', timing:'2:11'},{noteStyleId:'closed', timing:'2:13'},{noteStyleId:'closed', timing:'2:15'}]
    },
    {
      instrumentId: 'snare',
      packedNotes: [{noteStyleId:'accent', timing:'1:5'},{noteStyleId:'ghost', timing:'1:10'},{noteStyleId:'accent', timing:'1:15'},{noteStyleId:'ghost', timing:'2:2'},{noteStyleId:'rimshot', timing:'2:5'},{noteStyleId:'accent', timing:'2:13'}],
    },
    {
      instrumentId: 'kick',
      packedNotes: [{noteStyleId:'accent', timing:'1:1'},{noteStyleId:'ghost', timing:'1:8'},{noteStyleId:'accent', timing:'1:9'},{noteStyleId:'accent', timing:'1:11'},{noteStyleId:'accent', timing:'2:3'},{noteStyleId:'accent', timing:'2:8'},{noteStyleId:'accent', timing:'2:11'},{noteStyleId:'ghost', timing:'2:16'}]
    }
  ]
};
