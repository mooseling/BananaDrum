export const exampleArrangement:PackedArrangement = {
  timeSignature: '4/4',
  tempo: 120,
  length: 1, // bars
  packedTracks: [
    // snare
    {
      instrumentId: 'snare',
      packedNotes: [{noteStyleId:'accent', timing:'1.2'},{noteStyleId:'accent', timing:'1.4'}]},

    // hihat
    {
      instrumentId: 'hihat',
      packedNotes: [{noteStyleId:'closed', timing:'1'},{noteStyleId:'closed', timing:'1.1.3'},{noteStyleId:'closed', timing:'1.2'},{noteStyleId:'closed', timing:'1.2.3'},{noteStyleId:'closed', timing:'1.3'},{noteStyleId:'closed', timing:'1.3.3'},{noteStyleId:'closed', timing:'1.4'},{noteStyleId:'closed', timing:'1.4.3'}]},

    // kick
    {
      instrumentId: 'kick',
      packedNotes: [{noteStyleId:'kick', timing:'1'},{noteStyleId:'kick', timing:'1.3'}]}
  ]
};
