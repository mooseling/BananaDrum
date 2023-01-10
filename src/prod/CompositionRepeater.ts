import {TrackClipboard} from './TrackClipboard';

export function CompositionRepeater(arrangement:Banana.Arrangement) {
  let lastLength:number;
  let lastNoteCount:number;

  setCachedValues();
  arrangement.timeParams.subscribe(handleLengthChange);



  function handleLengthChange() {
    if (arrangement.timeParams.length >lastLength)
      Object.values(arrangement.tracks).forEach(repeatNotesInTrack);
    setCachedValues();
  }


  function repeatNotesInTrack(track:Banana.Track) {
    const firstTiming = track.notes[0].timing;
    const lastTiming = track.notes[lastNoteCount - 1].timing;

    const clipboard = new TrackClipboard(track);
    clipboard.copy({start:firstTiming, end:lastTiming});
    let numNotesCovered = clipboard.length;

    while (numNotesCovered < track.notes.length) {
      const pasteStart = track.notes[numNotesCovered].timing;
      clipboard.paste({start:pasteStart});
      numNotesCovered += clipboard.length;
    }
  }


  function setCachedValues() {
    lastLength = arrangement.timeParams.length;
    lastNoteCount = Object.values(arrangement.tracks)[0].notes.length;
  }
}
