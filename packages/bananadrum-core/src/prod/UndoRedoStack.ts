import { createPublisher } from './Publisher.js'
import { getArrangementSnapshot } from './serialisation/snapshots.js'
import { EditCommand } from './types/edit_commands.js'
import { ArrangementSnapshot } from './types/snapshots.js'
import { ArrangementView, Subscribable } from './types/types'


interface UndoRedoStack {
  canUndo: boolean
  canRedo: boolean
  currentState: ArrangementSnapshot
  handleEdit(command:EditCommand): void
  goBack(): void
  goForward(): void
  topics: {
    canUndo: Subscribable,
    canRedo: Subscribable
  }
}


interface HistoryState {
  arrangementSnapshot: ArrangementSnapshot
  lastCommand: EditCommand | null
  timestamp: number
}


export function createUndoRedoStack(arrangement:ArrangementView): UndoRedoStack {
  const canUndoPublisher = createPublisher();
  const canRedoPublisher = createPublisher();

  let present:HistoryState = getNewHistoryState(null);

  const past: HistoryState[] = [];
  const future: HistoryState[] = [];

  return {
    get canUndo() {return past.length > 0},
    get canRedo() {return future.length > 0},
    get currentState() {return present.arrangementSnapshot},
    handleEdit, goBack, goForward,
    topics: {
      canUndo: canUndoPublisher,
      canRedo: canRedoPublisher
    }
  };


  function handleEdit(command:EditCommand) {
    past.push(present);
    present = getNewHistoryState(command);

    if (future.length) {
      future.splice(0);
      canRedoPublisher.publish();
    }

    if (past.length === 1)
      canUndoPublisher.publish();
  }


  function goBack() {
    if (past.length === 0)
      return;

    future.push(present);
    present = past.pop();

    if (past.length === 0)
      canUndoPublisher.publish();
    if (future.length === 1)
      canRedoPublisher.publish();
  }


  function goForward() {
    if (future.length === 0)
      return;

    past.push(present);
    present = future.pop();

    if (past.length === 1)
      canUndoPublisher.publish();
    if (future.length === 0)
      canRedoPublisher.publish();
  }


  function getNewHistoryState(lastCommand:EditCommand): HistoryState {
    return {
      arrangementSnapshot: getArrangementSnapshot(arrangement),
      lastCommand,
      timestamp: Date.now()
    };
  }
}
