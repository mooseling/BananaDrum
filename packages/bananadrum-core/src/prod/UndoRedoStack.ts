import { createPublisher } from './Publisher.js'
import { getArrangementSnapshot } from './serialisation/snapshots.js'
import { EditCommand } from './types/edit_commands.js'
import { ArrangementSnapshot } from './types/snapshots.js'
import { ArrangementView, NoteStyle, Subscribable } from './types/types'


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
  lastCommand: EditCommand | null
  oldValue: NoteStyle|null
  timestamp: number
}


export function createUndoRedoStack(arrangement:ArrangementView): UndoRedoStack {
  const canUndoPublisher = createPublisher();
  const canRedoPublisher = createPublisher();
  const past = [getNewHistoryState(null, null)]; // Past must always contain at least one element, which is the present state
  const future: HistoryState[] = [];

  return {
    get canUndo() {return past.length > 1},
    get canRedo() {return future.length > 0},
    get currentState() {return past[past.length - 1].arrangementSnapshot},
    handleEdit, goBack, goForward,
    topics: {
      canUndo: canUndoPublisher,
      canRedo: canRedoPublisher
    }
  };


  function handleEdit(command:EditCommand, oldValue:NoteStyle|null) {
    past.push(getNewHistoryState(command, oldValue));

    if (future.length) {
      future.splice(0);
      canRedoPublisher.publish();
    }

    if (past.length === 2)
      canUndoPublisher.publish();
  }


  function goBack() {
    if (past.length < 2)
      return;

    future.push(past.pop());

    if (past.length === 1)
      canUndoPublisher.publish();
    if (future.length === 1)
      canRedoPublisher.publish();
  }


  function goForward() {
    if (future.length === 0)
      return;

    past.push(future.pop());

    if (past.length === 2)
      canUndoPublisher.publish();
    if (future.length === 0)
      canRedoPublisher.publish();
  }


  function getNewHistoryState(lastCommand:EditCommand|null, oldValue:NoteStyle|null): HistoryState {
    return {
      arrangementSnapshot: getArrangementSnapshot(arrangement),
      lastCommand,
      oldValue,
      timestamp: Date.now()
    };
  }
}
