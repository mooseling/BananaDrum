import { createPublisher } from './Publisher.js'
import { ArrangementState, getArrangementState } from './serialisation.js'
import { ArrangementView, Subscribable } from './types/types'


interface UndoRedoStack {
  canUndo: boolean
  canRedo: boolean
  currentState: ArrangementState
  handleEdit(): void
  goBack(): void
  goForward(): void
  topics: {
    canUndo: Subscribable,
    canRedo: Subscribable
  }
}


export function createUndoRedoStack(arrangement:ArrangementView): UndoRedoStack {
  const canUndoPublisher = createPublisher();
  const canRedoPublisher = createPublisher();

  let present = getArrangementState(arrangement);

  const past: ArrangementState[] = [];
  const future: ArrangementState[] = [];

  return {
    get canUndo() {return past.length > 0},
    get canRedo() {return future.length > 0},
    get currentState() {return present},
    handleEdit, goBack, goForward,
    topics: {
      canUndo: canUndoPublisher,
      canRedo: canRedoPublisher
    }
  };


  function handleEdit() {
    past.push(present);
    present = getArrangementState(arrangement);

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
}