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
      instrumentId: '2', // hi hat
      packedNotes: [{noteStyleId:'1', timing:'1:1'},{noteStyleId:'1', timing:'1:3'},{noteStyleId:'1', timing:'1:5'},{noteStyleId:'1', timing:'1:7'},{noteStyleId:'1', timing:'1:9'},{noteStyleId:'1', timing:'1:11'},{noteStyleId:'1', timing:'1:13'},{noteStyleId:'1', timing:'1:15'},{noteStyleId:'1', timing:'2:1'},{noteStyleId:'1', timing:'2:3'},{noteStyleId:'1', timing:'2:5'},{noteStyleId:'1', timing:'2:7'},{noteStyleId:'1', timing:'2:9'},{noteStyleId:'1', timing:'2:11'},{noteStyleId:'1', timing:'2:13'},{noteStyleId:'1', timing:'2:15'}]
    },
    {
      instrumentId: '3', // snare
      packedNotes: [{noteStyleId:'1', timing:'1:5'},{noteStyleId:'2', timing:'1:10'},{noteStyleId:'1', timing:'1:15'},{noteStyleId:'2', timing:'2:2'},{noteStyleId:'3', timing:'2:5'},{noteStyleId:'1', timing:'2:13'}],
    },
    {
      instrumentId: '4', // kick
      packedNotes: [{noteStyleId:'1', timing:'1:1'},{noteStyleId:'2', timing:'1:8'},{noteStyleId:'1', timing:'1:9'},{noteStyleId:'1', timing:'1:11'},{noteStyleId:'1', timing:'2:3'},{noteStyleId:'1', timing:'2:8'},{noteStyleId:'1', timing:'2:11'},{noteStyleId:'2', timing:'2:16'}]
    }
  ]
};
