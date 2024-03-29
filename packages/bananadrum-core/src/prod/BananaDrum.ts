import { deserialiseArrangement } from "./serialisation.js";
import { getLibrary } from "./Library.js";
import { BananaDrum, PackedInstrument } from "./types.js";


export function createBananaDrum(instrumentCollection:PackedInstrument[], serialisedArrangement:string): BananaDrum {
  const library = getLibrary();
  library.load(instrumentCollection);

  const arrangement = deserialiseArrangement(serialisedArrangement);

  return {library, arrangement};
}
