import { RealTime, Note, Track, Polyrhythm } from 'bananadrum-core';
import { createPublisher } from 'bananadrum-core';
import { getMuteEvents } from './Muting.js';
import { Event, Interval, SoloMute, TimeCoordinator, TrackPlayer } from './types.js';

type NoteWithTime = {realTime:RealTime, note:Note};
type PolyrhythmWithTime = {startTime:RealTime, polyrhythm:Polyrhythm, realTimeNotes:NoteWithTime[]};

export function createTrackPlayer(track:Track, timeCoordinator:TimeCoordinator): TrackPlayer {
  const publisher = createPublisher();
  let notesWithTime:NoteWithTime[] = [];
  let polyrhythmsWithTime:PolyrhythmWithTime[] = [];

  if (track.instrument.loaded) {
    fillInRealTimeNotes();
    addMissingRealTimePolyrhythms();
  } else {
    const setupNotes = () => {
      fillInRealTimeNotes();
      addMissingRealTimePolyrhythms();
      track.instrument.unsubscribe(setupNotes);
    }
    track.instrument.subscribe(setupNotes);
  }

  let lastNoteCount = track.notes.length;
  let lastPolyrhythmCount = track.polyrhythms.length;
  track.subscribe(handleTrackChange);
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


  function handleTrackChange() {
    const newNoteCount = track.notes.length;
    if (newNoteCount > lastNoteCount)
      fillInRealTimeNotes();
    else if (newNoteCount < lastNoteCount)
      removeExtraRealTimeNotes();
    else if (track.polyrhythms.length < lastPolyrhythmCount)
      addMissingRealTimePolyrhythms();
    else if (track.polyrhythms.length > lastPolyrhythmCount)
      removeExtraRealTimePolyrhythms();

    lastNoteCount = newNoteCount;
    lastPolyrhythmCount = track.polyrhythms.length;
  }


  function addMissingRealTimePolyrhythms() {
    track.polyrhythms.forEach(polyrhythm => {
      if (!polyrhythmsWithTime.some(pwt => pwt.polyrhythm === polyrhythm))
        addPolyrhythmWithTime(polyrhythm);
    });
  }


  function removeExtraRealTimePolyrhythms() {
    polyrhythmsWithTime = polyrhythmsWithTime.filter(
      pwt => track.polyrhythms.some(polyrhythm => pwt.polyrhythm === polyrhythm)
    );
  }


  function addPolyrhythmWithTime(polyrhythm:Polyrhythm) {
    const startTime = timeCoordinator.convertToRealTime(polyrhythm.start.timing);
    const endTime = timeCoordinator.convertToRealTime({
      bar: polyrhythm.end.timing.bar,
      step: polyrhythm.end.timing.step + 1 // May be an invalid timing, but should calculate just fine
    });
    const realTimeLength = endTime - startTime;

    polyrhythmsWithTime.push({
      startTime, polyrhythm,
      realTimeNotes: polyrhythm.notes.map((note, index) => ({
        note,
        realTime: (index/polyrhythm.notes.length) * realTimeLength
      }))
    });
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
