function noteBuilder({timing, track, noteStyle}:NoteInputs): Note {
  const note:Note = {
    timing, track, noteStyle,
    createAudioEvent(): AudioEvent {
      return {
        note,
        realTime: track.convertToRealTime(timing),
        audioBuffer: noteStyle.audioBuffer
      }
    }
  };

  return note;
}

export const Note:NoteBuilder = noteBuilder;
