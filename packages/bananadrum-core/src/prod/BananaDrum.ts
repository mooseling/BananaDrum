import { applySerialisedRhythmToTrack, ArrangementSnapshot, deserialiseArrangement } from "./serialisation/serialisation.js";
import { getLibrary } from "./Library.js";
import { BananaDrum, PackedInstrument } from "./types/types.js";
import { edit } from './edit.js';
import { EditCommand } from './types/edit_commands.js';
import { createUndoRedoStack } from './UndoRedoStack.js';


export function createBananaDrum(
  instrumentCollection:PackedInstrument[], toLoad:{serialisedArrangement:string, version:number, title?:string}
): BananaDrum {
  const library = getLibrary();
  library.load(instrumentCollection);

  const arrangement = deserialiseArrangement(toLoad.serialisedArrangement, toLoad.version, toLoad.title) as Arrangement;
  const undoRedoStack = createUndoRedoStack(arrangement);

  return {
    library, arrangement,
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

      // const currentState = undoRedoStack.currentState;
      // undoRedoStack.goBack();
      // const targetState = undoRedoStack.currentState;

      // applyStateChange(arrangement, currentState, targetState);
    },
    redo() {
      if (!undoRedoStack.canRedo)
        return;

      // const currentState = undoRedoStack.currentState;
      // undoRedoStack.goForward();
      // const targetState = undoRedoStack.currentState;

      // applyStateChange(arrangement, currentState, targetState);
    },
    topics: {
      canUndo: undoRedoStack.topics.canUndo,
      canRedo: undoRedoStack.topics.canRedo
    }
  }
}
