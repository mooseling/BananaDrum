import { EditCommand, EditCommand_Arrangement, EditCommand_ArrangementTitle, EditCommand_Note, EditCommand_TimeParams, EditCommand_Track } from './types/edit_commands';
import { Arrangement, TimeParams, Track } from './types/types';


export function edit(command:EditCommand): void {
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

  if (typeof (command as EditCommand_ArrangementTitle).newTitle === 'string') {
    const newTitle = (command as EditCommand_ArrangementTitle).newTitle;
    arrangement.title = newTitle;
  }
}


function editTimeParams(command:EditCommand_TimeParams) {
  const timeParams = command.timeParams as TimeParams;
}


function editTrack(command:EditCommand_Track) {
  const track = command.track as Track;
}


function editNote(command:EditCommand_Note) {
  const note = command.note as Note;
}