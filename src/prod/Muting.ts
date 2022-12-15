export function getMuteEvent(note:Banana.Note, realTime:Banana.RealTime): Banana.MuteEvent|undefined {
  const muteFilter:Banana.MuteFilter|void = getMuteFilter(note);
  if (!muteFilter)
    return;

  return {muteFilter, realTime};
}


function getMuteFilter(note:Banana.Note): Banana.MuteFilter|void {
  if (!note.noteStyle?.muting)
    return;

  switch (note.noteStyle.muting.name) {
    case 'sameTrack':
      return getSameTrackMuteFilter(note);
  }
}


function getSameTrackMuteFilter(note:Banana.Note): Banana.MuteFilter|undefined {
  const noteStyle = note.noteStyle;
  if (noteStyle === null)
    return;

  const track = note.track;

  return (audioEvent:Banana.AudioEvent) =>
    audioEvent.note.track === track
    && audioEvent.note !== note;
}
