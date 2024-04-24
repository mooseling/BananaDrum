import { RealTime, Note, Track, Polyrhythm } from 'bananadrum-core';
import { createPublisher } from 'bananadrum-core';
import { getMuteEvents } from './Muting.js';
import { Event, Interval, SoloMute, TimeCoordinator, TrackPlayer } from './types.js';


export function createTrackPlayer(track:Track, timeCoordinator:TimeCoordinator): TrackPlayer {
  const publisher = createPublisher();
  const noteTimes:Map<Note, RealTime> = new Map();
  let cachedPolyrhythms:Polyrhythm[] = [];

  if (track.instrument.loaded) {
    fillInBasicNoteTimes();
    handleNewPolyrhythms();
  } else {
    const setupNotes = () => {
      fillInBasicNoteTimes();
      handleNewPolyrhythms();
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

    const notesInInterval:Note[] = [];

    const noteIterator = track.getNoteIterator();
    for (const note of noteIterator) {
      const time = noteTimes.get(note);
      if (time > end)
        break;
      if (time >= start)
        notesInInterval.push(note);
    }

    // Can't do this all in one go because TypeScript won't allow the concat
    const events:Event[] = notesInInterval
      .filter(note => note.noteStyle) // Filter out rests (which have noteStyle: null)
      .map(note => ({
        note,
        realTime: noteTimes.get(note),
        audioBuffer:note.noteStyle.audioBuffer
      }));
    notesInInterval.forEach(note => events.push(...getMuteEvents(note, noteTimes.get(note))));

    return events;
  }






  // ==================================================================
  //                          Private Functions
  // ==================================================================



  function fillInBasicNoteTimes() {
    const unmatchedNotes = track.notes.filter(note => !noteTimes.get(note));
    unmatchedNotes.forEach(note => noteTimes.set(note, timeCoordinator.convertToRealTime(note.timing)));
  }


  function removeNoteTimesOfDroppedNotes() {
    for (const note of noteTimes.keys()) {
      if (!note.polyrhythm && !track.notes.includes(note))
        noteTimes.delete(note);
    }
  }


  function handleTrackChange() {
    const newNoteCount = track.notes.length;
    if (newNoteCount > lastNoteCount)
      fillInBasicNoteTimes();
    else if (newNoteCount < lastNoteCount)
      removeNoteTimesOfDroppedNotes();
    else if (track.polyrhythms.length > lastPolyrhythmCount)
      handleNewPolyrhythms();
    else if (track.polyrhythms.length < lastPolyrhythmCount)
      handleDroppedPolyrhythms();

    lastNoteCount = newNoteCount;
    lastPolyrhythmCount = track.polyrhythms.length;
  }


  function handleNewPolyrhythms() {
    track.polyrhythms.forEach(polyrhythm => {
      if (!cachedPolyrhythms.includes(polyrhythm)){
        addNoteTimesForPolyrhythm(polyrhythm);
        cachedPolyrhythms.push(polyrhythm);
      }
    });
  }


  function handleDroppedPolyrhythms() {
    cachedPolyrhythms = cachedPolyrhythms.filter(cachedPolyrhythm => track.polyrhythms.includes(cachedPolyrhythm) || cachedPolyrhythm.notes.forEach(note => noteTimes.delete(note)))
  }


  function addNoteTimesForPolyrhythm(polyrhythm:Polyrhythm) {
    const startTime = noteTimes.get(polyrhythm.start);

    // We need to find the note just after the polyrhythm ends to work out it's time-length
    // It's possible the next note is the start of a polyrhythm in an equal-or-higher level, which we don't have times for yet
    // So we exclude later polyrhythms from the iterator
    const laterPolyrhythms = track.polyrhythms.slice(track.polyrhythms.indexOf(polyrhythm) + 1);
    const noteIterator = track.getNoteIterator(laterPolyrhythms);
    let nextNote:Note;
    let foundPolyrhythm = false;
    for (const note of noteIterator) {
      if (foundPolyrhythm) {
        if (note.polyrhythm !== polyrhythm) {
          nextNote = note;
          break;
        }
      } else if (note.polyrhythm === polyrhythm) {
        foundPolyrhythm = true;
      }
    }

    const endTime = nextNote
      ? noteTimes.get(nextNote)
      : timeCoordinator.realTimeLength;

    const realTimeLength = endTime - startTime;
    const timePerNote = realTimeLength / polyrhythm.notes.length;

    polyrhythm.notes.forEach((note, index) => noteTimes.set(note, startTime + (index * timePerNote)));
  }


  function handleTimeChange() {
    // Unnecessary to recalc note times when the length changes
    if (track.arrangement.timeParams.length !== lastLength) {
      lastLength = track.arrangement.timeParams.length;
      return;
    }

    for (const note of noteTimes.keys()) {
      if (track.notes.includes(note))
        noteTimes.set(note, timeCoordinator.convertToRealTime(note.timing));
    }

    // Destroy and recreate polyrhythms for simplicity
    destroyPolyrhythms();
    handleNewPolyrhythms();
  }


  function destroyPolyrhythms() {
    cachedPolyrhythms.forEach(polyrhythm => polyrhythm.notes.forEach(note => noteTimes.delete(note)))
    cachedPolyrhythms = [];
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
