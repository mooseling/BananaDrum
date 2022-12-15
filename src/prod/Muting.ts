import {exists} from './utils';


export function getMuteEvents(note:Banana.Note, realTime:Banana.RealTime): Banana.MuteEvent[] {
  const muteFilters:Banana.MuteFilter[] = getMuteFilters(note);

  return muteFilters.map(muteFilter => ({muteFilter, realTime}));
}


function getMuteFilters(note:Banana.Note): Banana.MuteFilter[] {
  const muting = note.noteStyle?.muting;
  if (!muting)
    return [];

  if (Array.isArray(muting))
    return muting.map(muting => getMuteFilter(note, muting)).filter(exists);
  return [getMuteFilter(note, muting)];
}


function getMuteFilter(note:Banana.Note, muting:Banana.MutingRule): Banana.MuteFilter|undefined {
  switch (muting.name) {
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
