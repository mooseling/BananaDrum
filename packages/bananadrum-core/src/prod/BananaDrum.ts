import { getLibrary } from "./Library.js";
import { BananaDrum, PackedInstrument } from "./types/general.js";
import { edit } from './edit.js';
import { EditCommand } from './types/edit_commands.js';
import { createUndoRedoStack } from './UndoRedoStack.js';
import { deserialiseArrangement } from './serialisation/deserialisers.js';
import { applyArrangementSnapshot, createArrangementFromSnapshot } from './serialisation/snapshot_appliers.js';
import { extractOldValue } from './undo-redo-utils.js';
import { createPublisher } from './Publisher.js';
import { SerialisedArrangement } from './types/snapshots.js';


export function createBananaDrum(instrumentCollection:PackedInstrument[], toLoad:SerialisedArrangement): BananaDrum {
  const library = getLibrary();
  library.load(instrumentCollection);

  const arrangementSnapshot = deserialiseArrangement(toLoad)
  const arrangement = createArrangementFromSnapshot(arrangementSnapshot);
  const undoRedoStack = createUndoRedoStack(arrangement);

  const currentStatePublisher = createPublisher();

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
      const oldValue = extractOldValue(command);
      const anythingHasChanged = edit(command);
      if (anythingHasChanged) {
        undoRedoStack.handleEdit(command, oldValue);
        currentStatePublisher.publish();
      }
    },
    undo() {
      if (!undoRedoStack.canUndo)
        return;

      undoRedoStack.goBack();
      applyArrangementSnapshot(arrangement, undoRedoStack.currentState);
      currentStatePublisher.publish();
    },
    redo() {
      if (!undoRedoStack.canRedo)
        return;

      undoRedoStack.goForward();
      applyArrangementSnapshot(arrangement, undoRedoStack.currentState);
      currentStatePublisher.publish();
    },
    topics: {
      canUndo: undoRedoStack.topics.canUndo,
      canRedo: undoRedoStack.topics.canRedo,
      currentState: currentStatePublisher
    }
  }
}
