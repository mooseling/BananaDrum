import { MutingRule, MutingRuleOtherInstrument, NoteView, RealTime } from 'bananadrum-core';
import { isSameTiming, exists } from 'bananadrum-core';
import { AudioEvent, MuteEvent, MuteFilter } from './types';


export function getMuteEvents(note:NoteView, realTime:RealTime): MuteEvent[] {
  const muteFilters:MuteFilter[] = getMuteFilters(note);

  return muteFilters.map(muteFilter => ({muteFilter, realTime}));
}


function getMuteFilters(note:NoteView): MuteFilter[] {
  const muting = note.noteStyle?.muting;
  if (!muting)
    return [];

  if (Array.isArray(muting))
    return muting.map(muting => getMuteFilter(note, muting)).filter(exists);
  return [getMuteFilter(note, muting)];
}


function getMuteFilter(note:NoteView, muting:MutingRule): MuteFilter|undefined {
  const ruleName = typeof muting === 'string' ? muting : muting.name;
  switch (ruleName) {
    case 'sameTrack':
      return getSameTrackMuteFilter(note);
    case 'otherInstrument':
      return getOtherInstrumentMuteFilter(note, muting as MutingRuleOtherInstrument);
  }
}


function getSameTrackMuteFilter(note:NoteView): MuteFilter|undefined {
  const noteStyle = note.noteStyle;
  if (noteStyle === null)
    return;

  const track = note.track;

  return (audioEvent:AudioEvent) =>
    audioEvent.note.track === track
    && audioEvent.note !== note;
}


function getOtherInstrumentMuteFilter(note:NoteView, muting:MutingRuleOtherInstrument)
    : MuteFilter|undefined {
  const noteStyle = note.noteStyle;
  if (noteStyle === null)
    return;

  const otherInstrumentId = muting.id;

  return (audioEvent:AudioEvent) =>
    audioEvent.note.track.instrument.id === otherInstrumentId
    && !isSameTiming(audioEvent.note.timing, note.timing); // Don't cross-mute when played together
}
