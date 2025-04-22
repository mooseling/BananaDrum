import { getLibrary } from "./Library.js";
import { BananaDrum, PackedInstrument } from "./types/types.js";
import { edit } from './edit.js';
import { EditCommand } from './types/edit_commands.js';
import { createUndoRedoStack } from './UndoRedoStack.js';
import { deserialiseArrangement } from './serialisation/deserialisers.js';
import { SerialisedArrangement } from './serialisation/serialisers.js';
import { applyArrangementSnapshot, createArrangementFromSnapshot } from './serialisation/snapshot_appliers.js';


export function createBananaDrum(instrumentCollection:PackedInstrument[], toLoad:SerialisedArrangement): BananaDrum {
  const library = getLibrary();
  library.load(instrumentCollection);

  const arrangementSnapshot = deserialiseArrangement(toLoad)
  const arrangement = createArrangementFromSnapshot(arrangementSnapshot);
  const undoRedoStack = createUndoRedoStack(arrangement);

  return {
    library, arrangement,
    get currentState() {
      return undoRedoStack.currentState;
    },
    get canUndo() {
      return undoRedoStack.canUndo;
    },
    get canRedo() {
      return undoRedoStack.canRedo;
    },
    edit(command:EditCommand) {
      edit(command);
      undoRedoStack.handleEdit();
    },
    undo() {
      if (!undoRedoStack.canUndo)
        return;

      undoRedoStack.goBack();
      applyArrangementSnapshot(arrangement, undoRedoStack.currentState);
    },
    redo() {
      if (!undoRedoStack.canRedo)
        return;

      undoRedoStack.goForward();
      applyArrangementSnapshot(arrangement, undoRedoStack.currentState);
    },
    topics: {
      canUndo: undoRedoStack.topics.canUndo,
      canRedo: undoRedoStack.topics.canRedo
    }
  }
}
