import { EditCommand, EditCommand_Note } from './types/edit_commands.js';
import { NoteStyle } from './types/types.js';
import { HistoryState } from './UndoRedoStack.js';



interface NoteCycleStack {
  start: number
  distance: number // distance = endIndex - startIndex. It is like 'length', but exclusive
}


const LOOKBACK_TIME = 180_000; // 3 minutes
const NOTE_CYCLE_TIME = 2000; // 2 seconds


// Currently the only purpose of this is to track what NoteStyle a Note had before the user cycled it
export function extractOldValue(command:EditCommand): NoteStyle|null {
  const targetNote = (command as EditCommand_Note).note;
  if (targetNote)
    return targetNote.noteStyle;

  return null;
}


export function squashRecentNoteCycling(history:HistoryState[]): void {
  for (const stack of findRecentNoteCycleStacks(history)) {
    // We have to check if a stack actually ended up changing the NoteStyle
    // If not, when we squash it we'll end up with an undo-click that doesn't change anything
    if (noteCycleStackCausedChange(history, stack))
      squashFromIndex(history, stack, 0); // Squash down to just last command
    else
      squashFromIndex(history, stack, 1); // Squash to first and last command
  }
}


// Must return stacks in reverse order, and stacks must be 2 or more elements
function findRecentNoteCycleStacks(history:HistoryState[]): NoteCycleStack[] {
  const noteCycleStacks: NoteCycleStack[] = [];
  const currentTime = Date.now();
  let historyIndex = history.length - 1;

  // A note-cycle-stack is at least 2 elements long
  while (historyIndex > 1) {
    const historyEntry = history[historyIndex];

    // To avoid reading the whole stack every time, we only look a little ways back in time
    // Hopefully, we've already examined everything before the cutoff already
    if (currentTime - historyEntry.timestamp > LOOKBACK_TIME)
      break;

    // We must check if this command was even a note-cycle command
    const targetNote = (historyEntry.lastCommand as EditCommand_Note).note;
    if (targetNote) {
      // We may have found the top of a stack, now we search for the bottom
      const start = findBottomOfStack(history, historyIndex);
      const distance = historyIndex - start;
      if (distance > 0) // We want at least two clicks to consider this for squashing
        noteCycleStacks.push({start, distance});
      historyIndex = start - 1;
    } else {
      historyIndex--;
    }
  }

  return noteCycleStacks;
}


// Precondition: This really is the top of a cycle stack, and therefore history[searchStart].lastCommand.note exists
function findBottomOfStack(history:HistoryState[], searchStart:number): number {
  const stackNote = (history[searchStart].lastCommand as EditCommand_Note).note;
  let searchIndex = searchStart - 1;

  while (searchIndex >= 0) {
    const historyEntry = history[searchIndex];
    const targetNoteAtIndex = (historyEntry.lastCommand as EditCommand_Note).note;
    if (targetNoteAtIndex !== stackNote)
      break; // This also rules out commands which are not note-cycling
    
    const timeBetweenCommands = history[searchIndex + 1].timestamp - historyEntry.timestamp;
    if (timeBetweenCommands > NOTE_CYCLE_TIME)
      break;

    searchIndex--;
  }

  return searchIndex + 1;
}


function noteCycleStackCausedChange(history:HistoryState[], stack:NoteCycleStack): boolean {
  const startNoteStyle = history[stack.start].oldValue;
  const endNoteStyle = (history[stack.start + stack.distance].lastCommand as EditCommand_Note).noteStyle;
  return startNoteStyle !== endNoteStyle;
}


function squashFromIndex(history:HistoryState[], stack:NoteCycleStack, startOffset:number): void {
  history.splice(
    stack.start + startOffset, // Delete from (startOffset allows us to leave the first element alone (or more))
    stack.distance - startOffset // Delete count (We don't add 1 because we never delete the last element)
  );
}
