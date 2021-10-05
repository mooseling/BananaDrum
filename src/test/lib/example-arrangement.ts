export const exampleArrangement:Arrangement = {
  timeSignature:'4/4',
  tempo:120,
  tracks:[
    // snare
    {notes:[{instrumentId:'snare', styleId:'accent', timing:'1.2'},{instrumentId:'snare', styleId:'accent', timing:'1.4'}]},

    // hihat
    {notes:[{instrumentId:'hihat', styleId:'closed', timing:'1'},{instrumentId:'hihat', styleId:'closed', timing:'1.1.3'},{instrumentId:'hihat', styleId:'closed', timing:'1.2'},{instrumentId:'hihat', styleId:'closed', timing:'1.2.3'},{instrumentId:'hihat', styleId:'closed', timing:'1.3'},{instrumentId:'hihat', styleId:'closed', timing:'1.3.3'},{instrumentId:'hihat', styleId:'closed', timing:'1.4'},{instrumentId:'hihat', styleId:'closed', timing:'1.4.3'}]},

    // kick
    {notes:[{instrumentId:'kick', styleId:'kick', timing:'1'},{instrumentId:'kick', styleId:'kick', timing:'1.3'}]}
  ]
};
