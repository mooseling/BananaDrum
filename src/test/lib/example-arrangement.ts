export const exampleArrangement:Arrangement = {
  timeSignature:'4/4',
  tempo:120,
  length:2, // bars
  tracks:[
    // snare
    {notes:[
      {instrumentId:'snare', styleId:'accent', timing:'1.2'},
      {instrumentId:'snare', styleId:'accent', timing:'1.4'},
      {instrumentId:'snare', styleId:'accent', timing:'2.2'},
      {instrumentId:'snare', styleId:'accent', timing:'2.2.2T'},
      {instrumentId:'snare', styleId:'accent', timing:'2.2.3TT'},
      {instrumentId:'snare', styleId:'accent', timing:'2.4'},
      {instrumentId:'snare', styleId:'accent', timing:'2.4.2T'},
      {instrumentId:'snare', styleId:'accent', timing:'2.4.3TT'}
    ]},

    // hihat
    {notes:[
      {instrumentId:'hihat', styleId:'closed', timing:'1'},
      {instrumentId:'hihat', styleId:'closed', timing:'1.1.3'},
      {instrumentId:'hihat', styleId:'closed', timing:'1.2'},
      {instrumentId:'hihat', styleId:'closed', timing:'1.2.3'},
      {instrumentId:'hihat', styleId:'closed', timing:'1.3'},
      {instrumentId:'hihat', styleId:'closed', timing:'1.3.3'},
      {instrumentId:'hihat', styleId:'closed', timing:'1.4'},
      {instrumentId:'hihat', styleId:'closed', timing:'1.4.3'}
    ]},

    // kick
    {notes:[
      {instrumentId:'kick', styleId:'kick', timing:'1'},
      {instrumentId:'kick', styleId:'kick', timing:'1.3'},
      {instrumentId:'kick', styleId:'kick', timing:'2'},
      {instrumentId:'kick', styleId:'kick', timing:'2.1.2T'},
      {instrumentId:'kick', styleId:'kick', timing:'2.1.3TT'},
      {instrumentId:'kick', styleId:'kick', timing:'2.3'},
      {instrumentId:'kick', styleId:'kick', timing:'2.3.2T'},
      {instrumentId:'kick', styleId:'kick', timing:'2.3.3TT'}
    ]}
  ]
};
