import { EditCommand, EditCommand_Note } from './types/edit_commands.js';
import { NoteStyle } from './types/types.js';



// Currently the only purpose of this is to track what NoteStyle a Note had before the user cycled it
export function extractOldValue(command:EditCommand): NoteStyle|null {
  const targetNote = (command as EditCommand_Note).note;
  if (targetNote)
    return targetNote.noteStyle;

  return null;
}
