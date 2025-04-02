import { EditCommand, EditCommand_Arrangement, EditCommand_ArrangementAddPolyrhythms, EditCommand_ArrangementAddTrack, EditCommand_ArrangementClear, EditCommand_ArrangementClearSelection, EditCommand_ArrangementRemoveTrack, EditCommand_ArrangementTitle, EditCommand_Note, EditCommand_TimeParams, EditCommand_Track, EditCommand_TrackClear, EditCommand_TrackRemovePolyrhythm } from './types/edit_commands';
import { Arrangement, Note, TimeParams, Track } from './types/types';


export function edit(command:EditCommand): unknown {
  if ((command as EditCommand_Arrangement).arrangement)
    return editArrangement(command as EditCommand_Arrangement);
  if ((command as EditCommand_TimeParams).timeParams)
    return editTimeParams(command as EditCommand_TimeParams);
  if ((command as EditCommand_Track).track)
    return editTrack(command as EditCommand_Track);
  if ((command as EditCommand_Note).note)
    return editNote(command as EditCommand_Note);
}


function editArrangement(command:EditCommand_Arrangement) {
  const arrangement = command.arrangement as Arrangement;

  const newTitle = (command as EditCommand_ArrangementTitle).newTitle;
  if (typeof newTitle === 'string')
    return arrangement.title = newTitle;

  const instrument = (command as EditCommand_ArrangementAddTrack).addTrack;
  if (instrument)
    return arrangement.addTrack(instrument);

  const track = (command as EditCommand_ArrangementRemoveTrack).removeTrack as Track;
  if (track)
    return arrangement.removeTrack(track);

  if ((command as EditCommand_ArrangementClear).command === 'clear all tracks')
    return arrangement.tracks.forEach(track => track.clear());

  const clearSelection = (command as EditCommand_ArrangementClearSelection).clearSelection;
  if (clearSelection)
    return clearSelection.forEach(trackSelection => trackSelection.selectedNotes.forEach(note => (note as Note).noteStyle = null))

  const addPolyrhythms = (command as EditCommand_ArrangementAddPolyrhythms).addPolyrhythms;
  if (addPolyrhythms) {
    return addPolyrhythms.selection.forEach(({range}) => {
      const [start, end] = (range as [Note, Note]);
      const track = start.track;
      track.addPolyrhythm(start, end, addPolyrhythms.length);
    });
  }
}


function editTrack(command:EditCommand_Track): unknown {
  const track = command.track as Track;

  const removePolyrhythm = (command as EditCommand_TrackRemovePolyrhythm).removePolyrhythm;
  if (removePolyrhythm) 
    return track.removePolyrhythm(removePolyrhythm);

  if ((command as EditCommand_TrackClear).command === 'clear')
    return track.clear();
}


function editTimeParams(command:EditCommand_TimeParams) {
  const timeParams = command.timeParams as TimeParams;
}


function editNote(command:EditCommand_Note) {
  const note = command.note as Note;
}