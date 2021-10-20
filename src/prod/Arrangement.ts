export const Arrangement:ArrangementBuilder = arrangementBuilder;

function arrangementBuilder(library:Library, packedArrangement?:PackedArrangement): Arrangement {
  if (packedArrangement) {
    const {timeSignature, tempo, length} = packedArrangement;
    const arrangement:Arrangement = {timeSignature, tempo, length, tracks:[]};
    packedArrangement.packedTracks.forEach(packedTrack => arrangement.tracks.push(unpackTrack(library, packedTrack)));
    return arrangement;
  }
  return {timeSignature:'4/4', tempo:120, length:1, tracks:[]};
};


function unpackTrack(library:Library, packedTrack:PackedTrack): Track {
  const instrument = library.getInstrument(packedTrack.instrumentId);
  const notes = [];
  packedTrack.packedNotes.forEach(packedNote => notes.push(unpackNote(packedNote, instrument)));
  return {instrument, notes};
}


function unpackNote(packedNote:PackedNote, instrument:Instrument): Note {
  const {timing, noteStyleId} = packedNote;
  const untimedNote:UntimedNote = instrument.createUntimedNote(noteStyleId);
  return Object.assign({timing}, untimedNote);
}
