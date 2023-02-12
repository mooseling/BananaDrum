import { createArrangement, unpackArrangement } from "./Arrangement.js";
import { urlDecodeArrangement } from "./compression.js";
import { getLibrary } from "./Library.js";
import { Arrangement, BananaDrum, PackedInstrument } from "./types.js";


export function createBananaDrum(instrumentCollection?:PackedInstrument[], compressedArrangement?:string): BananaDrum {
  if (compressedArrangement) {
    const library = getLibrary();

    if (instrumentCollection)
      library.load(instrumentCollection);
    
    const arrangement = getNewArrangement(compressedArrangement);
    
    return {library, arrangement};
  }
}


function getNewArrangement(compressedArrangement?:string): Arrangement {
  if (compressedArrangement) {
    const packedArrangement = urlDecodeArrangement(compressedArrangement);
    return unpackArrangement(packedArrangement);
  }
  return createArrangement();
}