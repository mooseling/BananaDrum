import { RealTime, Note, TimeCoordinator, TrackPlayer, Track, SoloMute, Interval, Event } from 'bananadrum-core';
import {createPublisher} from 'bananadrum-core';
import {getMuteEvents} from './Muting.js';

type NoteWithTime = {realTime:RealTime, note:Note};

export function createTrackPlayer(track:Track, timeCoordinator:TimeCoordinator): TrackPlayer {
  const publisher = createPublisher();
  let notesWithTime:NoteWithTime[] = [];

  if (track.instrument.loaded) {
    fillInRealTimeNotes();
  } else {
    const setupNotes = () => {
      fillInRealTimeNotes();
      track.instrument.unsubscribe(setupNotes);
    }
    track.instrument.subscribe(setupNotes);
  }

  let lastNoteCount = track.notes.length;
  track.subscribe(handleNoteCountChange);
  let lastLength = track.arrangement.timeParams.length;
  timeCoordinator.subscribe(handleTimeChange);
  track.arrangement.subscribe(destroySelfIfNeeded);
  let soloMute:SoloMute = null;

  return {
    track, getEvents,
    subscribe:publisher.subscribe, unsubscribe:publisher.unsubscribe,
    get soloMute() {return soloMute;},
    set soloMute(newSoloMute:SoloMute) {
      if (newSoloMute !== soloMute) {
        soloMute = newSoloMute;
        publisher.publish();
      }
    }
  };






  // ==================================================================
  //                          Public Functions
  // ==================================================================



  function getEvents({start, end}:Interval): Event[] {
    if (!track.instrument.loaded)
      return [];

    const notesInInterval = notesWithTime.filter(({realTime}) => realTime >= start && realTime < end);

    // Can't do this all in one go because TypeScript won't allow the concat
    const events:Event[] = notesInInterval
      .filter(({note}) => note.noteStyle) // Filter out rests (which have noteStyle: null)
      .map(({realTime, note}) => ({realTime, note, audioBuffer:note.noteStyle.audioBuffer}));
    notesInInterval.forEach(({realTime, note}) => events.push(...getMuteEvents(note, realTime)));

    return events;
  }






  // ==================================================================
  //                          Private Functions
  // ==================================================================



  function createRealTimeNote(note:Note): NoteWithTime {
    return {
      realTime: timeCoordinator.convertToRealTime(note.timing),
      note
    };
  }


  function fillInRealTimeNotes() {
    const unmatchedNotes = track.notes.filter(note => !notesWithTime.some(noteWithTime => noteWithTime.note === note));
    notesWithTime.push(...unmatchedNotes.map(createRealTimeNote));
  }


  function removeExtraRealTimeNotes() {
    notesWithTime = notesWithTime.filter(({note}) => track.notes.includes(note))
  }


  function handleNoteCountChange() {
    const newNoteCount = track.notes.length;
    if (newNoteCount > lastNoteCount)
      fillInRealTimeNotes();
    else if (newNoteCount < lastNoteCount)
      removeExtraRealTimeNotes();
    lastNoteCount = newNoteCount;
  }


  function handleTimeChange() {
    // Unnecessary to recalc note times when the length changes
    if (track.arrangement.timeParams.length !== lastLength) {
      lastLength = track.arrangement.timeParams.length;
      return;
    }

    notesWithTime.forEach(noteWithTime => noteWithTime.realTime = timeCoordinator.convertToRealTime(noteWithTime.note.timing));
  }


  function destroySelfIfNeeded() {
    // Check track still exists
    for (const trackId in track.arrangement.tracks) {
      if (track.arrangement.tracks[trackId] === track)
        return;
    }
    // ... otherwise unsubscribe from everything
    timeCoordinator.unsubscribe(handleTimeChange);
    track.arrangement.unsubscribe(destroySelfIfNeeded);
  }
}
