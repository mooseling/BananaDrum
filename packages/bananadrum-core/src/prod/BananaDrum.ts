import { applySerialisedRhythmToTrack, ArrangementState, deserialiseArrangement } from "./serialisation.js";
import { getLibrary } from "./Library.js";
import { Arrangement, BananaDrum, PackedInstrument } from "./types/types.js";
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

      const currentState = undoRedoStack.currentState;
      undoRedoStack.goBack();
      const targetState = undoRedoStack.currentState;

      applyStateChange(arrangement, currentState, targetState);
    },
    redo() {
      if (!undoRedoStack.canRedo)
        return;

      const currentState = undoRedoStack.currentState;
      undoRedoStack.goForward();
      const targetState = undoRedoStack.currentState;

      applyStateChange(arrangement, currentState, targetState);
    },
    topics: {
      canUndo: undoRedoStack.topics.canUndo,
      canRedo: undoRedoStack.topics.canRedo
    }
  }
}


function applyStateChange(arrangement:Arrangement, currentState:ArrangementState, targetState:ArrangementState) {
  // Apply all timeParams without checking if they've changed. It will only publish if they actually change.
  arrangement.timeParams.timeSignature = targetState.timeParams.timeSignature;
  arrangement.timeParams.tempo = targetState.timeParams.tempo;
  arrangement.timeParams.length = targetState.timeParams.length;
  arrangement.timeParams.pulse = targetState.timeParams.pulse;
  arrangement.timeParams.stepResolution = targetState.timeParams.stepResolution;

  // Same with title
  arrangement.title = targetState.title;

  targetState.tracks.forEach((targetTrackState, trackIndex) => {
    const currentTrackState = currentState.tracks[trackIndex]

    // Wait what if we need to delete a track? Like, undo adding one.
    // Iterate over tracks in the target state
    // We find a track in the current state that doesn't match (by index)
    // Is it because we need to add one or remove one? How do we tell?
    // Maybe this...
    // For each track in target state...
    // Search for a matching track (by ID) in the current state
    // If not found, add
    // If found, do comparisson
    // Then (or first?), iterate over current tracks
    // If there's no matching track in the target state, we need to delete
    if (!currentTrackState || currentTrackState.id !== targetTrackState.id) {
      // Need to add the track, but we have to specify its ID
      // TODO: Make this possible in the deserialiseTrack functions
    } else if (currentTrackState.serialisedTrack !== targetTrackState.serialisedTrack) {
      applySerialisedRhythmToTrack(targetTrackState.serialisedTrack, arrangement.tracks[trackIndex], 2);
      // TODO: Not hard-code the serialisation version up there. Should be in the portable objects
    }
  });
}