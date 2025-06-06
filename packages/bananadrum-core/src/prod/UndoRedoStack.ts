import { createPublisher } from './Publisher.js'
import { getArrangementSnapshot } from './serialisation/snapshots.js'
import { EditCommand, EditCommand_ArrangementTitle } from './types/edit_commands.js'
import { ArrangementSnapshot } from './types/snapshots.js'
import { ArrangementView, NoteStyle, Subscribable } from './types/general.js'
import { squashRecentNoteCycling } from './undo-redo-utils.js'
import { exists } from './utils.js'


interface UndoRedoStack {
  canUndo: boolean
  canRedo: boolean
  currentState: ArrangementSnapshot
  handleEdit(command:EditCommand, oldValue:NoteStyle|null): void
  goBack(): void
  goForward(): void
  topics: {
    canUndo: Subscribable,
    canRedo: Subscribable
  }
}


export interface HistoryState {
  arrangementSnapshot: ArrangementSnapshot
  lastCommand: EditCommand
  oldValue: NoteStyle|null
  timestamp: number
}


export function createUndoRedoStack(arrangement:ArrangementView): UndoRedoStack {
  const canUndoPublisher = createPublisher();
  const canRedoPublisher = createPublisher();

  // Past must always contain at least one element, which is the present state
  // We initialise it with edit-command {}, which is meant as an EditCommand_LoadPage
  const past = [getNewHistoryState(arrangement, {}, null)];
  const future: HistoryState[] = [];

  let queuedSquashTimeout = 0;
  let squashIsQueued = false;

  return {
    get canUndo() {return past.length > 1},
    get canRedo() {return future.length > 0},
    get currentState() {
      return {
        ...past[past.length - 1].arrangementSnapshot,
        title: arrangement.title // Title is ignored in undo/redo, so we just pull the current title
      }
    },
    handleEdit, goBack, goForward,
    topics: {
      canUndo: canUndoPublisher,
      canRedo: canRedoPublisher
    }
  };


  function handleEdit(command:EditCommand, oldValue:NoteStyle|null) {
    if (exists((command as EditCommand_ArrangementTitle).newTitle))
      return; // Title is ignored in undo/redo, so we don't react to it changing at all

    past.push(getNewHistoryState(arrangement, command, oldValue));

    if (future.length) {
      future.splice(0);
      canRedoPublisher.publish(); // No longer anything to redo, the future has been deleted
    }

    if (past.length === 2)
      canUndoPublisher.publish(); // Used to be 1, so now we have a past to return to

    queueStackSquash();
  }


  function goBack() {
    if (past.length < 2)
      return;

    future.push(past.pop());

    if (past.length === 1)
      canUndoPublisher.publish(); // Reached the beginning of history, so can't go back any more
    if (future.length === 1)
      canRedoPublisher.publish(); // Didn't used to have a future, now we do

    // We don't want to simplify history in the middle of undoing some stuff
    // So if a squash is queued, we push it back. But if not, we wouldn't want to queue it for no reason
    if (squashIsQueued)
      queueStackSquash();
  }


  function goForward() {
    if (future.length === 0)
      return;

    past.push(future.pop());

    if (past.length === 2)
      canUndoPublisher.publish(); // Used to be 1, so now we have a past to return to
    if (future.length === 0)
      canRedoPublisher.publish(); // We've reached the end of the future

    // We may have hit undo a bunch before squashing
    queueStackSquash();
  }


  function queueStackSquash(): void {
    clearTimeout(queuedSquashTimeout);
    queuedSquashTimeout = setTimeout(() => {
      squashRecentNoteCycling(past);
      squashIsQueued = false;
    }, 2500);
    squashIsQueued = true;
  }
}


function getNewHistoryState(arrangement:ArrangementView, lastCommand:EditCommand|null, oldValue:NoteStyle|null): HistoryState {
  return {
    arrangementSnapshot: getArrangementSnapshot(arrangement),
    lastCommand,
    oldValue,
    timestamp: Date.now()
  };
}