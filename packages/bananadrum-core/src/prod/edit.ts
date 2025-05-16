import { EditCommand, EditCommand_Arrangement, EditCommand_ArrangementAddPolyrhythms, EditCommand_ArrangementAddTrack, EditCommand_ArrangementClear, EditCommand_ArrangementClearSelection, EditCommand_ArrangementRemoveTrack, EditCommand_ArrangementTitle, EditCommand_Note, EditCommand_TimeParams, EditCommand_TimeParamsLength, EditCommand_TimeParamsTempo, EditCommand_TimeParamsTimeSignature, EditCommand_Track, EditCommand_TrackClear, EditCommand_TrackRemovePolyrhythm } from './types/edit_commands';
import { Arrangement, Note, TimeParams, Track } from './types/general';



// Single edit function for all changes to the arrangement, so that we can maintain an undo stack
// Returns a boolean indicating whether anything has changed
export function edit(command:EditCommand): boolean {
  if ((command as EditCommand_Arrangement).arrangement)
    return editArrangement(command as EditCommand_Arrangement);
  if ((command as EditCommand_TimeParams).timeParams)
    return editTimeParams(command as EditCommand_TimeParams);
  if ((command as EditCommand_Track).track)
    return editTrack(command as EditCommand_Track);
  if ((command as EditCommand_Note).note)
    return editNote(command as EditCommand_Note);
}


function editArrangement(command:EditCommand_Arrangement): boolean {
  const arrangement = command.arrangement as Arrangement;

  const newTitle = (command as EditCommand_ArrangementTitle).newTitle;
  if (typeof newTitle === 'string') {
    if (arrangement.title != newTitle) {
      arrangement.title = newTitle;
      return true;
    }
    return false;
  }

  const instrument = (command as EditCommand_ArrangementAddTrack).addTrack;
  if (instrument) {
    arrangement.addTrack(instrument);
    return true;
  }

  const track = (command as EditCommand_ArrangementRemoveTrack).removeTrack as Track;
  if (track) {
    try {
      arrangement.removeTrack(track);
      return true;
    } catch (e) {
      return false;
    }
  }

  if ((command as EditCommand_ArrangementClear).command === 'clear all tracks') {
    // Need to painstakingly check whether this changes anything
    for (const track of arrangement.tracks) {
      for (const note of track.getNoteIterator()) {
        if (note.noteStyle !== null) {
          // As soon as we find one note to clear, we're good
          arrangement.tracks.forEach(track => track.clear());
          return true;
        }
      }
    }

    return false
  }

  const clearSelection = (command as EditCommand_ArrangementClearSelection).clearSelection;
  if (clearSelection) {
    let changedAnyNotes = false;

    clearSelection.forEach(trackSelection => {
      trackSelection.selectedNotes.forEach(note => {
        if (note.noteStyle !== null) {
          (note as Note).noteStyle = null;
          changedAnyNotes = true;
        }
      });
    });

    return changedAnyNotes;
  }

  const addPolyrhythms = (command as EditCommand_ArrangementAddPolyrhythms).addPolyrhythms;
  if (addPolyrhythms) {
    addPolyrhythms.selection.forEach(({range}) => {
      const [start, end] = (range as [Note, Note]);
      const track = start.track;
      track.addPolyrhythm(start, end, addPolyrhythms.length);
    });
    return true;
  }
}


function editTrack(command:EditCommand_Track): boolean {
  const track = command.track as Track;

  const removePolyrhythm = (command as EditCommand_TrackRemovePolyrhythm).removePolyrhythm;
  if (removePolyrhythm) {
    if (track.polyrhythms.find(polyrhythm => polyrhythm === removePolyrhythm)) {
      track.removePolyrhythm(removePolyrhythm);
      return true;
    }
    return false;
  }

  if ((command as EditCommand_TrackClear).command === 'clear') {
    for (const note of track.getNoteIterator()) {
      if (note.noteStyle !== null) {
        track.clear();
        return true;
      }
    }
    return false;
  }
}


function editTimeParams(command:EditCommand_TimeParams): boolean {
  const timeParams = command.timeParams as TimeParams;

  const {timeSignature, pulse, stepResolution} = ((command as EditCommand_TimeParamsTimeSignature));
  if (timeSignature) {
    if (timeSignature !== timeParams.timeSignature) {
      timeParams.timeSignature = timeSignature;
      timeParams.pulse = pulse;
      timeParams.stepResolution = stepResolution;
      return true;
    }
    return false;
  }

  const tempo = (command as EditCommand_TimeParamsTempo).tempo;
  if (tempo) {
    if (tempo !== timeParams.tempo) {
      timeParams.tempo = tempo;
      return true;
    }
    return false;
  }

  const length = (command as EditCommand_TimeParamsLength).length;
  if (length) {
    if (length !== timeParams.length) {
      timeParams.length = length;
      return true;
    }
    return false;
  }
}


function editNote(command:EditCommand_Note): boolean {
  const note = command.note as Note;

  if (note.noteStyle !== command.noteStyle) {
    note.noteStyle = command.noteStyle;
    return true;
  }

  return false;
}