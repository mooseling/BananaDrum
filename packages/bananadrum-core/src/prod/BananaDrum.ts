import { deserialiseArrangement } from "./serialisation.js";
import { getLibrary } from "./Library.js";
import { BananaDrum, PackedInstrument } from "./types.js";


export function createBananaDrum(
  instrumentCollection:PackedInstrument[], toLoad:{serialisedArrangement:string, version:number}
): BananaDrum {
  const library = getLibrary();
  library.load(instrumentCollection);

  const arrangement = deserialiseArrangement(toLoad.serialisedArrangement, toLoad.version);

  return {library, arrangement};
}
