import { deserialiseArrangement } from "./serialisation.js";
import { getLibrary } from "./Library.js";
import { BananaDrum, PackedInstrument } from "./types/types.js";
import { edit } from './edit.js';


export function createBananaDrum(
  instrumentCollection:PackedInstrument[], toLoad:{serialisedArrangement:string, version:number, title?:string}
): BananaDrum {
  const library = getLibrary();
  library.load(instrumentCollection);

  const arrangement = deserialiseArrangement(toLoad.serialisedArrangement, toLoad.version, toLoad.title);

  return {library, arrangement, edit};
}
