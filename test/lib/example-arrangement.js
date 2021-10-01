export const exampleArrangement = {
  timeSignature:'4/4',
  tempo:120,
  tracks:[
    // snare
    {notes:[{file:'sounds/snare.mp3', timing:'1.2'},{file:'sounds/snare.mp3', timing:'1.4'}]},

    // hihat
    {notes:[{file:'sounds/hihat.mp3', timing:'1'},{file:'sounds/hihat.mp3', timing:'1.1.3'},{file:'sounds/hihat.mp3', timing:'1.2'},{file:'sounds/hihat.mp3', timing:'1.2.3'},{file:'sounds/hihat.mp3', timing:'1.3'},{file:'sounds/hihat.mp3', timing:'1.3.3'},{file:'sounds/hihat.mp3', timing:'1.4'},{file:'sounds/hihat.mp3', timing:'1.4.3'}]},

    // kick
    {notes:[{file: 'sounds/kick.mp3', timing:'1'},{file: 'sounds/kick.mp3', timing:'1.3'}]}
  ]
};
